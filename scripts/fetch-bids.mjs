// 나라장터(조달청) 입찰공고정보서비스에서 상하수도설비공사 관련 서울/수도권 공고를 가져와
// public/data/bids.json 으로 저장한다. G2B_SERVICE_KEY 환경변수(공공데이터포털 인증키)가 필요하다.
//
// 로컬 실행: G2B_SERVICE_KEY는 .env 파일에서 자동으로 읽는다 (VITE_ 접두사 없이 저장 - 브라우저에 노출되면 안 됨).
// GitHub Actions 실행: 저장소 Secrets의 G2B_SERVICE_KEY를 사용한다.
//
// ⚠️ 참고: data.go.kr 응답 필드명은 실제 키로 한 번 실행해 확인 후 조정이 필요할 수 있다.

import fs from 'node:fs/promises'
import path from 'node:path'
import dns from 'node:dns'

// GitHub Actions(우분투 러너)는 IPv6를 우선 사용하는데, data.go.kr 서버가 IPv6 경로에서
// 연결을 받지 않아 "fetch failed"가 발생하는 경우가 있다. IPv4를 우선하도록 강제한다.
dns.setDefaultResultOrder('ipv4first')

async function loadDotEnv() {
  try {
    const text = await fs.readFile(path.resolve('.env'), 'utf-8')
    for (const line of text.split('\n')) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) continue
      const eq = trimmed.indexOf('=')
      if (eq === -1) continue
      const key = trimmed.slice(0, eq).trim()
      const value = trimmed.slice(eq + 1).trim()
      if (!(key in process.env)) process.env[key] = value
    }
  } catch {
    // .env 파일이 없으면 무시 (CI에서는 Secrets로 주입됨)
  }
}

const ENDPOINT = 'https://apis.data.go.kr/1230000/BidPublicInfoService/getBidPblancListInfoCnstwkPPSSrch'
const KEYWORDS = ['상수도', '하수도']
const REGION_KEYWORDS = ['서울', '경기', '인천']
const LOOKBACK_DAYS = 21
const OUTPUT_PATH = path.resolve('public/data/bids.json')

function formatDateTime(date) {
  const pad = (n) => String(n).padStart(2, '0')
  return (
    date.getFullYear().toString() +
    pad(date.getMonth() + 1) +
    pad(date.getDate()) +
    pad(date.getHours()) +
    pad(date.getMinutes())
  )
}

// data.go.kr은 "Encoding(이미 %인코딩됨)" / "Decoding(원문)" 두 종류의 인증키를 발급한다.
// URLSearchParams에 그대로 넣으면 Encoding 키는 이중 인코딩되어 400 오류가 난다.
// 이미 percent-encoding된 키는 그대로 쓰고, 아니면 한 번만 인코딩한다.
function encodeServiceKey(key) {
  return /%[0-9A-Fa-f]{2}/.test(key) ? key : encodeURIComponent(key)
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function fetchOnce(url) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 15000)
  try {
    return await fetch(url, { signal: controller.signal })
  } finally {
    clearTimeout(timeout)
  }
}

async function fetchKeyword(serviceKey, keyword) {
  const now = new Date()
  const begin = new Date(now.getTime() - LOOKBACK_DAYS * 24 * 60 * 60 * 1000)

  const params = new URLSearchParams({
    inqryDiv: '1',
    inqryBgnDt: formatDateTime(begin),
    inqryEndDt: formatDateTime(now),
    bidNtceNm: keyword,
    type: 'json',
    numOfRows: '100',
    pageNo: '1',
  })

  const url = `${ENDPOINT}?ServiceKey=${encodeServiceKey(serviceKey)}&${params}`

  let res
  let lastNetworkError
  const attempts = 3
  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      res = await fetchOnce(url)
      lastNetworkError = undefined
      break
    } catch (err) {
      lastNetworkError = err
      const cause = err.cause ? ` / cause: ${err.cause.code ?? err.cause.message ?? err.cause}` : ''
      console.warn(`[${keyword}] 네트워크 요청 실패 (시도 ${attempt}/${attempts}): ${err.message}${cause}`)
      if (attempt < attempts) await sleep(2000 * attempt)
    }
  }

  if (lastNetworkError) {
    const cause = lastNetworkError.cause
      ? ` / cause: ${lastNetworkError.cause.code ?? lastNetworkError.cause.message ?? lastNetworkError.cause}`
      : ''
    throw new Error(`나라장터 API 연결 실패 (${keyword}): ${lastNetworkError.message}${cause}`)
  }

  const bodyText = await res.text()

  if (!res.ok) {
    throw new Error(
      `나라장터 API 요청 실패 (${keyword}): ${res.status} ${res.statusText}\n응답 내용: ${bodyText.slice(0, 500)}`,
    )
  }

  let data
  try {
    data = JSON.parse(bodyText)
  } catch {
    throw new Error(`나라장터 API 응답이 JSON이 아닙니다 (${keyword}).\n응답 내용: ${bodyText.slice(0, 500)}`)
  }

  const items = data?.response?.body?.items
  if (!items) {
    const header = data?.response?.header
    console.warn(`[${keyword}] 결과 없음 또는 오류 응답:`, JSON.stringify(header ?? data))
    return []
  }
  return Array.isArray(items) ? items : [items]
}

function isInTargetRegion(item) {
  const haystack = [item.ntceInsttNm, item.dminsttNm].filter(Boolean).join(' ')
  return REGION_KEYWORDS.some((region) => haystack.includes(region))
}

function isStillOpen(item) {
  if (!item.bidClseDt) return true
  const deadline = new Date(item.bidClseDt.replace(' ', 'T'))
  if (Number.isNaN(deadline.getTime())) return true
  return deadline.getTime() >= Date.now()
}

function toBid(item) {
  return {
    id: `${item.bidNtceNo ?? ''}-${item.bidNtceOrd ?? ''}`,
    bidNo: item.bidNtceNo ?? '',
    title: item.bidNtceNm ?? '(공고명 없음)',
    agency: item.ntceInsttNm ?? '',
    demandAgency: item.dminsttNm ?? '',
    announceDate: item.bidNtceDt ?? '',
    deadline: item.bidClseDt ?? '',
    estimatedPrice: item.presmptPrce ?? null,
  }
}

async function main() {
  await loadDotEnv()
  const serviceKey = process.env.G2B_SERVICE_KEY

  if (!serviceKey) {
    console.error('G2B_SERVICE_KEY가 설정되지 않았습니다. .env 파일 또는 환경변수를 확인해주세요.')
    process.exitCode = 1
    return
  }

  const byId = new Map()

  for (const keyword of KEYWORDS) {
    try {
      const items = await fetchKeyword(serviceKey, keyword)
      let regionMatched = 0
      let stillOpenMatched = 0
      for (const item of items) {
        if (!isInTargetRegion(item)) continue
        regionMatched++
        if (!isStillOpen(item)) continue
        stillOpenMatched++
        const bid = toBid(item)
        byId.set(bid.id, bid)
      }
      console.log(
        `[${keyword}] 전체 ${items.length}건 -> 지역일치 ${regionMatched}건 -> 마감전 ${stillOpenMatched}건`,
      )
      if (items.length > 0 && regionMatched === 0) {
        console.log(`[${keyword}] 예시 공고기관명:`, items.slice(0, 5).map((i) => i.ntceInsttNm))
      }
    } catch (err) {
      console.error(err.message)
    }
  }

  const bids = [...byId.values()].sort((a, b) => a.deadline.localeCompare(b.deadline))

  await fs.mkdir(path.dirname(OUTPUT_PATH), { recursive: true })
  await fs.writeFile(
    OUTPUT_PATH,
    JSON.stringify({ updatedAt: new Date().toISOString(), bids }, null, 2),
    'utf-8',
  )

  console.log(`${bids.length}건 저장 완료 -> ${OUTPUT_PATH}`)
}

main()

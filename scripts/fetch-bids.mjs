// 나라장터(조달청) 입찰공고정보서비스에서 상하수도설비공사 관련 서울/수도권 공고를 가져와
// public/data/bids.json 으로 저장한다. G2B_SERVICE_KEY 환경변수(공공데이터포털 인증키)가 필요하다.
//
// 로컬 실행: G2B_SERVICE_KEY는 .env 파일에서 자동으로 읽는다 (VITE_ 접두사 없이 저장 - 브라우저에 노출되면 안 됨).
// GitHub Actions 실행: 저장소 Secrets의 G2B_SERVICE_KEY를 사용한다.
//
// ⚠️ 참고: data.go.kr 응답 필드명은 실제 키로 한 번 실행해 확인 후 조정이 필요할 수 있다.

import fs from 'node:fs/promises'
import path from 'node:path'

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

const ENDPOINT = 'http://apis.data.go.kr/1230000/BidPublicInfoService/getBidPblancListInfoCnstwkPPSSrch'
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

async function fetchKeyword(serviceKey, keyword) {
  const now = new Date()
  const begin = new Date(now.getTime() - LOOKBACK_DAYS * 24 * 60 * 60 * 1000)

  const params = new URLSearchParams({
    ServiceKey: serviceKey,
    inqryDiv: '1',
    inqryBgnDt: formatDateTime(begin),
    inqryEndDt: formatDateTime(now),
    bidNtceNm: keyword,
    type: 'json',
    numOfRows: '100',
    pageNo: '1',
  })

  const res = await fetch(`${ENDPOINT}?${params}`)
  if (!res.ok) {
    throw new Error(`나라장터 API 요청 실패 (${keyword}): ${res.status} ${res.statusText}`)
  }

  const data = await res.json()
  const items = data?.response?.body?.items
  if (!items) {
    const header = data?.response?.header
    console.warn(`[${keyword}] 결과 없음 또는 오류 응답:`, header ?? data)
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
      for (const item of items) {
        if (!isInTargetRegion(item)) continue
        if (!isStillOpen(item)) continue
        const bid = toBid(item)
        byId.set(bid.id, bid)
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

const { onSchedule } = require('firebase-functions/v2/scheduler')
const { onRequest } = require('firebase-functions/v2/https')
const { defineSecret } = require('firebase-functions/params')
const { initializeApp } = require('firebase-admin/app')
const { getFirestore } = require('firebase-admin/firestore')

initializeApp()

const G2B_SERVICE_KEY = defineSecret('G2B_SERVICE_KEY')

const ENDPOINT = 'https://apis.data.go.kr/1230000/ad/BidPublicInfoService/getBidPblancListInfoCnstwkPPSSrch'
const KEYWORDS = ['상수도', '하수도']
const REGION_KEYWORDS = ['서울', '경기', '인천']
const LOOKBACK_DAYS = 30
const RETENTION_DAYS = 30

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
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      res = await fetchOnce(url)
      lastNetworkError = undefined
      break
    } catch (err) {
      lastNetworkError = err
      console.warn(`[${keyword}] 네트워크 요청 실패 (시도 ${attempt}/3): ${err.message}`)
      if (attempt < 3) await sleep(2000 * attempt)
    }
  }

  if (lastNetworkError) {
    throw new Error(`나라장터 API 연결 실패 (${keyword}): ${lastNetworkError.message}`)
  }

  const bodyText = await res.text()

  if (!res.ok) {
    throw new Error(`나라장터 API 요청 실패 (${keyword}): ${res.status} ${res.statusText}\n${bodyText.slice(0, 500)}`)
  }

  let data
  try {
    data = JSON.parse(bodyText)
  } catch {
    throw new Error(`나라장터 API 응답이 JSON이 아닙니다 (${keyword}).\n${bodyText.slice(0, 500)}`)
  }

  const items = data?.response?.body?.items
  if (!items) {
    console.warn(`[${keyword}] 결과 없음 또는 오류 응답:`, JSON.stringify(data?.response?.header ?? data))
    return []
  }
  return Array.isArray(items) ? items : [items]
}

function isInTargetRegion(item) {
  const haystack = [item.ntceInsttNm, item.dminsttNm].filter(Boolean).join(' ')
  return REGION_KEYWORDS.some((region) => haystack.includes(region))
}

function parseDateSafe(value) {
  if (!value) return null
  const d = new Date(String(value).replace(' ', 'T'))
  return Number.isNaN(d.getTime()) ? null : d
}

function toBid(item) {
  const id = `${item.bidNtceNo ?? 'unknown'}-${item.bidNtceOrd ?? '0'}`
  return {
    id,
    bidNo: item.bidNtceNo ?? '',
    title: item.bidNtceNm ?? '(공고명 없음)',
    agency: item.ntceInsttNm ?? '',
    demandAgency: item.dminsttNm ?? '',
    announceDate: item.bidNtceDt ?? '',
    deadline: item.bidClseDt ?? '',
    estimatedPrice: item.presmptPrce ?? null,
  }
}

async function collectBids(serviceKey) {
  const byId = new Map()

  for (const keyword of KEYWORDS) {
    try {
      const items = await fetchKeyword(serviceKey, keyword)
      let regionMatched = 0
      for (const item of items) {
        if (!isInTargetRegion(item)) continue
        regionMatched++
        const bid = toBid(item)
        byId.set(bid.id, bid)
      }
      console.log(`[${keyword}] 전체 ${items.length}건 -> 지역일치 ${regionMatched}건`)
    } catch (err) {
      console.error(err.message)
    }
  }

  return [...byId.values()].sort((a, b) => a.deadline.localeCompare(b.deadline))
}

// 매번 전체 삭제 후 다시 쓰지 않고, 새로 조회된 공고는 추가/갱신(upsert)하고
// 공고일 기준 30일이 지난 공고만 정리한다.
async function syncBidsToFirestore(serviceKey) {
  const db = getFirestore()
  const newBids = await collectBids(serviceKey)

  const existingSnap = await db.collection('bids').get()
  const existingIds = new Set(existingSnap.docs.map((d) => d.id))

  let addedCount = 0
  if (newBids.length > 0) {
    const batchWrite = db.batch()
    for (const bid of newBids) {
      const docId = bid.id.replace(/[/\s]/g, '_')
      if (!existingIds.has(docId)) addedCount++
      batchWrite.set(db.collection('bids').doc(docId), bid, { merge: true })
    }
    await batchWrite.commit()
  }

  const cutoff = Date.now() - RETENTION_DAYS * 24 * 60 * 60 * 1000
  const batchDelete = db.batch()
  let expiredCount = 0
  existingSnap.docs.forEach((docSnap) => {
    const announceDate = parseDateSafe(docSnap.data().announceDate)
    if (announceDate && announceDate.getTime() < cutoff) {
      batchDelete.delete(docSnap.ref)
      expiredCount++
    }
  })
  if (expiredCount > 0) await batchDelete.commit()

  const totalCount = existingIds.size + addedCount - expiredCount

  await db.collection('meta').doc('bids').set({ updatedAt: new Date().toISOString(), count: totalCount })

  console.log(`신규 ${addedCount}건 추가, 조회 ${newBids.length}건, 만료 삭제 ${expiredCount}건, 총 보관 ${totalCount}건`)
  return { added: addedCount, matched: newBids.length, total: totalCount }
}

exports.fetchBids = onSchedule(
  {
    schedule: 'every 4 hours',
    region: 'asia-northeast3',
    secrets: [G2B_SERVICE_KEY],
    timeoutSeconds: 120,
  },
  async () => {
    await syncBidsToFirestore(G2B_SERVICE_KEY.value())
  },
)

const DAILY_LIMIT = 100
const ALLOWED_ORIGINS = [
  'https://yochan-tokgeon.web.app',
  'https://yochan-tokgeon.firebaseapp.com',
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
]

// 하루 호출 횟수를 Firestore 트랜잭션으로 세서 DAILY_LIMIT을 넘으면 막는다
// (사용자가 화면의 "최신 데이터 가져오기" 버튼을 눌렀을 때만 적용 - 자동 스케줄 실행에는 적용 안 됨)
async function checkAndIncrementRateLimit(db) {
  const today = new Date().toISOString().slice(0, 10)
  const ref = db.collection('meta').doc('rateLimit')

  return db.runTransaction(async (tx) => {
    const snap = await tx.get(ref)
    const data = snap.exists ? snap.data() : {}

    if (data.date === today) {
      if (data.count >= DAILY_LIMIT) {
        return { allowed: false, remaining: 0 }
      }
      tx.set(ref, { date: today, count: data.count + 1 })
      return { allowed: true, remaining: DAILY_LIMIT - data.count - 1 }
    }

    tx.set(ref, { date: today, count: 1 })
    return { allowed: true, remaining: DAILY_LIMIT - 1 }
  })
}

function setCors(req, res) {
  const origin = req.headers.origin
  if (ALLOWED_ORIGINS.includes(origin)) {
    res.set('Access-Control-Allow-Origin', origin)
  }
}

// 화면의 "최신 데이터 가져오기" 버튼이 호출하는 엔드포인트. 하루 100회로 제한된다.
exports.fetchBidsNow = onRequest(
  {
    region: 'asia-northeast3',
    secrets: [G2B_SERVICE_KEY],
    timeoutSeconds: 120,
  },
  async (req, res) => {
    setCors(req, res)

    try {
      const db = getFirestore()
      const { allowed, remaining } = await checkAndIncrementRateLimit(db)

      if (!allowed) {
        res.status(429).json({
          error: 'rate_limited',
          message: '오늘 조회 가능 횟수를 모두 사용했습니다. 내일 다시 시도해주세요.',
        })
        return
      }

      const result = await syncBidsToFirestore(G2B_SERVICE_KEY.value())
      res.status(200).json({ ...result, remaining })
    } catch (err) {
      console.error(err)
      res.status(500).json({ error: 'internal_error', message: err.message })
    }
  },
)

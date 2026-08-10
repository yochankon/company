import { useEffect, useState } from 'react'

function parseDate(value) {
  if (!value) return null
  const normalized = value.includes('T') ? value : value.replace(' ', 'T')
  const date = new Date(normalized)
  return Number.isNaN(date.getTime()) ? null : date
}

function formatDate(value) {
  const date = parseDate(value)
  if (!date) return value || '-'
  const pad = (n) => String(n).padStart(2, '0')
  return `${date.getFullYear()}.${pad(date.getMonth() + 1)}.${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`
}

function getDday(value) {
  const date = parseDate(value)
  if (!date) return null
  const diffMs = date.setHours(0, 0, 0, 0) - new Date().setHours(0, 0, 0, 0)
  return Math.round(diffMs / (24 * 60 * 60 * 1000))
}

function DdayBadge({ deadline }) {
  const dday = getDday(deadline)
  if (dday === null) return null

  let tone = 'dday-normal'
  if (dday < 0) tone = 'dday-closed'
  else if (dday <= 3) tone = 'dday-urgent'
  else if (dday <= 7) tone = 'dday-soon'

  const label = dday < 0 ? '마감' : dday === 0 ? 'D-Day' : `D-${dday}`

  return <span className={`dday-badge ${tone}`}>{label}</span>
}

function formatPrice(value) {
  const num = Number(value)
  if (!value || Number.isNaN(num) || num <= 0) return null
  return `추정가격 ${num.toLocaleString('ko-KR')}원`
}

function Bids() {
  const [data, setData] = useState(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    fetch('/data/bids.json')
      .then((res) => {
        if (!res.ok) throw new Error('not ok')
        return res.json()
      })
      .then(setData)
      .catch(() => setError(true))
  }, [])

  return (
    <div className="page">
      <section className="page-hero">
        <p className="eyebrow">입찰정보</p>
        <h1>나라장터 입찰공고 조회</h1>
        <p className="hero-lead">
          나라장터(조달청)에 공고된 상하수도설비공사 관련 서울·수도권 입찰 정보를 준실시간으로
          모아봅니다.
        </p>
      </section>

      <section className="section">
        {data?.updatedAt && (
          <p className="bids-updated">마지막 업데이트: {formatDate(data.updatedAt)}</p>
        )}

        {error && (
          <div className="bids-empty">
            <p>입찰정보를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.</p>
          </div>
        )}

        {!error && data && data.bids.length === 0 && (
          <div className="bids-empty">
            <p>아직 표시할 입찰공고가 없습니다.</p>
            <small>
              데이터 자동 수집이 아직 설정되지 않았거나, 조건에 맞는 공고가 없는 경우입니다.
            </small>
          </div>
        )}

        {!error && data && data.bids.length > 0 && (
          <div className="bid-list">
            {data.bids.map((bid) => (
              <div key={bid.id} className="bid-card">
                <div className="bid-card-head">
                  <h3>{bid.title}</h3>
                  <DdayBadge deadline={bid.deadline} />
                </div>
                <p className="bid-agency">{bid.agency}</p>
                <div className="bid-meta">
                  <span>공고일 {formatDate(bid.announceDate)}</span>
                  <span>마감일 {formatDate(bid.deadline)}</span>
                  {formatPrice(bid.estimatedPrice) && <span>{formatPrice(bid.estimatedPrice)}</span>}
                </div>
                {bid.bidNo && <p className="bid-no">공고번호 {bid.bidNo}</p>}
              </div>
            ))}
          </div>
        )}

        <p className="bids-source">
          출처: 나라장터(조달청) 공공데이터포털 오픈API · 검색어 &quot;상수도&quot;, &quot;하수도&quot;
          · 서울·경기·인천 공고기관 기준
        </p>
      </section>
    </div>
  )
}

export default Bids

import { company, history } from '../data/company.js'
import SealStamp from '../components/SealStamp.jsx'

function About() {
  return (
    <div className="page">
      <section className="page-hero">
        <p className="eyebrow">회사소개</p>
        <h1>{company.name}을 소개합니다</h1>
        <p className="hero-lead">
          1997년 설립 이후, 상하수도설비공사 분야에서 꾸준히 현장을 지켜온 전문건설업체입니다.
        </p>
      </section>

      <section className="section">
        <div className="section-head">
          <h2>인사말</h2>
        </div>
        <div className="greeting-card">
          <p>
            안녕하십니까, {company.name} 대표 {company.ceo}입니다.
          </p>
          <p>
높을 요(堯), 빛날 찬(燦). {company.name}이라는 이름에는 '높은 곳에서 환하게 빛난다'는 뜻이
            담겨 있습니다. 저희는 비록 땅 밑과 배관 속처럼 눈에 잘 띄지 않는 낮은 곳에서 일하지만, 그
            결과만큼은 누구나 알아볼 수 있을 만큼 높은 수준으로 완성하고자 합니다. 상하수도설비공사는
            화려하게 드러나는 일은 아니지만, 건물의 기초와 생활의 근간을 이루는 만큼 가장 높은 기준으로
            시공해야 하는 공사입니다.
          </p>
          <p>
            {company.founded} 설립 이래 저희 {company.name}은(는) 바로 그 믿음으로 크고 작은 현장을
            성실하게 수행해 왔습니다. 보이지 않는 곳까지 원칙대로 시공하는 것, 그것이 이름값을 하는
            길이라 생각하며 현장 하나하나에 최선을 다하고 있습니다.
          </p>
          <p>
            앞으로도 정직한 시공과 책임감 있는 사후 관리로, 이름처럼 높이 빛나는 {company.name}이
            되겠습니다. 감사합니다.
          </p>
          <div className="signature-row">
            <p className="signature">{company.name} 대표 {company.ceo}</p>
            <SealStamp className="seal-stamp" />
          </div>
        </div>
      </section>

      <section className="section section-alt">
        <div className="section-head">
          <h2>기업 개요</h2>
        </div>
        <div className="info-table">
          <div className="info-row">
            <dt>회사명</dt>
            <dd>{company.name}</dd>
          </div>
          <div className="info-row">
            <dt>대표자</dt>
            <dd>{company.ceo}</dd>
          </div>
          <div className="info-row">
            <dt>설립일</dt>
            <dd>{company.founded}</dd>
          </div>
          <div className="info-row">
            <dt>업종</dt>
            <dd>{company.industry}</dd>
          </div>
          <div className="info-row">
            <dt>사업분야</dt>
            <dd>{company.fields.join(', ')}</dd>
          </div>
          <div className="info-row">
            <dt>시공능력평가액</dt>
            <dd>{company.capabilityRating}</dd>
          </div>
          <div className="info-row">
            <dt>주소</dt>
            <dd>{company.address}</dd>
          </div>
          <div className="info-row">
            <dt>전화</dt>
            <dd>{company.phone}</dd>
          </div>
        </div>
        <p className="info-source">
          {company.infoAsOf} 기준 · {company.infoSource}
        </p>
      </section>

      <section className="section">
        <div className="section-head">
          <h2>연혁</h2>
        </div>
        <ul className="timeline">
          {history.map((h) => (
            <li key={h.year}>
              <span className="timeline-year">{h.year}</span>
              <span className="timeline-event">{h.event}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}

export default About

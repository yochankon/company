import { Link } from 'react-router-dom'
import { company, businessFields } from '../data/company.js'
import PipeIllustration from '../components/PipeIllustration.jsx'

const stats = [
  { label: '설립', value: company.founded },
  { label: '시공능력평가액', value: company.capabilityRating },
  { label: '전문 분야', value: `${company.fields.length}개 분야` },
]

function Home() {
  return (
    <div className="page">
      <section className="hero">
        <div className="hero-inner">
          <p className="eyebrow">서울 영등포구 · {company.industry}</p>
          <h1>
            믿을 수 있는 시공,
            <br />
            {company.name}
          </h1>
          <p className="hero-lead">{company.slogan}</p>
          <div className="hero-actions">
            <Link to="/contact" className="btn btn-primary">
              문의하기
            </Link>
            <Link to="/services" className="btn btn-ghost">
              사업분야 보기
            </Link>
          </div>
        </div>
        <div className="hero-stats">
          {stats.map((s) => (
            <div key={s.label} className="stat-card">
              <span className="stat-value">{s.value}</span>
              <span className="stat-label">{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <h2>사업분야</h2>
          <p>상하수도설비공사 분야에서 꾸준히 실적을 쌓아가고 있습니다.</p>
        </div>
        <div className="field-showcase">
          <PipeIllustration className="field-illustration" />
          <div className="field-showcase-content">
            <h3>{businessFields[0].title}</h3>
            <p>{businessFields[0].summary}</p>
            <Link to="/services" className="card-link">
              자세히 보기 &rarr;
            </Link>
          </div>
        </div>
      </section>

      <section className="section section-alt">
        <div className="section-head">
          <h2>{company.name}이 드리는 약속</h2>
        </div>
        <div className="card-grid card-grid-3">
          <div className="promise-card">
            <h3>현장 중심</h3>
            <p>작은 현장까지 대표가 직접 챙기는 꼼꼼한 시공 관리</p>
          </div>
          <div className="promise-card">
            <h3>정직한 견적</h3>
            <p>불필요한 비용 없이 투명하게 산출한 견적 제공</p>
          </div>
          <div className="promise-card">
            <h3>사후 관리</h3>
            <p>준공 이후에도 이어지는 책임감 있는 하자 대응</p>
          </div>
        </div>
      </section>

      <section className="cta">
        <div className="cta-inner">
          <h2>공사 문의가 있으신가요?</h2>
          <p>전화 또는 온라인 문의로 편하게 연락 주세요.</p>
          <div className="hero-actions">
            <a href={`tel:${company.phone}`} className="btn btn-primary">
              {company.phone}
            </a>
            <Link to="/contact" className="btn btn-ghost btn-ghost-light">
              온라인 문의
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home

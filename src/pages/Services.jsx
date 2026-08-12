import { Link } from 'react-router-dom'
import { businessFields } from '../data/company.js'
import PipeIllustration from '../components/PipeIllustration.jsx'

function Services() {
  return (
    <div className="page">
      <section className="page-hero">
        <p className="eyebrow">사업분야</p>
        <h1>전문성을 갖춘 상하수도설비공사</h1>
        <p className="hero-lead">현장 경험을 바탕으로 상하수도설비공사를 전문적으로 수행합니다.</p>
      </section>

      <section className="section">
        {businessFields.map((field, i) => (
          <div key={field.id} className={`service-block ${i % 2 === 1 ? 'service-block-reverse' : ''}`}>
            <PipeIllustration className="service-media" />

            <div className="service-content">
              <h2>{field.title}</h2>
              <p>{field.description}</p>
              <ul className="point-list">
                {field.points.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </section>

      <section className="cta">
        <div className="cta-inner">
          <h2>공사 상담이 필요하신가요?</h2>
          <p>현장 상황을 알려주시면 견적과 일정을 안내해 드립니다.</p>
          <Link to="/contact" className="btn btn-primary">
            문의하기
          </Link>
        </div>
      </section>
    </div>
  )
}

export default Services

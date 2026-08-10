import { useState } from 'react'
import { projects } from '../data/company.js'

const categories = ['전체', ...new Set(projects.map((p) => p.category))]

function Projects() {
  const [filter, setFilter] = useState('전체')
  const filtered = filter === '전체' ? projects : projects.filter((p) => p.category === filter)

  return (
    <div className="page">
      <section className="page-hero">
        <p className="eyebrow">시공실적</p>
        <h1>주요 시공 실적</h1>
        <p className="hero-lead">공공기관 발주 정보를 기준으로 정리한 최근 수주 실적입니다.</p>
      </section>

      <section className="section">
        <div className="filter-bar">
          {categories.map((c) => (
            <button
              key={c}
              type="button"
              className={`filter-btn ${filter === c ? 'filter-btn-active' : ''}`}
              onClick={() => setFilter(c)}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="card-grid">
          {filtered.map((p) => (
            <div key={p.id} className="project-card">
              <div className="project-thumb" aria-hidden="true">
                <span>{p.category}</span>
              </div>
              <div className="project-body">
                <h3>{p.title}</h3>
                <p className="project-client">{p.client}</p>
                <p className="project-meta">
                  {p.location} · {p.year}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

export default Projects

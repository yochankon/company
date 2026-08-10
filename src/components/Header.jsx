import { NavLink } from 'react-router-dom'
import { company } from '../data/company.js'

const links = [
  { to: '/', label: '홈', end: true },
  { to: '/about', label: '회사소개' },
  { to: '/services', label: '사업분야' },
  { to: '/projects', label: '시공실적' },
  { to: '/bids', label: '입찰정보' },
  { to: '/contact', label: '오시는 길' },
]

function Header() {
  return (
    <header className="header">
      <div className="header-inner">
        <div className="header-top">
          <NavLink to="/" className="brand">
            <span className="brand-mark">요</span>
            <span className="brand-text">
              {company.name}
              <small>{company.nameEn}</small>
            </span>
          </NavLink>

          <a href={`tel:${company.phone}`} className="mobile-call" aria-label={`전화 ${company.phone}`}>
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" aria-hidden="true">
              <path
                d="M6.6 10.8c1.4 2.8 3.8 5.2 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.9 21 3 13.1 3 3.5c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.2.2 2.4.6 3.6.1.3 0 .7-.3 1l-2.2 2.2z"
                fill="currentColor"
              />
            </svg>
          </a>
        </div>

        <nav className="nav">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) => `nav-link ${isActive ? 'nav-link-active' : ''}`}
            >
              {link.label}
            </NavLink>
          ))}
          <a href={`tel:${company.phone}`} className="nav-cta">
            {company.phone}
          </a>
        </nav>
      </div>
    </header>
  )
}

export default Header

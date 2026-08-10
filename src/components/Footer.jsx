import { company } from '../data/company.js'

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <span className="brand-mark">요</span>
          <span className="brand-text">
            {company.name}
            <small>{company.nameEn}</small>
          </span>
        </div>
        <dl className="footer-info">
          <div>
            <dt>대표</dt>
            <dd>{company.ceo}</dd>
          </div>
          <div>
            <dt>주소</dt>
            <dd>{company.address}</dd>
          </div>
          <div>
            <dt>전화</dt>
            <dd>
              <a href={`tel:${company.phone}`}>{company.phone}</a>
            </dd>
          </div>
          <div>
            <dt>업종</dt>
            <dd>{company.industry} ({company.fields.join(', ')})</dd>
          </div>
        </dl>
        <p className="footer-copy">
          &copy; {new Date().getFullYear()} {company.name}. All rights reserved.
        </p>
      </div>
    </footer>
  )
}

export default Footer

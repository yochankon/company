import { useRef, useState } from 'react'
import emailjs from '@emailjs/browser'
import { company } from '../data/company.js'

const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID
const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID
const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY
const EMAILJS_READY = Boolean(SERVICE_ID && TEMPLATE_ID && PUBLIC_KEY)

function Contact() {
  const formRef = useRef(null)
  const [status, setStatus] = useState('idle') // idle | sending | sent | error

  function handleSubmit(e) {
    e.preventDefault()

    if (!EMAILJS_READY) {
      setStatus('not-configured')
      return
    }

    setStatus('sending')
    emailjs.sendForm(SERVICE_ID, TEMPLATE_ID, formRef.current, { publicKey: PUBLIC_KEY }).then(
      () => setStatus('sent'),
      () => setStatus('error'),
    )
  }

  return (
    <div className="page">
      <section className="page-hero">
        <p className="eyebrow">오시는 길 / 문의</p>
        <h1>언제든지 편하게 연락 주세요</h1>
        <p className="hero-lead">전화 상담을 원하시면 아래 번호로, 온라인 문의는 폼을 이용해 주세요.</p>
      </section>

      <section className="section contact-grid">
        <div className="contact-info">
          <div className="info-table">
            <div className="info-row">
              <dt>회사명</dt>
              <dd>{company.name}</dd>
            </div>
            <div className="info-row">
              <dt>대표</dt>
              <dd>{company.ceo}</dd>
            </div>
            <div className="info-row">
              <dt>주소</dt>
              <dd>{company.address}</dd>
            </div>
            <div className="info-row">
              <dt>전화</dt>
              <dd>
                <a href={`tel:${company.phone}`}>{company.phone}</a>
              </dd>
            </div>
          </div>

          <iframe
            className="contact-map"
            title="오시는 길 지도"
            src={`https://www.google.com/maps?q=${encodeURIComponent(company.address)}&output=embed`}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>

        <form ref={formRef} className="contact-form" onSubmit={handleSubmit}>
          {status === 'sent' ? (
            <div className="form-success">
              <h3>문의가 접수되었습니다</h3>
              <p>빠른 시일 내에 연락드리겠습니다. 감사합니다.</p>
            </div>
          ) : (
            <>
              <div className="form-field">
                <label htmlFor="name">이름</label>
                <input id="name" name="user_name" type="text" required />
              </div>
              <div className="form-field">
                <label htmlFor="phone">연락처</label>
                <input id="phone" name="user_phone" type="tel" required />
              </div>
              <div className="form-field">
                <label htmlFor="message">문의 내용</label>
                <textarea id="message" name="message" rows="5" required />
              </div>
              <input type="hidden" name="to_email" value="kong1020@naver.com" />

              {status === 'not-configured' && (
                <p className="form-error">
                  문의 폼 발송 설정이 아직 완료되지 않았습니다. 전화({company.phone})로 문의해 주세요.
                </p>
              )}
              {status === 'error' && (
                <p className="form-error">전송에 실패했습니다. 잠시 후 다시 시도하시거나 전화로 문의해 주세요.</p>
              )}

              <button type="submit" className="btn btn-primary btn-block" disabled={status === 'sending'}>
                {status === 'sending' ? '전송 중...' : '문의 보내기'}
              </button>
            </>
          )}
        </form>
      </section>
    </div>
  )
}

export default Contact

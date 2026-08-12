import { useEffect, useState } from 'react'
import { doc, onSnapshot, runTransaction } from 'firebase/firestore'
import { db } from '../firebase.js'
import { company } from '../data/company.js'

const VISITED_KEY = 'yochan_visited_session'

function useVisitorCount() {
  const [count, setCount] = useState(null)

  useEffect(() => {
    const ref = doc(db, 'meta', 'visitors')

    const unsubscribe = onSnapshot(ref, (snap) => {
      setCount(snap.exists() ? snap.data().count : 0)
    })

    if (!sessionStorage.getItem(VISITED_KEY)) {
      sessionStorage.setItem(VISITED_KEY, '1')
      runTransaction(db, async (tx) => {
        const snap = await tx.get(ref)
        tx.set(ref, { count: snap.exists() ? snap.data().count + 1 : 1 })
      }).catch(() => {})
    }

    return unsubscribe
  }, [])

  return count
}

function Footer() {
  const visitorCount = useVisitorCount()

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
        <div className="footer-bottom">
          <span className="footer-visitors">
            누적 방문자 {visitorCount === null ? '-' : visitorCount.toLocaleString()}명
          </span>
          <p className="footer-copy">
            &copy; {new Date().getFullYear()} {company.name}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer

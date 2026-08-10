import { Outlet, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import Header from './components/Header.jsx'
import Footer from './components/Footer.jsx'
import './App.css'

function App() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return (
    <div className="site">
      <Header />
      <main className="site-main">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}

export default App

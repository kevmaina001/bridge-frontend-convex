import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import Payments from './pages/Payments'
import Clients from './pages/Clients'
import ClientDetails from './pages/ClientDetails'
import SplynxCustomers from './pages/SplynxCustomers'
import CustomerMappings from './pages/CustomerMappings'
import SendSMS from './pages/SendSMS'
import { Menu, X, Activity } from 'lucide-react'
import './App.css'

function App() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.classList.add('menu-open')
    } else {
      document.body.classList.remove('menu-open')
    }

    return () => {
      document.body.classList.remove('menu-open')
    }
  }, [mobileMenuOpen])

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen)
  }

  const closeMobileMenu = () => {
    setMobileMenuOpen(false)
  }

  return (
    <Router>
      <div className="app">
        <header className="header">
          <div className="container">
            <div className="header-content">
              <Link to="/" className="logo-link" onClick={closeMobileMenu}>
                <Activity size={28} className="logo-icon" />
                <h1 className="logo">Payment Bridge</h1>
              </Link>

              <button
                className="mobile-menu-toggle"
                onClick={toggleMobileMenu}
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>

              <nav className={`nav ${mobileMenuOpen ? 'nav-open' : ''}`}>
                <Link to="/" className="nav-link" onClick={closeMobileMenu}>
                  Dashboard
                </Link>
                <Link to="/payments" className="nav-link" onClick={closeMobileMenu}>
                  Payments
                </Link>
                <Link to="/clients" className="nav-link" onClick={closeMobileMenu}>
                  Clients
                </Link>
                <Link to="/sms" className="nav-link" onClick={closeMobileMenu}>
                  Send SMS
                </Link>
                <Link to="/splynx-customers" className="nav-link" onClick={closeMobileMenu}>
                  Splynx Customers
                </Link>
                <Link to="/mappings" className="nav-link" onClick={closeMobileMenu}>
                  Mappings
                </Link>
              </nav>
            </div>
          </div>
          {mobileMenuOpen && (
            <div className="mobile-menu-overlay" onClick={closeMobileMenu} />
          )}
        </header>

        <main className="main">
          <div className="container">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/payments" element={<Payments />} />
              <Route path="/clients" element={<Clients />} />
              <Route path="/clients/:clientId" element={<ClientDetails />} />
              <Route path="/sms" element={<SendSMS />} />
              <Route path="/splynx-customers" element={<SplynxCustomers />} />
              <Route path="/mappings" element={<CustomerMappings />} />
            </Routes>
          </div>
        </main>

        <footer className="footer">
          <div className="container">
            <p>Splynx-UISP Payment Bridge &copy; 2025</p>
          </div>
        </footer>
      </div>
    </Router>
  )
}

export default App

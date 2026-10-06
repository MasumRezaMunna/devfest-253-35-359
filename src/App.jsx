import { useState } from 'react'
import { LanguageProvider } from './contexts/LanguageContext'
import { ThemeProvider } from './contexts/ThemeContext'
import Header from './components/Header'
import Footer from './components/Footer'
import LandingPage from './pages/LandingPage'
import BuilderPage from './pages/BuilderPage'
import './App.css'

/**
 * App — root component.
 * Wrapped in both ThemeProvider (dark/light) and LanguageProvider (EN/BN).
 */
export default function App() {
  const [page, setPage] = useState('landing')

  return (
    <ThemeProvider>
      <LanguageProvider>
        <div className="app">
          <Header />

          {page === 'landing' && (
            <LandingPage onStart={() => setPage('builder')} />
          )}

          {page === 'builder' && (
            <BuilderPage onBack={() => setPage('landing')} />
          )}

          <Footer />
        </div>
      </LanguageProvider>
    </ThemeProvider>
  )
}

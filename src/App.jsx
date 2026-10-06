import { useState } from 'react'
import { LanguageProvider } from './contexts/LanguageContext'
import Header from './components/Header'
import Footer from './components/Footer'
import LandingPage from './pages/LandingPage'
import BuilderPage from './pages/BuilderPage'
import './App.css'

/**
 * App — root component.
 *
 * Simple page-based routing via state (no react-router needed at this stage).
 * Pages:
 *   'landing'  — Marketing / entry point
 *   'builder'  — Document package builder (Iteration 2+)
 */
export default function App() {
  const [page, setPage] = useState('landing')

  return (
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
  )
}

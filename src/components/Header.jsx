import { useLanguage } from '../contexts/LanguageContext'
import './Header.css'

export default function Header() {
  const { lang, toggleLanguage, t } = useLanguage()

  return (
    <header className="header">
      <div className="container header__inner">
        <div className="header__brand">
          <div className="header__logo">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
              <rect width="32" height="32" rx="8" fill="#1a56db"/>
              <path d="M8 10h10M8 14h10M8 18h7" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              <path d="M20 16l4 4-4 4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="24" cy="12" r="3" fill="#34d399" stroke="white" strokeWidth="1.5"/>
            </svg>
          </div>
          <span className="header__app-name">{t.appName}</span>
        </div>

        <nav className="header__nav" aria-label="Main navigation">
          <button
            id="btn-lang-toggle"
            className="btn btn--ghost btn--sm header__lang-btn"
            onClick={toggleLanguage}
            aria-label={lang === 'en' ? 'Switch to Bangla' : 'Switch to English'}
            title={lang === 'en' ? 'বাংলায় দেখুন' : 'View in English'}
          >
            <span className="lang-icon" aria-hidden="true">🌐</span>
            {lang === 'en' ? 'বাংলা' : 'English'}
          </button>
        </nav>
      </div>
    </header>
  )
}

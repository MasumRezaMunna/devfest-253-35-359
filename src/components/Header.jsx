import { useLanguage } from '../contexts/LanguageContext'
import { useTheme } from '../contexts/ThemeContext'
import './Header.css'

export default function Header() {
  const { lang, toggleLanguage, t } = useLanguage()
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <header className="header">
      <div className="container header__inner">

        {/* Brand */}
        <div className="header__brand">
          <div className="header__logo" aria-hidden="true">
            <svg width="34" height="34" viewBox="0 0 34 34" fill="none">
              <rect width="34" height="34" rx="9" fill="var(--color-primary)"/>
              <path d="M9 11h11M9 15h11M9 19h8" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              <path d="M21 17l4 4-4 4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="25" cy="12" r="3.5" fill="#34d399" stroke="white" strokeWidth="1.5"/>
            </svg>
          </div>
          <div className="header__brand-text">
            <span className="header__app-name">{t.appName}</span>
            <span className="header__app-sub">AI DevFest 2026</span>
          </div>
        </div>

        {/* Nav controls */}
        <nav className="header__nav" aria-label="Main navigation">

          {/* Language toggle */}
          <button
            id="btn-lang-toggle"
            className="header__icon-btn"
            onClick={toggleLanguage}
            aria-label={lang === 'en' ? 'Switch to Bangla' : 'Switch to English'}
            title={lang === 'en' ? 'বাংলায় দেখুন' : 'View in English'}
          >
            <span className="lang-icon" aria-hidden="true">🌐</span>
            <span className="header__icon-btn-label">
              {lang === 'en' ? 'বাংলা' : 'English'}
            </span>
          </button>

          {/* Theme toggle */}
          <button
            id="btn-theme-toggle"
            className="header__theme-btn"
            onClick={toggleTheme}
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            title={isDark ? 'Light mode' : 'Dark mode'}
          >
            <span className="header__theme-track">
              <span className="header__theme-thumb">
                {isDark ? '🌙' : '☀️'}
              </span>
            </span>
          </button>

        </nav>
      </div>
    </header>
  )
}

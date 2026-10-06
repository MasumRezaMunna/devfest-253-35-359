import { useLanguage } from '../contexts/LanguageContext'
import './Footer.css'

export default function Footer() {
  const { t } = useLanguage()
  const year = new Date().getFullYear()

  return (
    <footer className="footer">
      <div className="container footer__inner">
        <p className="footer__text">{t.footerBuilt} &mdash; {year}</p>
        <p className="footer__privacy">🔒 {t.footerPrivacy}</p>
      </div>
    </footer>
  )
}

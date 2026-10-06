/* ──────────────────────────────────────────────────────────
   BUILDER PAGE — placeholder for Iteration 2+
   ────────────────────────────────────────────────────────── */
import { useLanguage } from '../contexts/LanguageContext'
import './BuilderPage.css'

export default function BuilderPage({ onBack }) {
  const { t } = useLanguage()

  return (
    <main className="builder">
      <div className="container">
        {/* Back navigation */}
        <button
          id="btn-back-home"
          className="builder__back"
          onClick={onBack}
          aria-label="Go back to home"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M10 4L6 8l4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Back
        </button>

        <div className="builder__header">
          <h1 className="builder__title">{t.ctaStart}</h1>
          <p className="builder__subtitle">
            Start by uploading a <code>requirements.json</code> file.
          </p>
        </div>

        {/* Step indicator */}
        <div className="builder__steps">
          {[
            { num: 1, label: t.step1Title, active: true },
            { num: 2, label: t.step2Title, active: false },
            { num: 3, label: t.step3Title, active: false },
            { num: 4, label: t.step4Title, active: false },
          ].map(s => (
            <div
              key={s.num}
              className={`builder__step-pill ${s.active ? 'builder__step-pill--active' : ''}`}
            >
              <span className="builder__step-pill-num">{s.num}</span>
              <span className="builder__step-pill-label">{s.label}</span>
            </div>
          ))}
        </div>

        {/* Upload card — coming in Iteration 2 */}
        <div className="builder__upload-card">
          <div className="upload-placeholder">
            <div className="upload-placeholder__icon">📋</div>
            <h2 className="upload-placeholder__title">Load Requirements File</h2>
            <p className="upload-placeholder__desc">
              Upload the <code>requirements.json</code> file for this tender.
              The application will read the tender details and document requirements automatically.
            </p>
            <label
              id="label-req-upload"
              htmlFor="input-req-file"
              className="btn btn--primary upload-placeholder__btn"
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                <path d="M9 2v10M9 2L6 5M9 2l3 3M3 14h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Choose requirements.json
            </label>
            <input
              id="input-req-file"
              type="file"
              accept=".json,application/json"
              className="upload-placeholder__input"
              aria-label="Upload requirements.json"
            />
            <p className="upload-placeholder__hint">
              JSON files only · Max 1 MB
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}

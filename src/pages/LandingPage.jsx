import { useLanguage } from '../contexts/LanguageContext'
import './LandingPage.css'

/* ── Workflow step data ── */
const WORKFLOW_STEPS = [
  { num: 1, icon: '📋', keyTitle: 'step1Title', keyDesc: 'step1Desc', done: false },
  { num: 2, icon: '📄', keyTitle: 'step2Title', keyDesc: 'step2Desc', done: false },
  { num: 3, icon: '✅', keyTitle: 'step3Title', keyDesc: 'step3Desc', done: false },
  { num: 4, icon: '📦', keyTitle: 'step4Title', keyDesc: 'step4Desc', done: false },
]

/* ── Feature card data ── */
const FEATURES = [
  { icon: '🔒', keyTitle: 'feat1Title', keyDesc: 'feat1Desc', accent: '#1a56db' },
  { icon: '🔍', keyTitle: 'feat2Title', keyDesc: 'feat2Desc', accent: '#0891b2' },
  { icon: '🌐', keyTitle: 'feat3Title', keyDesc: 'feat3Desc', accent: '#7c3aed' },
  { icon: '📦', keyTitle: 'feat4Title', keyDesc: 'feat4Desc', accent: '#16a34a' },
]

export default function LandingPage({ onStart }) {
  const { t } = useLanguage()

  return (
    <main className="landing">
      {/* ─── Hero ─── */}
      <section className="landing__hero" aria-labelledby="hero-heading">
        <div className="container">
          <div className="hero__badge">
            <span className="badge badge--blue">AI DevFest Hackathon</span>
          </div>
          <h1 id="hero-heading" className="hero__title">
            <span className="hero__title-accent">{t.heroTitle}</span>
          </h1>
          <p className="hero__subtitle">{t.heroSubtitle}</p>
          <p className="hero__privacy">
            {t.heroPrivacyNote}
          </p>

          <div className="hero__actions">
            <button
              id="btn-start-new"
              className="btn btn--primary btn--lg"
              onClick={onStart}
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <path d="M10 2v16M2 10h16" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
              </svg>
              {t.ctaStart}
            </button>
            <button
              id="btn-load-requirements"
              className="btn btn--secondary btn--lg"
              onClick={onStart}
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <path d="M4 12v3a1 1 0 001 1h10a1 1 0 001-1v-3M10 2v10m0 0l-3-3m3 3l3-3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              {t.ctaLoad}
            </button>
          </div>

          {/* Hero illustration strip */}
          <div className="hero__doc-strip" aria-hidden="true">
            <DocStrip />
          </div>
        </div>
      </section>

      {/* ─── Workflow ─── */}
      <section className="landing__workflow" aria-labelledby="workflow-heading">
        <div className="container">
          <h2 id="workflow-heading" className="section-title">{t.workflowTitle}</h2>
          <div className="workflow__steps">
            {WORKFLOW_STEPS.map((step, idx) => (
              <WorkflowStep
                key={step.num}
                step={step}
                t={t}
                isLast={idx === WORKFLOW_STEPS.length - 1}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ─── Features ─── */}
      <section className="landing__features" aria-labelledby="features-heading">
        <div className="container">
          <h2 id="features-heading" className="section-title">{t.featuresTitle}</h2>
          <div className="features__grid">
            {FEATURES.map(f => (
              <FeatureCard key={f.keyTitle} feature={f} t={t} />
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}

/* ── Sub-components ── */

function WorkflowStep({ step, t, isLast }) {
  return (
    <div className="workflow__step-wrapper">
      <div className="workflow__step">
        <div className="workflow__step-icon">
          <span className="workflow__step-num">{step.num}</span>
          <span className="workflow__step-emoji" aria-hidden="true">{step.icon}</span>
        </div>
        <div className="workflow__step-body">
          <h3 className="workflow__step-title">{t[step.keyTitle]}</h3>
          <p className="workflow__step-desc">{t[step.keyDesc]}</p>
        </div>
      </div>
      {!isLast && (
        <div className="workflow__arrow" aria-hidden="true">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M5 12h14M13 6l6 6-6 6" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      )}
    </div>
  )
}

function FeatureCard({ feature, t }) {
  return (
    <div className="feature-card">
      <div className="feature-card__icon" style={{ '--accent': feature.accent }}>
        <span aria-hidden="true">{feature.icon}</span>
      </div>
      <h3 className="feature-card__title">{t[feature.keyTitle]}</h3>
      <p className="feature-card__desc">{t[feature.keyDesc]}</p>
    </div>
  )
}

function DocStrip() {
  const docs = [
    { label: 'Trade License', status: 'ok', pages: 2 },
    { label: 'TIN Certificate', status: 'ok', pages: 1 },
    { label: 'Bank Solvency', status: 'warn', pages: 3 },
    { label: 'Technical Proposal', status: 'ok', pages: 8 },
    { label: 'Financial Proposal', status: 'missing', pages: 0 },
  ]

  const statusColors = { ok: '#16a34a', warn: '#d97706', missing: '#dc2626' }
  const statusLabels = { ok: 'OK', warn: 'Expiry', missing: 'Missing' }

  return (
    <div className="doc-strip">
      {docs.map((doc, i) => (
        <div key={i} className="doc-chip">
          <span className="doc-chip__icon">📄</span>
          <div className="doc-chip__info">
            <span className="doc-chip__name">{doc.label}</span>
            {doc.pages > 0 && (
              <span className="doc-chip__pages">{doc.pages}p</span>
            )}
          </div>
          <span
            className="doc-chip__status"
            style={{ background: statusColors[doc.status] + '22', color: statusColors[doc.status] }}
          >
            {statusLabels[doc.status]}
          </span>
        </div>
      ))}
    </div>
  )
}

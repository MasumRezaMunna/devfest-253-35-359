import { useState } from 'react'
import { useLanguage } from '../contexts/LanguageContext'
import { computeStatus } from './StatusBadge'
import { generatePackage, downloadPdf } from '../utils/generatePackage'
import { formatDate } from '../utils/formatDate'
import TenderInfoCard from './TenderInfoCard'
import RequirementsList from './RequirementsList'
import './GeneratePanel.css'

/**
 * GeneratePanel
 *
 * Final step — shows package summary and triggers PDF generation.
 *
 * @param {{
 *   tender, requirements, pdfEntries,
 *   matches: Record<string, string>,     reqId → entryId
 *   expiryDates: Record<string, string>,
 *   onBack: () => void,
 * }} props
 */
export default function GeneratePanel({
  tender,
  requirements,
  pdfEntries,
  matches,
  expiryDates,
  onBack,
}) {
  const { lang, t } = useLanguage()
  const [generating, setGenerating] = useState(false)
  const [error, setError]           = useState(null)
  const [done, setDone]             = useState(false)

  // Build the file-keyed matches for RequirementsList
  const fileMatches = Object.fromEntries(
    Object.entries(matches).map(([reqId, entryId]) => [
      reqId,
      pdfEntries.find(e => e.id === entryId)?.file ?? null,
    ])
  )

  // Blocking issues
  const blockingIssues = requirements.filter(req => {
    const file   = fileMatches[req.id] ?? null
    const expiry = expiryDates[req.id] ?? null
    const status = computeStatus(req, file, expiry, tender.submission_deadline)
    return ['missing', 'expiry_needed', 'expired'].includes(status)
  })

  const canGenerate = blockingIssues.length === 0

  // Included documents list (for preview)
  const includedDocs = requirements.filter(req => matches[req.id])

  async function handleGenerate() {
    setError(null)
    setGenerating(true)
    setDone(false)
    try {
      const bytes    = await generatePackage({ tender, requirements, pdfEntries, matches, expiryDates, lang })
      const filename = `${tender.tender_id}_Package.pdf`
      downloadPdf(bytes, filename)
      setDone(true)
    } catch (err) {
      setError(`Generation failed: ${err.message}`)
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="generate-panel">

      {/* Tender card */}
      <TenderInfoCard tender={tender} />

      {/* Blocking issues banner */}
      {blockingIssues.length > 0 && (
        <div className="generate-panel__issues" role="alert">
          <span className="generate-panel__issues-icon">⚠️</span>
          <div>
            <strong>{blockingIssues.length} blocking issue{blockingIssues.length > 1 ? 's' : ''} must be resolved:</strong>
            <ul className="generate-panel__issues-list">
              {blockingIssues.map(req => {
                const file   = fileMatches[req.id] ?? null
                const expiry = expiryDates[req.id] ?? null
                const status = computeStatus(req, file, expiry, tender.submission_deadline)
                const title  = lang === 'bn' ? req.title_bn : req.title_en
                const reason = {
                  missing:       'No file matched',
                  expiry_needed: 'Expiry date required',
                  expired:       `Expired before ${formatDate(tender.submission_deadline, lang)}`,
                }[status] ?? status
                return (
                  <li key={req.id}>
                    <strong>{String(req.order).padStart(2, '0')}. {title}</strong> — {reason}
                  </li>
                )
              })}
            </ul>
            <p className="generate-panel__issues-hint">
              Go back to Matching to fix these issues, or generate anyway (package will be incomplete).
            </p>
          </div>
        </div>
      )}

      {/* Package preview */}
      <div className="generate-panel__section-header">
        <h2 className="generate-panel__section-title">Package Contents</h2>
        <span className="generate-panel__section-count">
          {includedDocs.length} document{includedDocs.length !== 1 ? 's' : ''} included
        </span>
      </div>

      <div className="generate-panel__doc-list">
        {requirements.map(req => {
          const entryId = matches[req.id]
          const entry   = pdfEntries.find(e => e.id === entryId)
          const file    = fileMatches[req.id] ?? null
          const expiry  = expiryDates[req.id] ?? null
          const status  = computeStatus(req, file, expiry, tender.submission_deadline)
          const title   = lang === 'bn' ? req.title_bn : req.title_en

          return (
            <div
              key={req.id}
              className={`gen-doc-row gen-doc-row--${entry ? 'included' : 'skipped'}`}
            >
              <span className="gen-doc-row__num">
                {entry ? String(req.order).padStart(2, '0') : '—'}
              </span>
              <span className="gen-doc-row__icon" aria-hidden="true">
                {entry ? '📄' : req.mandatory ? '❌' : '—'}
              </span>
              <div className="gen-doc-row__info">
                <span className="gen-doc-row__title">{title}</span>
                {entry ? (
                  <span className="gen-doc-row__file">
                    {entry.file.name}
                    {entry.pages > 0 && ` · ${entry.pages} page${entry.pages > 1 ? 's' : ''}`}
                    {expiry && ` · Exp: ${formatDate(expiry, lang)}`}
                  </span>
                ) : (
                  <span className="gen-doc-row__skip">
                    {req.mandatory ? 'Missing — mandatory document' : 'Not included (optional)'}
                  </span>
                )}
              </div>
              <span className={`gen-doc-row__badge gen-doc-row__badge--${status}`}>
                {status === 'ok' ? '✓ OK' :
                 status === 'missing' ? '✗ Missing' :
                 status === 'expired' ? '✗ Expired' :
                 status === 'expiry_needed' ? '! Expiry' :
                 'Skip'}
              </span>
            </div>
          )
        })}
      </div>

      {/* Error display */}
      {error && (
        <div className="generate-panel__error" role="alert">
          <span>⚠️</span> {error}
        </div>
      )}

      {/* Success message */}
      {done && (
        <div className="generate-panel__success" role="status">
          <span>✅</span>
          <div>
            <strong>Package downloaded!</strong>
            <p>File saved as <code>{tender.tender_id}_Package.pdf</code></p>
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div className="generate-panel__actions">
        <button className="builder__back" onClick={onBack}>
          ← Back to Matching
        </button>

        <button
          id="btn-generate-pdf"
          className={`btn btn--lg generate-panel__btn ${canGenerate ? 'btn--primary' : 'generate-panel__btn--warn'}`}
          onClick={handleGenerate}
          disabled={generating}
          aria-label="Generate PDF package"
        >
          {generating ? (
            <>
              <div className="spinner-sm" aria-hidden="true" />
              Generating…
            </>
          ) : done ? (
            <>📥 Download Again</>
          ) : (
            <>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <path d="M10 2v12M10 14l-4-4M10 14l4-4M3 17h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              {canGenerate ? `Generate ${tender.tender_id}_Package.pdf` : 'Generate Anyway (Incomplete)'}
            </>
          )}
        </button>
      </div>

      {/* Full requirements status */}
      <details className="generate-panel__details">
        <summary className="generate-panel__details-summary">
          View full requirements status
        </summary>
        <div className="generate-panel__details-body">
          <RequirementsList
            requirements={requirements}
            tender={tender}
            matches={fileMatches}
            expiryDates={expiryDates}
          />
        </div>
      </details>
    </div>
  )
}

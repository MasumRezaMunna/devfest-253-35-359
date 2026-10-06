import { useState, useRef, useCallback } from 'react'
import { useLanguage } from '../contexts/LanguageContext'
import { readAndParseRequirementsFile } from '../utils/parseRequirements'
import TenderInfoCard from '../components/TenderInfoCard'
import RequirementsList from '../components/RequirementsList'
import PdfUploadZone from '../components/PdfUploadZone'
import MatchingPanel from '../components/MatchingPanel'
import GeneratePanel from '../components/GeneratePanel'
import './BuilderPage.css'

/**
 * BuilderPage
 *
 * Phases:
 *   'upload'  → Step 1: Load requirements.json
 *   'pdf'     → Step 2: Upload PDF documents
 *   'match'   → Step 3: Match & Verify (Iteration 4)
 *   'generate'→ Step 4: Generate Package (Iteration 6)
 *
 * State:
 *   tender, requirements — from parsed JSON
 *   pdfEntries           — enriched PDF file list
 *   matches, expiryDates — populated in Iteration 4
 */
export default function BuilderPage({ onBack }) {
  const { t } = useLanguage()

  const [phase, setPhase] = useState('upload')  // 'upload' | 'pdf' | 'match' | 'generate'
  const [tender, setTender]               = useState(null)
  const [requirements, setRequirements]   = useState([])
  const [error, setError]                 = useState(null)
  const [loading, setLoading]             = useState(false)
  const [isDragOver, setIsDragOver]       = useState(false)

  // Step 2: PDF files
  const [pdfEntries, setPdfEntries]     = useState([])  // PdfEntry[]

  // Step 3: Matching (Iteration 4)
  const [matches, setMatches]           = useState({}) // reqId → File
  const [expiryDates, setExpiryDates]   = useState({}) // reqId → "YYYY-MM-DD"

  const fileInputRef = useRef(null)

  // ── File processing ──────────────────────────────────────────────────
  const handleFile = useCallback(async (file) => {
    if (!file) return

    setError(null)
    setLoading(true)

    try {
      const { tender, requirements } = await readAndParseRequirementsFile(file)
      setTender(tender)
      setRequirements(requirements)
      setMatches({})
      setExpiryDates({})
      setPdfEntries([])
      setPhase('pdf')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  const handleInputChange = (e) => {
    const file = e.target.files?.[0]
    handleFile(file)
    // Reset so same file can be re-uploaded if needed
    e.target.value = ''
  }

  const handleReset = () => {
    setPhase('upload')
    setTender(null)
    setRequirements([])
    setMatches({})
    setPdfEntries([])
    setExpiryDates({})
    setError(null)
  }

  // ── Drag-and-drop ────────────────────────────────────────────────────
  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = () => setIsDragOver(false)

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (file) handleFile(file)
  }

  // ── Steps ────────────────────────────────────────────────────────────
  const STEPS = [
    { num: 1, label: t.step1Title },
    { num: 2, label: t.step2Title },
    { num: 3, label: t.step3Title },
    { num: 4, label: t.step4Title },
  ]

  const activeStep = {
    upload:   1,
    pdf:      2,
    match:    3,
    generate: 4,
  }[phase] ?? 1

  return (
    <main className="builder">
      <div className="container">

        {/* ── Top bar ── */}
        <div className="builder__topbar">
          <button
            id="btn-back-home"
            className="builder__back"
            onClick={onBack}
            aria-label="Go back to home"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M10 4L6 8l4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            {t.navHome}
          </button>

          {phase !== 'upload' && (
            <button
              id="btn-reset"
              className="builder__reset"
              onClick={handleReset}
              title="Load a different requirements.json"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path d="M1 7a6 6 0 1 0 6-6 6 6 0 0 0-4.24 1.76L1 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                <path d="M1 1v3h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Load Different File
            </button>
          )}
        </div>

        {/* ── Step progress ── */}
        <div className="builder__steps" role="list" aria-label="Package creation steps">
          {STEPS.map((s) => {
            const isDone   = s.num < activeStep
            const isActive = s.num === activeStep
            return (
              <div
                key={s.num}
                className={`builder__step-pill ${isActive ? 'builder__step-pill--active' : ''} ${isDone ? 'builder__step-pill--done' : ''}`}
                role="listitem"
                aria-current={isActive ? 'step' : undefined}
              >
                <span className="builder__step-pill-num">
                  {isDone ? '✓' : s.num}
                </span>
                <span className="builder__step-pill-label">{s.label}</span>
              </div>
            )
          })}
        </div>

        {/* ── Content area ── */}
        {phase === 'upload' && (
          <UploadPhase
            loading={loading}
            error={error}
            isDragOver={isDragOver}
            fileInputRef={fileInputRef}
            onInputChange={handleInputChange}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClearError={() => setError(null)}
          />
        )}

        {phase === 'pdf' && tender && (
          <PdfPhase
            tender={tender}
            requirements={requirements}
            pdfEntries={pdfEntries}
            onPdfChange={setPdfEntries}
            onContinue={() => setPhase('match')}
            t={t}
          />
        )}

        {phase === 'match' && tender && (
          <MatchPhase
            tender={tender}
            requirements={requirements}
            pdfEntries={pdfEntries}
            matches={matches}
            expiryDates={expiryDates}
            onMatchChange={(reqId, entryId) => {
              setMatches(prev => {
                const next = { ...prev }
                if (entryId === null) delete next[reqId]
                else next[reqId] = entryId
                return next
              })
              // Clear expiry when file is removed
              if (entryId === null) {
                setExpiryDates(prev => {
                  const next = { ...prev }
                  delete next[reqId]
                  return next
                })
              }
            }}
            onExpiryChange={(reqId, date) => {
              setExpiryDates(prev => ({ ...prev, [reqId]: date }))
            }}
            onBack={() => setPhase('pdf')}
            onContinue={() => setPhase('generate')}
            t={t}
          />
        )}

        {phase === 'generate' && tender && (
          <GeneratePhase
            tender={tender}
            requirements={requirements}
            pdfEntries={pdfEntries}
            matches={matches}
            expiryDates={expiryDates}
            onBack={() => setPhase('match')}
            t={t}
          />
        )}

      </div>
    </main>
  )
}

/* ─────────────────────────────────────────────────────────────────────
   Sub-components
───────────────────────────────────────────────────────────────────── */

function UploadPhase({ loading, error, isDragOver, fileInputRef, onInputChange, onDragOver, onDragLeave, onDrop, onClearError }) {
  return (
    <div className="upload-phase">
      {/* Error banner */}
      {error && (
        <div className="upload-error" role="alert">
          <span className="upload-error__icon" aria-hidden="true">⚠️</span>
          <span className="upload-error__msg">{error}</span>
          <button
            className="upload-error__close"
            onClick={onClearError}
            aria-label="Dismiss error"
          >✕</button>
        </div>
      )}

      {/* Drop zone */}
      <div
        className={`upload-dropzone ${isDragOver ? 'upload-dropzone--over' : ''} ${loading ? 'upload-dropzone--loading' : ''}`}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        aria-label="Drop requirements.json here or click to browse"
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
        onClick={() => fileInputRef.current?.click()}
      >
        {loading ? (
          <div className="upload-dropzone__loading">
            <div className="spinner" aria-label="Loading" />
            <p>Parsing requirements…</p>
          </div>
        ) : (
          <>
            <div className="upload-dropzone__icon" aria-hidden="true">
              {isDragOver ? '📂' : '📋'}
            </div>
            <h2 className="upload-dropzone__title">
              {isDragOver ? 'Drop it here!' : 'Load Requirements File'}
            </h2>
            <p className="upload-dropzone__desc">
              Drag and drop your <code>requirements.json</code> here, or click to browse.
            </p>
            <span className="btn btn--primary upload-dropzone__btn">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M8 2v8M8 2L5 5M8 2l3 3M2 13h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Choose File
            </span>
            <p className="upload-dropzone__hint">JSON only · Max 1 MB</p>
          </>
        )}
      </div>

      <input
        ref={fileInputRef}
        id="input-req-file"
        type="file"
        accept=".json,application/json"
        className="visually-hidden"
        onChange={onInputChange}
        aria-label="Upload requirements.json"
      />

      {/* Helper note */}
      <div className="upload-hint-card">
        <span className="upload-hint-card__icon" aria-hidden="true">💡</span>
        <div>
          <strong>Expected file:</strong> <code>requirements.json</code> from the tender package.
          It contains the tender details and the list of required documents.
        </div>
      </div>
    </div>
  )
}

function PdfPhase({ tender, requirements, pdfEntries, onPdfChange, onContinue, t }) {
  const canContinue = pdfEntries.length > 0

  return (
    <div className="loaded-phase">
      <TenderInfoCard tender={tender} />

      <div className="loaded-section-header">
        <h2 className="loaded-section-title">Upload PDF Documents</h2>
        <span className="loaded-section-count">{requirements.length} requirements</span>
      </div>

      <PdfUploadZone entries={pdfEntries} onChange={onPdfChange} />

      <div className="pdf-phase__actions">
        {canContinue ? (
          <button
            id="btn-continue-to-match"
            className="btn btn--primary btn--lg"
            onClick={onContinue}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
              <path d="M4 9h10M10 5l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Continue to Match & Verify
          </button>
        ) : (
          <p className="pdf-phase__hint">
            Upload at least one PDF to continue.
          </p>
        )}
      </div>
    </div>
  )
}

function MatchPhase({ tender, requirements, pdfEntries, matches, expiryDates, onMatchChange, onExpiryChange, onBack, onContinue, t }) {
  // Check if all blocking issues are resolved
  const canGenerate = requirements.every(req => {
    const entryId = matches[req.id] ?? null
    const file    = entryId ? (pdfEntries.find(e => e.id === entryId)?.file ?? null) : null
    const expiry  = expiryDates[req.id] ?? null
    if (!req.mandatory && !file) return true
    if (!file) return false
    if (req.has_expiry) {
      if (!expiry) return false
      const d  = new Date(expiry + 'T00:00:00')
      const dl = new Date(tender.submission_deadline + 'T00:00:00')
      if (d < dl) return false
    }
    return true
  })

  return (
    <div className="loaded-phase">
      <TenderInfoCard tender={tender} />

      <div className="loaded-section-header">
        <h2 className="loaded-section-title">Match Documents to Requirements</h2>
        <span className="loaded-section-count">{requirements.length} requirements · {pdfEntries.length} files</span>
      </div>

      <MatchingPanel
        requirements={requirements}
        tender={tender}
        pdfEntries={pdfEntries}
        matches={matches}
        expiryDates={expiryDates}
        onMatchChange={onMatchChange}
        onExpiryChange={onExpiryChange}
      />

      <div className="pdf-phase__actions">
        <button className="builder__back" onClick={onBack}>
          ← Back to Documents
        </button>
        <button
          id="btn-continue-to-generate"
          className={`btn ${canGenerate ? 'btn--primary' : 'btn--secondary'} btn--lg`}
          onClick={onContinue}
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
            <path d="M4 9h10M10 5l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          {canGenerate ? 'Generate Package' : 'Continue Anyway →'}
        </button>
      </div>
    </div>
  )
}

function GeneratePhase({ tender, requirements, pdfEntries, matches, expiryDates, onBack, t }) {
  return (
    <div className="loaded-phase">
      <GeneratePanel
        tender={tender}
        requirements={requirements}
        pdfEntries={pdfEntries}
        matches={matches}
        expiryDates={expiryDates}
        onBack={onBack}
      />
    </div>
  )
}

// Keep for compatibility
function LoadedPhase({ tender, requirements, matches, expiryDates }) {
  return (
    <div className="loaded-phase">
      <TenderInfoCard tender={tender} />
      <RequirementsList
        requirements={requirements}
        tender={tender}
        matches={matches}
        expiryDates={expiryDates}
      />
    </div>
  )
}


import { useState, useRef, useCallback } from 'react'
import {
  getPdfPageCount,
  hashFile,
  formatBytes,
  validateFilesBatch,
  MAX_FILES,
  MAX_TOTAL_BYTES,
} from '../utils/pdfUtils'
import './PdfUploadZone.css'

/**
 * PdfEntry — enriched file object stored in state.
 * @typedef {Object} PdfEntry
 * @property {string} id        — unique per-upload ID
 * @property {File}   file
 * @property {number} pages     — 0 while loading, >0 when done
 * @property {string} hash      — SHA-256 hex for duplicate detection
 * @property {boolean} loading  — true while page count / hash is computing
 * @property {boolean} isDuplicate
 */

let _idCounter = 0
function nextId() { return `pdf_${++_idCounter}` }

/**
 * PdfUploadZone
 *
 * Handles multi-PDF upload, validation, page counting, and duplicate detection.
 * Reports the final list to the parent via onChange(entries).
 *
 * @param {{
 *   entries: PdfEntry[],
 *   onChange: (entries: PdfEntry[]) => void,
 * }} props
 */
export default function PdfUploadZone({ entries, onChange }) {
  const [isDragOver, setIsDragOver]   = useState(false)
  const [errors, setErrors]           = useState([])
  const fileInputRef                  = useRef(null)

  // ── File ingestion ─────────────────────────────────────────────────
  const addFiles = useCallback(async (rawFiles) => {
    const files = Array.from(rawFiles)

    // Filter duplicates already in list (by name+size heuristic, hashes done async)
    const deduped = files.filter(
      f => !entries.some(e => e.file.name === f.name && e.file.size === f.size)
    )

    if (deduped.length === 0) {
      setErrors(['All selected files are already in the list.'])
      return
    }

    const validationErrors = validateFilesBatch(deduped, entries.map(e => e.file))
    if (validationErrors.length > 0) {
      setErrors(validationErrors)
      return
    }

    setErrors([])

    // Create placeholder entries (loading: true)
    const placeholders = deduped.map(file => ({
      id:          nextId(),
      file,
      pages:       0,
      hash:        '',
      loading:     true,
      isDuplicate: false,
    }))

    const next = [...entries, ...placeholders]
    onChange(next)

    // Process each file async
    const enriched = await Promise.all(
      placeholders.map(async (entry) => {
        const [pages, hash] = await Promise.all([
          getPdfPageCount(entry.file),
          hashFile(entry.file),
        ])
        return { ...entry, pages, hash, loading: false }
      })
    )

    // Merge enriched into list and detect duplicates
    onChange(prev => {
      const merged = prev.map(e => {
        const found = enriched.find(r => r.id === e.id)
        return found ?? e
      })
      return markDuplicates(merged)
    })
  }, [entries, onChange])

  // ── Duplicate marking ──────────────────────────────────────────────
  function markDuplicates(list) {
    const hashCounts = {}
    list.forEach(e => {
      if (e.hash) hashCounts[e.hash] = (hashCounts[e.hash] ?? 0) + 1
    })
    return list.map(e => ({
      ...e,
      isDuplicate: e.hash ? hashCounts[e.hash] > 1 : false,
    }))
  }

  // ── Remove entry ───────────────────────────────────────────────────
  const removeEntry = useCallback((id) => {
    onChange(prev => markDuplicates(prev.filter(e => e.id !== id)))
  }, [onChange])

  // ── Drag handlers ──────────────────────────────────────────────────
  const handleDragOver  = (e) => { e.preventDefault(); setIsDragOver(true) }
  const handleDragLeave = ()  => setIsDragOver(false)
  const handleDrop      = (e) => {
    e.preventDefault()
    setIsDragOver(false)
    addFiles(e.dataTransfer.files)
  }

  const handleInputChange = (e) => {
    addFiles(e.target.files)
    e.target.value = ''
  }

  // ── Totals ─────────────────────────────────────────────────────────
  const totalBytes   = entries.reduce((s, e) => s + e.file.size, 0)
  const totalPages   = entries.reduce((s, e) => s + e.pages, 0)
  const duplicates   = entries.filter(e => e.isDuplicate).length
  const canAddMore   = entries.length < MAX_FILES && totalBytes < MAX_TOTAL_BYTES

  return (
    <div className="pdf-upload">

      {/* ── Errors ── */}
      {errors.length > 0 && (
        <div className="pdf-upload__errors" role="alert">
          {errors.map((err, i) => (
            <div key={i} className="pdf-upload__error">
              <span aria-hidden="true">⚠️</span> {err}
            </div>
          ))}
          <button
            className="pdf-upload__clear-errors"
            onClick={() => setErrors([])}
            aria-label="Dismiss errors"
          >✕</button>
        </div>
      )}

      {/* ── Stats bar ── */}
      {entries.length > 0 && (
        <div className="pdf-upload__stats">
          <span>{entries.length} / {MAX_FILES} files</span>
          <span>{formatBytes(totalBytes)} / 50 MB</span>
          <span>{totalPages} pages total</span>
          {duplicates > 0 && (
            <span className="pdf-upload__stats--dup">
              ⚠️ {duplicates} duplicate{duplicates > 1 ? 's' : ''}
            </span>
          )}
        </div>
      )}

      {/* ── Drop zone ── */}
      {canAddMore && (
        <div
          className={`pdf-dropzone ${isDragOver ? 'pdf-dropzone--over' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
          role="button"
          tabIndex={0}
          aria-label="Drop PDF files here or click to browse"
        >
          <span className="pdf-dropzone__icon" aria-hidden="true">
            {isDragOver ? '📂' : '📄'}
          </span>
          <span className="pdf-dropzone__label">
            {isDragOver ? 'Drop PDFs here' : 'Add PDF files'}
          </span>
          <span className="pdf-dropzone__hint">
            Drop here or click · PDF only · max {MAX_FILES} files · 50 MB total
          </span>
        </div>
      )}

      <input
        ref={fileInputRef}
        id="input-pdf-files"
        type="file"
        accept=".pdf,application/pdf"
        multiple
        className="visually-hidden"
        onChange={handleInputChange}
        aria-label="Upload PDF documents"
      />

      {/* ── File list ── */}
      {entries.length > 0 && (
        <ul className="pdf-file-list" aria-label="Uploaded PDF files">
          {entries.map(entry => (
            <PdfFileRow
              key={entry.id}
              entry={entry}
              onRemove={() => removeEntry(entry.id)}
            />
          ))}
        </ul>
      )}
    </div>
  )
}

function PdfFileRow({ entry, onRemove }) {
  return (
    <li className={`pdf-file-row ${entry.isDuplicate ? 'pdf-file-row--dup' : ''}`}>
      <span className="pdf-file-row__icon" aria-hidden="true">
        {entry.loading ? '⏳' : entry.isDuplicate ? '⚠️' : '📄'}
      </span>

      <div className="pdf-file-row__info">
        <span className="pdf-file-row__name" title={entry.file.name}>
          {entry.file.name}
        </span>
        <span className="pdf-file-row__meta">
          {formatBytes(entry.file.size)}
          {entry.loading ? (
            <span className="pdf-file-row__counting"> · counting pages…</span>
          ) : (
            <span> · {entry.pages > 0 ? `${entry.pages} page${entry.pages > 1 ? 's' : ''}` : 'unreadable'}</span>
          )}
          {entry.isDuplicate && (
            <span className="pdf-file-row__dup-tag"> · Duplicate content</span>
          )}
        </span>
      </div>

      <button
        className="pdf-file-row__remove"
        onClick={onRemove}
        aria-label={`Remove ${entry.file.name}`}
        title="Remove file"
      >✕</button>
    </li>
  )
}

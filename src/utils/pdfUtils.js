/**
 * pdfUtils.js
 *
 * Browser-side PDF processing utilities.
 * Uses pdf-lib for generation and pdfjs-dist for reading page counts.
 *
 * ALL processing is local — no data leaves the browser.
 */

/**
 * Get the page count of a PDF File using pdf-lib.
 * Falls back to 0 if the file cannot be read as a valid PDF.
 *
 * @param {File} file
 * @returns {Promise<number>}
 */
export async function getPdfPageCount(file) {
  try {
    const { PDFDocument } = await import('pdf-lib')
    const arrayBuffer = await file.arrayBuffer()
    const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true })
    return pdfDoc.getPageCount()
  } catch {
    return 0
  }
}

/**
 * Compute a simple content hash for a File to detect duplicates.
 * Uses the Web Crypto API (SHA-256) — fully browser-side.
 *
 * @param {File} file
 * @returns {Promise<string>} hex digest
 */
export async function hashFile(file) {
  const arrayBuffer = await file.arrayBuffer()
  const hashBuffer  = await crypto.subtle.digest('SHA-256', arrayBuffer)
  const hashArray   = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

/**
 * Format bytes to a human-readable string.
 * @param {number} bytes
 * @returns {string}
 */
export function formatBytes(bytes) {
  if (bytes === 0) return '0 B'
  const k     = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i     = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

// ── Validation constants ──────────────────────────────────────────────
export const MAX_FILES      = 30
export const MAX_TOTAL_BYTES = 50 * 1024 * 1024  // 50 MB

/**
 * Validate a batch of files before processing.
 * Returns an array of error strings (empty = all valid).
 *
 * @param {File[]} newFiles       — files being added
 * @param {File[]} existingFiles  — files already in the upload list
 * @returns {string[]}
 */
export function validateFilesBatch(newFiles, existingFiles) {
  const errors = []

  const combined = [...existingFiles, ...newFiles]

  // Type check
  const nonPdf = newFiles.filter(f => f.type !== 'application/pdf' && !f.name.toLowerCase().endsWith('.pdf'))
  if (nonPdf.length > 0) {
    errors.push(`Non-PDF file(s) rejected: ${nonPdf.map(f => f.name).join(', ')}`)
  }

  // Count check
  if (combined.length > MAX_FILES) {
    errors.push(`Maximum ${MAX_FILES} files allowed. You have ${combined.length}.`)
  }

  // Total size check
  const totalBytes = combined.reduce((sum, f) => sum + f.size, 0)
  if (totalBytes > MAX_TOTAL_BYTES) {
    errors.push(`Total size exceeds 50 MB limit (${formatBytes(totalBytes)}).`)
  }

  return errors
}

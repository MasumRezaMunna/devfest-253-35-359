/**
 * generatePackage.js
 *
 * Generates the complete tender PDF package entirely in the browser.
 *
 * Output structure:
 *   Page 1     — English cover page
 *   Pages 2+   — Matched PDFs in requirement order
 *   Every page — Footer: "<tender_id> | Page X of Y"
 *
 * Rules:
 *   - Skip optional requirements with no matched file
 *   - Include all pages of each PDF in original order
 *   - Footer must not cover document content (add margin via transformation)
 *
 * @param {{
 *   tender: import('./parseRequirements').Tender,
 *   requirements: import('./parseRequirements').Requirement[],
 *   pdfEntries: import('../components/PdfUploadZone').PdfEntry[],
 *   matches: Record<string, string>,      reqId → entryId
 *   expiryDates: Record<string, string>,  reqId → "YYYY-MM-DD"
 *   lang: 'en' | 'bn',
 * }} opts
 * @returns {Promise<Uint8Array>}  — raw PDF bytes ready for download
 */
export async function generatePackage({ tender, requirements, pdfEntries, matches, expiryDates, lang }) {
  const { PDFDocument, rgb, StandardFonts, degrees } = await import('pdf-lib')

  // ── 1. Collect ordered pages to include ──────────────────────────────
  const orderedItems = []

  for (const req of requirements) {
    const entryId = matches[req.id] ?? null
    if (!entryId) continue  // Skip unmatched (mandatory will be caught in UI)

    const entry = pdfEntries.find(e => e.id === entryId)
    if (!entry) continue

    const title = lang === 'bn' ? req.title_bn : req.title_en
    orderedItems.push({ req, entry, title, expiry: expiryDates[req.id] ?? null })
  }

  // ── 2. Create output document ─────────────────────────────────────────
  const outDoc  = await PDFDocument.create()
  const font    = await outDoc.embedFont(StandardFonts.Helvetica)
  const fontB   = await outDoc.embedFont(StandardFonts.HelveticaBold)

  const A4W = 595.28
  const A4H = 841.89

  // ── 3. Cover page ─────────────────────────────────────────────────────
  const cover = outDoc.addPage([A4W, A4H])
  drawCoverPage(cover, font, fontB, tender, orderedItems, expiryDates, rgb)

  // ── 4. Embed matched PDFs ─────────────────────────────────────────────
  for (const item of orderedItems) {
    const fileBytes = await item.entry.file.arrayBuffer()
    let srcDoc
    try {
      srcDoc = await PDFDocument.load(fileBytes, { ignoreEncryption: true })
    } catch {
      // If PDF can't be loaded, add a placeholder page
      const placeholder = outDoc.addPage([A4W, A4H])
      placeholder.drawText(`[Could not embed: ${item.entry.file.name}]`, {
        x: 72, y: A4H / 2,
        size: 12, font,
        color: rgb(0.6, 0.1, 0.1),
      })
      continue
    }

    const pageCount = srcDoc.getPageCount()
    const srcPageIndices = Array.from({ length: pageCount }, (_, i) => i)
    const copiedPages = await outDoc.copyPages(srcDoc, srcPageIndices)
    copiedPages.forEach(p => outDoc.addPage(p))
  }

  // ── 5. Add footer to every page ───────────────────────────────────────
  const totalPages = outDoc.getPageCount()
  const footerText = (n) => `${tender.tender_id}  |  Page ${n} of ${totalPages}`
  const FOOTER_H   = 24
  const FOOTER_SIZE = 8
  const FOOTER_COLOR = rgb(0.45, 0.45, 0.45)

  outDoc.getPages().forEach((page, idx) => {
    const { width } = page.getSize()
    const text = footerText(idx + 1)
    const textW = font.widthOfTextAtSize(text, FOOTER_SIZE)

    page.drawRectangle({
      x: 0, y: 0,
      width, height: FOOTER_H,
      color: rgb(0.97, 0.97, 0.97),
    })
    page.drawLine({
      start: { x: 0, y: FOOTER_H },
      end:   { x: width, y: FOOTER_H },
      thickness: 0.5,
      color: rgb(0.8, 0.8, 0.8),
    })
    page.drawText(text, {
      x: (width - textW) / 2,
      y: (FOOTER_H - FOOTER_SIZE) / 2,
      size: FOOTER_SIZE,
      font,
      color: FOOTER_COLOR,
    })
  })

  // ── 6. Serialize ──────────────────────────────────────────────────────
  return await outDoc.save()
}

/* ── Cover page drawing ─────────────────────────────────────────────── */
function drawCoverPage(page, font, fontB, tender, orderedItems, expiryDates, rgb) {
  const { width, height } = page.getSize()
  const MARGIN = 72

  // Background header bar
  page.drawRectangle({
    x: 0, y: height - 140,
    width, height: 140,
    color: rgb(0.10, 0.33, 0.86),  // #1a56db
  })

  // App name (top)
  page.drawText('TENDER DOCUMENT PACKAGE', {
    x: MARGIN, y: height - 55,
    size: 10, font,
    color: rgb(0.7, 0.83, 1),
  })

  // Tender title
  const titleLines = wrapText(tender.title, 52)
  titleLines.forEach((line, i) => {
    page.drawText(line, {
      x: MARGIN, y: height - 85 - (i * 22),
      size: 18, font: fontB,
      color: rgb(1, 1, 1),
    })
  })

  // Tender ID badge
  page.drawRectangle({
    x: MARGIN - 4, y: height - 130,
    width: font.widthOfTextAtSize(tender.tender_id, 10) + 12,
    height: 16,
    color: rgb(0.6, 0.78, 1),
    borderRadius: 3,
  })
  page.drawText(tender.tender_id, {
    x: MARGIN + 2, y: height - 127,
    size: 10, font: fontB,
    color: rgb(0.05, 0.17, 0.5),
  })

  // Metadata fields
  const fields = [
    ['Procuring Entity', tender.procuring_entity],
    ['Bidder',           tender.bidder],
    ['Submission Deadline', formatDateSimple(tender.submission_deadline)],
    ['Package Created',  formatDateSimple(new Date().toISOString().slice(0, 10))],
  ]

  let y = height - 185
  fields.forEach(([label, value]) => {
    page.drawText(label.toUpperCase(), {
      x: MARGIN, y,
      size: 7, font,
      color: rgb(0.55, 0.55, 0.55),
    })
    page.drawText(value, {
      x: MARGIN, y: y - 13,
      size: 10, font: fontB,
      color: rgb(0.1, 0.1, 0.1),
    })
    y -= 38
  })

  // Divider
  y -= 10
  page.drawLine({
    start: { x: MARGIN, y },
    end:   { x: width - MARGIN, y },
    thickness: 1,
    color: rgb(0.85, 0.85, 0.85),
  })
  y -= 24

  // Document index heading
  page.drawText('INCLUDED DOCUMENTS', {
    x: MARGIN, y,
    size: 9, font: fontB,
    color: rgb(0.1, 0.33, 0.86),
  })
  y -= 20

  // Document index list
  orderedItems.forEach((item, idx) => {
    const expiry = expiryDates[item.req.id]
    const rowY   = y - idx * 22

    if (rowY < 80) return  // Don't overflow footer area

    // Row background alternating
    if (idx % 2 === 0) {
      page.drawRectangle({
        x: MARGIN - 6, y: rowY - 5,
        width: width - MARGIN * 2 + 12, height: 19,
        color: rgb(0.97, 0.98, 1),
      })
    }

    // Number
    page.drawText(`${String(item.req.order).padStart(2, '0')}.`, {
      x: MARGIN, y: rowY,
      size: 9, font: fontB,
      color: rgb(0.4, 0.4, 0.6),
    })

    // Title
    page.drawText(item.title, {
      x: MARGIN + 28, y: rowY,
      size: 9, font: fontB,
      color: rgb(0.1, 0.1, 0.1),
    })

    // Pages
    if (item.entry.pages > 0) {
      const pagesText = `${item.entry.pages}p`
      const pW = font.widthOfTextAtSize(pagesText, 8)
      page.drawText(pagesText, {
        x: width - MARGIN - pW - (expiry ? 80 : 0),
        y: rowY,
        size: 8, font,
        color: rgb(0.5, 0.5, 0.5),
      })
    }

    // Expiry
    if (expiry) {
      const expText = `Exp: ${formatDateSimple(expiry)}`
      const eW = font.widthOfTextAtSize(expText, 7)
      page.drawText(expText, {
        x: width - MARGIN - eW,
        y: rowY,
        size: 7, font,
        color: rgb(0.55, 0.35, 0.05),
      })
    }
  })

  // Privacy notice at bottom
  page.drawText('All documents in this package are confidential. Generated locally — no data was uploaded to any server.', {
    x: MARGIN, y: 36,
    size: 7, font,
    color: rgb(0.65, 0.65, 0.65),
    maxWidth: width - MARGIN * 2,
  })
}

/* ── Helpers ────────────────────────────────────────────────────── */
function wrapText(text, maxChars) {
  const words = text.split(' ')
  const lines = []
  let current = ''
  for (const word of words) {
    if ((current + ' ' + word).trim().length > maxChars) {
      if (current) lines.push(current.trim())
      current = word
    } else {
      current = (current + ' ' + word).trim()
    }
  }
  if (current) lines.push(current.trim())
  return lines
}

function formatDateSimple(isoDate) {
  if (!isoDate) return '—'
  try {
    const [y, m, d] = isoDate.split('-')
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
    return `${parseInt(d)} ${months[parseInt(m) - 1]} ${y}`
  } catch {
    return isoDate
  }
}

/**
 * Trigger browser download of a Uint8Array as a PDF file.
 * @param {Uint8Array} bytes
 * @param {string} filename
 */
export function downloadPdf(bytes, filename) {
  const blob = new Blob([bytes], { type: 'application/pdf' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href     = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  setTimeout(() => URL.revokeObjectURL(url), 10_000)
}

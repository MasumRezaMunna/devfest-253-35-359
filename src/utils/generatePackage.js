/**
 * generatePackage.js
 *
 * Generates the complete tender PDF package entirely in the browser.
 *
 * Output structure:
 *   Page 1     — Cover page (tender info + summary)
 *   Page 2     — Document Index (with page numbers where each doc starts)  [BONUS]
 *   Pages 3+   — Matched PDFs in requirement order
 *   Every page — Footer: "<tender_id> | Page X of Y"  (spec §6.3)
 *
 * Rules:
 *   - Skip optional requirements with no matched file
 *   - Include all pages of each PDF in original order
 *   - Footer must not cover document content
 *   - Generate button is disabled until all blocking issues resolved
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
  const { PDFDocument, rgb, StandardFonts } = await import('pdf-lib')

  // ── 1. Collect ordered items to include ──────────────────────────────
  const orderedItems = []

  for (const req of requirements) {
    const entryId = matches[req.id] ?? null
    if (!entryId) continue  // Skip unmatched

    const entry = pdfEntries.find(e => e.id === entryId)
    if (!entry) continue

    const title = lang === 'bn' ? req.title_bn : req.title_en
    orderedItems.push({ req, entry, title, expiry: expiryDates[req.id] ?? null })
  }

  // ── 2. Create output document ─────────────────────────────────────────
  const outDoc = await PDFDocument.create()
  const font   = await outDoc.embedFont(StandardFonts.Helvetica)
  const fontB  = await outDoc.embedFont(StandardFonts.HelveticaBold)

  const A4W = 595.28
  const A4H = 841.89

  // ── 3. Cover page ─────────────────────────────────────────────────────
  const cover = outDoc.addPage([A4W, A4H])
  drawCoverPage(cover, font, fontB, tender, orderedItems, rgb)

  // ── 4. Index page (BONUS §7) ──────────────────────────────────────────
  // Documents start at page 3 (cover=1, index=2)
  let pageOffset = 2
  const docStartPages = orderedItems.map(item => {
    const startPage = pageOffset + 1  // 1-based
    pageOffset += item.entry.pages > 0 ? item.entry.pages : 1
    return startPage
  })

  const indexPage = outDoc.addPage([A4W, A4H])
  drawIndexPage(indexPage, font, fontB, tender, orderedItems, docStartPages, rgb)

  // ── 5. Embed matched PDFs ─────────────────────────────────────────────
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

  // ── 6. Add footer to every page ───────────────────────────────────────
  // Spec §6.3: exact format "<tender_id> | Page X of Y"
  const totalPages = outDoc.getPageCount()
  const makeFooterText = (n) => `${tender.tender_id} | Page ${n} of ${totalPages}`
  const FOOTER_H    = 24
  const FOOTER_SIZE = 8
  const FOOTER_COLOR = rgb(0.45, 0.45, 0.45)

  outDoc.getPages().forEach((page, idx) => {
    const { width } = page.getSize()
    const text  = makeFooterText(idx + 1)
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

  // ── 7. Serialize ──────────────────────────────────────────────────────
  return await outDoc.save()
}

/* ── Cover page ─────────────────────────────────────────────────────── */
function drawCoverPage(page, font, fontB, tender, orderedItems, rgb) {
  const { width, height } = page.getSize()
  const MARGIN = 72

  // Header bar
  page.drawRectangle({
    x: 0, y: height - 150,
    width, height: 150,
    color: rgb(0.10, 0.33, 0.86),
  })

  // "TENDER DOCUMENT PACKAGE" label
  page.drawText('TENDER DOCUMENT PACKAGE', {
    x: MARGIN, y: height - 40,
    size: 9, font,
    color: rgb(0.7, 0.83, 1),
  })

  // Tender title (wrapped)
  const titleLines = wrapText(tender.title, 55)
  titleLines.forEach((line, i) => {
    page.drawText(line, {
      x: MARGIN, y: height - 68 - (i * 22),
      size: 18, font: fontB,
      color: rgb(1, 1, 1),
    })
  })

  // Tender ID badge
  page.drawRectangle({
    x: MARGIN - 4, y: height - 136,
    width: font.widthOfTextAtSize(tender.tender_id, 10) + 12,
    height: 16,
    color: rgb(0.6, 0.78, 1),
    borderRadius: 3,
  })
  page.drawText(tender.tender_id, {
    x: MARGIN + 2, y: height - 133,
    size: 10, font: fontB,
    color: rgb(0.05, 0.17, 0.5),
  })

  // Metadata fields — all required by spec §6.1
  const fields = [
    ['Tender ID',           tender.tender_id],
    ['Tender Title',        tender.title],
    ['Procuring Entity',    tender.procuring_entity],
    ['Bidder',              tender.bidder],
    ['Submission Deadline', formatDateSimple(tender.submission_deadline)],
    ['Package Created',     formatDateSimple(new Date().toISOString().slice(0, 10))],
  ]

  let y = height - 190
  for (const [label, value] of fields) {
    if (y < 100) break
    page.drawText(label.toUpperCase(), {
      x: MARGIN, y,
      size: 7, font,
      color: rgb(0.55, 0.55, 0.55),
    })
    const valLines = wrapText(String(value || '—'), 75)
    valLines.forEach((line, i) => {
      page.drawText(line, {
        x: MARGIN, y: y - 13 - i * 12,
        size: 10, font: fontB,
        color: rgb(0.1, 0.1, 0.1),
      })
    })
    y -= 36 + Math.max(0, (valLines.length - 1) * 12)
  }

  // Divider
  page.drawLine({
    start: { x: MARGIN, y: y - 8 },
    end:   { x: width - MARGIN, y: y - 8 },
    thickness: 0.75,
    color: rgb(0.85, 0.85, 0.85),
  })
  y -= 28

  // Documents summary
  page.drawText('DOCUMENTS INCLUDED', {
    x: MARGIN, y,
    size: 8, font: fontB,
    color: rgb(0.1, 0.33, 0.86),
  })
  y -= 16

  orderedItems.forEach((item, idx) => {
    const rowY = y - idx * 18
    if (rowY < 50) return

    if (idx % 2 === 0) {
      page.drawRectangle({
        x: MARGIN - 4, y: rowY - 4,
        width: width - MARGIN * 2 + 8, height: 15,
        color: rgb(0.97, 0.98, 1),
      })
    }

    page.drawText(`${String(item.req.order).padStart(2, '0')}.`, {
      x: MARGIN, y: rowY,
      size: 8, font: fontB,
      color: rgb(0.4, 0.4, 0.6),
    })

    const titleTrunc = item.title.length > 50 ? item.title.slice(0, 48) + '...' : item.title
    page.drawText(titleTrunc, {
      x: MARGIN + 24, y: rowY,
      size: 8, font: fontB,
      color: rgb(0.1, 0.1, 0.1),
    })

    // Expiry on the right
    if (item.expiry) {
      const expText = `Exp: ${formatDateSimple(item.expiry)}`
      const eW = font.widthOfTextAtSize(expText, 7)
      page.drawText(expText, {
        x: width - MARGIN - eW, y: rowY,
        size: 7, font,
        color: rgb(0.55, 0.35, 0.05),
      })
    }
  })

  // Privacy notice
  page.drawText(
    'All documents in this package are confidential. Generated locally — no data was uploaded to any server.',
    { x: MARGIN, y: 36, size: 7, font, color: rgb(0.65, 0.65, 0.65), maxWidth: width - MARGIN * 2 }
  )
}

/* ── Index page (BONUS §7) ───────────────────────────────────────────── */
function drawIndexPage(page, font, fontB, tender, orderedItems, docStartPages, rgb) {
  const { width, height } = page.getSize()
  const MARGIN = 72

  // Header bar
  page.drawRectangle({
    x: 0, y: height - 80,
    width, height: 80,
    color: rgb(0.10, 0.33, 0.86),
  })
  page.drawText('DOCUMENT INDEX', {
    x: MARGIN, y: height - 38,
    size: 16, font: fontB,
    color: rgb(1, 1, 1),
  })
  page.drawText(`${tender.tender_id}  |  ${tender.title}`, {
    x: MARGIN, y: height - 60,
    size: 9, font,
    color: rgb(0.7, 0.83, 1),
    maxWidth: width - MARGIN * 2,
  })

  // Table header
  let y = height - 105
  const COL = { num: MARGIN, title: MARGIN + 24, file: MARGIN + 265, expiry: MARGIN + 370, page: width - MARGIN - 30 }

  page.drawText('#',          { x: COL.num,    y, size: 8, font: fontB, color: rgb(0.4, 0.4, 0.6) })
  page.drawText('DOCUMENT',   { x: COL.title,  y, size: 8, font: fontB, color: rgb(0.4, 0.4, 0.6) })
  page.drawText('FILE',       { x: COL.file,   y, size: 8, font: fontB, color: rgb(0.4, 0.4, 0.6) })
  page.drawText('EXPIRY',     { x: COL.expiry, y, size: 8, font: fontB, color: rgb(0.4, 0.4, 0.6) })
  page.drawText('PAGE',       { x: COL.page,   y, size: 8, font: fontB, color: rgb(0.4, 0.4, 0.6) })

  y -= 6
  page.drawLine({
    start: { x: MARGIN, y }, end: { x: width - MARGIN, y },
    thickness: 0.5, color: rgb(0.75, 0.75, 0.75),
  })
  y -= 14

  orderedItems.forEach((item, idx) => {
    if (y < 55) return

    if (idx % 2 === 0) {
      page.drawRectangle({
        x: MARGIN - 4, y: y - 4,
        width: width - MARGIN * 2 + 8, height: 16,
        color: rgb(0.96, 0.97, 1),
      })
    }

    const startPage = docStartPages[idx]
    const expiry    = item.expiry ? formatDateSimple(item.expiry) : '—'
    const fileName  = item.entry.file.name.length > 20
      ? item.entry.file.name.slice(0, 18) + '…'
      : item.entry.file.name

    page.drawText(String(item.req.order).padStart(2, '0'), {
      x: COL.num, y, size: 9, font: fontB, color: rgb(0.3, 0.3, 0.5),
    })

    const titleTrunc = item.title.length > 35 ? item.title.slice(0, 33) + '…' : item.title
    page.drawText(titleTrunc, {
      x: COL.title, y, size: 9, font: fontB, color: rgb(0.1, 0.1, 0.1),
    })

    page.drawText(fileName, {
      x: COL.file, y, size: 7.5, font, color: rgb(0.4, 0.4, 0.4),
    })

    page.drawText(expiry, {
      x: COL.expiry, y, size: 7.5, font,
      color: item.expiry ? rgb(0.55, 0.35, 0.05) : rgb(0.6, 0.6, 0.6),
    })

    // Page number — right aligned
    const pageStr = `p.${startPage}`
    const pageW   = fontB.widthOfTextAtSize(pageStr, 9)
    page.drawText(pageStr, {
      x: COL.page - pageW + 30, y,
      size: 9, font: fontB, color: rgb(0.10, 0.33, 0.86),
    })

    y -= 18
  })

  // Summary line
  page.drawLine({
    start: { x: MARGIN, y: y - 6 }, end: { x: width - MARGIN, y: y - 6 },
    thickness: 0.5, color: rgb(0.85, 0.85, 0.85),
  })
  page.drawText(`${orderedItems.length} document(s) included in this package.`, {
    x: MARGIN, y: y - 22,
    size: 8, font, color: rgb(0.5, 0.5, 0.5),
  })
}

/* ── Helpers ─────────────────────────────────────────────────────────── */
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

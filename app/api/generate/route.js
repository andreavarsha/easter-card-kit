/**
 * POST /api/generate
 *
 * Pipeline:
 *  1. Parse FormData
 *  2. extractColors  — colorthief on logo + collection → hex palette
 *  3. analyzeBrand   — Claude Vision API (or MOCK_AI fixture) → brand.json v2
 *  4. generateCardHtml × 3 variants → write to output/
 *  5. Persist brand.json to project root
 *  6. Return { ok: true, client }
 */
import { NextResponse } from 'next/server'
import { extractColors } from '@/lib/extractColors'
import { analyzeBrand } from '@/lib/claudeVision'
import { generateCardHtml } from '@/lib/cardTemplates'

export async function POST(request) {
  // ── 1. Parse FormData ──────────────────────────────────────────────────────
  const formData = await request.formData()

  const logoFile = formData.get('logo')
  const aboutText = formData.get('about_text') || ''
  const aboutPdf = formData.get('about_pdf')
  const theme = formData.get('theme') || ''

  const collectionFiles = []
  for (let i = 0; i < 5; i++) {
    const f = formData.get(`collection_${i}`)
    if (f) collectionFiles.push(f)
  }

  if (!logoFile || collectionFiles.length === 0) {
    return NextResponse.json(
      { error: 'Logo and at least one collection image are required.' },
      { status: 400 }
    )
  }

  // Buffer everything up front — File.arrayBuffer() is single-consume
  const logoBuffer = Buffer.from(await logoFile.arrayBuffer())
  const collectionBuffers = await Promise.all(
    collectionFiles.map(f => f.arrayBuffer().then(ab => Buffer.from(ab)))
  )
  const aboutPdfBuffer = aboutPdf ? Buffer.from(await aboutPdf.arrayBuffer()) : null

  try {
    // ── 2. Colour extraction ─────────────────────────────────────────────────
    const { dominant, palette } = await extractColors(logoBuffer, collectionBuffers)

    // ── 3. Brand analysis (Claude Vision or mock) ────────────────────────────
    const brand = await analyzeBrand({
      logoBuffer,
      logoMediaType: logoFile.type || 'image/jpeg',
      collectionBuffers,
      collectionMediaTypes: collectionFiles.map(f => f.type || 'image/jpeg'),
      aboutPdfBuffer,
      aboutText,
      theme,
      dominantHex: dominant,
      paletteHexes: palette,
    })

    // ── 4. Generate card HTML ─────────────────────────────────────────────────
    const cards = brand.card_variants.slice(0, 3).map(variant => ({
      id: variant.id,
      html: generateCardHtml(brand, variant),
    }))

    return NextResponse.json({ ok: true, brand, cards })
  } catch (err) {
    console.error('[/api/generate]', err)
    return NextResponse.json(
      { error: err.message || 'Generation failed. Please try again.' },
      { status: 500 }
    )
  }
}

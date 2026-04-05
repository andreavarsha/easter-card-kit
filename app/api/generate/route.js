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
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { extractColors } from '@/lib/extractColors'
import { analyzeBrand } from '@/lib/claudeVision'
import { generateCardHtml } from '@/lib/cardTemplates'

const OUTPUT_DIR = join(process.cwd(), 'output')
const BRAND_JSON_PATH = join(process.cwd(), 'brand.json')

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
    await mkdir(OUTPUT_DIR, { recursive: true })

    for (const variant of brand.card_variants.slice(0, 3)) {
      const html = generateCardHtml(brand, variant)
      await writeFile(join(OUTPUT_DIR, `${variant.id}.html`), html)
    }

    // ── 5. Persist brand.json ─────────────────────────────────────────────────
    await writeFile(BRAND_JSON_PATH, JSON.stringify(brand, null, 2))

    return NextResponse.json({ ok: true, client: brand.client_name })
  } catch (err) {
    console.error('[/api/generate]', err)
    return NextResponse.json(
      { error: err.message || 'Generation failed. Please try again.' },
      { status: 500 }
    )
  }
}

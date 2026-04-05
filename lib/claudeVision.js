/**
 * Sends brand assets to the Claude Vision API and returns a parsed brand.json v2 object.
 *
 * Set MOCK_AI=true in .env.local to skip the real API and return a fixture — useful for
 * testing the card-generation pipeline without burning API credits.
 */
import Anthropic from '@anthropic-ai/sdk'
import { MOCK_BRAND } from './mockBrand.js'

/**
 * @param {{
 *   logoBuffer: Buffer,
 *   logoMediaType: string,
 *   collectionBuffers: Buffer[],
 *   collectionMediaTypes: string[],
 *   aboutPdfBuffer: Buffer | null,
 *   aboutText: string,
 *   theme: string,
 *   dominantHex: string,
 *   paletteHexes: string[],
 * }} params
 * @returns {Promise<object>} Parsed brand.json v2 object
 */
export async function analyzeBrand({
  logoBuffer,
  logoMediaType,
  collectionBuffers,
  collectionMediaTypes,
  aboutPdfBuffer,
  aboutText,
  theme,
  dominantHex,
  paletteHexes,
}) {
  if (process.env.MOCK_AI === 'true') {
    console.log('[claudeVision] MOCK_AI=true — returning fixture brand.json')
    // Simulate processing time so the UI steps cycle visibly
    await new Promise(r => setTimeout(r, 1200))
    return MOCK_BRAND
  }

  const content = []

  // Optional about PDF
  if (aboutPdfBuffer) {
    content.push({
      type: 'document',
      source: {
        type: 'base64',
        media_type: 'application/pdf',
        data: aboutPdfBuffer.toString('base64'),
      },
    })
  }

  // Logo
  content.push({ type: 'text', text: 'Brand logo:' })
  content.push({
    type: 'image',
    source: {
      type: 'base64',
      media_type: logoMediaType || 'image/jpeg',
      data: logoBuffer.toString('base64'),
    },
  })

  // Collection images
  content.push({ type: 'text', text: 'Collection / product images:' })
  for (let i = 0; i < collectionBuffers.length; i++) {
    content.push({
      type: 'image',
      source: {
        type: 'base64',
        media_type: collectionMediaTypes[i] || 'image/jpeg',
        data: collectionBuffers[i].toString('base64'),
      },
    })
  }

  const prompt = buildPrompt({ aboutText, theme, dominantHex, paletteHexes })
  content.push({ type: 'text', text: prompt })

  const client = new Anthropic()
  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1500,
    messages: [{ role: 'user', content }],
  })

  const rawText = response.content[0].text.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '')

  let brand
  try {
    brand = JSON.parse(rawText)
  } catch {
    console.error('[claudeVision] Non-JSON response (first 300 chars):', rawText.slice(0, 300))
    throw new Error('Claude returned non-JSON. See server logs.')
  }

  validateBrand(brand)
  return brand
}

// ---------------------------------------------------------------------------
// Internals
// ---------------------------------------------------------------------------

function buildPrompt({ aboutText, theme, dominantHex, paletteHexes }) {
  return `You are a brand identity analyst. Analyse every uploaded asset and return a single JSON object that conforms exactly to the schema below.

Rules:
- Return raw JSON only — no markdown fences, no prose, no explanation before or after.
- Never leave a required string field empty; always infer from the assets.
- Populate the colours object exclusively from the hex values listed below.
- card_variants must contain exactly three objects, ids: thank-you, promo, personal-greeting.
- headline_prompt and cta_text must be real, on-brand Easter copy — never lorem ipsum.
- Set max_exclamation_marks to 0 for luxury or premium brands, 1–2 for casual brands.
${aboutText ? `\nAbout / mission / vision text:\n${aboutText}` : ''}
${theme ? `\nTheme direction: ${theme}` : ''}

Colour palette extracted from the uploaded assets:
- Logo dominant: ${dominantHex}
- Full palette: ${paletteHexes.join(', ')}

Required JSON schema (fill every field):
{
  "_version": "2.0",
  "client_name": "string",
  "tagline": "string",
  "mission": "string",
  "vision": "string",
  "industry": "string",
  "colors": {
    "primitive": { "<descriptive-name>": "<hex>" },
    "semantic": { "background": "<hex>", "headline": "<hex>", "cta": "<hex>", "accent": "<hex>" }
  },
  "typography": {
    "headline_font": "string — infer from logo style, suggest a real Google Font",
    "body_font": "string — suggest a Google Font that pairs well",
    "font_confidence": "high|medium|low"
  },
  "voice": {
    "description": "string",
    "good_examples": ["string", "string"],
    "bad_examples": ["string"],
    "avoid": ["string"]
  },
  "seasonal": {
    "easter": { "themes": ["string"], "imagery_words": ["string"], "avoid_imagery": ["string"] }
  },
  "card_variants": [
    { "id": "thank-you", "headline_prompt": "string", "cta_text": "string" },
    { "id": "promo", "headline_prompt": "string", "cta_text": "string" },
    { "id": "personal-greeting", "headline_prompt": "string", "cta_text": "string" }
  ],
  "hook_rules": {
    "required_colors": ["<hex>"],
    "forbidden_fonts": [],
    "max_exclamation_marks": 0
  }
}`
}

const REQUIRED_KEYS = ['_version', 'client_name', 'colors', 'card_variants', 'hook_rules']

function validateBrand(brand) {
  for (const key of REQUIRED_KEYS) {
    if (!brand[key]) throw new Error(`brand.json missing required field: "${key}"`)
  }
  const semantic = brand.colors?.semantic ?? {}
  for (const role of ['background', 'headline', 'cta', 'accent']) {
    if (!semantic[role]) throw new Error(`brand.json colors.semantic missing "${role}"`)
  }
  if (!Array.isArray(brand.card_variants) || brand.card_variants.length < 3) {
    throw new Error('brand.json card_variants must have at least 3 items')
  }
}

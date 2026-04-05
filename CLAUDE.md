# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

**Branded Easter Card Kit** — a Next.js web app that extracts brand identity from uploaded images (logo, about page, collection photos) and generates a set of on-brand Easter greeting cards using Claude's vision API. Part of the Ginchy Series (Project #2), built for the Claude Code in Action course.

## Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 14 (App Router) |
| Styling | Tailwind CSS |
| AI | Claude Vision API — model `claude-sonnet-4-6` |
| Colour extraction | `colorthief` npm package (runs in server action, no subprocess) |
| Deployment | Netlify with `@netlify/plugin-nextjs` |
| Language | JavaScript (no TypeScript) |
| Package manager | npm |

## Repository

`github.com/andreavarsha/easter-card-kit`

## Environment Variables

| Variable | Purpose | Where |
|---|---|---|
| `ANTHROPIC_API_KEY` | Authenticates Claude API calls | `.env.local` locally; Netlify dashboard in production |
| `MOCK_AI` | Set to `true` to skip the real Claude API and return a fixture brand.json | `.env.local` only — never production |

Copy `.env.example` to `.env.local` to get started. With `MOCK_AI=true` you can run the full pipeline without an API key.

## Upload Input Specs

| Input | Accepted formats | Notes |
|---|---|---|
| Logo | PNG, JPG — max 5MB | Single file |
| Collection images | PNG, JPG — max 5MB each | 1–5 files |
| About / mission / vision | PDF upload **or** text paste | Toggle between the two |

## Key File Structure

```
app/
  page.js               # Homepage — upload form (logo, about, collection, theme)
  results/page.js       # Results — brand audit panel + card preview iframes
  api/generate/
    route.js            # POST handler — orchestrates the full pipeline
components/
  FileDropZone.js       # Drag-and-drop file input, 5MB guard, remove chips
  AboutToggle.js        # Toggle: "Paste text" textarea vs "Upload PDF" input
  ProcessingScreen.js   # 4 sequential status messages with strikethrough
  CardPreviews.js       # Client component — iframes + Blob download buttons
lib/
  extractColors.js      # colorthief wrapper: image Buffers → { dominant, palette } hex strings
  claudeVision.js       # Claude Vision API call → parsed brand.json object (supports MOCK_AI)
  mockBrand.js          # Fixture brand.json for pipeline testing without hitting the API
  cardTemplates.js      # generateCardHtml(brand, variant) → self-contained 600px HTML string
output/                 # Generated card HTML files (hooks watch this dir)
.claude/
  card-log.txt          # Appended by Stop hook: timestamp | session | card count | client name
brand.json              # Extracted brand config (v2 schema, see below)
.env.example            # Template — copy to .env.local
```

## Claude API Rules

- Always use model `claude-sonnet-4-6`
- `max_tokens: 1500`
- Prompt must request **raw JSON only** — no markdown fences, no prose
- Single API call: send all images + hex palette data together, ask for `brand.json v2` output
- Parse and validate the JSON response before passing to card templates

## brand.json v2 Schema

All generated `brand.json` files must conform exactly to this shape:

```json
{
  "_version": "2.0",
  "client_name": "string",
  "tagline": "string",
  "mission": "string",
  "vision": "string",
  "industry": "string",
  "colors": {
    "primitive": { "<name>": "<hexString>" },
    "semantic": { "background": "", "headline": "", "cta": "", "accent": "" }
  },
  "typography": {
    "headline_font": "string",
    "body_font": "string",
    "font_confidence": "high|medium|low"
  },
  "voice": {
    "description": "string",
    "good_examples": ["string"],
    "bad_examples": ["string"],
    "avoid": ["string"]
  },
  "seasonal": {
    "easter": { "themes": [], "imagery_words": [], "avoid_imagery": [] }
  },
  "card_variants": [{ "id": "", "headline_prompt": "", "cta_text": "" }],
  "hook_rules": {
    "required_colors": [],
    "forbidden_fonts": [],
    "max_exclamation_marks": 0
  }
}
```

## Card Output Rules

- Cards are 600px wide, self-contained HTML files (no external dependencies)
- Use brand colours from `brand.json` semantic palette only
- Three variants per generation: `thank-you`, `promo`, `personal-greeting`
- Previewed in iframes on `/results`; downloaded as individual `.html` files via Blob

## Generation Pipeline

1. User submits form → `POST /api/generate` receives FormData
2. `lib/extractColors.js` — colorthief extracts dominant hex palettes from logo + collection images
3. `lib/claudeVision.js` — single Claude Vision API call: all images + hex data → structured `brand.json`
4. Server parses and validates JSON response
5. `lib/cardTemplates.js` — card HTML generated from `brand.json` (3 variants)
6. Cards written to `output/`; `brand.json` written to project root
7. Client renders previews in iframes on `/results`; download links created via Blob

## Testing Without the API

Set `MOCK_AI=true` in `.env.local`. The pipeline runs end-to-end using the fixture in `lib/mockBrand.js` (a fictional luxury candle brand — "Lumière & Co") with a 1.2s artificial delay so the processing screen steps are visible. No `ANTHROPIC_API_KEY` required.

## Hooks

**PostToolUse — brand colour guard** (`output/` writes)
- After every file write to `output/`, read `required_colors` from `brand.json`
- Check generated HTML contains at least one brand colour hex value
- Log a console warning if off-brand — warns only, does not block (v1)

**Stop — session logger**
- On session end, append one line to `.claude/card-log.txt`
- Format: `timestamp | session | card count | client name`

**PreToolUse — schema validator** (P1, not in v1)
- Before any card HTML write, validate `brand.json` has all required v2 fields
- Block write and return error if schema is invalid

## Processing Screen Copy

Show these four sequential status messages (not a generic spinner):
1. `reading your brand assets...`
2. `extracting colours from your collection...`
3. `generating your card copy...`
4. `building your card designs...`

## Do-Not Rules

- No lorem ipsum in any generated card content
- No off-brand colours — only use hex values from `brand.json`
- No exclamation marks for luxury-positioned clients (`max_exclamation_marks` in `hook_rules`)
- Do not generate PDF, image export, animated, or video cards (v1 scope)
- Do not add user accounts, saved sessions, or payment flows (explicit non-goals)

## Custom Commands

- `/scaffold-client <client-slug>` — creates `clients/<slug>/` with a blank brand.json stub and a README listing which images to add before running the pipeline
- `/test-pipeline <client-slug>` — reads images from `clients/<slug>/`, runs extractColors + claudeVision, writes `clients/<slug>/brand.json`, prints a field-by-field summary
- `/deploy-check` — pre-flight before pushing to Netlify: checks `netlify.toml` has a build section, runs `npm run build`

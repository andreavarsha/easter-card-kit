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

- `ANTHROPIC_API_KEY` — `.env` locally (gitignored), Netlify dashboard in production

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
  api/generate/         # Server action endpoint (not a page)
output/                 # Generated card HTML files (hooks watch this dir)
.claude/
  card-log.txt          # Appended by Stop hook: timestamp | session | card count | client name
brand.json              # Extracted brand config (v2 schema, see below)
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

1. User submits form → Next.js server action receives files
2. `colorthief` extracts dominant hex palettes from logo + collection images
3. Single Claude Vision API call: all images + hex data → structured `brand.json` prompt
4. Server parses and validates JSON response
5. Card HTML generated from `brand.json` via template function (3 variants)
6. Client renders previews in iframes; download links created via Blob

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

- `/scaffold-client` — (Phase 4) scaffolds a new client session with empty upload state and resets `brand.json`

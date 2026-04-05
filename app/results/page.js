import { readFile } from 'fs/promises'
import { join } from 'path'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import CardPreviews from '@/components/CardPreviews'

// Always read fresh from disk — no static caching
export const dynamic = 'force-dynamic'

const CARD_IDS = ['thank-you', 'promo', 'personal-greeting']

async function loadBrand() {
  try {
    const raw = await readFile(join(process.cwd(), 'brand.json'), 'utf8')
    return JSON.parse(raw)
  } catch {
    return null
  }
}

async function loadCards() {
  const results = await Promise.allSettled(
    CARD_IDS.map(id =>
      readFile(join(process.cwd(), 'output', `${id}.html`), 'utf8')
        .then(html => ({ id, html }))
    )
  )
  return results
    .filter(r => r.status === 'fulfilled')
    .map(r => r.value)
}

export default async function ResultsPage() {
  const [brand, cards] = await Promise.all([loadBrand(), loadCards()])

  if (!brand || cards.length === 0) {
    notFound()
  }

  const { client_name, tagline, mission, vision, industry, colors, typography, voice, hook_rules } = brand
  const { background, headline, cta, accent } = colors.semantic

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-12">
      <div className="mx-auto max-w-2xl">

        <div className="mb-8 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-indigo-500 mb-1">
              Brand kit ready
            </p>
            <h1 className="text-2xl font-semibold text-gray-900">{client_name}</h1>
            {tagline && <p className="mt-1 text-sm text-gray-500 italic">&ldquo;{tagline}&rdquo;</p>}
          </div>
          <Link
            href="/"
            className="rounded-md border border-gray-300 px-3 py-2 text-xs font-medium text-gray-600 hover:bg-white transition-colors"
          >
            ← New session
          </Link>
        </div>

        {/* Brand audit panel */}
        <section className="mb-10 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-5 text-xs font-bold uppercase tracking-widest text-gray-400">Brand audit</h2>

          <div className="grid grid-cols-2 gap-6 text-sm">
            {/* Identity */}
            <div className="flex flex-col gap-1">
              <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">Industry</span>
              <span className="text-gray-700">{industry}</span>
            </div>

            {/* Typography */}
            <div className="flex flex-col gap-1">
              <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                Typography
                <span className="ml-1 normal-case text-gray-300">({typography.font_confidence})</span>
              </span>
              <span className="text-gray-700">{typography.headline_font} / {typography.body_font}</span>
            </div>

            {/* Mission */}
            {mission && (
              <div className="col-span-2 flex flex-col gap-1">
                <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">Mission</span>
                <span className="text-gray-700 leading-relaxed">{mission}</span>
              </div>
            )}

            {/* Vision */}
            {vision && (
              <div className="col-span-2 flex flex-col gap-1">
                <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">Vision</span>
                <span className="text-gray-700 leading-relaxed">{vision}</span>
              </div>
            )}
          </div>

          {/* Colour palette */}
          <div className="mt-6 flex flex-col gap-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">Semantic palette</span>
            <div className="flex gap-3 flex-wrap">
              {Object.entries(colors.semantic).map(([role, hex]) => (
                <div key={role} className="flex flex-col items-center gap-1">
                  <div
                    className="h-10 w-10 rounded-full border border-gray-200 shadow-inner"
                    style={{ backgroundColor: hex }}
                    title={hex}
                  />
                  <span className="text-[10px] text-gray-400 uppercase tracking-wide">{role}</span>
                  <span className="text-[10px] font-mono text-gray-500">{hex}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Voice */}
          {voice?.description && (
            <div className="mt-6 flex flex-col gap-2">
              <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">Brand voice</span>
              <p className="text-sm text-gray-700 leading-relaxed">{voice.description}</p>
              {voice.avoid?.length > 0 && (
                <p className="text-xs text-gray-400">
                  Avoid: {voice.avoid.join(', ')}
                </p>
              )}
            </div>
          )}

          {/* Hook rules */}
          <div className="mt-6 flex flex-col gap-1">
            <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">Hook rules</span>
            <p className="text-xs text-gray-500">
              Max exclamation marks: {hook_rules?.max_exclamation_marks ?? 1} ·{' '}
              Required colours: {hook_rules?.required_colors?.join(', ') || 'none'}
            </p>
          </div>
        </section>

        {/* Card previews */}
        <section>
          <h2 className="mb-6 text-xs font-bold uppercase tracking-widest text-gray-400">
            Generated cards
          </h2>
          <CardPreviews cards={cards} />
        </section>

      </div>
    </main>
  )
}

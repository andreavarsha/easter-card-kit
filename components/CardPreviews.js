'use client'

import { useRef } from 'react'

const VARIANT_LABELS = {
  'thank-you': 'Thank You',
  'promo': 'Promo',
  'personal-greeting': 'Personal Greeting',
}

export default function CardPreviews({ cards }) {
  return (
    <div className="flex flex-col gap-12">
      {cards.map(({ id, html }) => (
        <CardPreview key={id} id={id} html={html} />
      ))}
    </div>
  )
}

function CardPreview({ id, html }) {
  const iframeRef = useRef(null)

  function handleDownload() {
    const blob = new Blob([html], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${id}.html`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-widest">
          {VARIANT_LABELS[id] ?? id}
        </h2>
        <button
          onClick={handleDownload}
          className="rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors"
        >
          Download .html
        </button>
      </div>

      {/* Scale the 600×800 card to fit a comfortable preview width */}
      <div className="overflow-hidden rounded-lg border border-gray-200 shadow-sm"
           style={{ width: '100%', maxWidth: 600, aspectRatio: '600 / 800' }}>
        <iframe
          ref={iframeRef}
          srcDoc={html}
          title={`${id} card preview`}
          sandbox="allow-same-origin"
          scrolling="no"
          style={{ width: 600, height: 800, border: 'none', transformOrigin: 'top left' }}
          onLoad={e => {
            const container = e.target.parentElement
            const scale = container.clientWidth / 600
            e.target.style.transform = `scale(${scale})`
            container.style.height = `${800 * scale}px`
          }}
        />
      </div>
    </div>
  )
}

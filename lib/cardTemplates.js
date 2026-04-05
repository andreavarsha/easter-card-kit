/**
 * Generates self-contained 600px-wide Easter card HTML from brand.json + a variant descriptor.
 * No external dependencies — fonts degrade gracefully to system serif/sans stacks.
 */
export function generateCardHtml(brand, variant) {
  const {
    client_name,
    tagline,
    colors,
    typography,
    seasonal,
    hook_rules,
  } = brand

  const { background, headline: headlineColor, cta: ctaColor, accent } = colors.semantic

  const headlineFont = typography.headline_font || 'Georgia'
  const bodyFont = typography.body_font || 'Georgia'

  const easterWords = seasonal?.easter?.imagery_words ?? []
  const imagery = easterWords.slice(0, 3).join(' · ')

  const maxExcl = hook_rules?.max_exclamation_marks ?? 1
  const headlineText = clampExclamationMarks(variant.headline_prompt, maxExcl)
  const ctaText = clampExclamationMarks(variant.cta_text, maxExcl)

  // Per-variant visual tweak
  const accentShape = variant.id === 'promo' ? promoAccent(accent) : defaultAccent(accent)

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${escHtml(client_name)} — Easter ${escHtml(variant.id)}</title>
  <style>
    *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      width: 600px;
      height: 800px;
      overflow: hidden;
      background-color: ${background};
      font-family: '${bodyFont}', Georgia, 'Times New Roman', serif;
      color: ${headlineColor};
    }

    .card {
      width: 600px;
      height: 800px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 64px 56px;
      position: relative;
      text-align: center;
    }

    /* top accent stripe */
    .stripe {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 5px;
      background-color: ${accent};
    }

    .brand-name {
      font-family: '${headlineFont}', Georgia, serif;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.22em;
      text-transform: uppercase;
      color: ${accent};
      margin-bottom: 28px;
    }

    .divider {
      width: 48px;
      height: 2px;
      background-color: ${accent};
      margin: 0 auto 32px;
      opacity: 0.5;
    }

    .headline {
      font-family: '${headlineFont}', Georgia, serif;
      font-size: 34px;
      font-weight: 700;
      line-height: 1.25;
      color: ${headlineColor};
      margin-bottom: 18px;
      max-width: 440px;
    }

    .tagline {
      font-size: 14px;
      line-height: 1.7;
      color: ${headlineColor};
      opacity: 0.65;
      margin-bottom: 40px;
      max-width: 380px;
    }

    .cta {
      display: inline-block;
      background-color: ${ctaColor};
      color: ${background};
      font-family: '${headlineFont}', Georgia, serif;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.2em;
      text-transform: uppercase;
      padding: 15px 40px;
      text-decoration: none;
      border: none;
    }

    .imagery {
      position: absolute;
      bottom: 32px;
      font-size: 10px;
      letter-spacing: 0.18em;
      text-transform: uppercase;
      color: ${accent};
      opacity: 0.5;
    }

    ${accentShape.css}
  </style>
</head>
<body>
  <div class="card">
    <div class="stripe"></div>
    ${accentShape.html}
    <p class="brand-name">${escHtml(client_name)}</p>
    <div class="divider"></div>
    <h1 class="headline">${escHtml(headlineText)}</h1>
    <p class="tagline">${escHtml(tagline)}</p>
    <a class="cta" href="#">${escHtml(ctaText)}</a>
    ${imagery ? `<p class="imagery">${escHtml(imagery)}</p>` : ''}
  </div>
</body>
</html>`
}

// Promo cards get a bold bottom-left corner block
function promoAccent(accent) {
  return {
    css: `.corner { position: absolute; bottom: 0; left: 0; width: 120px; height: 120px; background-color: ${accent}; opacity: 0.12; }`,
    html: '<div class="corner"></div>',
  }
}

// Thank-you and personal-greeting get a centred egg motif (pure CSS oval)
function defaultAccent(accent) {
  return {
    css: `.egg { position: absolute; top: 32px; right: 40px; width: 22px; height: 28px; border-radius: 50% 50% 50% 50% / 60% 60% 40% 40%; background-color: ${accent}; opacity: 0.25; }`,
    html: '<div class="egg"></div>',
  }
}

function escHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function clampExclamationMarks(text, max) {
  if (max === 0) return String(text ?? '').replace(/!/g, '.')
  let count = 0
  return String(text ?? '').replace(/!/g, () => (++count <= max ? '!' : '.'))
}

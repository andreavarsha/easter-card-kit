/**
 * Fixture brand.json used when MOCK_AI=true.
 * Represents a fictional artisan candle brand — realistic enough to smoke-test
 * the full card-generation pipeline without hitting the Claude API.
 */
export const MOCK_BRAND = {
  _version: '2.0',
  client_name: 'Lumière & Co',
  tagline: 'Hand-poured moments, lit with intention.',
  mission:
    'To craft beautifully scented candles that transform ordinary spaces into sanctuaries of calm and warmth.',
  vision:
    'A world where slowing down is celebrated — one flickering flame at a time.',
  industry: 'Luxury home fragrance',
  colors: {
    primitive: {
      ivory: '#f5f0e8',
      charcoal: '#2c2c2c',
      champagne: '#d4a96a',
      blush: '#e8d5c4',
      sage: '#7d9b76',
    },
    semantic: {
      background: '#f5f0e8',
      headline: '#2c2c2c',
      cta: '#2c2c2c',
      accent: '#d4a96a',
    },
  },
  typography: {
    headline_font: 'Cormorant Garamond',
    body_font: 'Jost',
    font_confidence: 'high',
  },
  voice: {
    description:
      'Warm, poetic, and unhurried. Speaks to the senses. Never loud, never urgent — always inviting.',
    good_examples: [
      'A quiet Easter morning, wrapped in amber light.',
      'Celebrate the season slowly.',
    ],
    bad_examples: ['HUGE SALE — BUY NOW!', "Don't miss out!!!"],
    avoid: ['urgency language', 'exclamation marks', 'discount-first messaging'],
  },
  seasonal: {
    easter: {
      themes: ['renewal', 'spring light', 'quiet celebration', 'new beginnings'],
      imagery_words: ['blossom', 'dawn', 'warmth', 'nest', 'amber'],
      avoid_imagery: ['plastic eggs', 'cartoon bunnies', 'neon colours'],
    },
  },
  card_variants: [
    {
      id: 'thank-you',
      headline_prompt: 'With warmth and gratitude this Easter.',
      cta_text: 'Explore our spring collection',
    },
    {
      id: 'promo',
      headline_prompt: 'Illuminate your Easter table.',
      cta_text: 'Shop the seasonal edit',
    },
    {
      id: 'personal-greeting',
      headline_prompt: 'Wishing you a season of quiet joy.',
      cta_text: 'Discover Lumière & Co',
    },
  ],
  hook_rules: {
    required_colors: ['#d4a96a', '#2c2c2c'],
    forbidden_fonts: ['Comic Sans MS', 'Impact'],
    max_exclamation_marks: 0,
  },
}

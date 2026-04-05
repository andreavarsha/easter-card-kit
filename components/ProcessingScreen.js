'use client'

import { useState, useEffect } from 'react'

const MESSAGES = [
  'reading your brand assets...',
  'extracting colours from your collection...',
  'generating your card copy...',
  'building your card designs...',
]

export default function ProcessingScreen() {
  const [step, setStep] = useState(0)

  useEffect(() => {
    if (step >= MESSAGES.length - 1) return
    const t = setTimeout(() => setStep(s => s + 1), 4000)
    return () => clearTimeout(t)
  }, [step])

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-8">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" />
      <div className="flex flex-col items-center gap-3">
        {MESSAGES.map((msg, i) => (
          <p
            key={msg}
            className={`text-sm transition-all duration-500
              ${i === step ? 'text-gray-900 font-medium' : i < step ? 'text-gray-400 line-through' : 'text-gray-300'}`}
          >
            {msg}
          </p>
        ))}
      </div>
    </div>
  )
}

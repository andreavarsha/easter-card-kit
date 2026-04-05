'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import FileDropZone from '@/components/FileDropZone'
import AboutToggle from '@/components/AboutToggle'
import ProcessingScreen from '@/components/ProcessingScreen'

export default function Home() {
  const router = useRouter()

  const [logoFile, setLogoFile] = useState(null)
  const [collectionFiles, setCollectionFiles] = useState([])
  const [aboutMode, setAboutMode] = useState('text')
  const [aboutText, setAboutText] = useState('')
  const [aboutPdf, setAboutPdf] = useState(null)
  const [theme, setTheme] = useState('')
  const [errors, setErrors] = useState({})
  const [isProcessing, setIsProcessing] = useState(false)
  const [submitError, setSubmitError] = useState(null)

  function validate() {
    const errs = {}
    if (!logoFile) errs.logo = 'Logo is required'
    if (collectionFiles.length === 0) errs.collection = 'At least one collection image is required'
    if (aboutMode === 'text' && !aboutText.trim()) errs.about = 'Brand description is required'
    if (aboutMode === 'pdf' && !aboutPdf) errs.about = 'Please upload a PDF or switch to text'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitError(null)
    if (!validate()) return

    setIsProcessing(true)

    const fd = new FormData()
    fd.append('logo', logoFile)
    collectionFiles.forEach((f, i) => fd.append(`collection_${i}`, f))
    if (aboutMode === 'pdf') {
      fd.append('about_pdf', aboutPdf)
    } else {
      fd.append('about_text', aboutText)
    }
    fd.append('theme', theme)

    try {
      const res = await fetch('/api/generate', { method: 'POST', body: fd })
      if (res.ok) {
        router.push('/results')
      } else {
        const data = await res.json().catch(() => ({}))
        setSubmitError(data.error ?? 'Something went wrong. Please try again.')
        setIsProcessing(false)
      }
    } catch {
      setSubmitError('Network error. Please check your connection and try again.')
      setIsProcessing(false)
    }
  }

  if (isProcessing) return <ProcessingScreen />

  return (
    <main className="min-h-screen bg-white px-4 py-12">
      <div className="mx-auto max-w-xl">
        <header className="mb-10">
          <h1 className="text-3xl font-semibold text-gray-900">Easter Card Kit</h1>
          <p className="mt-2 text-gray-500">
            Upload your brand assets and we'll generate a set of on-brand Easter greeting cards.
          </p>
        </header>

        <form onSubmit={handleSubmit} className="flex flex-col gap-8" noValidate>

          {/* Logo */}
          <section className="flex flex-col gap-2">
            <h2 className="text-base font-medium text-gray-900">Brand logo</h2>
            <FileDropZone
              id="logo-input"
              label="Logo file"
              accept="image/png,image/jpeg"
              multiple={false}
              maxFiles={1}
              maxSizeMB={5}
              files={logoFile ? [logoFile] : []}
              onFiles={f => setLogoFile(f[0] ?? null)}
              error={errors.logo}
              hint="PNG or JPG · max 5 MB"
            />
          </section>

          {/* Collection */}
          <section className="flex flex-col gap-2">
            <h2 className="text-base font-medium text-gray-900">Collection images</h2>
            <FileDropZone
              id="collection-input"
              label="Collection photos"
              accept="image/png,image/jpeg,image/webp"
              multiple
              maxFiles={5}
              maxSizeMB={5}
              files={collectionFiles}
              onFiles={setCollectionFiles}
              error={errors.collection}
              hint="1–5 images · PNG, JPG or WEBP · max 5 MB each"
            />
          </section>

          {/* About / Mission / Vision */}
          <section className="flex flex-col gap-2">
            <h2 className="text-base font-medium text-gray-900">About / mission / vision</h2>
            <p className="text-sm text-gray-500">Paste your about page copy or upload a PDF.</p>
            <AboutToggle
              mode={aboutMode}
              onModeChange={setAboutMode}
              text={aboutText}
              onTextChange={setAboutText}
              pdfFile={aboutPdf}
              onPdfChange={setAboutPdf}
              error={errors.about}
            />
          </section>

          {/* Theme */}
          <section className="flex flex-col gap-2">
            <h2 className="text-base font-medium text-gray-900">
              Theme <span className="font-normal text-gray-400">(optional)</span>
            </h2>
            <input
              type="text"
              value={theme}
              onChange={e => setTheme(e.target.value)}
              placeholder="e.g. rustic farmhouse, luxury spa, playful kids brand"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
          </section>

          {submitError && (
            <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{submitError}</p>
          )}

          <button
            type="submit"
            className="w-full rounded-lg bg-indigo-600 px-6 py-3 text-sm font-semibold text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 transition-colors"
          >
            Generate Easter cards
          </button>

        </form>
      </div>
    </main>
  )
}

'use client'

export default function AboutToggle({
  mode,
  onModeChange,
  text,
  onTextChange,
  pdfFile,
  onPdfChange,
  error,
}) {
  function onPdfInputChange(e) {
    onPdfChange(e.target.files[0] ?? null)
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-1 rounded-lg border border-gray-200 bg-gray-50 p-1 w-fit">
        <button
          type="button"
          onClick={() => onModeChange('text')}
          className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors
            ${mode === 'text' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Paste text
        </button>
        <button
          type="button"
          onClick={() => onModeChange('pdf')}
          className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors
            ${mode === 'pdf' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Upload PDF
        </button>
      </div>

      {mode === 'text' ? (
        <textarea
          value={text}
          onChange={e => onTextChange(e.target.value)}
          rows={5}
          placeholder="Paste your about page, mission, or vision statement here..."
          className={`w-full rounded-lg border px-3 py-2 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none
            ${error ? 'border-red-400' : 'border-gray-300'}`}
        />
      ) : (
        <div className="flex flex-col gap-2">
          <label
            htmlFor="about-pdf"
            className={`flex items-center gap-3 rounded-lg border-2 border-dashed px-4 py-5 cursor-pointer transition-colors
              ${error ? 'border-red-400 bg-red-50' : 'border-gray-300 bg-gray-50 hover:border-gray-400 hover:bg-gray-100'}`}
          >
            <svg className="h-6 w-6 flex-shrink-0 text-gray-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
            </svg>
            <span className="text-sm text-gray-500">
              {pdfFile ? pdfFile.name : 'Click to select a PDF'}
            </span>
            <input
              id="about-pdf"
              type="file"
              accept=".pdf,application/pdf"
              onChange={onPdfInputChange}
              className="sr-only"
            />
          </label>
        </div>
      )}

      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  )
}

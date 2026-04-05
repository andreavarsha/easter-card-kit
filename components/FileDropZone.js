'use client'

import { useState } from 'react'

export default function FileDropZone({
  accept,
  multiple,
  maxFiles = 1,
  maxSizeMB = 5,
  onFiles,
  files = [],
  error,
  label,
  hint,
  id,
}) {
  const [isDragging, setIsDragging] = useState(false)
  const [sizeError, setSizeError] = useState(null)

  function handleFiles(incoming) {
    setSizeError(null)
    const oversized = incoming.find(f => f.size > maxSizeMB * 1024 * 1024)
    if (oversized) {
      setSizeError(`${oversized.name} exceeds ${maxSizeMB}MB limit`)
      return
    }
    const capped = multiple ? incoming.slice(0, maxFiles) : incoming.slice(0, 1)
    onFiles(capped)
  }

  function onInputChange(e) {
    handleFiles(Array.from(e.target.files))
    // reset input so same file can be re-selected after removal
    e.target.value = ''
  }

  function onDragOver(e) {
    e.preventDefault()
    setIsDragging(true)
  }

  function onDragLeave() {
    setIsDragging(false)
  }

  function onDrop(e) {
    e.preventDefault()
    setIsDragging(false)
    handleFiles(Array.from(e.dataTransfer.files))
  }

  function removeFile(index) {
    const next = files.filter((_, i) => i !== index)
    onFiles(next)
  }

  const displayError = error || sizeError

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-gray-700">{label}</label>

      <label
        htmlFor={id}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        className={`flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-4 py-8 cursor-pointer transition-colors
          ${isDragging ? 'border-indigo-400 bg-indigo-50' : 'border-gray-300 bg-gray-50 hover:border-gray-400 hover:bg-gray-100'}
          ${displayError ? 'border-red-400 bg-red-50' : ''}`}
      >
        <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
        </svg>
        <span className="text-sm text-gray-500">
          {isDragging ? 'Drop here' : 'Click to browse or drag & drop'}
        </span>
        {hint && <span className="text-xs text-gray-400">{hint}</span>}
        <input
          id={id}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={onInputChange}
          className="sr-only"
        />
      </label>

      {displayError && (
        <p className="text-xs text-red-600">{displayError}</p>
      )}

      {files.length > 0 && (
        <ul className="flex flex-col gap-1">
          {files.map((f, i) => (
            <li key={i} className="flex items-center justify-between rounded bg-gray-100 px-3 py-1.5 text-sm text-gray-700">
              <span className="truncate max-w-xs">{f.name}</span>
              <button
                type="button"
                onClick={() => removeFile(i)}
                className="ml-2 flex-shrink-0 text-gray-400 hover:text-gray-600"
                aria-label={`Remove ${f.name}`}
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

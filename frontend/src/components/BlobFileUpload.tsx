'use client'

import { useCallback, useState } from 'react'
import { DocumentTextIcon } from '@heroicons/react/24/outline'
import { uploadToBlob, type BlobUploadType } from '@/lib/blobStorage'

interface BlobFileUploadProps {
  uploadType: BlobUploadType
  onUploaded: (url: string, pathname: string, file: File) => void
  accept?: string
  maxSize?: number
  maxFiles?: number
  label?: string
  hint?: string
  className?: string
}

export default function BlobFileUpload({
  uploadType,
  onUploaded,
  accept = '.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,image/*',
  maxSize = 10 * 1024 * 1024,
  maxFiles = 10,
  label = 'Upload documents',
  hint = 'PDF, DOC, DOCX, XLS, XLSX, images up to 10MB each',
  className = '',
}: BlobFileUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState(false)

  const handleFiles = useCallback(
    async (files: FileList | File[]) => {
      const arr = Array.from(files).slice(0, maxFiles)
      if (arr.length === 0) return

      setError(null)
      setUploading(true)

      for (const file of arr) {
        if (file.size > maxSize) {
          setError(`${file.name} exceeds ${maxSize / 1024 / 1024}MB limit`)
          continue
        }
        try {
          const result = await uploadToBlob(file, uploadType)
          onUploaded(result.url, result.pathname, file)
        } catch (e) {
          setError(e instanceof Error ? e.message : 'Upload failed')
        }
      }
      setUploading(false)
    },
    [uploadType, onUploaded, maxSize, maxFiles]
  )

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setDragOver(false)
      handleFiles(e.dataTransfer.files)
    },
    [handleFiles]
  )

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }, [])

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
  }, [])

  const onInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files
      if (files?.length) handleFiles(files)
      e.target.value = ''
    },
    [handleFiles]
  )

  return (
    <div className={className}>
      <div
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer ${
          dragOver ? 'border-orange-500 bg-orange-50' : 'border-gray-300 hover:border-gray-400'
        } ${uploading ? 'opacity-70 pointer-events-none' : ''}`}
      >
        <input
          type="file"
          multiple
          accept={accept}
          onChange={onInputChange}
          className="hidden"
          id="blob-file-upload"
          disabled={uploading}
        />
        <label htmlFor="blob-file-upload" className="cursor-pointer block">
          <DocumentTextIcon className="w-10 h-10 mx-auto mb-2 text-gray-400" />
          <p className="text-sm font-medium text-gray-700">{uploading ? 'Uploading...' : label}</p>
          <p className="text-xs text-gray-500 mt-1">{hint}</p>
        </label>
      </div>
      {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
    </div>
  )
}

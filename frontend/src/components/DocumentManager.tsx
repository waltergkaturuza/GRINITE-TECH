'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  ArrowDownTrayIcon,
  FolderIcon,
  MagnifyingGlassIcon,
  PencilSquareIcon,
  TrashIcon,
} from '@heroicons/react/24/outline'
import BlobFileUpload from '@/components/BlobFileUpload'
import { documentsAPI, type CompanyDocument } from '@/lib/api'
import {
  COMPANY_DOCUMENT_CATEGORIES,
  PROJECT_DOCUMENT_CATEGORIES,
  documentCategoryLabel,
  formatFileSize,
} from '@/lib/documentCategories'
import type { BlobUploadType } from '@/lib/blobStorage'

type DocumentManagerProps = {
  scope: 'company' | 'project'
  projectId?: string
  projectName?: string
  tone?: 'dark' | 'light'
}

function titleFromFile(name: string) {
  return name.replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' ').trim()
}

export default function DocumentManager({
  scope,
  projectId,
  projectName = 'project',
  tone = 'dark',
}: DocumentManagerProps) {
  const categories = scope === 'project' ? PROJECT_DOCUMENT_CATEGORIES : COMPANY_DOCUMENT_CATEGORIES
  const [docs, setDocs] = useState<CompanyDocument[]>([])
  const [counts, setCounts] = useState<Record<string, number>>({})
  const [category, setCategory] = useState('all')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [uploadCategory, setUploadCategory] = useState<string>(categories[0].id)
  const [saving, setSaving] = useState(false)
  const [editing, setEditing] = useState<CompanyDocument | null>(null)
  const usedCustomTitle = useRef(false)

  const isDark = tone === 'dark'
  const panel = isDark
    ? 'bg-granite-800 border-granite-700 text-white'
    : 'bg-white border-granite-200 text-granite-800'
  const muted = isDark ? 'text-gray-400' : 'text-granite-500'
  const input = isDark
    ? 'bg-granite-700 border-granite-600 text-white'
    : 'bg-white border-granite-300 text-granite-800'
  const hoverBtn = isDark ? 'hover:bg-granite-700' : 'hover:bg-granite-100'
  const divider = isDark ? 'divide-granite-700' : 'divide-granite-200'
  const errorText = isDark ? 'text-crimson-300' : 'text-crimson-700'

  const load = useCallback(async () => {
    try {
      setLoading(true)
      setError('')
      const [items, cat] = await Promise.all([
        documentsAPI.list({
          scope,
          projectId,
          category: category === 'all' ? undefined : category,
          search: search.trim() || undefined,
        }),
        documentsAPI.categories({ projectId, scope }),
      ])
      setDocs(Array.isArray(items) ? items : [])
      const map: Record<string, number> = {}
      for (const row of cat.counts || []) map[row.category] = row.count
      setCounts(map)
    } catch (err) {
      console.error(err)
      setError('Could not load documents. Try again in a moment.')
      setDocs([])
    } finally {
      setLoading(false)
    }
  }, [scope, projectId, category, search])

  useEffect(() => {
    const timer = setTimeout(load, search ? 250 : 0)
    return () => clearTimeout(timer)
  }, [load, search])

  const uploadType: BlobUploadType = useMemo(() => {
    if (scope === 'project') {
      return { type: 'project', projectName, subfolder: uploadCategory }
    }
    return { type: 'company', category: uploadCategory }
  }, [scope, projectName, uploadCategory])

  const registerFile = async (url: string, pathname: string, file: File) => {
    const customTitle = title.trim()
    const docTitle =
      customTitle && !usedCustomTitle.current ? customTitle : titleFromFile(file.name) || file.name
    if (customTitle) usedCustomTitle.current = true

    await documentsAPI.create({
      title: docTitle,
      description: description.trim() || undefined,
      category: uploadCategory,
      scope,
      projectId,
      url,
      pathname,
      originalName: file.name,
      fileSize: file.size,
      mimeType: file.type,
    })
  }

  const onUploaded = async (url: string, pathname: string, file: File) => {
    try {
      setSaving(true)
      setError('')
      await registerFile(url, pathname, file)
      setNotice(`Saved ${file.name}`)
      await load()
    } catch (err) {
      console.error(err)
      setError('File uploaded, but it could not be saved to the library. Try again.')
    } finally {
      setSaving(false)
    }
  }

  const onUploadingChange = (uploading: boolean) => {
    if (uploading) {
      usedCustomTitle.current = false
      setNotice('')
    } else {
      setTitle('')
      setDescription('')
    }
  }

  const saveEdit = async () => {
    if (!editing) return
    try {
      setSaving(true)
      await documentsAPI.update(editing.id, {
        title: editing.title,
        description: editing.description,
        category: editing.category,
      })
      setEditing(null)
      await load()
    } catch (err) {
      console.error(err)
      setError('Could not update the document.')
    } finally {
      setSaving(false)
    }
  }

  const removeDoc = async (id: string) => {
    if (!confirm('Remove this document from the library?')) return
    try {
      await documentsAPI.remove(id)
      await load()
    } catch (err) {
      console.error(err)
      setError('Could not delete the document.')
    }
  }

  const total = Object.values(counts).reduce((sum, n) => sum + n, 0)

  return (
    <div className="grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)]">
      <aside className={`rounded-xl border p-3 ${panel}`}>
        <p className={`px-2 pb-2 text-xs font-semibold uppercase tracking-wide ${muted}`}>Categories</p>
        <button
          type="button"
          onClick={() => setCategory('all')}
          className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm ${
            category === 'all' ? 'bg-crimson-900 text-white' : hoverBtn
          }`}
        >
          <span>All</span>
          <span className="text-xs opacity-70">{total}</span>
        </button>
        {categories.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setCategory(item.id)}
            className={`mt-1 flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm ${
              category === item.id ? 'bg-crimson-900 text-white' : hoverBtn
            }`}
          >
            <span>{item.label}</span>
            <span className="text-xs opacity-70">{counts[item.id] || 0}</span>
          </button>
        ))}
      </aside>

      <div className="space-y-4">
        <div className={`rounded-xl border p-4 ${panel}`}>
          <h3 className="font-semibold mb-1">
            Upload {scope === 'project' ? 'project' : 'company'} document
          </h3>
          <p className={`mb-3 text-xs ${muted}`}>
            Files are stored by category. Add a title if you want a clearer name than the file name.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-sm">
              <span className={muted}>Title (optional)</span>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className={`mt-1 w-full rounded-lg border px-3 py-2 ${input}`}
                placeholder={
                  scope === 'company' ? 'e.g. Tax clearance 2026' : 'e.g. Approved wireframes'
                }
              />
            </label>
            <label className="text-sm">
              <span className={muted}>Category</span>
              <select
                value={uploadCategory}
                onChange={(e) => setUploadCategory(e.target.value)}
                className={`mt-1 w-full rounded-lg border px-3 py-2 ${input}`}
              >
                {categories.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <label className="mt-3 block text-sm">
            <span className={muted}>Notes (optional)</span>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className={`mt-1 w-full rounded-lg border px-3 py-2 ${input}`}
            />
          </label>
          <BlobFileUpload
            className="mt-3"
            inputId={`doc-upload-${scope}-${projectId || 'company'}`}
            uploadType={uploadType}
            tone={tone}
            maxFiles={8}
            label={saving ? 'Saving to library...' : 'Drop files or click to upload'}
            onUploaded={onUploaded}
            onUploadingChange={onUploadingChange}
          />
        </div>

        <div className={`rounded-xl border p-4 ${panel}`}>
          <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <MagnifyingGlassIcon className={`absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 ${muted}`} />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search titles and file names..."
                className={`w-full rounded-lg border py-2 pl-9 pr-3 ${input}`}
              />
            </div>
          </div>

          {notice && !error && <p className={`mb-3 text-sm ${muted}`}>{notice}</p>}
          {error && <p className={`mb-3 text-sm ${errorText}`}>{error}</p>}

          {loading ? (
            <div className={`h-32 animate-pulse rounded-lg ${isDark ? 'bg-granite-700/40' : 'bg-granite-100'}`} />
          ) : docs.length === 0 ? (
            <div className={`py-10 text-center ${muted}`}>
              <FolderIcon className="mx-auto mb-2 h-10 w-10" />
              <p>No documents in this category yet.</p>
            </div>
          ) : (
            <ul className={`divide-y ${divider}`}>
              {docs.map((doc) => (
                <li key={doc.id} className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <p className="font-medium truncate">{doc.title}</p>
                    <p className={`text-xs ${muted}`}>
                      {documentCategoryLabel(doc.category, doc.scope)}
                      {doc.project?.title ? ` · ${doc.project.title}` : ''}
                      {` · ${formatFileSize(doc.fileSize)} · ${new Date(doc.createdAt).toLocaleDateString()}`}
                    </p>
                    <p className={`truncate text-xs ${muted}`}>{doc.originalName}</p>
                    {doc.description && <p className={`mt-1 text-sm ${muted}`}>{doc.description}</p>}
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <a
                      href={doc.url}
                      target="_blank"
                      rel="noreferrer"
                      className={`rounded-md p-2 ${hoverBtn}`}
                      title="Open / download"
                    >
                      <ArrowDownTrayIcon className="h-4 w-4" />
                    </a>
                    <button
                      type="button"
                      onClick={() => setEditing(doc)}
                      className={`rounded-md p-2 ${hoverBtn}`}
                      title="Edit details"
                    >
                      <PencilSquareIcon className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeDoc(doc.id)}
                      className={`rounded-md p-2 text-crimson-400 ${hoverBtn}`}
                      title="Delete"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className={`w-full max-w-md rounded-xl border p-5 ${panel}`}>
            <h3 className="mb-3 text-lg font-semibold">Edit document</h3>
            <label className="block text-sm">
              Title
              <input
                value={editing.title}
                onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                className={`mt-1 w-full rounded-lg border px-3 py-2 ${input}`}
              />
            </label>
            <label className="mt-3 block text-sm">
              Category
              <select
                value={editing.category}
                onChange={(e) => setEditing({ ...editing, category: e.target.value })}
                className={`mt-1 w-full rounded-lg border px-3 py-2 ${input}`}
              >
                {categories.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="mt-3 block text-sm">
              Notes
              <textarea
                value={editing.description || ''}
                onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                rows={3}
                className={`mt-1 w-full rounded-lg border px-3 py-2 ${input}`}
              />
            </label>
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditing(null)}
                className="rounded-lg border border-granite-600 px-3 py-2 text-sm"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={saveEdit}
                disabled={saving}
                className="rounded-lg bg-crimson-900 px-3 py-2 text-sm font-semibold text-white"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

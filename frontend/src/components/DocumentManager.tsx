'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
  FolderIcon,
  MagnifyingGlassIcon,
  PencilSquareIcon,
  TrashIcon,
} from '@heroicons/react/24/outline'
import BlobFileUpload from '@/components/BlobFileUpload'
import { documentsAPI, projectsAPI, type CompanyDocument } from '@/lib/api'
import {
  COMPANY_DOCUMENT_CATEGORIES,
  PROJECT_DOCUMENT_CATEGORIES,
  documentCategoryLabel,
  formatFileSize,
} from '@/lib/documentCategories'
import type { BlobUploadType } from '@/lib/blobStorage'

type ViewScope = 'all' | 'company' | 'project'

type FormFile = {
  url: string
  pathname?: string
  name?: string
  originalName?: string
  fileSize?: number
  mimeType?: string
}

type DocumentManagerProps = {
  scope?: 'company' | 'project'
  projectId?: string
  projectName?: string
  tone?: 'dark' | 'light'
  library?: boolean
}

type ProjectOption = {
  id: string
  title: string
  supportingDocuments?: FormFile[]
  fundingDocuments?: FormFile[]
}

function titleFromFile(name: string) {
  return name.replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' ').trim()
}

function categoriesFor(scope: 'company' | 'project') {
  return scope === 'project' ? PROJECT_DOCUMENT_CATEGORIES : COMPANY_DOCUMENT_CATEGORIES
}

function mapProject(project: {
  id: string
  title: string
  metadata?: { supportingDocuments?: FormFile[]; fundingDocuments?: FormFile[] }
  supportingDocuments?: FormFile[]
  fundingDocuments?: FormFile[]
}): ProjectOption {
  return {
    id: project.id,
    title: project.title,
    supportingDocuments: project.metadata?.supportingDocuments || project.supportingDocuments || [],
    fundingDocuments: project.metadata?.fundingDocuments || project.fundingDocuments || [],
  }
}

function docsFromProjectForm(project: ProjectOption): CompanyDocument[] {
  const groups = [
    {
      files: project.supportingDocuments || [],
      category: 'specs',
      description: 'Supporting document from the project form',
    },
    {
      files: project.fundingDocuments || [],
      category: 'other',
      description: 'Funding / budget document from the project form',
    },
  ]

  return groups.flatMap((group) =>
    group.files
      .filter((file) => file?.url)
      .map((file) => {
        const originalName = file.name || file.originalName || file.url.split('/').pop() || 'document'
        return {
          id: `form-${project.id}-${file.url}`,
          title: titleFromFile(originalName) || originalName,
          description: group.description,
          category: group.category,
          scope: 'project' as const,
          projectId: project.id,
          project: { id: project.id, title: project.title },
          url: file.url,
          pathname: file.pathname || file.url,
          originalName,
          fileSize: file.fileSize || 0,
          mimeType: file.mimeType,
          createdAt: '',
          updatedAt: '',
        }
      }),
  )
}

export default function DocumentManager({
  scope: lockedScope,
  projectId: lockedProjectId,
  projectName: lockedProjectName = 'project',
  tone = 'dark',
  library = false,
}: DocumentManagerProps) {
  const [viewScope, setViewScope] = useState<ViewScope>(lockedScope || (library ? 'all' : 'company'))
  const [filterProjectId, setFilterProjectId] = useState(lockedProjectId || '')
  const [projects, setProjects] = useState<ProjectOption[]>([])
  const [docs, setDocs] = useState<CompanyDocument[]>([])
  const [counts, setCounts] = useState<Record<string, number>>({})
  const [category, setCategory] = useState('all')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [uploadTarget, setUploadTarget] = useState<'company' | string>(
    lockedScope === 'project' && lockedProjectId ? lockedProjectId : 'company',
  )
  const [uploadCategory, setUploadCategory] = useState<string>(
    categoriesFor(lockedScope === 'project' ? 'project' : 'company')[0].id,
  )
  const [saving, setSaving] = useState(false)
  const [editing, setEditing] = useState<CompanyDocument | null>(null)
  const [workspaceTab, setWorkspaceTab] = useState<'upload' | 'search'>('upload')
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

  const listScope = lockedScope || (viewScope === 'all' ? undefined : viewScope)
  const listProjectId = lockedProjectId || (viewScope === 'project' ? filterProjectId || undefined : undefined)
  const uploadScope: 'company' | 'project' = uploadTarget === 'company' ? 'company' : 'project'
  const uploadCategories = categoriesFor(uploadScope)
  const uploadProject = projects.find((p) => p.id === uploadTarget)
  const uploadProjectName = lockedProjectName || uploadProject?.title || 'project'

  const sidebarGroups = useMemo(() => {
    if (lockedScope === 'project' || viewScope === 'project') {
      return [{ scope: 'project' as const, label: 'Project files', items: PROJECT_DOCUMENT_CATEGORIES }]
    }
    if (lockedScope === 'company' || viewScope === 'company') {
      return [{ scope: 'company' as const, label: 'Company records', items: COMPANY_DOCUMENT_CATEGORIES }]
    }
    return [
      { scope: 'company' as const, label: 'Company records', items: COMPANY_DOCUMENT_CATEGORIES },
      { scope: 'project' as const, label: 'Project files', items: PROJECT_DOCUMENT_CATEGORIES },
    ]
  }, [lockedScope, viewScope])

  const countFor = (scope: 'company' | 'project', id: string) =>
    counts[`${scope}:${id}`] || counts[id] || 0

  const groupTotal = (scope: 'company' | 'project') =>
    categoriesFor(scope).reduce((sum, item) => sum + countFor(scope, item.id), 0)

  const total = sidebarGroups.reduce((sum, group) => sum + groupTotal(group.scope), 0)

  useEffect(() => {
    let cancelled = false
    const loadProjects = async () => {
      try {
        if (library) {
          const res = await projectsAPI.getProjects({ limit: 500 })
          const list = (res.projects || res.data || []) as Parameters<typeof mapProject>[0][]
          if (!cancelled) setProjects(Array.isArray(list) ? list.map(mapProject) : [])
          return
        }
        if (lockedProjectId) {
          const project = await projectsAPI.getProject(lockedProjectId)
          if (!cancelled) setProjects(project ? [mapProject(project)] : [])
        }
      } catch {
        if (!cancelled) setProjects([])
      }
    }
    loadProjects()
    return () => {
      cancelled = true
    }
  }, [library, lockedProjectId])

  const load = useCallback(async () => {
    try {
      setLoading(true)
      setError('')
      let queryScope = listScope
      let queryCategory = category === 'all' ? undefined : category
      let queryProjectId = listProjectId
      if (category.includes(':')) {
        const [scopePart, categoryPart] = category.split(':') as ['company' | 'project', string]
        queryScope = scopePart
        queryCategory = categoryPart
        if (scopePart === 'company') queryProjectId = undefined
      }
      const [items, cat] = await Promise.all([
        documentsAPI.list({
          scope: queryScope,
          projectId: queryProjectId,
          category: queryCategory,
          search: search.trim() || undefined,
        }),
        documentsAPI.categories({ projectId: queryProjectId, scope: listScope }),
      ])
      let nextDocs = Array.isArray(items) ? items : []
      if (queryScope === 'project' || listScope === 'project') {
        nextDocs = nextDocs.filter((doc) => doc.scope === 'project')
      }

      const relevantProjects = queryProjectId
        ? projects.filter((project) => project.id === queryProjectId)
        : queryScope === 'company'
          ? []
          : projects
      const existingUrls = new Set(nextDocs.map((doc) => doc.url))
      const q = search.trim().toLowerCase()
      const extras = relevantProjects
        .flatMap(docsFromProjectForm)
        .filter((doc) => !existingUrls.has(doc.url))
        .filter((doc) => !queryCategory || doc.category === queryCategory)
        .filter((doc) => {
          if (!q) return true
          return (
            doc.title.toLowerCase().includes(q) ||
            doc.originalName.toLowerCase().includes(q) ||
            (doc.project?.title || '').toLowerCase().includes(q)
          )
        })

      const map: Record<string, number> = {}
      for (const row of cat.counts || []) {
        const scopedKey = row.scope ? `${row.scope}:${row.category}` : row.category
        map[scopedKey] = row.count
        map[row.category] = (map[row.category] || 0) + row.count
      }
      for (const extra of extras) {
        const scopedKey = `${extra.scope}:${extra.category}`
        map[scopedKey] = (map[scopedKey] || 0) + 1
        map[extra.category] = (map[extra.category] || 0) + 1
      }

      setDocs([...extras, ...nextDocs])
      setCounts(map)
    } catch (err) {
      console.error(err)
      setError('Could not load documents. Try again in a moment.')
      setDocs([])
    } finally {
      setLoading(false)
    }
  }, [listScope, listProjectId, category, search, projects])

  useEffect(() => {
    const timer = setTimeout(load, search ? 250 : 0)
    return () => clearTimeout(timer)
  }, [load, search])

  const uploadType: BlobUploadType = useMemo(() => {
    if (uploadScope === 'project') {
      return { type: 'project', projectName: uploadProjectName, subfolder: uploadCategory }
    }
    return { type: 'company', category: uploadCategory }
  }, [uploadScope, uploadProjectName, uploadCategory])

  const registerFile = async (url: string, pathname: string, file: File) => {
    const customTitle = title.trim()
    const docTitle =
      customTitle && !usedCustomTitle.current ? customTitle : titleFromFile(file.name) || file.name
    if (customTitle) usedCustomTitle.current = true

    await documentsAPI.create({
      title: docTitle,
      description: description.trim() || undefined,
      category: uploadCategory,
      scope: uploadScope,
      projectId: uploadScope === 'project' ? uploadTarget : undefined,
      url,
      pathname,
      originalName: file.name,
      fileSize: file.size,
      mimeType: file.type,
    })
  }

  const onUploaded = async (url: string, pathname: string, file: File) => {
    if (uploadScope === 'project' && !uploadTarget) {
      setError('Choose a project before uploading.')
      return
    }
    try {
      setSaving(true)
      setError('')
      await registerFile(url, pathname, file)
      setNotice(`Saved ${file.name}`)
      setWorkspaceTab('search')
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

  const changeViewScope = (next: ViewScope) => {
    setViewScope(next)
    setCategory('all')
    if (next === 'company') setFilterProjectId('')
    if (next === 'company') {
      setUploadTarget('company')
      setUploadCategory(COMPANY_DOCUMENT_CATEGORIES[0].id)
    } else if (next === 'project') {
      const project = filterProjectId || projects[0]?.id || ''
      if (project) {
        setUploadTarget(project)
        setUploadCategory(PROJECT_DOCUMENT_CATEGORIES[0].id)
      }
    }
  }

  const changeUploadTarget = (value: string) => {
    setUploadTarget(value)
    const nextScope = value === 'company' ? 'company' : 'project'
    const nextCats = categoriesFor(nextScope)
    if (!nextCats.some((item) => item.id === uploadCategory)) {
      setUploadCategory(nextCats[0].id)
    }
  }

  const editCategories = editing ? categoriesFor(editing.scope) : uploadCategories
  const activeTabClass = isDark
    ? 'border-amber-500 text-amber-400'
    : 'border-crimson-600 text-crimson-700'
  const idleTabClass = isDark
    ? 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-500'
    : 'border-transparent text-granite-500 hover:text-granite-700 hover:border-granite-300'
  const filterChip = (id: ViewScope, label: string) => (
    <button
      type="button"
      onClick={() => changeViewScope(id)}
      className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
        viewScope === id ? 'bg-crimson-900 text-white' : `${hoverBtn} ${muted}`
      }`}
    >
      {label}
    </button>
  )

  return (
    <div className="space-y-4">
      <div className={`border-b ${isDark ? 'border-granite-600' : 'border-granite-200'}`}>
        <nav className="-mb-px flex gap-6" aria-label="Document workspace">
          <button
            type="button"
            onClick={() => setWorkspaceTab('upload')}
            className={`inline-flex items-center gap-2 border-b-2 py-3 px-1 text-sm font-medium ${
              workspaceTab === 'upload' ? activeTabClass : idleTabClass
            }`}
          >
            <ArrowUpTrayIcon className="h-4 w-4" />
            Upload documents
          </button>
          <button
            type="button"
            onClick={() => setWorkspaceTab('search')}
            className={`inline-flex items-center gap-2 border-b-2 py-3 px-1 text-sm font-medium ${
              workspaceTab === 'search' ? activeTabClass : idleTabClass
            }`}
          >
            <MagnifyingGlassIcon className="h-4 w-4" />
            Search documents
          </button>
        </nav>
      </div>

      {workspaceTab === 'upload' && (
        <div className={`rounded-xl border p-4 ${panel}`}>
          <h3 className="font-semibold mb-1">
            Upload {uploadScope === 'project' ? 'project' : 'company'} document
          </h3>
          <p className={`mb-3 text-xs ${muted}`}>
            Files are stored by category. Add a title if you want a clearer name than the file name.
          </p>
          {error && <p className={`mb-3 text-sm ${errorText}`}>{error}</p>}
          <div className="grid gap-3 sm:grid-cols-2">
            {library && (
              <label className="text-sm sm:col-span-2">
                <span className={muted}>Save to</span>
                <select
                  value={uploadTarget}
                  onChange={(e) => changeUploadTarget(e.target.value)}
                  className={`mt-1 w-full rounded-lg border px-3 py-2 ${input}`}
                >
                  <option value="company">Company records</option>
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      Project: {project.title}
                    </option>
                  ))}
                </select>
              </label>
            )}
            <label className="text-sm">
              <span className={muted}>Title (optional)</span>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className={`mt-1 w-full rounded-lg border px-3 py-2 ${input}`}
                placeholder={
                  uploadScope === 'company' ? 'e.g. Tax clearance 2026' : 'e.g. Approved wireframes'
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
                {uploadCategories.map((item) => (
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
            inputId={`doc-upload-${lockedScope || 'library'}-${lockedProjectId || uploadTarget || 'company'}`}
            uploadType={uploadType}
            tone={tone}
            maxFiles={8}
            label={saving ? 'Saving to library...' : 'Drop files or click to upload'}
            onUploaded={onUploaded}
            onUploadingChange={onUploadingChange}
          />
        </div>
      )}

      {workspaceTab === 'search' && (
        <div className="flex min-h-0 flex-col gap-4">
          {library && (
            <div className={`flex shrink-0 flex-col gap-3 rounded-xl border p-3 sm:flex-row sm:items-center ${panel}`}>
              <div className="flex flex-wrap gap-2">
                {filterChip('all', 'All')}
                {filterChip('company', 'Company')}
                {filterChip('project', 'Projects')}
              </div>
              {viewScope === 'project' && (
                <label className="sm:ml-auto text-sm sm:min-w-[240px]">
                  <span className="sr-only">Project</span>
                  <select
                    value={filterProjectId}
                    onChange={(e) => {
                      const id = e.target.value
                      setFilterProjectId(id)
                      setCategory('all')
                      if (id) {
                        setUploadTarget(id)
                        setUploadCategory(PROJECT_DOCUMENT_CATEGORIES[0].id)
                      }
                    }}
                    className={`w-full rounded-lg border px-3 py-2 ${input}`}
                  >
                    <option value="">All projects</option>
                    {projects.map((project) => (
                      <option key={project.id} value={project.id}>
                        {project.title}
                      </option>
                    ))}
                  </select>
                </label>
              )}
            </div>
          )}

          <div className="grid min-h-0 items-start gap-6 lg:grid-cols-[220px_minmax(0,1fr)] lg:h-[min(32rem,calc(100vh-18rem))]">
            <aside className={`rounded-xl border p-3 lg:sticky lg:top-4 lg:max-h-full lg:overflow-y-auto ${panel}`}>
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
              {sidebarGroups.map((group) => (
                <div key={group.scope} className="mt-3">
                  {sidebarGroups.length > 1 && (
                    <p className={`px-2 pb-1 text-[11px] font-semibold uppercase tracking-wide ${muted}`}>
                      {group.label}
                    </p>
                  )}
                  {group.items.map((item) => {
                    const key = sidebarGroups.length > 1 ? `${group.scope}:${item.id}` : item.id
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setCategory(key)}
                        className={`mt-1 flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm ${
                          category === key ? 'bg-crimson-900 text-white' : hoverBtn
                        }`}
                      >
                        <span>{item.label}</span>
                        <span className="text-xs opacity-70">{countFor(group.scope, item.id)}</span>
                      </button>
                    )
                  })}
                </div>
              ))}
            </aside>

            <div className={`flex min-h-0 flex-col rounded-xl border p-4 ${panel}`}>
              <div className="mb-3 shrink-0">
                <div className="relative">
                  <MagnifyingGlassIcon className={`absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 ${muted}`} />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search titles, file names, and projects..."
                    className={`w-full rounded-lg border py-2 pl-9 pr-3 ${input}`}
                  />
                </div>
                {notice && !error && <p className={`mt-2 text-sm ${muted}`}>{notice}</p>}
                {error && <p className={`mt-2 text-sm ${errorText}`}>{error}</p>}
              </div>

              <div className="min-h-0 max-h-[22rem] flex-1 overflow-y-auto overscroll-contain pr-1 lg:max-h-none">
                {loading ? (
                  <div className={`h-32 animate-pulse rounded-lg ${isDark ? 'bg-granite-700/40' : 'bg-granite-100'}`} />
                ) : docs.length === 0 ? (
                  <div className={`py-10 text-center ${muted}`}>
                    <FolderIcon className="mx-auto mb-2 h-10 w-10" />
                    <p>No documents in this filter yet.</p>
                  </div>
                ) : (
                  <ul className={`divide-y ${divider}`}>
                    {docs.map((doc) => (
                      <li key={doc.id} className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="min-w-0">
                          <p className="font-medium truncate">{doc.title}</p>
                          <p className={`text-xs ${muted}`}>
                            {doc.scope === 'project' ? 'Project' : 'Company'}
                            {` · ${documentCategoryLabel(doc.category, doc.scope)}`}
                            {doc.project?.title ? ` · ${doc.project.title}` : ''}
                            {` · ${formatFileSize(doc.fileSize)}`}
                            {doc.createdAt
                              ? ` · ${new Date(doc.createdAt).toLocaleDateString()}`
                              : ' · From project form'}
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
                          {doc.id.startsWith('form-') ? null : (
                            <>
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
                            </>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

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
                {editCategories.map((item) => (
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

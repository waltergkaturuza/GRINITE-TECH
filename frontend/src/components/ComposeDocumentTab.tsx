'use client'

import { useEffect, useMemo, useState } from 'react'
import { PrinterIcon } from '@heroicons/react/24/outline'
import { documentsAPI, invoicesAPI, usersAPI } from '@/lib/api'
import { uploadToBlob } from '@/lib/blobStorage'
import { QUANTIS_LETTERHEAD, letterheadCss, letterheadHtml } from '@/lib/companyLetterhead'
import { COMPANY_CONTACT } from '@/constants/company'
import QuantisLetterhead from '@/components/QuantisLetterhead'

export type ComposedKind = 'bid' | 'letter' | 'sla' | 'memo'

type Attachment = {
  key: string
  group: string
  label: string
  href?: string
}

type ClientOption = {
  id: string
  firstName?: string
  lastName?: string
  email?: string
  company?: string
  companyAddress?: string
  billingAddress?: string
  role?: string
}

type ProjectOption = { id: string; title: string }

const KIND_META: Record<
  ComposedKind,
  { label: string; category: string; prefix: string; defaultSubject: string; defaultBody: string }
> = {
  bid: {
    label: 'Bid / Tender',
    category: 'bids',
    prefix: 'BID',
    defaultSubject: 'Submission of bid',
    defaultBody:
      'Dear Sir/Madam,\n\nPlease find our bid for the stated requirement. Quantis Technologies is pleased to submit this proposal together with the enclosed supporting documents.\n\nWe remain available for any clarification.\n\nYours faithfully,',
  },
  letter: {
    label: 'Letter',
    category: 'correspondence',
    prefix: 'LTR',
    defaultSubject: '',
    defaultBody: 'Dear Sir/Madam,\n\n\n\nYours faithfully,',
  },
  sla: {
    label: 'SLA',
    category: 'contracts',
    prefix: 'SLA',
    defaultSubject: 'Service Level Agreement',
    defaultBody:
      'This Service Level Agreement sets out the services Quantis Technologies will provide, the performance standards we commit to, and the responsibilities of both parties.\n\n1. Services\n2. Service levels and response times\n3. Reporting and review\n4. Term and termination\n\nThe enclosed documents form part of this agreement.',
  },
  memo: {
    label: 'Memo',
    category: 'correspondence',
    prefix: 'MEMO',
    defaultSubject: '',
    defaultBody: 'Please note the following:\n\n',
  },
}

function todayIso() {
  return new Date().toISOString().slice(0, 10)
}

function makeRef(kind: ComposedKind) {
  return `${KIND_META[kind].prefix}-${todayIso().replace(/-/g, '')}`
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function asList<T>(value: unknown): T[] {
  if (Array.isArray(value)) return value as T[]
  if (value && typeof value === 'object') {
    const obj = value as { invoices?: T[]; data?: T[]; users?: T[] }
    if (Array.isArray(obj.invoices)) return obj.invoices
    if (Array.isArray(obj.data)) return obj.data
    if (Array.isArray(obj.users)) return obj.users
  }
  return []
}

type ComposeDocumentTabProps = {
  projects: ProjectOption[]
  onSaved: () => void
}

export default function ComposeDocumentTab({ projects, onSaved }: ComposeDocumentTabProps) {
  const [kind, setKind] = useState<ComposedKind>('letter')
  const [reference, setReference] = useState(makeRef('letter'))
  const [docDate, setDocDate] = useState(todayIso())
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState(KIND_META.letter.defaultBody)
  const [recipientId, setRecipientId] = useState('')
  const [recipientName, setRecipientName] = useState('')
  const [recipientCompany, setRecipientCompany] = useState('')
  const [recipientAddress, setRecipientAddress] = useState('')
  const [projectId, setProjectId] = useState('')
  const [signatory, setSignatory] = useState('Walter Katuruza')
  const [signatoryTitle, setSignatoryTitle] = useState('Director')
  const [selectedKeys, setSelectedKeys] = useState<string[]>([])
  const [clients, setClients] = useState<ClientOption[]>([])
  const [attachments, setAttachments] = useState<Attachment[]>([])
  const [loadingSources, setLoadingSources] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  useEffect(() => {
    let cancelled = false
    const loadSources = async () => {
      setLoadingSources(true)
      try {
        const [clientRes, certs, invoices, quotations, receipts, companyDocs] = await Promise.all([
          usersAPI.getUsers({ role: 'client' }).catch(() => []),
          documentsAPI.list({ scope: 'company', category: 'certificates' }).catch(() => []),
          invoicesAPI.getInvoices({ documentType: 'invoice', limit: 100 }).catch(() => []),
          invoicesAPI.getInvoices({ documentType: 'quotation', limit: 100 }).catch(() => []),
          invoicesAPI.getInvoices({ documentType: 'receipt', limit: 100 }).catch(() => []),
          documentsAPI.list({ scope: 'company' }).catch(() => []),
        ])
        if (cancelled) return

        const clientList = asList<ClientOption>(clientRes).filter(
          (user) => !user.role || String(user.role).toLowerCase() === 'client',
        )
        setClients(clientList)

        const certDocs = Array.isArray(certs) ? certs : []
        const otherDocs = (Array.isArray(companyDocs) ? companyDocs : []).filter(
          (doc) => doc.category !== 'certificates',
        )
        const invoiceRows = asList<any>(invoices)
        const quotationRows = asList<any>(quotations)
        const receiptRows = asList<any>(receipts)

        const next: Attachment[] = [
          ...certDocs.map((doc) => ({
            key: `doc-${doc.id}`,
            group: 'Certificates',
            label: doc.title || doc.originalName,
            href: doc.url,
          })),
          ...invoiceRows.map((row) => ({
            key: `inv-${row.id}`,
            group: 'Invoices',
            label: `${row.invoice_number}${row.project?.title ? ` · ${row.project.title}` : ''}`,
            href: row.url,
          })),
          ...quotationRows.map((row) => ({
            key: `quo-${row.id}`,
            group: 'Quotations',
            label: `${row.invoice_number}${row.project?.title ? ` · ${row.project.title}` : ''}`,
            href: row.url,
          })),
          ...receiptRows.map((row) => ({
            key: `rec-${row.id}`,
            group: 'Receipts',
            label: `${row.invoice_number}${row.parent_invoice?.invoice_number ? ` · ${row.parent_invoice.invoice_number}` : ''}`,
            href: row.url,
          })),
          ...otherDocs.map((doc) => ({
            key: `doc-${doc.id}`,
            group: 'Other company files',
            label: `${doc.title} (${doc.category})`,
            href: doc.url,
          })),
        ]
        setAttachments(next)
      } catch (err) {
        console.error(err)
        if (!cancelled) setError('Could not load certificates, invoices, or other files to attach.')
      } finally {
        if (!cancelled) setLoadingSources(false)
      }
    }
    loadSources()
    return () => {
      cancelled = true
    }
  }, [])

  const changeKind = (next: ComposedKind) => {
    const prev = KIND_META[kind]
    setKind(next)
    setReference(makeRef(next))
    if (!subject.trim() || subject === prev.defaultSubject) {
      setSubject(KIND_META[next].defaultSubject)
    }
    if (!body.trim() || body === prev.defaultBody) {
      setBody(KIND_META[next].defaultBody)
    }
  }

  const applyClient = (id: string) => {
    setRecipientId(id)
    const client = clients.find((item) => item.id === id)
    if (!client) return
    setRecipientName(`${client.firstName || ''} ${client.lastName || ''}`.trim())
    setRecipientCompany(client.company || '')
    setRecipientAddress(client.billingAddress || client.companyAddress || '')
  }

  const chosen = attachments.filter((item) => selectedKeys.includes(item.key))
  const groups = useMemo(() => {
    const map = new Map<string, Attachment[]>()
    for (const item of attachments) {
      const list = map.get(item.group) || []
      list.push(item)
      map.set(item.group, list)
    }
    return Array.from(map.entries())
  }, [attachments])

  const toggleAttachment = (key: string) => {
    setSelectedKeys((current) =>
      current.includes(key) ? current.filter((item) => item !== key) : [...current, key],
    )
  }

  const composedHtml = (forPrint = false) => {
    const enclosures = chosen
      .map((item) => {
        if (item.href) {
          return `<li><a href="${escapeHtml(item.href)}" target="_blank" rel="noopener noreferrer">${escapeHtml(item.label)}</a></li>`
        }
        return `<li>${escapeHtml(item.label)}</li>`
      })
      .join('')
    const origin = typeof window !== 'undefined' ? window.location.origin : ''
    const projectTitle = projects.find((item) => item.id === projectId)?.title || ''
    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(reference)} ${escapeHtml(subject || KIND_META[kind].label)}</title>
  <style>
    body { font-family: Georgia, "Times New Roman", serif; color: #111827; margin: ${forPrint ? '16mm' : '0'}; }
    .sheet { max-width: 800px; margin: 0 auto; }
    .meta { display: flex; justify-content: space-between; gap: 24px; margin: 20px 0 28px; font-size: 13px; }
    h1 { font-size: 20px; letter-spacing: 0.08em; text-transform: uppercase; font-weight: 700; margin: 0 0 8px; }
    .body { white-space: pre-wrap; line-height: 1.55; font-size: 15px; }
    .enclosures { margin-top: 28px; font-size: 13px; }
    .sign { margin-top: 36px; }
    .muted { color: #6b7280; }
    ${letterheadCss()}
  </style>
</head>
<body>
  <div class="sheet">
    ${letterheadHtml(origin)}
    <div class="meta">
      <div>
        ${recipientName ? `<p><strong>${escapeHtml(recipientName)}</strong></p>` : ''}
        ${recipientCompany ? `<p>${escapeHtml(recipientCompany)}</p>` : ''}
        ${recipientAddress ? `<p style="white-space:pre-line">${escapeHtml(recipientAddress)}</p>` : ''}
      </div>
      <div style="text-align:right">
        <p><strong>${escapeHtml(KIND_META[kind].label)}</strong></p>
        <p>${escapeHtml(reference)}</p>
        <p>${escapeHtml(docDate)}</p>
        ${projectTitle ? `<p>${escapeHtml(projectTitle)}</p>` : ''}
      </div>
    </div>
    ${subject ? `<h1>${escapeHtml(subject)}</h1>` : ''}
    <div class="body">${escapeHtml(body)}</div>
    <div class="sign">
      <p>${escapeHtml(signatory)}</p>
      <p class="muted">${escapeHtml(signatoryTitle)}</p>
      <p class="muted">${escapeHtml(QUANTIS_LETTERHEAD.company_name)}</p>
      <p class="muted">${escapeHtml(COMPANY_CONTACT.primaryPhoneDisplay)} · ${escapeHtml(COMPANY_CONTACT.websiteDisplay)}</p>
    </div>
    ${
      enclosures
        ? `<div class="enclosures"><p><strong>Enclosures</strong></p><ul>${enclosures}</ul></div>`
        : ''
    }
  </div>
</body>
</html>`
  }

  const printDocument = () => {
    const popup = window.open('', '_blank', 'noopener,noreferrer,width=900,height=1100')
    if (!popup) {
      setError('Allow pop-ups to print or save this document as PDF.')
      return
    }
    popup.document.write(composedHtml(true))
    popup.document.close()
    popup.focus()
    setTimeout(() => popup.print(), 400)
  }

  const saveToLibrary = async () => {
    if (!body.trim()) {
      setError('Add the document body before saving.')
      return
    }
    try {
      setSaving(true)
      setError('')
      setNotice('')
      const html = composedHtml(true)
      const blob = new Blob([html], { type: 'text/html' })
      const filename = `${reference || KIND_META[kind].prefix}.html`
      const file = new File([blob], filename, { type: 'text/html' })
      const category = KIND_META[kind].category
      const uploaded = await uploadToBlob(file, { type: 'company', category }, filename)
      const enclosureNote = chosen.length
        ? `Enclosures: ${chosen.map((item) => item.label).join('; ')}`
        : ''
      await documentsAPI.create({
        title: subject.trim() || `${KIND_META[kind].label} ${reference}`,
        description: [reference, recipientCompany || recipientName, enclosureNote].filter(Boolean).join(' · '),
        category,
        scope: projectId ? 'project' : 'company',
        projectId: projectId || undefined,
        url: uploaded.url,
        pathname: uploaded.pathname,
        originalName: filename,
        fileSize: file.size,
        mimeType: 'text/html',
      })
      setNotice(`Saved ${KIND_META[kind].label.toLowerCase()} ${reference} to the library.`)
      onSaved()
    } catch (err) {
      console.error(err)
      setError('Could not save this document to the library. You can still print it.')
    } finally {
      setSaving(false)
    }
  }

  const field =
    'mt-1 w-full rounded-lg border border-granite-600 bg-granite-700 px-3 py-2 text-white placeholder-gray-400'

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(320px,0.9fr)]">
      <div className="rounded-xl border border-granite-700 bg-granite-800 p-4 text-white">
        <h3 className="font-semibold">Create a letterheaded document</h3>
        <p className="mt-1 mb-4 text-xs text-gray-400">
          Draft a bid, letter, SLA, or memo on the Quantis letterhead. Attach certificates, invoices,
          quotations, or receipts from the system, then print or save to the library.
        </p>
        {error && <p className="mb-3 text-sm text-crimson-300">{error}</p>}
        {notice && <p className="mb-3 text-sm text-green-300">{notice}</p>}

        <div className="flex flex-wrap gap-2 mb-4">
          {(Object.keys(KIND_META) as ComposedKind[]).map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => changeKind(item)}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
                kind === item ? 'bg-crimson-900 text-white' : 'text-gray-300 hover:bg-granite-700'
              }`}
            >
              {KIND_META[item].label}
            </button>
          ))}
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="text-sm">
            <span className="text-gray-400">Reference</span>
            <input value={reference} onChange={(e) => setReference(e.target.value)} className={field} />
          </label>
          <label className="text-sm">
            <span className="text-gray-400">Date</span>
            <input type="date" value={docDate} onChange={(e) => setDocDate(e.target.value)} className={field} />
          </label>
          <label className="text-sm sm:col-span-2">
            <span className="text-gray-400">Subject / title</span>
            <input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className={field}
              placeholder={kind === 'memo' ? 'Memo subject' : 'Document title'}
            />
          </label>
          <label className="text-sm">
            <span className="text-gray-400">Contact person</span>
            <select value={recipientId} onChange={(e) => applyClient(e.target.value)} className={field}>
              <option value="">Select a client contact</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {`${client.firstName || ''} ${client.lastName || ''}`.trim()}
                  {client.company ? ` · ${client.company}` : ''}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm">
            <span className="text-gray-400">Project (optional)</span>
            <select value={projectId} onChange={(e) => setProjectId(e.target.value)} className={field}>
              <option value="">Company record</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.title}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm">
            <span className="text-gray-400">Recipient name</span>
            <input value={recipientName} onChange={(e) => setRecipientName(e.target.value)} className={field} />
          </label>
          <label className="text-sm">
            <span className="text-gray-400">Recipient company</span>
            <input value={recipientCompany} onChange={(e) => setRecipientCompany(e.target.value)} className={field} />
          </label>
          <label className="text-sm sm:col-span-2">
            <span className="text-gray-400">Recipient address</span>
            <textarea
              value={recipientAddress}
              onChange={(e) => setRecipientAddress(e.target.value)}
              rows={2}
              className={field}
            />
          </label>
          <label className="text-sm sm:col-span-2">
            <span className="text-gray-400">Body</span>
            <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={10} className={field} />
          </label>
          <label className="text-sm">
            <span className="text-gray-400">Signatory</span>
            <input value={signatory} onChange={(e) => setSignatory(e.target.value)} className={field} />
          </label>
          <label className="text-sm">
            <span className="text-gray-400">Title</span>
            <input value={signatoryTitle} onChange={(e) => setSignatoryTitle(e.target.value)} className={field} />
          </label>
        </div>

        <div className="mt-5">
          <p className="text-sm font-medium text-white mb-2">Attach from the system</p>
          {loadingSources ? (
            <p className="text-sm text-gray-400">Loading certificates, invoices, quotations, and receipts…</p>
          ) : groups.length === 0 ? (
            <p className="text-sm text-gray-400">No files or billing documents are available to attach yet.</p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 max-h-72 overflow-y-auto pr-1">
              {groups.map(([group, items]) => (
                <div key={group} className="rounded-lg border border-granite-600 p-3">
                  <p className="text-xs uppercase tracking-wide text-gray-400 mb-2">{group}</p>
                  <div className="space-y-1.5">
                    {items.map((item) => (
                      <label key={item.key} className="flex items-start gap-2 text-sm text-gray-200">
                        <input
                          type="checkbox"
                          checked={selectedKeys.includes(item.key)}
                          onChange={() => toggleAttachment(item.key)}
                          className="mt-1 rounded border-granite-500"
                        />
                        <span>{item.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={printDocument}
            className="inline-flex items-center gap-2 rounded-lg bg-granite-600 px-4 py-2 text-sm font-medium text-white hover:bg-granite-500"
          >
            <PrinterIcon className="h-4 w-4" />
            Print / save PDF
          </button>
          <button
            type="button"
            onClick={saveToLibrary}
            disabled={saving}
            className="rounded-lg bg-crimson-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            {saving ? 'Saving…' : 'Save to library'}
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-granite-700 bg-granite-800 p-4">
        <p className="mb-3 text-xs uppercase tracking-wide text-gray-400">Letterhead preview</p>
        <div className="max-h-[70vh] overflow-y-auto rounded-lg bg-white p-6 text-gray-900">
          <QuantisLetterhead className="mb-5" />
          <div className="mt-4 flex justify-between gap-4 text-sm">
            <div>
              {recipientName && <p className="font-semibold">{recipientName}</p>}
              {recipientCompany && <p>{recipientCompany}</p>}
              {recipientAddress && <p className="whitespace-pre-line text-gray-600">{recipientAddress}</p>}
            </div>
            <div className="text-right text-gray-600">
              <p className="font-semibold text-gray-900">{KIND_META[kind].label}</p>
              <p>{reference}</p>
              <p>{docDate}</p>
            </div>
          </div>
          {subject && <h4 className="mt-5 text-lg font-semibold uppercase tracking-wide">{subject}</h4>}
          <div className="mt-4 whitespace-pre-wrap text-[15px] leading-relaxed">{body}</div>
          <div className="mt-8 text-sm">
            <p>{signatory}</p>
            <p className="text-gray-500">{signatoryTitle}</p>
            <p className="text-gray-500">{QUANTIS_LETTERHEAD.company_name}</p>
          </div>
          {chosen.length > 0 && (
            <div className="mt-6 text-sm">
              <p className="font-semibold">Enclosures</p>
              <ul className="mt-1 list-disc pl-5 text-gray-700">
                {chosen.map((item) => (
                  <li key={item.key}>{item.label}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

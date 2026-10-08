'use client'

import { useCallback, useEffect, useMemo, useRef, useState, type ClipboardEvent } from 'react'
import { PrinterIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline'
import { documentsAPI, invoicesAPI, usersAPI, type ComposedDocumentDraft } from '@/lib/api'
import { uploadToBlob } from '@/lib/blobStorage'
import { QUANTIS_LETTERHEAD, letterheadCss, letterheadHtml } from '@/lib/companyLetterhead'
import { COMPANY_CONTACT } from '@/constants/company'
import QuantisLetterhead from '@/components/QuantisLetterhead'
import {
  attachmentPrintPages,
  buildComposedPdf,
  downloadPdfBytes,
  type ComposeAttachment,
} from '@/lib/composePdf'

export type ComposedKind = 'bid' | 'letter' | 'sla' | 'memo'

type Attachment = ComposeAttachment

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

type BodyAlign = 'left' | 'justify' | 'right'

function bodyAlignOf(value: unknown): BodyAlign {
  return value === 'right' || value === 'justify' || value === 'left' ? value : 'left'
}

function looksLikeHtml(value: string) {
  return /<\/?[a-z][\s\S]*>/i.test(value)
}

const BODY_TAGS = new Set([
  'P',
  'DIV',
  'BR',
  'B',
  'STRONG',
  'I',
  'EM',
  'U',
  'TABLE',
  'THEAD',
  'TBODY',
  'TFOOT',
  'TR',
  'TH',
  'TD',
  'CAPTION',
  'UL',
  'OL',
  'LI',
])

function sanitizeBodyHtml(input: string) {
  if (typeof document === 'undefined') return ''
  const parsed = new DOMParser().parseFromString(`<div>${input}</div>`, 'text/html')
  const root = parsed.body.firstElementChild
  if (!root) return ''

  const clean = (node: Node): Node | null => {
    if (node.nodeType === Node.TEXT_NODE) return document.createTextNode(node.textContent || '')
    if (!(node instanceof HTMLElement)) return null
    const tag = node.tagName
    if (tag === 'BR') return document.createElement('br')
    if (!BODY_TAGS.has(tag)) {
      const fragment = document.createDocumentFragment()
      node.childNodes.forEach((child) => {
        const next = clean(child)
        if (next) fragment.appendChild(next)
      })
      return fragment
    }
    const out = document.createElement(tag.toLowerCase())
    if (tag === 'TH' || tag === 'TD') {
      const colspan = Number(node.getAttribute('colspan'))
      const rowspan = Number(node.getAttribute('rowspan'))
      if (colspan > 1 && colspan < 20) out.setAttribute('colspan', String(Math.floor(colspan)))
      if (rowspan > 1 && rowspan < 20) out.setAttribute('rowspan', String(Math.floor(rowspan)))
    }
    node.childNodes.forEach((child) => {
      const next = clean(child)
      if (next) out.appendChild(next)
    })
    return out
  }

  const holder = document.createElement('div')
  root.childNodes.forEach((child) => {
    const next = clean(child)
    if (next) holder.appendChild(next)
  })
  return holder.innerHTML
}

function bodyToEditorHtml(value: string) {
  if (!value) return ''
  if (!looksLikeHtml(value)) return escapeHtml(value).replace(/\r\n/g, '\n').replace(/\n/g, '<br>')
  if (typeof document === 'undefined') return escapeHtml(value)
  return sanitizeBodyHtml(value)
}

function plainTextFromBody(value: string) {
  if (!looksLikeHtml(value)) return value.replace(/\u00a0/g, ' ').trim()
  if (typeof document === 'undefined') return value.replace(/<[^>]+>/g, ' ').trim()
  const holder = document.createElement('div')
  holder.innerHTML = sanitizeBodyHtml(value)
  return (holder.textContent || '').replace(/\u00a0/g, ' ').trim()
}

function tableHtml(rows: number, cols: number) {
  const heading = Array.from({ length: cols }, (_, index) => `<th>Column ${index + 1}</th>`).join('')
  const body = Array.from(
    { length: rows },
    () => `<tr>${Array.from({ length: cols }, () => '<td>&nbsp;</td>').join('')}</tr>`,
  ).join('')
  return `<table><caption>Table title</caption><thead><tr>${heading}</tr></thead><tbody>${body}</tbody></table>`
}

function columnStart(cell: HTMLTableCellElement) {
  const row = cell.parentElement
  if (!row) return 0
  let index = 0
  for (const child of Array.from(row.children)) {
    if (child === cell) return index
    if (child instanceof HTMLTableCellElement) index += child.colSpan || 1
  }
  return index
}

function rowLayout(row: HTMLTableRowElement) {
  const cells: { cell: HTMLTableCellElement; start: number; span: number }[] = []
  let cursor = 0
  for (const child of Array.from(row.children)) {
    if (!(child instanceof HTMLTableCellElement)) continue
    const span = child.colSpan || 1
    cells.push({ cell: child, start: cursor, span })
    cursor += span
  }
  return cells
}

function tableColumnCount(table: HTMLTableElement) {
  let max = 0
  table.querySelectorAll('tr').forEach((row) => {
    if (!(row instanceof HTMLTableRowElement)) return
    const cells = rowLayout(row)
    const last = cells[cells.length - 1]
    max = Math.max(max, last ? last.start + last.span : 0)
  })
  return max
}

function blankCell(tag: 'td' | 'th') {
  const cell = document.createElement(tag)
  cell.innerHTML = '&nbsp;'
  return cell
}

function placeCaret(cell: HTMLElement) {
  const range = document.createRange()
  range.selectNodeContents(cell)
  range.collapse(true)
  const selection = window.getSelection()
  selection?.removeAllRanges()
  selection?.addRange(range)
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

export function isComposedDraft(value: unknown): value is ComposedDocumentDraft {
  if (!value || typeof value !== 'object') return false
  const kind = (value as { kind?: string }).kind
  return kind === 'bid' || kind === 'letter' || kind === 'sla' || kind === 'memo'
}

type ComposeDocumentTabProps = {
  projects: ProjectOption[]
  onSaved: () => void
  onCancel?: () => void
  documentId?: string | null
  initialDraft?: ComposedDocumentDraft | null
}

export default function ComposeDocumentTab({
  projects,
  onSaved,
  onCancel,
  documentId,
  initialDraft,
}: ComposeDocumentTabProps) {
  const starting = initialDraft && isComposedDraft(initialDraft) ? initialDraft : null
  const startKind: ComposedKind = starting?.kind || 'letter'
  const [kind, setKind] = useState<ComposedKind>(startKind)
  const [reference, setReference] = useState(starting?.reference || makeRef(startKind))
  const [docDate, setDocDate] = useState(starting?.docDate || todayIso())
  const [subject, setSubject] = useState(starting?.subject ?? '')
  const [body, setBody] = useState(starting?.body ?? KIND_META[startKind].defaultBody)
  const [bodyAlign, setBodyAlign] = useState<BodyAlign>(bodyAlignOf(starting?.bodyAlign))
  const [recipientId, setRecipientId] = useState(starting?.recipientId ?? '')
  const [recipientName, setRecipientName] = useState(starting?.recipientName ?? '')
  const [recipientCompany, setRecipientCompany] = useState(starting?.recipientCompany ?? '')
  const [recipientAddress, setRecipientAddress] = useState(starting?.recipientAddress ?? '')
  const [projectId, setProjectId] = useState(starting?.projectId ?? '')
  const [signatory, setSignatory] = useState(starting?.signatory || 'Walter Katuruza')
  const [signatoryTitle, setSignatoryTitle] = useState(starting?.signatoryTitle || 'Director')
  const [selectedKeys, setSelectedKeys] = useState<string[]>(
    starting && Array.isArray(starting.attachmentKeys) ? starting.attachmentKeys : [],
  )
  const [clients, setClients] = useState<ClientOption[]>([])
  const [attachments, setAttachments] = useState<Attachment[]>([])
  const [loadingSources, setLoadingSources] = useState(true)
  const [saving, setSaving] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [tableRows, setTableRows] = useState(3)
  const [tableCols, setTableCols] = useState(4)
  const editorRef = useRef<HTMLDivElement | null>(null)
  const internalEdit = useRef(false)
  const bindEditor = useCallback((node: HTMLDivElement | null) => {
    editorRef.current = node
  }, [])

  useEffect(() => {
    if (!initialDraft || !isComposedDraft(initialDraft)) return
    const nextKind = initialDraft.kind
    setKind(nextKind)
    setReference(initialDraft.reference || makeRef(nextKind))
    setDocDate(initialDraft.docDate || todayIso())
    setSubject(initialDraft.subject || '')
    setBody(initialDraft.body || KIND_META[nextKind].defaultBody)
    setBodyAlign(bodyAlignOf(initialDraft.bodyAlign))
    setRecipientId(initialDraft.recipientId || '')
    setRecipientName(initialDraft.recipientName || '')
    setRecipientCompany(initialDraft.recipientCompany || '')
    setRecipientAddress(initialDraft.recipientAddress || '')
    setProjectId(initialDraft.projectId || '')
    setSignatory(initialDraft.signatory || 'Walter Katuruza')
    setSignatoryTitle(initialDraft.signatoryTitle || 'Director')
    setSelectedKeys(Array.isArray(initialDraft.attachmentKeys) ? initialDraft.attachmentKeys : [])
    // Hydrate once per opened document. The parent remounts this form with a new key.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [documentId])

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
            mimeType: doc.mimeType,
            originalName: doc.originalName,
            kind: 'file' as const,
          })),
          ...invoiceRows.map((row) => ({
            key: `inv-${row.id}`,
            group: 'Invoices',
            label: `${row.invoice_number}${row.project?.title ? ` · ${row.project.title}` : ''}`,
            href: row.url,
            kind: 'invoice' as const,
            recordId: row.id,
            record: row,
          })),
          ...quotationRows.map((row) => ({
            key: `quo-${row.id}`,
            group: 'Quotations',
            label: `${row.invoice_number}${row.project?.title ? ` · ${row.project.title}` : ''}`,
            href: row.url,
            kind: 'quotation' as const,
            recordId: row.id,
            record: row,
          })),
          ...receiptRows.map((row) => ({
            key: `rec-${row.id}`,
            group: 'Receipts',
            label: `${row.invoice_number}${row.parent_invoice?.invoice_number ? ` · ${row.parent_invoice.invoice_number}` : ''}`,
            href: row.url,
            kind: 'receipt' as const,
            recordId: row.id,
            record: row,
          })),
          ...otherDocs.map((doc) => ({
            key: `doc-${doc.id}`,
            group: 'Other company files',
            label: `${doc.title} (${doc.category})`,
            href: doc.url,
            mimeType: doc.mimeType,
            originalName: doc.originalName,
            kind: 'file' as const,
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
    if (!documentId) setReference(makeRef(next))
    if (!subject.trim() || subject === prev.defaultSubject) {
      setSubject(KIND_META[next].defaultSubject)
    }
    if (!plainTextFromBody(body) || plainTextFromBody(body) === plainTextFromBody(prev.defaultBody)) {
      setBody(KIND_META[next].defaultBody)
    }
  }

  const rememberBody = () => {
    const node = editorRef.current
    if (!node) return
    const next = sanitizeBodyHtml(node.innerHTML)
    if (next === body) return
    internalEdit.current = true
    setBody(next)
  }

  useEffect(() => {
    const node = editorRef.current
    if (!node) return
    if (internalEdit.current) {
      internalEdit.current = false
      return
    }
    const next = bodyToEditorHtml(body)
    if (node.innerHTML !== next) node.innerHTML = next
  }, [body])

  const applyInline = (tag: 'strong' | 'em') => {
    const node = editorRef.current
    const selection = window.getSelection()
    if (!node || !selection || selection.rangeCount === 0 || !node.contains(selection.anchorNode)) {
      setError('Select the words in the body first.')
      return
    }
    const range = selection.getRangeAt(0)
    if (range.collapsed) {
      setError('Select the words you want in bold or italic.')
      return
    }
    setError('')
    const parentTag = (start: Node | null) => {
      let current: Node | null = start
      while (current && current !== node) {
        if (current instanceof HTMLElement && current.tagName === tag.toUpperCase()) return current
        current = current.parentNode
      }
      return null
    }
    const existing = parentTag(range.startContainer)
    if (existing && existing === parentTag(range.endContainer)) {
      const fragment = document.createDocumentFragment()
      while (existing.firstChild) fragment.appendChild(existing.firstChild)
      existing.replaceWith(fragment)
    } else {
      const wrapper = document.createElement(tag)
      try {
        range.surroundContents(wrapper)
      } catch {
        wrapper.appendChild(range.extractContents())
        range.insertNode(wrapper)
      }
    }
    rememberBody()
  }

  const insertTable = () => {
    const node = editorRef.current
    if (!node) return
    const rows = Math.min(12, Math.max(1, Number(tableRows) || 1))
    const cols = Math.min(8, Math.max(1, Number(tableCols) || 1))
    node.focus()
    const html = `${tableHtml(rows, cols)}<br>`
    const selection = window.getSelection()
    const inside = Boolean(selection && selection.rangeCount > 0 && node.contains(selection.anchorNode))
    if (!inside) node.insertAdjacentHTML('beforeend', html)
    else document.execCommand('insertHTML', false, html)
    rememberBody()
  }

  const selectedTableCell = () => {
    const editor = editorRef.current
    const selection = window.getSelection()
    if (!editor || !selection?.anchorNode || !editor.contains(selection.anchorNode)) return null
    const origin = selection.anchorNode instanceof HTMLElement ? selection.anchorNode : selection.anchorNode.parentElement
    const cell = origin?.closest('td, th')
    if (!(cell instanceof HTMLTableCellElement) || !editor.contains(cell)) return null
    const row = cell.parentElement
    const table = cell.closest('table')
    if (!(row instanceof HTMLTableRowElement) || !(table instanceof HTMLTableElement) || !editor.contains(table)) {
      return null
    }
    return { cell, row, table }
  }

  const addTableRow = () => {
    const current = selectedTableCell()
    if (!current) {
      setError('Click a cell in the table first.')
      return
    }
    const { row, table } = current
    if (table.querySelectorAll('tr').length >= 24) {
      setError('This table already has 24 rows.')
      return
    }
    setError('')
    const cols = Math.max(1, tableColumnCount(table))
    const inHead = row.parentElement?.tagName === 'THEAD'
    const tag = inHead ? 'td' : row.cells[0]?.tagName === 'TH' ? 'th' : 'td'
    const next = document.createElement('tr')
    for (let index = 0; index < cols; index += 1) next.appendChild(blankCell(tag))
    if (inHead) {
      let body = table.tBodies[0]
      if (!body) {
        body = document.createElement('tbody')
        table.appendChild(body)
      }
      body.insertBefore(next, body.firstChild)
    } else {
      row.after(next)
    }
    placeCaret(next.cells[0])
    rememberBody()
  }

  const deleteTableRow = () => {
    const current = selectedTableCell()
    if (!current) {
      setError('Click a cell in the table first.')
      return
    }
    setError('')
    const { row, table } = current
    const nextRow = row.nextElementSibling instanceof HTMLTableRowElement ? row.nextElementSibling : row.previousElementSibling
    row.remove()
    if (!table.querySelector('tr')) table.remove()
    else if (nextRow instanceof HTMLTableRowElement && nextRow.cells[0]) placeCaret(nextRow.cells[0])
    rememberBody()
  }

  const addTableColumn = () => {
    const current = selectedTableCell()
    if (!current) {
      setError('Click a cell in the table first.')
      return
    }
    const { cell, table } = current
    if (tableColumnCount(table) >= 12) {
      setError('This table already has 12 columns.')
      return
    }
    setError('')
    const index = columnStart(cell)
    let focus: HTMLTableCellElement | null = null
    table.querySelectorAll('tr').forEach((item) => {
      if (!(item instanceof HTMLTableRowElement)) return
      const layout = rowLayout(item)
      const hit = layout.find((entry) => index >= entry.start && index < entry.start + entry.span)
      const tag = item.parentElement?.tagName === 'THEAD' || item.cells[0]?.tagName === 'TH' ? 'th' : 'td'
      const fresh = blankCell(tag)
      if (!hit) {
        item.appendChild(fresh)
      } else if (hit.span > 1 && index > hit.start) {
        hit.cell.colSpan = hit.span + 1
        return
      } else {
        hit.cell.after(fresh)
      }
      if (item === current.row) focus = fresh
    })
    if (focus) placeCaret(focus)
    rememberBody()
  }

  const deleteTableColumn = () => {
    const current = selectedTableCell()
    if (!current) {
      setError('Click a cell in the table first.')
      return
    }
    setError('')
    const { cell, table } = current
    if (tableColumnCount(table) <= 1) {
      table.remove()
      rememberBody()
      return
    }
    const index = columnStart(cell)
    table.querySelectorAll('tr').forEach((item) => {
      if (!(item instanceof HTMLTableRowElement)) return
      const hit = rowLayout(item).find((entry) => index >= entry.start && index < entry.start + entry.span)
      if (!hit) return
      if (hit.span > 1) hit.cell.colSpan = hit.span - 1
      else hit.cell.remove()
    })
    rememberBody()
  }

  const pasteBody = (event: ClipboardEvent<HTMLDivElement>) => {
    const html = event.clipboardData.getData('text/html')
    const text = event.clipboardData.getData('text/plain')
    event.preventDefault()
    const safe = html ? sanitizeBodyHtml(html) : escapeHtml(text).replace(/\n/g, '<br>')
    document.execCommand('insertHTML', false, safe)
    rememberBody()
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

  const composedHtml = (forPrint = false, attachments = chosen, includeAttachmentPages = forPrint) => {
    const enclosures = attachments
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
    .body { white-space: pre-wrap; line-height: 1.55; font-size: 15px; text-align: ${bodyAlign}; }
    .body table { width: 100%; border-collapse: collapse; margin: 12px 0 16px; font-size: 13px; }
    .body caption { caption-side: top; text-align: left; font-weight: 700; margin: 0 0 6px; }
    .body th, .body td { border: 1px solid #111827; padding: 6px 8px; vertical-align: top; text-align: left; }
    .body th { font-weight: 700; }
    .enclosures { margin-top: 28px; font-size: 13px; }
    .sign { margin-top: 36px; }
    .muted { color: #6b7280; }
    @page { size: A4; margin: 14mm; }
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
    <div class="body">${bodyToEditorHtml(body)}</div>
    <div class="sign">
      <p>${escapeHtml(signatory)}</p>
      <p class="muted">${escapeHtml(signatoryTitle)}</p>
      <p class="muted">${escapeHtml(QUANTIS_LETTERHEAD.company_name)}</p>
      <p class="muted">${escapeHtml(COMPANY_CONTACT.primaryPhoneDisplay)} · ${escapeHtml(COMPANY_CONTACT.websiteDisplay)}</p>
    </div>
    ${
      enclosures
        ? `<div class="enclosures"><p><strong>Enclosures (attached as PDF)</strong></p><ul>${enclosures}</ul></div>`
        : ''
    }
  </div>
  ${includeAttachmentPages ? attachmentPrintPages(attachments, origin) : ''}
</body>
</html>`
  }

  const pdfFilename = () => `${reference || KIND_META[kind].prefix}.pdf`

  const resolveAttachments = async () => {
    const next = await Promise.all(
      chosen.map(async (item) => {
        if (item.kind === 'file' || !item.recordId) return item
        if (Array.isArray(item.record?.items) && item.record.items.length) return item
        try {
          const full = await invoicesAPI.getInvoice(Number(item.recordId))
          return { ...item, record: full }
        } catch {
          return item
        }
      }),
    )
    return next
  }

  const printDocument = async () => {
    try {
      setExporting(true)
      setError('')
      const attachments = await resolveAttachments()
      const popup = window.open('', '_blank', 'noopener,noreferrer,width=900,height=1100')
      if (!popup) {
        setError('Allow pop-ups to print this document.')
        return
      }
      popup.document.write(composedHtml(true, attachments))
      popup.document.close()
      popup.focus()
      setTimeout(() => popup.print(), 500)
    } catch (err) {
      console.error(err)
      setError('Could not open the print preview.')
    } finally {
      setExporting(false)
    }
  }

  const makePdfFile = async () => {
    const attachments = await resolveAttachments()
    const bytes = await buildComposedPdf(composedHtml(true, attachments, false), attachments)
    const filename = pdfFilename()
    const copy = new Uint8Array(bytes.byteLength)
    copy.set(bytes)
    const file = new File([copy], filename, { type: 'application/pdf' })
    return { bytes, filename, file }
  }

  const downloadPdf = async () => {
    try {
      setExporting(true)
      setError('')
      setNotice('')
      const { bytes, filename } = await makePdfFile()
      downloadPdfBytes(bytes, filename)
      setNotice(
        chosen.length
          ? `Downloaded ${filename} with ${chosen.length} attached PDF${chosen.length === 1 ? '' : 's'}.`
          : `Downloaded ${filename}.`,
      )
    } catch (err) {
      console.error(err)
      setError('Could not build the PDF pack. Try print instead, or attach fewer files.')
    } finally {
      setExporting(false)
    }
  }

  const saveToLibrary = async () => {
    if (!plainTextFromBody(body)) {
      setError('Add the document body before saving.')
      return
    }
    try {
      setSaving(true)
      setError('')
      setNotice('')
      const { file, filename } = await makePdfFile()
      const category = KIND_META[kind].category
      const uploaded = await uploadToBlob(file, { type: 'company', category }, filename)
      const enclosureNote = chosen.length
        ? `PDF enclosures: ${chosen.map((item) => item.label).join('; ')}`
        : ''
      const draft: ComposedDocumentDraft = {
        kind,
        reference,
        docDate,
        subject,
        body: editorRef.current ? sanitizeBodyHtml(editorRef.current.innerHTML) : bodyToEditorHtml(body),
        bodyAlign,
        recipientId,
        recipientName,
        recipientCompany,
        recipientAddress,
        projectId,
        signatory,
        signatoryTitle,
        attachmentKeys: selectedKeys,
      }
      const saved = {
        title: subject.trim() || `${KIND_META[kind].label} ${reference}`,
        description: [reference, recipientCompany || recipientName, enclosureNote].filter(Boolean).join(' · '),
        category,
        scope: (projectId ? 'project' : 'company') as 'project' | 'company',
        url: uploaded.url,
        pathname: uploaded.pathname,
        originalName: filename,
        fileSize: file.size,
        mimeType: 'application/pdf',
        metadata: { compose: draft },
      }
      if (documentId) {
        await documentsAPI.update(documentId, {
          ...saved,
          projectId: projectId || null,
        })
      } else {
        await documentsAPI.create({
          ...saved,
          projectId: projectId || undefined,
        })
      }
      setNotice(
        documentId
          ? `Updated ${KIND_META[kind].label.toLowerCase()} ${reference} in the library.`
          : `Saved ${KIND_META[kind].label.toLowerCase()} ${reference} as a PDF pack in the library.`,
      )
      onSaved()
    } catch (err) {
      console.error(err)
      setError('Could not save the PDF to the library. You can still download it.')
    } finally {
      setSaving(false)
    }
  }

  const field =
    'mt-1 w-full rounded-lg border border-granite-600 bg-granite-700 px-3 py-2 text-white placeholder-gray-400'

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(320px,0.9fr)]">
      <div className="rounded-xl border border-granite-700 bg-granite-800 p-4 text-white">
        <h3 className="font-semibold">
          {documentId ? `Edit ${KIND_META[kind].label.toLowerCase()}` : 'Create a letterheaded document'}
        </h3>
        <p className="mt-1 mb-4 text-xs text-gray-400">
          {documentId
            ? 'Change the recipient, subject, body, signatory, or attachments, then save. The library PDF is replaced with the updated letterhead pack.'
            : 'Draft a bid, letter, SLA, or memo on the Quantis letterhead. Tick certificates, invoices, quotations, or receipts to attach them as extra PDF pages, then print or download the pack.'}
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
          <div className="text-sm sm:col-span-2">
            <span className="text-gray-400">Body</span>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              {(
                [
                  ['left', 'Left'],
                  ['justify', 'Justify'],
                  ['right', 'Right align'],
                ] as const
              ).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setBodyAlign(value)}
                  className={`rounded-md px-2.5 py-1 text-xs font-medium ${
                    bodyAlign === value ? 'bg-crimson-900 text-white' : 'bg-granite-700 text-gray-200'
                  }`}
                >
                  {label}
                </button>
              ))}
              <button
                type="button"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => applyInline('strong')}
                className="rounded-md bg-granite-700 px-2.5 py-1 text-xs font-bold text-white"
              >
                Bold
              </button>
              <button
                type="button"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => applyInline('em')}
                className="rounded-md bg-granite-700 px-2.5 py-1 text-xs italic text-white"
              >
                Italic
              </button>
              <label className="flex items-center gap-1 text-xs text-gray-300">
                Rows
                <input
                  type="number"
                  min={1}
                  max={12}
                  value={tableRows}
                  onChange={(event) => setTableRows(Number(event.target.value))}
                  className="w-14 rounded border border-granite-600 bg-granite-700 px-2 py-1 text-white"
                />
              </label>
              <label className="flex items-center gap-1 text-xs text-gray-300">
                Columns
                <input
                  type="number"
                  min={1}
                  max={8}
                  value={tableCols}
                  onChange={(event) => setTableCols(Number(event.target.value))}
                  className="w-14 rounded border border-granite-600 bg-granite-700 px-2 py-1 text-white"
                />
              </label>
              <button
                type="button"
                onMouseDown={(event) => event.preventDefault()}
                onClick={insertTable}
                className="rounded-md bg-granite-700 px-2.5 py-1 text-xs font-medium text-white"
              >
                Insert table
              </button>
              <button
                type="button"
                onMouseDown={(event) => event.preventDefault()}
                onClick={addTableRow}
                className="rounded-md bg-granite-700 px-2.5 py-1 text-xs font-medium text-white"
              >
                Add row
              </button>
              <button
                type="button"
                onMouseDown={(event) => event.preventDefault()}
                onClick={deleteTableRow}
                className="rounded-md bg-granite-700 px-2.5 py-1 text-xs font-medium text-white"
              >
                Delete row
              </button>
              <button
                type="button"
                onMouseDown={(event) => event.preventDefault()}
                onClick={addTableColumn}
                className="rounded-md bg-granite-700 px-2.5 py-1 text-xs font-medium text-white"
              >
                Add column
              </button>
              <button
                type="button"
                onMouseDown={(event) => event.preventDefault()}
                onClick={deleteTableColumn}
                className="rounded-md bg-granite-700 px-2.5 py-1 text-xs font-medium text-white"
              >
                Delete column
              </button>
            </div>
            <div
              ref={bindEditor}
              contentEditable
              suppressContentEditableWarning
              role="textbox"
              aria-multiline="true"
              aria-label="Document body"
              onInput={rememberBody}
              onPaste={pasteBody}
              style={{ textAlign: bodyAlign }}
              className="compose-editor mt-2 min-h-[220px] w-full rounded-lg border border-granite-600 bg-granite-700 px-3 py-2 text-white outline-none whitespace-pre-wrap"
            />
            <p className="mt-1 text-xs text-gray-400">
              Select words, then use Bold or Italic. Insert a table, then click a cell and use Add row, Delete row, Add
              column, or Delete column.
            </p>
          </div>
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
          <p className="text-sm font-medium text-white mb-2">Attach from the system (included as PDF pages)</p>
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
            disabled={exporting || saving}
            className="inline-flex items-center gap-2 rounded-lg bg-granite-600 px-4 py-2 text-sm font-medium text-white hover:bg-granite-500 disabled:opacity-60"
          >
            <PrinterIcon className="h-4 w-4" />
            Print
          </button>
          <button
            type="button"
            onClick={downloadPdf}
            disabled={exporting || saving}
            className="inline-flex items-center gap-2 rounded-lg bg-purple-700 px-4 py-2 text-sm font-medium text-white hover:bg-purple-600 disabled:opacity-60"
          >
            <ArrowDownTrayIcon className="h-4 w-4" />
            {exporting ? 'Building PDF…' : 'Download PDF'}
          </button>
          <button
            type="button"
            onClick={saveToLibrary}
            disabled={saving || exporting}
            className="rounded-lg bg-crimson-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            {saving ? 'Saving PDF…' : documentId ? 'Save changes' : 'Save PDF to library'}
          </button>
          {documentId && onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={saving || exporting}
              className="rounded-lg border border-granite-600 px-4 py-2 text-sm font-medium text-gray-200 disabled:opacity-60"
            >
              Cancel
            </button>
          )}
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
          <style>{`
            .compose-body table, .compose-editor table { width: 100%; border-collapse: collapse; margin: 12px 0 16px; }
            .compose-body caption, .compose-editor caption { caption-side: top; text-align: left; font-weight: 700; margin: 0 0 6px; }
            .compose-body th, .compose-body td, .compose-editor th, .compose-editor td { border: 1px solid #111827; padding: 6px 8px; vertical-align: top; text-align: left; }
            .compose-editor th, .compose-editor td, .compose-editor caption { border-color: #9ca3af; }
          `}</style>
          <div
            className="compose-body mt-4 whitespace-pre-wrap text-[15px] leading-relaxed"
            style={{ textAlign: bodyAlign }}
            dangerouslySetInnerHTML={{ __html: bodyToEditorHtml(body) }}
          />
          <div className="mt-8 text-sm">
            <p>{signatory}</p>
            <p className="text-gray-500">{signatoryTitle}</p>
            <p className="text-gray-500">{QUANTIS_LETTERHEAD.company_name}</p>
          </div>
          {chosen.length > 0 && (
            <div className="mt-6 text-sm">
              <p className="font-semibold">Enclosures (PDF pages)</p>
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

/**
 * Systematic file storage paths for Vercel Blob
 * Format: {Root}/{entity}/{identifier}/{date}/{filename}
 */

const slugify = (s: string): string =>
  s
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-_]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')

const sanitizeFilename = (name: string): string => {
  const base = name.replace(/[^a-zA-Z0-9._-]/g, '_')
  return base.slice(0, 200)
}

const dateSegment = (): string => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export type BlobUploadType =
  | { type: 'project'; projectName: string; subfolder?: 'supporting' | 'funding' }
  | { type: 'inquiry'; category: string }
  | { type: 'invoice'; projectOrClient: string; invoiceNumber: string }
  | { type: 'quotation'; projectOrClient: string; quotationNumber: string }
  | { type: 'generic'; folder: string }

/**
 * Build the Blob path for systematic storage
 * - Projects: Projects/{project_name}/{date}/{file-name}
 * - Inquiries: Inquiries/{category}/{date}/{file-name}
 * - Invoices: Invoices/{project_or_client}/{date}/{invoice_number}_{file-name}
 * - Quotations: Quotations/{project_or_client}/{date}/{quotation_number}_{file-name}
 */
export function buildBlobPath(uploadType: BlobUploadType, originalFilename: string): string {
  const filename = sanitizeFilename(originalFilename)
  const date = dateSegment()

  switch (uploadType.type) {
    case 'project': {
      const base = `Projects/${slugify(uploadType.projectName)}`
      const mid = uploadType.subfolder ? `/${uploadType.subfolder}` : ''
      return `${base}${mid}/${date}/${filename}`
    }
    case 'inquiry':
      return `Inquiries/${slugify(uploadType.category)}/${date}/${filename}`
    case 'invoice':
      return `Invoices/${slugify(uploadType.projectOrClient)}/${date}/${uploadType.invoiceNumber}_${filename}`
    case 'quotation':
      return `Quotations/${slugify(uploadType.projectOrClient)}/${date}/${uploadType.quotationNumber}_${filename}`
    case 'generic':
      return `${uploadType.folder}/${date}/${filename}`
    default:
      return `Misc/${date}/${filename}`
  }
}

export interface UploadResult {
  url: string
  pathname: string
}

export async function uploadToBlob(
  file: File | Blob,
  uploadType: BlobUploadType,
  filename?: string
): Promise<UploadResult> {
  const name = filename || (file instanceof File ? file.name : 'file')
  const pathname = buildBlobPath(uploadType, name)

  const res = await fetch('/api/upload', {
    method: 'POST',
    headers: { 'X-Blob-Path': pathname },
    body: file,
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || `Upload failed: ${res.statusText}`)
  }

  const data = await res.json()
  return { url: data.url, pathname: data.pathname || pathname }
}

export const COMPANY_DOCUMENT_CATEGORIES = [
  { id: 'certificates', label: 'Certificates' },
  { id: 'bids', label: 'Bids & Tenders' },
  { id: 'contracts', label: 'Contracts' },
  { id: 'licenses', label: 'Licenses & Permits' },
  { id: 'insurance', label: 'Insurance' },
  { id: 'policies', label: 'Policies' },
  { id: 'financial', label: 'Financial' },
  { id: 'hr', label: 'Human Resources' },
  { id: 'legal', label: 'Legal' },
  { id: 'correspondence', label: 'Correspondence' },
  { id: 'other', label: 'Other' },
] as const

export const PROJECT_DOCUMENT_CATEGORIES = [
  { id: 'specs', label: 'Specifications' },
  { id: 'designs', label: 'Designs' },
  { id: 'deliverables', label: 'Deliverables' },
  { id: 'contracts', label: 'Contracts' },
  { id: 'correspondence', label: 'Correspondence' },
  { id: 'other', label: 'Other' },
] as const

export function documentCategoryLabel(id: string, scope: 'company' | 'project' = 'company') {
  const list = scope === 'project' ? PROJECT_DOCUMENT_CATEGORIES : COMPANY_DOCUMENT_CATEGORIES
  return list.find((item) => item.id === id)?.label || id.replace(/_/g, ' ')
}

export function formatFileSize(bytes?: number) {
  const n = Number(bytes) || 0
  if (n < 1024) return `${n} B`
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`
  return `${(n / 1024 / 1024).toFixed(2)} MB`
}

export function parseListField(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map(String).map((item) => item.trim()).filter(Boolean)
  }
  if (typeof value === 'string' && value.trim()) {
    try {
      const parsed = JSON.parse(value)
      if (Array.isArray(parsed)) {
        return parsed.map(String).map((item) => item.trim()).filter(Boolean)
      }
    } catch {
      // treat as delimited text
    }
    return value.split(/\r?\n|,/).map((item) => item.trim()).filter(Boolean)
  }
  return []
}

export function formatPrice(value: unknown, currency = 'USD') {
  const amount = Number(value)
  if (!Number.isFinite(amount)) return '—'
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      maximumFractionDigits: amount % 1 === 0 ? 0 : 2,
    }).format(amount)
  } catch {
    return `$${amount.toLocaleString()}`
  }
}

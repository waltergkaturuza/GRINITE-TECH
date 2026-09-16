export const CURRENCY_OPTIONS = [
  { code: 'USD', label: 'USD — US Dollar' },
  { code: 'ZWG', label: 'ZiG — Zimbabwe Gold' },
  { code: 'ZAR', label: 'ZAR — South African Rand' },
  { code: 'GBP', label: 'GBP — British Pound' },
  { code: 'EUR', label: 'EUR — Euro' },
] as const

export type MoneyBag = Record<string, number>

export type FxConfig = {
  combine: boolean
  reportingCurrency: string
  /** Units of each currency equal to 1 reporting unit. Example: 1 USD = 28 ZiG → { ZWG: 28 } */
  unitsPerReporting: Record<string, number>
}

const FX_KEY = 'quantis-fx-rates'

export const defaultFxConfig: FxConfig = {
  combine: false,
  reportingCurrency: 'USD',
  unitsPerReporting: { ZWG: 0, ZAR: 0, GBP: 0, EUR: 0 },
}

export function normalizeCurrency(code?: string | null): string {
  const raw = String(code || 'USD').trim().toUpperCase()
  if (!raw) return 'USD'
  if (raw === 'ZIG' || raw === 'ZWG' || raw === 'ZWL' || raw === 'Z$') return 'ZWG'
  return raw
}

export function currencyLabel(code?: string | null): string {
  const normalized = normalizeCurrency(code)
  return normalized === 'ZWG' ? 'ZiG' : normalized
}

export function moneyCurrencyOf(record?: {
  currency?: string | null
  metadata?: { currency?: string | null }
} | null): string {
  return normalizeCurrency(record?.currency || record?.metadata?.currency)
}

export function invoiceCurrencyOf(doc?: {
  currency?: string | null
  project?: { currency?: string | null; metadata?: { currency?: string | null } } | null
  parent_invoice?: {
    currency?: string | null
    project?: { currency?: string | null; metadata?: { currency?: string | null } } | null
  } | null
} | null): string {
  return normalizeCurrency(
    doc?.currency
      || doc?.project?.currency
      || doc?.project?.metadata?.currency
      || doc?.parent_invoice?.currency
      || doc?.parent_invoice?.project?.currency
      || doc?.parent_invoice?.project?.metadata?.currency,
  )
}

export function rowsToBag(rows?: Array<{ total?: number; currency?: string | null }> | null): MoneyBag {
  const bag: MoneyBag = {}
  for (const row of rows || []) addToBag(bag, row.total, row.currency)
  return bag
}

export function formatBagWithFx(bag: MoneyBag, fx?: FxConfig | null, empty = '—'): {
  separate: string
  combined: string | null
  needsRates: boolean
} {
  const separate = formatMoneyBag(bag, empty)
  const codes = Object.keys(bag).filter((code) => Math.abs(bag[code]) > 0.0001)
  if (!fx?.combine || codes.length <= 1) {
    return { separate, combined: null, needsRates: false }
  }
  const combined = combineBag(bag, fx)
  return {
    separate,
    combined: combined != null ? formatMoney(combined, fx.reportingCurrency) : null,
    needsRates: combined == null,
  }
}

export function formatMoney(amount: unknown, currency?: string | null): string {
  const value = Number(amount)
  const safe = Number.isFinite(value) ? value : 0
  const code = normalizeCurrency(currency)
  const label = currencyLabel(code)
  try {
    const intlCode = code === 'ZWG' ? 'USD' : code
    const formatted = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: intlCode,
      currencyDisplay: 'narrowSymbol',
    }).format(safe)
    return code === 'ZWG' ? formatted.replace('$', 'ZiG ') : formatted
  } catch {
    return `${label} ${safe.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }
}

export function addToBag(bag: MoneyBag, amount: unknown, currency?: string | null): MoneyBag {
  const code = normalizeCurrency(currency)
  const value = Number(amount)
  bag[code] = (bag[code] || 0) + (Number.isFinite(value) ? value : 0)
  return bag
}

export function formatMoneyBag(bag: MoneyBag, empty = '—'): string {
  const parts = Object.entries(bag)
    .filter(([, value]) => Math.abs(value) > 0.0001)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([code, value]) => formatMoney(value, code))
  return parts.length ? parts.join('  ·  ') : empty
}

export function loadFxConfig(): FxConfig {
  if (typeof window === 'undefined') return defaultFxConfig
  try {
    const raw = window.localStorage.getItem(FX_KEY)
    if (!raw) return defaultFxConfig
    const parsed = JSON.parse(raw) as Partial<FxConfig>
    return {
      ...defaultFxConfig,
      ...parsed,
      unitsPerReporting: {
        ...defaultFxConfig.unitsPerReporting,
        ...(parsed.unitsPerReporting || {}),
      },
    }
  } catch {
    return defaultFxConfig
  }
}

export function saveFxConfig(config: FxConfig) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(FX_KEY, JSON.stringify(config))
}

export function convertToReporting(amount: number, from: string, fx: FxConfig): number | null {
  const source = normalizeCurrency(from)
  const target = normalizeCurrency(fx.reportingCurrency)
  if (source === target) return amount
  const rate = Number(fx.unitsPerReporting[source])
  if (!rate || rate <= 0) return null
  return amount / rate
}

export function combineBag(bag: MoneyBag, fx: FxConfig): number | null {
  const entries = Object.entries(bag).filter(([, value]) => Math.abs(value) > 0.0001)
  if (!entries.length) return 0
  let total = 0
  for (const [code, amount] of entries) {
    const converted = convertToReporting(amount, code, fx)
    if (converted == null) return null
    total += converted
  }
  return total
}

export function canCombine(bag: MoneyBag, fx: FxConfig): boolean {
  return combineBag(bag, fx) != null && Object.keys(bag).filter((code) => Math.abs(bag[code]) > 0.0001).length > 1
}

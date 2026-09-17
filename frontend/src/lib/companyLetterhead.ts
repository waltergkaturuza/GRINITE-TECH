import { COMPANY_ADDRESS_LINES, COMPANY_CONTACT, QUANTIS_LOGO_PNG_URL } from '@/constants/company'

export const QUANTIS_LETTERHEAD = {
  company_name: 'Quantis Technologies Private Limited',
  company_legal_name: 'QUANTIS TECHNOLOGIES (PRIVATE) LIMITED',
  company_logo_url: QUANTIS_LOGO_PNG_URL,
  company_address: `${COMPANY_CONTACT.addressLine1}\n${COMPANY_CONTACT.addressLine2}`,
  company_email: COMPANY_CONTACT.primaryEmail,
  company_phone: COMPANY_CONTACT.primaryPhoneDisplay,
  company_website: COMPANY_CONTACT.website,
  company_code: '',
  company_vat_code: '',
  company_bank_name: 'CBZ',
  company_bank_branch: 'Southerton (Code: 6110)',
  company_account_name: 'Quantis Technologies',
  company_usd_account: '02327737470013',
  company_zig_account: '02327737470023',
  company_swift: '',
  company_iban: '',
  currency: 'USD',
}

export type SellerBankDetails = {
  company_bank_name?: string
  company_bank_branch?: string
  company_account_name?: string
  company_usd_account?: string
  company_zig_account?: string
  company_swift?: string
  company_iban?: string
}

export function getSellerBankDetails(source?: SellerBankDetails) {
  return {
    bank: source?.company_bank_name || QUANTIS_LETTERHEAD.company_bank_name,
    branch: source?.company_bank_branch || QUANTIS_LETTERHEAD.company_bank_branch,
    accountName: source?.company_account_name || QUANTIS_LETTERHEAD.company_account_name,
    usdAccount: source?.company_usd_account || QUANTIS_LETTERHEAD.company_usd_account,
    zigAccount: source?.company_zig_account || QUANTIS_LETTERHEAD.company_zig_account,
    swift: source?.company_swift || QUANTIS_LETTERHEAD.company_swift,
    iban: source?.company_iban || QUANTIS_LETTERHEAD.company_iban,
  }
}

export function formatSellerBankBlock(source?: SellerBankDetails): string[] {
  const b = getSellerBankDetails(source)
  const lines = [
    `Bank: ${b.bank}`,
    `Branch: ${b.branch}`,
    `Account Name: ${b.accountName}`,
    `USD Account: ${b.usdAccount}`,
    `ZiG Account: ${b.zigAccount}`,
  ]
  if (b.swift) lines.push(`SWIFT: ${b.swift}`)
  if (b.iban) lines.push(`IBAN: ${b.iban}`)
  return lines
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export function letterheadContact() {
  return {
    legalName: QUANTIS_LETTERHEAD.company_legal_name,
    lines: [
      ...COMPANY_ADDRESS_LINES,
      COMPANY_CONTACT.websiteDisplay,
      COMPANY_CONTACT.primaryEmail,
      COMPANY_CONTACT.primaryPhoneDisplay,
    ],
  }
}

/** Prefer the current mark; skip old full-width letterhead images and the former SVG. */
export function resolveLetterheadLogoSrc(stored?: string | null) {
  if (!stored) return QUANTIS_LOGO_PNG_URL
  const path = stored.replace(/^https?:\/\/[^/]+/i, '').toLowerCase()
  if (path.includes('letterhead') || path.includes('quantis-1.svg')) {
    return QUANTIS_LOGO_PNG_URL
  }
  return stored
}

export function absoluteLetterheadLogoUrl(stored?: string | null) {
  const path = resolveLetterheadLogoSrc(stored)
  if (/^https?:\/\//i.test(path)) return path
  const origin = typeof window !== 'undefined' ? window.location.origin : ''
  return `${origin}${path}`
}

export function letterheadCss() {
  return `
.qh { width: 100%; border-collapse: collapse; margin: 0 0 10px; }
.qh td { vertical-align: middle; padding: 0; }
.qh-logo { width: 54%; }
.qh-logo img { height: 68px; width: auto; max-width: 300px; display: block; }
.qh-contact { font-family: Arial, Helvetica, sans-serif; font-size: 11px; line-height: 1.45; color: #1B365D; text-align: right; }
.qh-name { font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; font-size: 11px; color: #152A4A; margin-bottom: 4px; }
.qh-rule { height: 3px; background: linear-gradient(90deg, #1B365D 0%, #2E6B9E 58%, #C4A574 100%); margin: 0 0 22px; }
`
}

export function letterheadHtml(origin = '', storedLogo?: string | null) {
  const contact = letterheadContact()
  const logoPath = resolveLetterheadLogoSrc(storedLogo)
  const logo = /^https?:\/\//i.test(logoPath) ? logoPath : `${origin}${logoPath}`
  const lines = contact.lines.map((line) => `<div>${escapeHtml(line)}</div>`).join('')
  return `
<table class="qh" role="presentation" width="100%" cellspacing="0" cellpadding="0">
  <tr>
    <td class="qh-logo">
      <img src="${escapeHtml(logo)}" alt="Quantis Technologies" />
    </td>
    <td class="qh-contact">
      <div class="qh-name">${escapeHtml(contact.legalName)}</div>
      ${lines}
    </td>
  </tr>
</table>
<div class="qh-rule"></div>`
}

export function letterheadHtmlInline(origin = '', storedLogo?: string | null) {
  const contact = letterheadContact()
  const logoPath = resolveLetterheadLogoSrc(storedLogo)
  const logo = /^https?:\/\//i.test(logoPath) ? logoPath : `${origin}${logoPath}`
  const lines = contact.lines.map((line) => `<div style="margin:0;">${escapeHtml(line)}</div>`).join('')
  return `
<table width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;margin:0 0 8px;">
  <tr>
    <td style="width:54%;vertical-align:middle;padding:0;">
      <img src="${escapeHtml(logo)}" alt="Quantis Technologies" style="height:68px;width:auto;max-width:300px;display:block;" />
    </td>
    <td style="vertical-align:middle;padding:0;text-align:right;font-family:Arial,Helvetica,sans-serif;font-size:11px;line-height:1.45;color:#1B365D;">
      <div style="font-weight:700;letter-spacing:0.06em;text-transform:uppercase;font-size:11px;color:#152A4A;margin-bottom:4px;">${escapeHtml(contact.legalName)}</div>
      ${lines}
    </td>
  </tr>
</table>
<div style="height:3px;background:#1B365D;margin:0 0 22px;"></div>`
}

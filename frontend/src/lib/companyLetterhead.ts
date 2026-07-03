export const QUANTIS_LETTERHEAD = {
  company_name: 'Quantis Technologies Private Limited',
  company_legal_name: 'QUANTIS TECHNOLOGIES (PRIVATE) LIMITED',
  company_logo_url: '/quantis-letterhead.png',
  company_address: 'Suite R8, Kuwirirana House\nCnr Angwa and George Silundika, Harare',
  company_email: 'waltergkaturuza@gmail.com',
  company_phone: '+263777937721',
  company_website: 'https://www.quantistechnologies.co.zw',
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

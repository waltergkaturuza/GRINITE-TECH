export const COMPANY_CONTACT = {
  legalName: 'Quantis Technologies Private Limited',
  addressLine1: 'Suite R8, Kuwirirana House',
  addressLine2: 'Cnr Angwa and George Silundika, Harare',
  website: 'https://www.quantistechnologies.co.zw',
  websiteDisplay: 'www.quantistechnologies.co.zw',
  primaryEmail: 'waltergkaturuza@gmail.com',
  supportEmail: 'support@quantistech.co.zw',
  primaryPhone: '+263777937721',
  primaryPhoneDisplay: '+263 777 937 721',
} as const

export const COMPANY_ADDRESS_LINES = [
  COMPANY_CONTACT.addressLine1,
  COMPANY_CONTACT.addressLine2,
] as const

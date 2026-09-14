/** On-site wordmark (SVG). Prefer PNG URLs for Google, Open Graph, and schema. */
export const QUANTIS_LOGO_URL = '/QUANTIS-1.svg'
export const QUANTIS_LOGO_PNG_URL = '/quantis-logo.png'
export const QUANTIS_MARK_PNG_URL = '/quantis-mark.png'
export const QUANTIS_OG_IMAGE_URL = '/quantis-og.png'
export const QUANTIS_ICON_192_URL = '/icon-192.png'
export const QUANTIS_APPLE_ICON_URL = '/apple-touch-icon.png'

export const QUANTIS_LOGO_PNG_SIZE = { width: 1600, height: 572 } as const
export const QUANTIS_OG_IMAGE_SIZE = { width: 1200, height: 630 } as const

export const COMPANY_CONTACT = {
  legalName: 'Quantis Technologies Private Limited',
  addressLine1: 'Suite R8, Kuwirirana House',
  addressLine2: 'Cnr Angwa and George Silundika, Harare',
  addressLocality: 'Harare',
  addressCountry: 'ZW',
  website: 'https://www.quantistechnologies.co.zw',
  websiteDisplay: 'www.quantistechnologies.co.zw',
  primaryEmail: 'waltergkaturuza@gmail.com',
  supportEmail: 'support@quantistech.co.zw',
  primaryPhone: '+263777937721',
  primaryPhoneDisplay: '+263 777 937 721',
  slogan: 'Engineering Digital Infrastructure for a Smarter Future.',
} as const

export const COMPANY_ADDRESS_LINES = [
  COMPANY_CONTACT.addressLine1,
  COMPANY_CONTACT.addressLine2,
] as const

export const QUANTIS_CORE_SERVICES = [
  {
    id: 'enterprise',
    name: 'Enterprise Systems Engineering',
    description:
      'Custom-built platforms, portals, and mission-critical systems engineered for scalability, performance, and security.',
  },
  {
    id: 'cloud',
    name: 'Cloud Infrastructure & DevOps',
    description:
      'Cloud migration, CI/CD pipelines, infrastructure as code, and managed hosting for enterprise workloads.',
  },
  {
    id: 'data',
    name: 'Data Intelligence & Analytics',
    description:
      'Executive dashboards, KPI tracking, data warehousing, and real-time analytics for informed decision-making.',
  },
  {
    id: 'automation',
    name: 'Process Automation & Integration',
    description:
      'Workflow automation, ERP integrations, API development, and intelligent systems that streamline operations.',
  },
  {
    id: 'security',
    name: 'Cybersecurity & Compliance',
    description:
      'Security audits, penetration testing, data encryption, identity management, and compliance advisory (GDPR, POPIA).',
  },
  {
    id: 'platforms',
    name: 'Digital Platform Development',
    description:
      'End-to-end digital ecosystems including e-commerce, SaaS platforms, service portals, and enterprise tools.',
  },
] as const

export const QUANTIS_KNOWS_ABOUT = [
  ...QUANTIS_CORE_SERVICES.map((service) => service.name),
  'Custom software development',
  'Government digital transformation',
  'NGO systems',
  'Fuel management systems',
  'Mobile application development',
  'Business automation',
  'E-commerce platforms',
] as const

export const QUANTIS_KEYWORDS = [
  'Quantis Technologies',
  'Quantis Technologies Zimbabwe',
  'Quantis Tech',
  'enterprise systems engineering Zimbabwe',
  'government digital transformation Africa',
  'cloud infrastructure DevOps Zimbabwe',
  'data intelligence and analytics',
  'process automation and integration',
  'cybersecurity and compliance Zimbabwe',
  'digital platform development',
  'custom software development Harare',
  'NGO software Africa',
  'fuel management system Africa',
] as const

export const QUANTIS_DESCRIPTION =
  'Quantis Technologies is a Harare systems engineering company delivering enterprise platforms, cloud and DevOps, data intelligence, automation, cybersecurity, and digital platforms for government, NGOs, and corporates in Zimbabwe and Africa.'

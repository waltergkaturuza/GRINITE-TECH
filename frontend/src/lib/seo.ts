import { absoluteUrl, getSiteUrl } from '@/lib/site'
import {
  COMPANY_CONTACT,
  QUANTIS_CORE_SERVICES,
  QUANTIS_DESCRIPTION,
  QUANTIS_KNOWS_ABOUT,
  QUANTIS_LOGO_PNG_SIZE,
  QUANTIS_LOGO_PNG_URL,
  QUANTIS_OG_IMAGE_SIZE,
  QUANTIS_OG_IMAGE_URL,
} from '@/constants/company'

export const defaultSocialImage = {
  url: QUANTIS_OG_IMAGE_URL,
  width: QUANTIS_OG_IMAGE_SIZE.width,
  height: QUANTIS_OG_IMAGE_SIZE.height,
  alt: 'Quantis Technologies — enterprise systems, cloud, data, automation, cybersecurity, and digital platforms',
}

export function getRootJsonLd() {
  const siteUrl = getSiteUrl()
  const logoUrl = absoluteUrl(QUANTIS_LOGO_PNG_URL)
  const organizationId = `${siteUrl}/#organization`

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': ['Organization', 'ProfessionalService'],
        '@id': organizationId,
        name: 'Quantis Technologies',
        legalName: COMPANY_CONTACT.legalName,
        alternateName: ['Quantis', 'Quantis Tech', 'Quantis Technologies Zimbabwe'],
        url: siteUrl,
        logo: {
          '@type': 'ImageObject',
          '@id': `${siteUrl}/#logo`,
          url: logoUrl,
          contentUrl: logoUrl,
          width: QUANTIS_LOGO_PNG_SIZE.width,
          height: QUANTIS_LOGO_PNG_SIZE.height,
          caption: 'Quantis Technologies',
        },
        image: [logoUrl, absoluteUrl(QUANTIS_OG_IMAGE_URL)],
        description: QUANTIS_DESCRIPTION,
        slogan: COMPANY_CONTACT.slogan,
        email: COMPANY_CONTACT.supportEmail,
        telephone: COMPANY_CONTACT.primaryPhone,
        address: {
          '@type': 'PostalAddress',
          streetAddress: `${COMPANY_CONTACT.addressLine1}, ${COMPANY_CONTACT.addressLine2}`,
          addressLocality: COMPANY_CONTACT.addressLocality,
          addressCountry: COMPANY_CONTACT.addressCountry,
        },
        areaServed: [
          { '@type': 'Country', name: 'Zimbabwe' },
          { '@type': 'Continent', name: 'Africa' },
        ],
        knowsAbout: [...QUANTIS_KNOWS_ABOUT],
        serviceType: QUANTIS_CORE_SERVICES.map((service) => service.name),
        contactPoint: [
          {
            '@type': 'ContactPoint',
            contactType: 'sales',
            email: COMPANY_CONTACT.primaryEmail,
            telephone: COMPANY_CONTACT.primaryPhone,
            areaServed: 'ZW',
            availableLanguage: ['English', 'French', 'Portuguese', 'Shona'],
          },
          {
            '@type': 'ContactPoint',
            contactType: 'customer support',
            email: COMPANY_CONTACT.supportEmail,
            telephone: COMPANY_CONTACT.primaryPhone,
            areaServed: 'ZW',
            availableLanguage: ['English'],
          },
        ],
        hasOfferCatalog: {
          '@type': 'OfferCatalog',
          name: 'Quantis Technologies core capabilities',
          itemListElement: QUANTIS_CORE_SERVICES.map((service, index) => ({
            '@type': 'Offer',
            position: index + 1,
            itemOffered: {
              '@type': 'Service',
              '@id': `${siteUrl}/#service-${service.id}`,
              name: service.name,
              description: service.description,
              provider: { '@id': organizationId },
              url: absoluteUrl('/services'),
              areaServed: 'ZW',
            },
          })),
        },
      },
      {
        '@type': 'WebSite',
        '@id': `${siteUrl}/#website`,
        url: siteUrl,
        name: 'Quantis Technologies',
        alternateName: ['Quantis', 'Quantis Tech'],
        description: QUANTIS_DESCRIPTION,
        publisher: { '@id': organizationId },
        inLanguage: ['en-ZW', 'en', 'fr', 'pt', 'sn'],
      },
      {
        '@type': 'WebPage',
        '@id': `${siteUrl}/#webpage`,
        url: siteUrl,
        name: 'Quantis Technologies | Enterprise Systems Engineering Zimbabwe',
        description: QUANTIS_DESCRIPTION,
        isPartOf: { '@id': `${siteUrl}/#website` },
        about: { '@id': organizationId },
        primaryImageOfPage: { '@id': `${siteUrl}/#logo` },
      },
    ],
  }
}

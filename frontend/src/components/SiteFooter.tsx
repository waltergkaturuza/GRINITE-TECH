'use client'

import Link from 'next/link'
import { useLanguage } from '@/i18n/LanguageProvider'
import { t } from '@/i18n/config'
import { COMPANY_CONTACT, QUANTIS_LOGO_URL } from '@/constants/company'
import NewsSubscribeForm from '@/components/NewsSubscribeForm'

const SERVICE_LINKS = [
  { href: '/services/custom-software', key: 'footer.services.web' },
  { href: '/services/mobile-apps', key: 'footer.services.mobile' },
  { href: '/services/ecommerce', key: 'footer.services.digital' },
  { href: '/services/business-automation', key: 'footer.services.automation' },
  { href: '/services/fuel-management-system-africa', key: 'footer.services.fuel' },
] as const

const PRODUCT_LINKS = [
  { href: '/products?category=website', key: 'footer.products.templates' },
  { href: '/products?category=cloud', key: 'footer.products.tools' },
  { href: '/products?category=api', key: 'footer.products.apis' },
  { href: '/products?category=analytics', key: 'footer.products.plugins' },
] as const

const SITEMAP_LINKS = [
  { href: '/', key: 'nav.home' },
  { href: '/about', key: 'nav.about' },
  { href: '/services', key: 'nav.services' },
  { href: '/products', key: 'nav.products' },
  { href: '/news', key: 'nav.news' },
  { href: '/portfolio', key: 'nav.portfolio' },
  { href: '/case-studies', key: 'footer.sitemap.caseStudies' },
  { href: '/contact', key: 'nav.contact' },
  { href: '/track-request', key: 'nav.trackRequest' },
] as const

export default function SiteFooter() {
  const { lang } = useLanguage()

  return (
    <footer className="bg-granite-800 text-white py-12 border-t border-granite-700">
      <div className="mx-auto w-full max-w-[1600px] px-4 sm:px-6 lg:px-8 xl:px-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10">
          <div className="lg:col-span-2">
            <Link href="/" className="mb-4 inline-flex">
              <img
                src={QUANTIS_LOGO_URL}
                alt="Quantis Technologies"
                className="quantis-logo-on-dark h-10 sm:h-12 w-auto max-w-[220px] object-contain object-left"
              />
            </Link>
            <h3 className="text-lg font-semibold mb-4 text-yellow-900">{t(lang, 'footer.title')}</h3>
            <p className="text-gray-300 mb-3">{t(lang, 'footer.tagline')}</p>
            <address className="text-gray-300 text-sm not-italic space-y-1">
              <p className="font-medium text-gray-200">{COMPANY_CONTACT.legalName}</p>
              <p>{COMPANY_CONTACT.addressLine1}</p>
              <p>{COMPANY_CONTACT.addressLine2}</p>
            </address>
          </div>
          <div className="lg:col-span-3">
            <h4 className="font-semibold mb-4 text-peach-300">{t(lang, 'footer.sitemap')}</h4>
            <ul className="grid grid-cols-2 gap-x-4 gap-y-1 text-gray-300">
              {SITEMAP_LINKS.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="block py-1 hover:text-peach-300 transition-colors duration-200"
                  >
                    {t(lang, item.key)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="sm:col-span-2 lg:col-span-4">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-4 text-crimson-300">
                  <Link href="/services" className="hover:text-crimson-200 transition-colors duration-200">
                    {t(lang, 'footer.services')}
                  </Link>
                </h4>
                <ul className="space-y-2 text-gray-300">
                  {SERVICE_LINKS.map((item) => (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className="block py-1 hover:text-crimson-300 transition-colors duration-200"
                      >
                        {t(lang, item.key)}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-4 text-jungle-300">
                  <Link href="/products" className="hover:text-jungle-200 transition-colors duration-200">
                    {t(lang, 'footer.products')}
                  </Link>
                </h4>
                <ul className="space-y-2 text-gray-300">
                  {PRODUCT_LINKS.map((item) => (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className="block py-1 hover:text-jungle-300 transition-colors duration-200"
                      >
                        {t(lang, item.key)}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="mt-8">
              <NewsSubscribeForm variant="footer" />
            </div>
          </div>
          <div className="lg:col-span-3 min-w-0">
            <h4 className="font-semibold mb-4 text-olive-300">
              <Link href="/contact" className="hover:text-olive-200 transition-colors duration-200">
                {t(lang, 'footer.contact')}
              </Link>
            </h4>
            <ul className="space-y-2 text-gray-300 text-sm sm:text-base">
              <li className="hover:text-olive-300 transition-colors duration-200">
                <a href={`mailto:${COMPANY_CONTACT.primaryEmail}`} className="block py-1 lg:whitespace-nowrap">
                  {COMPANY_CONTACT.primaryEmail}
                </a>
              </li>
              <li className="hover:text-olive-300 transition-colors duration-200">
                <a href={`mailto:${COMPANY_CONTACT.supportEmail}`} className="block py-1 lg:whitespace-nowrap">
                  {COMPANY_CONTACT.supportEmail}
                </a>
              </li>
              <li className="hover:text-olive-300 transition-colors duration-200">
                <a
                  href={COMPANY_CONTACT.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block py-1 lg:whitespace-nowrap"
                >
                  {COMPANY_CONTACT.websiteDisplay}
                </a>
              </li>
              <li className="hover:text-olive-300 transition-colors duration-200">
                <a href={`tel:${COMPANY_CONTACT.primaryPhone}`} className="block py-1">
                  {COMPANY_CONTACT.primaryPhoneDisplay}
                </a>
              </li>
              <li className="hover:text-olive-300 transition-colors duration-200">
                <a href="tel:+263717935866" className="block py-1">
                  +263 717 935 866
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-granite-700 mt-8 pt-8 text-center space-y-2">
          <p className="text-gray-400">
            &copy; 2026 <span className="text-crimson-300">Quantis Technologies</span>.{' '}
            {t(lang, 'footer.copyright')}
          </p>
          <p className="text-gray-800 text-xs">
            <Link href="/login" className="text-gray-800 hover:text-gray-600 transition-colors">
              {t(lang, 'footer.adminLogin')}
            </Link>
          </p>
        </div>
      </div>
    </footer>
  )
}

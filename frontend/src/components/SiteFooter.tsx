'use client'

import Link from 'next/link'
import { useLanguage } from '@/i18n/LanguageProvider'
import { t } from '@/i18n/config'
import { COMPANY_CONTACT } from '@/constants/company'

export default function SiteFooter() {
  const { lang } = useLanguage()

  return (
    <footer className="bg-granite-800 text-white py-12 border-t border-granite-700">
      <div className="wide-container px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4 text-yellow-900">{t(lang, 'footer.title')}</h3>
            <p className="text-gray-300 mb-3">{t(lang, 'footer.tagline')}</p>
            <address className="text-gray-300 text-sm not-italic space-y-1">
              <p className="font-medium text-gray-200">{COMPANY_CONTACT.legalName}</p>
              <p>{COMPANY_CONTACT.addressLine1}</p>
              <p>{COMPANY_CONTACT.addressLine2}</p>
            </address>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-crimson-300">{t(lang, 'footer.services')}</h4>
            <ul className="space-y-2 text-gray-300">
              <li className="hover:text-crimson-300 transition-colors duration-200">
                {t(lang, 'footer.services.web')}
              </li>
              <li className="hover:text-crimson-300 transition-colors duration-200">
                {t(lang, 'footer.services.mobile')}
              </li>
              <li className="hover:text-crimson-300 transition-colors duration-200">
                {t(lang, 'footer.services.digital')}
              </li>
              <li className="hover:text-crimson-300 transition-colors duration-200">
                {t(lang, 'footer.services.automation')}
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-jungle-300">{t(lang, 'footer.products')}</h4>
            <ul className="space-y-2 text-gray-300">
              <li className="hover:text-jungle-300 transition-colors duration-200">
                {t(lang, 'footer.products.templates')}
              </li>
              <li className="hover:text-jungle-300 transition-colors duration-200">
                {t(lang, 'footer.products.tools')}
              </li>
              <li className="hover:text-jungle-300 transition-colors duration-200">
                {t(lang, 'footer.products.apis')}
              </li>
              <li className="hover:text-jungle-300 transition-colors duration-200">
                {t(lang, 'footer.products.plugins')}
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-olive-300">{t(lang, 'footer.contact')}</h4>
            <ul className="space-y-2 text-gray-300 text-sm sm:text-base">
              <li className="hover:text-olive-300 transition-colors duration-200 break-words">
                <a href={`mailto:${COMPANY_CONTACT.primaryEmail}`} className="block py-1">
                  {COMPANY_CONTACT.primaryEmail}
                </a>
              </li>
              <li className="hover:text-olive-300 transition-colors duration-200 break-words">
                <a href={`mailto:${COMPANY_CONTACT.supportEmail}`} className="block py-1">
                  {COMPANY_CONTACT.supportEmail}
                </a>
              </li>
              <li className="hover:text-olive-300 transition-colors duration-200 break-words">
                <a
                  href={COMPANY_CONTACT.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block py-1"
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
              <li className="hover:text-olive-300 transition-colors duration-200">
                <a href="tel:+263774211041" className="block py-1">
                  +263 774 211 041
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-granite-700 mt-8 pt-8 text-center space-y-2">
          <p className="text-gray-400">
            &copy; 2024 <span className="text-crimson-300">Quantis Technologies</span>.{' '}
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

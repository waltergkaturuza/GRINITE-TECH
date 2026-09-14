'use client'

import Link from 'next/link'
import { ArrowRightIcon } from '@heroicons/react/24/outline'
import Navigation from './components/Navigation'
import { useEffect } from 'react'
import { trackPageView } from '@/lib/analytics'
import { useLanguage } from '@/i18n/LanguageProvider'
import { t } from '@/i18n/config'
import SiteFooter from '@/components/SiteFooter'
import CapabilitiesSlider from '@/components/CapabilitiesSlider'
import { QUANTIS_LOGO_URL } from '@/constants/company'

export default function HomePageClient() {
  useEffect(() => {
    trackPageView('/')
  }, [])
  const { lang } = useLanguage()
  return (
    <div className="public-page min-h-screen bg-gradient-to-br from-granite-800 via-granite-700 to-crimson-900">
      {/* Navigation */}
      <Navigation />

      {/* Hero Section */}
      <section className="py-12 sm:py-16 lg:py-20 relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/wp4004960-engineer-wallpapers.jpg')" }}
          aria-hidden
        />
        <div className="absolute inset-0 bg-gradient-to-br from-granite-900/85 via-granite-800/75 to-crimson-950/80" aria-hidden />

        <div className="wide-container px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,280px)_minmax(0,1fr)] xl:grid-cols-[minmax(0,320px)_minmax(0,1fr)] gap-6 lg:gap-8 xl:gap-10 items-center">
            {/* Full wordmark on a light plate so navy artwork reads on the photo */}
            <div className="flex justify-center lg:justify-start order-1 min-w-0 py-4 sm:py-6">
              <div className="overflow-visible w-full max-w-[360px] lg:max-w-none flex justify-center lg:justify-start">
                <div className="quantis-logo-hinge">
                  <img
                    src={QUANTIS_LOGO_URL}
                    alt="Quantis Technologies"
                    className="quantis-logo-on-dark h-24 sm:h-28 lg:h-28 w-auto max-w-full object-contain"
                  />
                </div>
              </div>
            </div>

            {/* Hero text - below logo on mobile, right on desktop */}
            <div className="text-center lg:text-left order-2 min-w-0 w-full">
              <h1 className="font-bold mb-4 leading-[1.2] tracking-tight text-balance">
                <span className="block text-white text-[clamp(1.375rem,calc(0.85rem+2vw),2.25rem)]">
                  {t(lang, 'home.hero.title.part1')}
                </span>
                <span className="block mt-1 text-[clamp(1.375rem,calc(0.85rem+2vw),2.25rem)] text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-peach-400">
                  {t(lang, 'home.hero.title.part2')}
                </span>
              </h1>
              <p className="text-sm sm:text-base lg:text-lg text-gray-200 mb-6 max-w-2xl mx-auto lg:mx-0">
                {t(lang, 'home.hero.subtitle')}
              </p>
              <div className="flex flex-col sm:flex-row flex-wrap gap-3 justify-center lg:justify-start">
                <Link href="/contact" className="inline-flex items-center justify-center bg-crimson-900 hover:bg-crimson-800 text-white font-medium text-base sm:text-lg px-6 py-3 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl">
                  {t(lang, 'home.hero.primaryCta')}
                  <ArrowRightIcon className="ml-2 h-5 w-5 inline shrink-0" />
                </Link>
                <Link href="/portfolio#featured-work" className="inline-flex items-center justify-center bg-white/20 backdrop-blur-sm border border-white/30 text-white hover:bg-white/30 font-medium text-base sm:text-lg px-6 py-3 rounded-lg transition-all duration-200">
                  {t(lang, 'home.hero.secondaryCta')}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Capabilities - 6 Strategic Pillars */}
      <section className="py-20 bg-white dark:bg-granite-900 relative">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-crimson-900 to-transparent"></div>
        <div className="wide-container px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-granite-800 dark:text-granite-100 mb-4">
              {t(lang, 'home.pillars.heading')}
            </h2>
            <p className="text-xl text-granite-600 dark:text-granite-300 max-w-2xl mx-auto">
              {t(lang, 'home.pillars.subheading')}
            </p>
          </div>

          <CapabilitiesSlider lang={lang} />
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-granite-800 to-crimson-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-granite-800/95 to-crimson-900/95"></div>
        <div className="wide-container px-4 sm:px-6 lg:px-8 text-center relative">
          <h2 className="text-3xl font-bold text-white mb-4">
            {t(lang, 'home.cta.heading')}
          </h2>
          <p className="text-xl text-gray-200 mb-8">
            {t(lang, 'home.cta.text')}
          </p>
          <Link href="/contact" className="bg-white text-granite-800 hover:bg-gray-100 font-medium py-3 px-8 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl">
            {t(lang, 'home.cta.button')}
          </Link>
        </div>
      </section>

      <SiteFooter />
    </div>
  )
}
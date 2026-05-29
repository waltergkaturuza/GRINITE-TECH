'use client'

import Link from 'next/link'
import Image from 'next/image'
import { ArrowRightIcon, ShieldCheckIcon } from '@heroicons/react/24/outline'
import Navigation from './components/Navigation'
import { useEffect } from 'react'
import { trackPageView } from '@/lib/analytics'
import { useLanguage } from '@/i18n/LanguageProvider'
import { t } from '@/i18n/config'
import SiteFooter from '@/components/SiteFooter'

export default function HomePageClient() {
  useEffect(() => {
    trackPageView('/')
  }, [])
  const { lang } = useLanguage()
  return (
    <div className="min-h-screen bg-gradient-to-br from-granite-800 via-granite-700 to-crimson-900">
      {/* Navigation */}
      <Navigation />

      {/* Hero Section */}
      <section className="py-16 sm:py-20 relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/wp4004960-engineer-wallpapers.jpg')" }}
          aria-hidden
        />
        <div className="absolute inset-0 bg-gradient-to-br from-granite-900/85 via-granite-800/75 to-crimson-950/80" aria-hidden />

        <div className="wide-container px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(240px,300px)_1fr] gap-8 lg:gap-12 items-center">
            {/* Logo - top on mobile, left on desktop; slightly smaller; pushed left */}
            <div className="flex justify-center lg:justify-start order-1 lg:-ml-4">
              <div className="relative w-full max-w-[min(75vw,300px)] aspect-square max-h-[min(40vh,300px)]">
                <div className="absolute inset-0 bg-white/95 backdrop-blur-sm rounded-3xl p-5 sm:p-6 shadow-2xl flex items-center justify-center">
                  <Image
                    src="/logo.png"
                    alt="Quantis Technologies"
                    fill
                    sizes="(max-width: 640px) 200px, (max-width: 1024px) 260px, 300px"
                    className="object-contain p-4"
                    priority
                  />
                </div>
              </div>
            </div>

            {/* Hero text - below logo on mobile, right on desktop */}
            <div className="text-center lg:text-left order-2">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[2.75rem] xl:text-6xl font-bold text-white mb-6 leading-tight tracking-tight">
                <span className="block">{t(lang, 'home.hero.title.part1')}</span>
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-peach-400">
                  {t(lang, 'home.hero.title.part2')}
                </span>
              </h1>
              <p className="text-xl text-gray-200 mb-8 max-w-3xl lg:max-w-none mx-auto lg:mx-0">
                {t(lang, 'home.hero.subtitle')}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link href="/contact" className="bg-crimson-900 hover:bg-crimson-800 text-white font-medium text-lg px-8 py-3 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl">
                  {t(lang, 'home.hero.primaryCta')}
                  <ArrowRightIcon className="ml-2 h-5 w-5 inline" />
                </Link>
                <Link href="/portfolio" className="bg-white/20 backdrop-blur-sm border border-white/30 text-white hover:bg-white/30 font-medium text-lg px-8 py-3 rounded-lg transition-all duration-200">
                  {t(lang, 'home.hero.secondaryCta')}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Capabilities - 6 Strategic Pillars */}
      <section className="py-20 bg-white relative">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-crimson-900 to-transparent"></div>
        <div className="wide-container px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-granite-800 mb-4">
              {t(lang, 'home.pillars.heading')}
            </h2>
            <p className="text-xl text-granite-600 max-w-2xl mx-auto">
              {t(lang, 'home.pillars.subheading')}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="card group hover:border-crimson-200 transition-all duration-300 overflow-hidden">
              <div className="relative h-40 bg-gradient-to-br from-granite-100 to-granite-50 rounded-t-lg overflow-hidden">
                <Image src="/pillar-enterprise-systems.png" alt="Enterprise Systems Engineering" fill className="object-cover opacity-90 group-hover:scale-105 transition-transform duration-300" sizes="(max-width: 768px) 100vw, 33vw" />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-granite-800 mb-2">
                  {t(lang, 'home.pillars.enterprise')}
                </h3>
                <p className="text-granite-600 text-sm leading-relaxed">
                  {t(lang, 'home.pillars.enterprise.desc')}
                </p>
              </div>
            </div>

            <div className="card group hover:border-crimson-200 transition-all duration-300 overflow-hidden">
              <div className="relative h-40 bg-gradient-to-br from-sky-50 to-blue-50 rounded-t-lg overflow-hidden">
                <Image src="/pillar-cloud-devops.png" alt="Cloud Infrastructure & DevOps" fill className="object-cover opacity-90 group-hover:scale-105 transition-transform duration-300" sizes="(max-width: 768px) 100vw, 33vw" />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-granite-800 mb-2">
                  {t(lang, 'home.pillars.cloud')}
                </h3>
                <p className="text-granite-600 text-sm leading-relaxed">
                  {t(lang, 'home.pillars.cloud.desc')}
                </p>
              </div>
            </div>

            <div className="card group hover:border-crimson-200 transition-all duration-300 overflow-hidden">
              <div className="relative h-40 bg-gradient-to-br from-amber-50 to-yellow-50 rounded-t-lg overflow-hidden">
                <Image src="/pillar-data-intelligence.png" alt="Data Intelligence & Analytics" fill className="object-cover opacity-90 group-hover:scale-105 transition-transform duration-300" sizes="(max-width: 768px) 100vw, 33vw" />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-granite-800 mb-2">
                  {t(lang, 'home.pillars.data')}
                </h3>
                <p className="text-granite-600 text-sm leading-relaxed">
                  {t(lang, 'home.pillars.data.desc')}
                </p>
              </div>
            </div>

            <div className="card group hover:border-crimson-200 transition-all duration-300 overflow-hidden">
              <div className="relative h-40 bg-gradient-to-br from-emerald-50 to-green-50 rounded-t-lg overflow-hidden">
                <Image src="/pillar-automation-integration.png" alt="Process Automation & Integration" fill className="object-cover opacity-90 group-hover:scale-105 transition-transform duration-300" sizes="(max-width: 768px) 100vw, 33vw" />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-granite-800 mb-2">
                  {t(lang, 'home.pillars.automation')}
                </h3>
                <p className="text-granite-600 text-sm leading-relaxed">
                  {t(lang, 'home.pillars.automation.desc')}
                </p>
              </div>
            </div>

            <div className="card group hover:border-crimson-200 transition-all duration-300 overflow-hidden">
              <div className="relative h-40 bg-gradient-to-br from-crimson-900 to-crimson-800 rounded-t-lg flex items-center justify-center">
                <ShieldCheckIcon className="h-20 w-20 text-white/90" />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-granite-800 mb-2">
                  {t(lang, 'home.pillars.security')}
                </h3>
                <p className="text-granite-600 text-sm leading-relaxed">
                  {t(lang, 'home.pillars.security.desc')}
                </p>
              </div>
            </div>

            <div className="card group hover:border-crimson-200 transition-all duration-300 overflow-hidden">
              <div className="relative h-40 bg-gradient-to-br from-violet-50 to-purple-50 rounded-t-lg overflow-hidden">
                <Image src="/pillar-digital-platforms.png" alt="Digital Platform Development" fill className="object-cover opacity-90 group-hover:scale-105 transition-transform duration-300" sizes="(max-width: 768px) 100vw, 33vw" />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-granite-800 mb-2">
                  {t(lang, 'home.pillars.platforms')}
                </h3>
                <p className="text-granite-600 text-sm leading-relaxed">
                  {t(lang, 'home.pillars.platforms.desc')}
                </p>
              </div>
            </div>
          </div>
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
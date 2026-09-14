'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { ShieldCheckIcon } from '@heroicons/react/24/outline'
import { t, type Lang } from '@/i18n/config'

const PILLARS = [
  {
    key: 'enterprise',
    image: '/pillar-enterprise-systems.png',
    imageClass: 'from-granite-100 to-granite-50',
  },
  {
    key: 'cloud',
    image: '/pillar-cloud-devops.png',
    imageClass: 'from-sky-50 to-blue-50',
  },
  {
    key: 'data',
    image: '/pillar-data-intelligence.png',
    imageClass: 'from-amber-50 to-yellow-50',
  },
  {
    key: 'automation',
    image: '/pillar-automation-integration.png',
    imageClass: 'from-emerald-50 to-green-50',
  },
  {
    key: 'security',
    image: null,
    imageClass: 'from-crimson-900 to-crimson-800',
  },
  {
    key: 'platforms',
    image: '/pillar-digital-platforms.png',
    imageClass: 'from-violet-50 to-purple-50',
  },
] as const

const SLIDES = [PILLARS.slice(0, 3), PILLARS.slice(3, 6)]

function PillarCard({
  pillar,
  lang,
}: {
  pillar: (typeof PILLARS)[number]
  lang: Lang
}) {
  return (
    <article className="card group hover:border-crimson-200 transition-colors duration-300 overflow-hidden h-full">
      <div className={`relative h-40 bg-gradient-to-br ${pillar.imageClass} rounded-t-lg overflow-hidden`}>
        {pillar.image ? (
          <Image
            src={pillar.image}
            alt={t(lang, `home.pillars.${pillar.key}`)}
            fill
            className="object-cover opacity-90"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <ShieldCheckIcon className="h-20 w-20 text-white/90" />
          </div>
        )}
      </div>
      <div className="p-6">
        <h3 className="text-xl font-semibold text-granite-800 dark:text-granite-100 mb-2">
          {t(lang, `home.pillars.${pillar.key}`)}
        </h3>
        <p className="text-granite-600 dark:text-granite-300 text-sm leading-relaxed">
          {t(lang, `home.pillars.${pillar.key}.desc`)}
        </p>
      </div>
    </article>
  )
}

export default function CapabilitiesSlider({ lang }: { lang: Lang }) {
  const [active, setActive] = useState(0)
  const [paused, setPaused] = useState(false)
  const [reduceMotion, setReduceMotion] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const sync = () => setReduceMotion(mq.matches)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])

  useEffect(() => {
    if (paused || reduceMotion) return
    const id = window.setInterval(() => {
      setActive((current) => (current + 1) % SLIDES.length)
    }, 5500)
    return () => window.clearInterval(id)
  }, [paused, reduceMotion])

  return (
    <div
      className="relative"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div className="relative">
        {SLIDES.map((slide, index) => (
          <div
            key={`slide-${index}`}
            className={`${index === 0 ? 'relative' : 'absolute inset-0'} transition-opacity ease-in-out ${
              reduceMotion ? 'duration-0' : 'duration-[1100ms]'
            } ${index === active ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}
            aria-hidden={index !== active}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {slide.map((pillar) => (
                <PillarCard key={pillar.key} pillar={pillar} lang={lang} />
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-center gap-2 mt-8" role="tablist" aria-label="Core capabilities slides">
        {SLIDES.map((_, index) => (
          <button
            key={index}
            type="button"
            role="tab"
            aria-selected={index === active}
            aria-label={`Show capabilities ${index + 1} of ${SLIDES.length}`}
            onClick={() => setActive(index)}
            className={`h-2.5 rounded-full transition-all duration-300 ${
              index === active ? 'w-8 bg-crimson-900' : 'w-2.5 bg-granite-300 hover:bg-granite-400'
            }`}
          />
        ))}
      </div>
    </div>
  )
}

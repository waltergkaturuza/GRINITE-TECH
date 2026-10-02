'use client'

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

function PillarCard({
  pillar,
  lang,
}: {
  pillar: (typeof PILLARS)[number]
  lang: Lang
}) {
  return (
    <article className="card qt-pillar-card group hover:border-crimson-200 transition-colors duration-300 overflow-hidden">
      <div className={`relative h-32 bg-gradient-to-br ${pillar.imageClass} overflow-hidden`}>
        {pillar.image ? (
          <Image
            src={pillar.image}
            alt={t(lang, `home.pillars.${pillar.key}`)}
            fill
            className="object-cover opacity-90"
            sizes="320px"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <ShieldCheckIcon className="h-16 w-16 text-white/90" />
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold text-granite-800 dark:text-granite-100 mb-1.5">
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
  return (
    <div className="qt-marquee-viewport" aria-label="Core capabilities">
      <div className="qt-marquee-track">
        {[0, 1].map((copy) => (
          <div className="qt-marquee-group" key={copy} aria-hidden={copy === 1}>
            {PILLARS.map((pillar) => (
              <PillarCard key={`${copy}-${pillar.key}`} pillar={pillar} lang={lang} />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

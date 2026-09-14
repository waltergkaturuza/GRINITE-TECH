'use client'

import { useEffect, useState } from 'react'

const PHONE_SLIDES = [
  {
    src: '/phones/maxresdefault.jpg',
    alt: 'Hands-on mobile app experience',
  },
  {
    src: '/phones/0x0.webp',
    alt: 'Android phone showing a home-screen of apps',
  },
  {
    src: '/phones/iphone-18-pro-max-pdp-image-position-1-black_1.webp',
    alt: 'Premium smartphone product photography',
  },
  {
    src: '/phones/04W0TuZekk2nGFyDdFc64Ez-6.fit_lim.size_1600x900.v1789004244.webp',
    alt: 'Close-up of a modern mobile device',
  },
] as const

export default function PhoneSlideshow() {
  const [active, setActive] = useState(0)
  const [reduceMotion, setReduceMotion] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const sync = () => setReduceMotion(mq.matches)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])

  useEffect(() => {
    if (reduceMotion) return
    const id = window.setInterval(() => {
      setActive((current) => (current + 1) % PHONE_SLIDES.length)
    }, 5200)
    return () => window.clearInterval(id)
  }, [reduceMotion])

  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden>
      {PHONE_SLIDES.map((slide, index) => (
        <div
          key={slide.src}
          className={`absolute inset-0 transition-opacity ease-in-out ${
            reduceMotion ? 'duration-0' : 'duration-[900ms]'
          } ${index === active ? 'opacity-100' : 'opacity-0'}`}
        >
          <img
            src={slide.src}
            alt=""
            className={`h-full w-full object-cover object-center ${
              index === active && !reduceMotion ? 'quantis-kenburns' : ''
            }`}
          />
        </div>
      ))}
      <div className="absolute inset-0 bg-gradient-to-r from-granite-950/78 via-granite-950/50 to-granite-950/32" />
      <div className="absolute inset-0 bg-gradient-to-b from-granite-950/20 via-transparent to-granite-950/40" />
    </div>
  )
}

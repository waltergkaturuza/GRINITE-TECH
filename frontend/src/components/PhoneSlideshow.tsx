'use client'

import { useEffect, useState } from 'react'

const PHONE_SLIDES = [
  {
    src: '/phones/iphone-18-pro-max-pdp-image-position-1-black_1.webp',
    alt: 'Premium smartphone product photography',
  },
  {
    src: '/phones/maxresdefault.jpg',
    alt: 'Hands-on mobile app experience',
  },
  {
    src: '/phones/0x0.webp',
    alt: 'Android phone showing a home-screen of apps',
  },
  {
    src: '/phones/04W0TuZekk2nGFyDdFc64Ez-6.fit_lim.size_1600x900.v1789004244.webp',
    alt: 'Close-up of a modern mobile device',
  },
] as const

export default function PhoneSlideshow() {
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
      setActive((current) => (current + 1) % PHONE_SLIDES.length)
    }, 5200)
    return () => window.clearInterval(id)
  }, [paused, reduceMotion])

  return (
    <div
      className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/30 shadow-xl aspect-[4/3] lg:aspect-[5/4] min-h-[280px]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {PHONE_SLIDES.map((slide, index) => (
        <div
          key={slide.src}
          className={`absolute inset-0 transition-opacity ease-in-out ${
            reduceMotion ? 'duration-0' : 'duration-[900ms]'
          } ${index === active ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
          aria-hidden={index !== active}
        >
          <img
            src={slide.src}
            alt={index === active ? slide.alt : ''}
            className={`h-full w-full object-cover object-center ${
              index === active && !reduceMotion ? 'quantis-kenburns' : ''
            }`}
          />
        </div>
      ))}

      <div className="absolute inset-0 bg-gradient-to-t from-granite-950/50 via-transparent to-black/10 pointer-events-none z-20" />

      <div className="absolute bottom-3 left-0 right-0 z-30 flex justify-center gap-2" role="tablist" aria-label="Phone gallery">
        {PHONE_SLIDES.map((slide, index) => (
          <button
            key={slide.src}
            type="button"
            role="tab"
            aria-selected={index === active}
            aria-label={`Show image ${index + 1} of ${PHONE_SLIDES.length}`}
            onClick={() => setActive(index)}
            className={`h-2 rounded-full transition-all duration-300 ${
              index === active ? 'w-7 bg-cyan-300' : 'w-2 bg-white/50 hover:bg-white/80'
            }`}
          />
        ))}
      </div>
    </div>
  )
}

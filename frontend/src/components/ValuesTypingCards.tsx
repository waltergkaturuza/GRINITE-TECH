'use client'

import { useEffect, useState } from 'react'

type ValueCard = {
  title: string
  description: string
}

function WritingPen() {
  return (
    <span className="inline-flex align-middle ml-0.5 animate-pulse" aria-hidden>
      <svg viewBox="0 0 24 24" className="h-[1em] w-[1em] drop-shadow-sm" fill="none">
        <path
          d="M14.5 4.5l5 5L9 20H4v-5L14.5 4.5z"
          fill="#07563B"
          stroke="#0f172a"
          strokeWidth="1"
        />
        <path d="M13 6l5 5" stroke="#fbbf24" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M4 20l3-1" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    </span>
  )
}

export default function ValuesTypingCards({ values }: { values: readonly ValueCard[] }) {
  const [active, setActive] = useState(0)
  const [chars, setChars] = useState(0)
  const [completed, setCompleted] = useState<boolean[]>(() => values.map(() => false))
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

    let cancelled = false
    let card = 0
    let count = 0
    let done = values.map(() => false)
    let timeout: number

    const typeNext = () => {
      if (cancelled) return
      const text = values[card].description
      if (count < text.length) {
        count += 1
        setActive(card)
        setChars(count)
        timeout = window.setTimeout(typeNext, 26)
        return
      }

      done = done.map((value, index) => (index === card ? true : value))
      setCompleted(done)
      const next = (card + 1) % values.length
      timeout = window.setTimeout(() => {
        if (cancelled) return
        if (next === 0) {
          done = values.map(() => false)
          setCompleted(done)
        }
        card = next
        count = 0
        setActive(card)
        setChars(0)
        timeout = window.setTimeout(typeNext, 40)
      }, next === 0 ? 1600 : 420)
    }

    timeout = window.setTimeout(typeNext, 350)
    return () => {
      cancelled = true
      window.clearTimeout(timeout)
    }
  }, [reduceMotion, values])

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
      {values.map((value, index) => {
        const shown = reduceMotion || completed[index]
          ? value.description
          : index === active
            ? value.description.slice(0, chars)
            : ''
        const showPen = !reduceMotion && index === active && !completed[index]

        return (
          <div
            key={value.title}
            className={`text-center bg-gradient-to-br from-granite-50 to-white p-8 rounded-2xl border transition-all duration-300 ${
              showPen
                ? 'border-jungle-500 shadow-lg'
                : 'border-granite-200 hover:shadow-lg'
            }`}
          >
            <h3 className="text-xl font-bold text-jungle-700 dark:text-jungle-400 mb-4">
              {value.title}
            </h3>
            <p
              className="text-jungle-700 dark:text-jungle-300 leading-relaxed min-h-[6.5em]"
              aria-label={value.description}
            >
              <span aria-hidden>{shown}</span>
              {showPen ? <WritingPen /> : null}
            </p>
          </div>
        )
      })}
    </div>
  )
}

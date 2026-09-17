'use client'

import { letterheadContact, resolveLetterheadLogoSrc } from '@/lib/companyLetterhead'

type QuantisLetterheadProps = {
  logoSrc?: string | null
  className?: string
  compact?: boolean
}

export default function QuantisLetterhead({ logoSrc, className = '', compact = false }: QuantisLetterheadProps) {
  const contact = letterheadContact()
  const src = resolveLetterheadLogoSrc(logoSrc)

  return (
    <header className={className}>
      <div className={`flex items-center justify-between gap-6 max-sm:flex-col max-sm:items-start print:flex-row print:items-center ${compact ? 'mb-2' : 'mb-3'}`}>
        <img
          src={src}
          alt="Quantis Technologies"
          className={
            compact
              ? 'h-12 w-auto max-w-[220px] object-contain object-left'
              : 'h-[72px] w-auto max-w-[300px] object-contain object-left'
          }
        />
        <div
          className={`min-w-0 text-right font-sans max-sm:text-left print:text-right ${
            compact ? 'text-[10px] leading-snug' : 'text-[11.5px] leading-snug'
          } text-[#1B365D]`}
        >
          <p className={`font-semibold uppercase tracking-wide text-[#152A4A] ${compact ? 'mb-0.5' : 'mb-1'}`}>
            {contact.legalName}
          </p>
          {contact.lines.map((line) => (
            <p key={line} className="text-[#2A4A6E]">
              {line}
            </p>
          ))}
        </div>
      </div>
      <div
        className="h-[3px] w-full"
        style={{ background: 'linear-gradient(90deg, #1B365D 0%, #2E6B9E 58%, #C4A574 100%)' }}
        aria-hidden
      />
    </header>
  )
}

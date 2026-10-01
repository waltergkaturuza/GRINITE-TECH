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
    <header className={`invoice-letterhead ${className}`}>
      <div className={`flex items-start justify-between gap-4 max-sm:flex-col max-sm:items-start print:flex-row print:items-start ${compact ? 'mb-2' : 'mb-3'}`}>
        <img
          src={src}
          alt="Quantis Technologies"
          className={
            compact
              ? 'h-12 w-auto max-w-[180px] shrink-0 object-contain object-left'
              : 'h-[72px] w-auto max-w-[240px] shrink-0 object-contain object-left print:h-14 print:max-w-[200px]'
          }
        />
        <div
          className={`min-w-0 max-w-[320px] flex-1 text-right font-sans max-sm:max-w-none max-sm:text-left print:max-w-[280px] print:text-right ${
            compact ? 'text-[10px] leading-snug' : 'text-[11.5px] leading-snug'
          } text-[#1B365D]`}
        >
          <p className={`font-semibold uppercase tracking-wide text-[#152A4A] break-words ${compact ? 'mb-0.5' : 'mb-1'}`}>
            {contact.legalName}
          </p>
          {contact.lines.map((line) => (
            <p key={line} className="break-words text-[#2A4A6E]">
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

'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import type { Lang } from './config'

const SUPPORTED_LANGS: Lang[] = ['en', 'fr', 'zh', 'sn', 'pt', 'ja', 'ru', 'el']

function isLang(value: string | null): value is Lang {
  return !!value && (SUPPORTED_LANGS as string[]).includes(value)
}

type LanguageContextValue = {
  lang: Lang
  setLang: (lang: Lang) => void
}

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>('en')

  useEffect(() => {
    if (typeof window === 'undefined') return
    const stored = window.localStorage.getItem('qt_lang')
    if (isLang(stored) && stored !== 'en') {
      setLangState(stored)
      document.documentElement.lang = stored === 'zh' ? 'zh-CN' : stored
      return
    }
    document.documentElement.lang = 'en'
  }, [])

  const setLang = (next: Lang) => {
    setLangState(next)
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('qt_lang', next)
      document.documentElement.lang = next === 'zh' ? 'zh-CN' : next
    }
  }

  return (
    <LanguageContext.Provider value={{ lang, setLang }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) {
    throw new Error('useLanguage must be used within LanguageProvider')
  }
  return ctx
}


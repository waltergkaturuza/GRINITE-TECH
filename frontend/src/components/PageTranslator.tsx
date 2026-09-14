'use client'

import { useEffect, useRef } from 'react'
import Script from 'next/script'
import { usePathname } from 'next/navigation'
import { useLanguage } from '@/i18n/LanguageProvider'
import type { Lang } from '@/i18n/config'

const GOOGLE_LANG: Record<Lang, string> = {
  en: 'en',
  fr: 'fr',
  zh: 'zh-CN',
  sn: 'sn',
  pt: 'pt',
  ja: 'ja',
  ru: 'ru',
  el: 'el',
}

declare global {
  interface Window {
    googleTranslateElementInit?: () => void
    google?: {
      translate?: {
        TranslateElement: new (
          options: Record<string, unknown>,
          id: string,
        ) => void
      }
    }
  }
}

function setTranslateCookie(googleLang: string) {
  const value = googleLang === 'en' ? '/en/en' : `/en/${googleLang}`
  document.cookie = `googtrans=${value};path=/`
  document.cookie = `googtrans=${value};path=/;domain=${window.location.hostname}`
}

function clearTranslateCookie() {
  document.cookie = 'googtrans=;path=/;expires=Thu, 01 Jan 1970 00:00:00 GMT'
  document.cookie = `googtrans=;path=/;domain=${window.location.hostname};expires=Thu, 01 Jan 1970 00:00:00 GMT`
}

function comboSelect(): HTMLSelectElement | null {
  return document.querySelector('.goog-te-combo')
}

function applyGoogleLanguage(googleLang: string) {
  const combo = comboSelect()
  if (!combo) return false
  if (combo.value === googleLang) {
    combo.dispatchEvent(new Event('change'))
    return true
  }
  combo.value = googleLang
  combo.dispatchEvent(new Event('change'))
  return true
}

export default function PageTranslator() {
  const { lang } = useLanguage()
  const pathname = usePathname()
  const readyRef = useRef(false)
  const langRef = useRef(lang)

  langRef.current = lang

  useEffect(() => {
    window.googleTranslateElementInit = () => {
      if (!window.google?.translate?.TranslateElement) return
      const host = document.getElementById('google_translate_element')
      if (!host) return
      host.innerHTML = ''
      new window.google.translate.TranslateElement(
        {
          pageLanguage: 'en',
          includedLanguages: 'en,fr,zh-CN,sn,pt,ja,ru,el',
          autoDisplay: false,
        },
        'google_translate_element',
      )
      readyRef.current = true
      const target = GOOGLE_LANG[langRef.current]
      window.setTimeout(() => applyGoogleLanguage(target), 250)
    }
  }, [])

  useEffect(() => {
    const target = GOOGLE_LANG[lang]
    if (target === 'en') {
      clearTranslateCookie()
    } else {
      setTranslateCookie(target)
    }

    let tries = 0
    const tick = () => {
      if (applyGoogleLanguage(target) || tries > 20) return
      tries += 1
      window.setTimeout(tick, 250)
    }
    tick()
  }, [lang, pathname])

  return (
    <>
      <div id="google_translate_element" className="sr-only" aria-hidden />
      <Script
        src="https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"
        strategy="afterInteractive"
      />
    </>
  )
}

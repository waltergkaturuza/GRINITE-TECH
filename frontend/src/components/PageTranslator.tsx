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

function cookieDomains() {
  const host = window.location.hostname
  const domains = ['', host, `.${host}`]
  const parts = host.split('.')
  if (parts.length >= 2) domains.push(`.${parts.slice(-2).join('.')}`)
  return Array.from(new Set(domains))
}

function writeGoogtrans(value: string | null) {
  const expire = 'Thu, 01 Jan 1970 00:00:00 GMT'
  for (const domain of cookieDomains()) {
    const extra = domain ? `;domain=${domain}` : ''
    if (value) {
      document.cookie = `googtrans=${value};path=/${extra}`
    } else {
      document.cookie = `googtrans=;path=/${extra};expires=${expire}`
    }
  }
}

function pinEnglishCookie() {
  writeGoogtrans(null)
  writeGoogtrans('/en/en')
}

function comboSelect(): HTMLSelectElement | null {
  return document.querySelector('.goog-te-combo')
}

function applyGoogleLanguage(googleLang: string) {
  const combo = comboSelect()
  if (!combo) return false
  if (combo.value !== googleLang) combo.value = googleLang
  combo.dispatchEvent(new Event('change'))
  return true
}

function pageIsTranslated() {
  return (
    document.documentElement.classList.contains('translated-ltr') ||
    document.documentElement.classList.contains('translated-rtl') ||
    !!document.querySelector('iframe.skiptranslate')
  )
}

export default function PageTranslator() {
  const { lang } = useLanguage()
  const pathname = usePathname()
  const langRef = useRef(lang)
  const wantsTranslate = lang !== 'en'

  langRef.current = lang

  if (typeof window !== 'undefined' && wantsTranslate) {
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
      window.setTimeout(() => applyGoogleLanguage(GOOGLE_LANG[langRef.current]), 250)
    }
  }

  useEffect(() => {
    if (wantsTranslate) {
      document.documentElement.setAttribute('translate', 'yes')
      document.documentElement.lang = lang === 'zh' ? 'zh-CN' : lang
      document.querySelectorAll('meta[name="google"]').forEach((node) => {
        if (node.getAttribute('content') === 'notranslate') node.remove()
      })
      return
    }

    document.documentElement.setAttribute('translate', 'no')
    document.documentElement.lang = 'en'
    pinEnglishCookie()
    if (!document.querySelector('meta[name="google"][content="notranslate"]')) {
      const meta = document.createElement('meta')
      meta.name = 'google'
      meta.content = 'notranslate'
      document.head.appendChild(meta)
    }

    if (pageIsTranslated() && sessionStorage.getItem('qt_en_reload') !== '1') {
      sessionStorage.setItem('qt_en_reload', '1')
      window.location.reload()
      return
    }
    sessionStorage.removeItem('qt_en_reload')
  }, [wantsTranslate, lang])

  useEffect(() => {
    if (!wantsTranslate) return
    const target = GOOGLE_LANG[lang]
    writeGoogtrans(`/en/${target}`)

    let tries = 0
    const tick = () => {
      if (applyGoogleLanguage(target) || tries > 20) return
      tries += 1
      window.setTimeout(tick, 250)
    }
    tick()
  }, [lang, pathname, wantsTranslate])

  if (!wantsTranslate) return null

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

'use client'

import { createContext, useContext, useEffect, useState } from 'react'

export type Theme = 'light' | 'dark'

type ThemeContextValue = {
  theme: Theme
  setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined)

function applyTheme(theme: Theme) {
  if (typeof document === 'undefined') return
  document.documentElement.classList.toggle('dark', theme === 'dark')
  document.documentElement.style.colorScheme = theme
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('light')

  useEffect(() => {
    if (typeof window === 'undefined') return
    const stored = window.localStorage.getItem('qt_theme') as Theme | null
    if (stored === 'light' || stored === 'dark') {
      setThemeState(stored)
      applyTheme(stored)
      return
    }
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const initial: Theme = prefersDark ? 'dark' : 'light'
    setThemeState(initial)
    applyTheme(initial)
  }, [])

  const setTheme = (next: Theme) => {
    setThemeState(next)
    applyTheme(next)
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('qt_theme', next)
    }
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) {
    throw new Error('useTheme must be used within ThemeProvider')
  }
  return ctx
}

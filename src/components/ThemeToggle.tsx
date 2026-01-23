import { useCallback, useEffect, useState } from 'react'

type ThemePreference = 'light' | 'dark'

const resolveDocumentTheme = () => {
  if (typeof document === 'undefined') return 'dark'
  const attr = document.documentElement.getAttribute('data-theme')
  return attr === 'light' || attr === 'dark' ? attr : 'dark'
}

const readStoredTheme = (): ThemePreference | null => {
  try {
    const stored = localStorage.getItem('theme')
    return stored === 'light' || stored === 'dark' ? stored : null
  } catch {
    return null
  }
}

const writeStoredTheme = (theme: ThemePreference) => {
  try {
    localStorage.setItem('theme', theme)
  } catch {
    // Ignore storage write errors (private mode/quota)
  }
}

const applyTheme = (theme: ThemePreference) => {
  if (typeof document === 'undefined') return
  document.documentElement.setAttribute('data-theme', theme)
  document.documentElement.classList.toggle('dark', theme === 'dark')
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState<ThemePreference>(() =>
    resolveDocumentTheme(),
  )
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const savedTheme = readStoredTheme()
    if (savedTheme) {
      setTheme(savedTheme)
      applyTheme(savedTheme)
      return
    }

    applyTheme(resolveDocumentTheme())
  }, [])

  const toggleTheme = useCallback(() => {
    setTheme((prevTheme) => {
      const newTheme: ThemePreference = prevTheme === 'light' ? 'dark' : 'light'
      applyTheme(newTheme)
      writeStoredTheme(newTheme)
      return newTheme
    })
  }, [])

  return (
    <button
      onClick={toggleTheme}
      type="button"
      className="inline-flex items-center justify-center p-2 rounded-md border border-border bg-transparent hover:bg-muted text-primary transition-colors cursor-pointer"
      style={{ minWidth: '40px', minHeight: '40px' }}
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      {!mounted || theme === 'dark' ? (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-5 h-5"
        >
          <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
        </svg>
      ) : (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-5 h-5"
        >
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2" />
          <path d="M12 20v2" />
          <path d="m4.93 4.93 1.41 1.41" />
          <path d="m17.66 17.66 1.41 1.41" />
          <path d="M2 12h2" />
          <path d="M20 12h2" />
          <path d="m6.34 17.66-1.41 1.41" />
          <path d="m19.07 4.93-1.41 1.41" />
        </svg>
      )}
    </button>
  )
}

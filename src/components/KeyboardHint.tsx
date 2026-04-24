import { useEffect, useState } from 'react'

function getShortcutLabel() {
  if (typeof navigator === 'undefined') return 'Ctrl+K'
  return /Mac|iPhone|iPad|iPod/i.test(navigator.userAgent) ? '⌘K' : 'Ctrl+K'
}

export function KeyboardHint() {
  const [shortcut, setShortcut] = useState('Ctrl+K')

  useEffect(() => {
    setShortcut(getShortcutLabel())
  }, [])

  return (
    <p className="hidden sm:inline-flex items-center gap-1.5 text-[8px] uppercase tracking-[0.15em] text-muted-foreground select-none">
      press{' '}
      <kbd className="inline-flex items-center gap-0.5 rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px] font-medium text-muted-foreground">
        {shortcut}
      </kbd>{' '}
      to navigate this site via keyboard
    </p>
  )
}

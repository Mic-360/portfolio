import { Suspense, lazy, useEffect, useState } from 'react'

const CommandMenu = lazy(() =>
  import('@/components/CommandMenu').then((module) => ({
    default: module.CommandMenu,
  })),
)

export function LazyCommandMenu() {
  const [enabled, setEnabled] = useState(false)
  const [openOnMount, setOpenOnMount] = useState(false)

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (!(event.metaKey || event.ctrlKey)) return
      if (event.key.toLowerCase() !== 'k') return

      event.preventDefault()
      setOpenOnMount(true)
      setEnabled(true)
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  if (!enabled) return null

  return (
    <Suspense fallback={null}>
      <CommandMenu openOnMount={openOnMount} />
    </Suspense>
  )
}

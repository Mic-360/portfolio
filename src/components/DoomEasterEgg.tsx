import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'

interface DosInstance {
  stop: () => Promise<void>
}

declare global {
  var emulators: { pathPrefix: string }
  function Dos(
    el: HTMLDivElement,
    options: Record<string, unknown>,
  ): Promise<DosInstance>
}

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve()
      return
    }
    const s = document.createElement('script')
    s.src = src
    s.async = true
    s.onload = () => resolve()
    s.onerror = () => reject(new Error(`Failed to load ${src}`))
    document.head.appendChild(s)
  })
}

function loadCSS(href: string) {
  if (document.querySelector(`link[href="${href}"]`)) return
  const l = document.createElement('link')
  l.rel = 'stylesheet'
  l.href = href
  document.head.appendChild(l)
}

function waitForGlobal(name: string, timeout = 10000): Promise<void> {
  return new Promise((resolve, reject) => {
    if ((window as unknown as Record<string, unknown>)[name]) {
      resolve()
      return
    }
    const start = Date.now()
    const check = setInterval(() => {
      if ((window as unknown as Record<string, unknown>)[name]) {
        clearInterval(check)
        resolve()
      } else if (Date.now() - start > timeout) {
        clearInterval(check)
        reject(new Error(`${name} did not become available`))
      }
    }, 50)
  })
}

export function DoomEasterEgg({ onClose }: { onClose: () => void }) {
  const dosRef = useRef<HTMLDivElement>(null)
  const dosInstanceRef = useRef<DosInstance | null>(null)
  const [status, setStatus] = useState<'loading' | 'playing' | 'error'>(
    'loading',
  )
  const [errorMsg, setErrorMsg] = useState('')

  const handleClose = useCallback(() => {
    onClose()
  }, [onClose])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [handleClose])

  useEffect(() => {
    let cancelled = false

    // Catch js-dos internal Preact errors that escape its error boundary
    const errorHandler = (event: ErrorEvent) => {
      if (
        event.filename.includes('js-dos') ||
        (event.error instanceof TypeError && event.message.includes('setState'))
      ) {
        event.preventDefault()
        if (!cancelled) {
          setStatus('error')
          setErrorMsg('DOOM engine encountered an internal error')
        }
      }
    }
    window.addEventListener('error', errorHandler)

    async function boot() {
      try {
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        window.emulators = window.emulators || ({} as typeof emulators)
        window.emulators.pathPrefix = '/doom/emulators/'

        loadCSS('/doom/js-dos.css')
        await loadScript('/doom/js-dos.js')

        // js-dos sets Dos globally after script executes; wait for it
        await waitForGlobal('Dos')

        if (cancelled || !dosRef.current) return

        const instance = await Dos(dosRef.current, {
          url: '/doom/doom.zip',
          autoStart: true,
          kiosk: true,
          theme: 'dark',
          noNetworking: true,
          noCloud: true,
        })

        dosInstanceRef.current = instance

        // If unmounted while Dos() was resolving, stop immediately
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (cancelled) {
          instance.stop().catch(() => {})
          return
        }

        setStatus('playing')
      } catch (e) {
        if (!cancelled) {
          setStatus('error')
          setErrorMsg(e instanceof Error ? e.message : String(e))
        }
      }
    }

    boot()
    return () => {
      cancelled = true
      window.removeEventListener('error', errorHandler)

      // Properly shut down the js-dos instance
      if (dosInstanceRef.current) {
        dosInstanceRef.current.stop().catch(() => {})
        dosInstanceRef.current = null
      }

      document
        .querySelectorAll('link[href="/doom/js-dos.css"], style[data-jsdos]')
        .forEach((el) => el.remove())

      document.querySelectorAll('style').forEach((el) => {
        if (
          el.textContent.includes('daisyui') ||
          el.textContent.includes('.jsdos') ||
          el.textContent.includes('.emulator-')
        ) {
          el.remove()
        }
      })

      document
        .querySelectorAll('.jsdos-overlay, .jsdos-player-modal')
        .forEach((el) => el.remove())
    }
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-9999 flex flex-col items-center justify-center bg-black"
    >
      <AnimatePresence>
        {status === 'loading' && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex flex-col items-center justify-center gap-4"
          >
            <p className="font-mono text-2xl uppercase tracking-widest text-red-600 animate-pulse">
              loading doom...
            </p>
            <p className="font-mono text-xs text-zinc-600">press esc to exit</p>
          </motion.div>
        )}
      </AnimatePresence>

      {status === 'error' && (
        <div className="flex flex-col items-center gap-3 font-mono text-zinc-500">
          <p className="text-red-600">failed to load doom</p>
          <p className="text-xs">{errorMsg}</p>
          <button
            onClick={handleClose}
            className="mt-2 text-xs text-zinc-600 transition-colors hover:text-zinc-300"
          >
            [esc] close
          </button>
        </div>
      )}

      <div
        ref={dosRef}
        className="h-full w-full"
        style={{
          display: status === 'loading' ? 'none' : 'block',
        }}
      />

      <button
        onClick={handleClose}
        className="absolute right-4 top-4 z-10 font-mono text-xs text-zinc-600 transition-colors hover:text-zinc-300"
      >
        [esc] exit
      </button>
    </motion.div>
  )
}

export default DoomEasterEgg

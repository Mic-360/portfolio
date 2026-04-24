import { useEffect } from 'react'

export const useOutsideClick = (
  ref: React.RefObject<HTMLDivElement>,
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  callback: Function,
) => {
  useEffect(() => {
    const listener = (event: any) => {
      // DO NOTHING if the element being clicked is the target element or their children
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if (!ref.current || ref.current.contains(event.target)) {
        return
      }
      callback(event)
    }

    document.addEventListener('mousedown', listener)
    document.addEventListener('touchstart', listener)

    return () => {
      document.removeEventListener('mousedown', listener)
      document.removeEventListener('touchstart', listener)
    }
  }, [ref, callback])
}

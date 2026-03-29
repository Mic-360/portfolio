import { useId } from 'react'
import type { ReactElement } from 'react'

export const GLOBAL_IMAGE_BACKLIGHT_FILTER_ID = 'global-image-backlight'

type BacklightProps = {
  children?: ReactElement
  className?: string
  blur?: number
}

type BacklightFilterDefsProps = {
  id?: string
  blur?: number
}

function BacklightFilter({ blur, id }: { id: string; blur: number }) {
  return (
    <filter id={id} y="-50%" x="-50%" width="200%" height="200%">
      <feGaussianBlur
        in="SourceGraphic"
        stdDeviation={blur}
        result="blurred"
      ></feGaussianBlur>
      <feColorMatrix type="saturate" in="blurred" values="4"></feColorMatrix>
      <feComposite in="SourceGraphic" operator="over"></feComposite>
    </filter>
  )
}

export function BacklightFilterDefs({
  id = GLOBAL_IMAGE_BACKLIGHT_FILTER_ID,
  blur = 20,
}: BacklightFilterDefsProps) {
  return (
    <svg width="0" height="0" aria-hidden="true">
      <BacklightFilter id={id} blur={blur} />
    </svg>
  )
}

export function Backlight({ blur = 20, children, className }: BacklightProps) {
  const id = useId()

  return (
    <div className={className}>
      <BacklightFilterDefs id={id} blur={blur} />

      <div style={{ filter: `url(#${id})` }}>{children}</div>
    </div>
  )
}

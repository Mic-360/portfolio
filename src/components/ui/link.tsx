import { Link as TanStackLink, LinkProps } from '@tanstack/react-router'
import { useFeedback } from '@/hooks/use-feedback'
import { forwardRef } from 'react'

export const Link = forwardRef<HTMLAnchorElement, LinkProps>((props, ref) => {
    const { triggerFeedback } = useFeedback()

    const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
        triggerFeedback('selection')
        if ((props as any).onClick) {
            (props as any).onClick(e)
        }
    }

    return (
        <TanStackLink
            {...props}
            ref={ref}
            onClick={handleClick}
        />
    )
})

Link.displayName = 'Link'

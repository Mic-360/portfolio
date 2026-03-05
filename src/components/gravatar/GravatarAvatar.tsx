import { generateAvatarUrl } from '@/lib/gravatar'
import { gravatarConfig } from '@/config/gravatar'
import { cn } from '@/lib/utils'
import type { AvatarOptions, AvatarDefault } from '@/config/gravatar'

interface GravatarAvatarProps {
    /** SHA-256 hash of the email. */
    hash: string
    /** Width/height in pixels. */
    size?: number
    /** Fallback avatar style. */
    fallback?: AvatarDefault
    /** Alt text for the image. */
    alt?: string
    /** Additional CSS classes. */
    className?: string
}

/**
 * Renders a Gravatar avatar image with responsive srcSet and lazy loading.
 */
export default function GravatarAvatar({
    hash,
    size = gravatarConfig.defaults.size,
    fallback = gravatarConfig.defaults.defaultImage,
    alt = 'Avatar',
    className,
}: GravatarAvatarProps) {
    const options: AvatarOptions = {
        size,
        defaultImage: fallback,
        rating: gravatarConfig.defaults.rating,
    }

    const src1x = generateAvatarUrl(hash, { ...options, size })
    const src2x = generateAvatarUrl(hash, { ...options, size: size * 2 })

    return (
        <img
            src={src1x}
            srcSet={`${src1x} 1x, ${src2x} 2x`}
            alt={alt}
            width={size}
            height={size}
            loading="lazy"
            decoding="async"
            className={cn(
                'rounded-full border border-primary/40 shadow-md',
                className,
            )}
        />
    )
}

import type { GalleryImage } from '@/types/gravatar'
import { cn } from '@/lib/utils'

interface GravatarGalleryProps {
  images: Array<GalleryImage>
  className?: string
}

/**
 * Responsive grid gallery rendered from Gravatar gallery images.
 */
export default function GravatarGallery({
  images,
  className,
}: GravatarGalleryProps) {
  if (!images || images.length === 0) return null

  return (
    <div className={cn('grid grid-cols-2 sm:grid-cols-3 gap-3', className)}>
      {images.map((img, i) => (
        <a
          key={img.url}
          href={img.url}
          target="_blank"
          rel="noopener noreferrer"
          className="group overflow-hidden rounded-lg border border-border/50 hover:border-primary/50 transition-colors"
        >
          <img
            src={img.url}
            alt={img.alt || `Gallery image ${i + 1}`}
            loading="lazy"
            decoding="async"
            className="w-full h-auto aspect-square object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </a>
      ))}
    </div>
  )
}

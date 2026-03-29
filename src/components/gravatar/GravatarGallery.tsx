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
  if (images.length === 0) return null

  return (
    <div className={cn('grid grid-cols-2 sm:grid-cols-3 gap-3', className)}>
      {images.map((img, i) => (
        <a
          key={img.url}
          href={img.url}
          target="_blank"
          rel="noopener noreferrer"
          className="group media-hover-parent overflow-hidden rounded-[1.25rem] bg-muted/15"
        >
          <img
            src={img.url}
            alt={img.alt || `Gallery image ${i + 1}`}
            loading="lazy"
            decoding="async"
            className="media-hover-image media-hover-fade h-auto aspect-square w-full object-cover"
          />
        </a>
      ))}
    </div>
  )
}

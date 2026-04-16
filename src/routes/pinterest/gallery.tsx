import { Link, createFileRoute } from '@tanstack/react-router'
import { ImageIcon } from 'lucide-react'
import { motion } from 'motion/react'

import type { PinterestCreatedPin } from '@/lib/pinterest'
import { pinterest, siteMeta } from '@/config/site-data'
import { getPinterestCreatedPins } from '@/lib/pinterest'

export const Route = createFileRoute('/pinterest/gallery')({
  loader: async () => {
    const data = await getPinterestCreatedPins()
    return data
  },
  head: ({ loaderData }) => {
    const title = `Pinterest Gallery | ${siteMeta.defaultTitle}`
    const description =
      'A masonry gallery of created Pinterest pins from my profile, synced from the Created section.'
    const canonicalUrl = `${siteMeta.baseUrl}/pinterest/gallery`
    const firstImage = loaderData?.pins[0]?.imageUrl
    const imageUrl = firstImage || `${siteMeta.baseUrl}${siteMeta.defaultImage}`

    return {
      meta: [
        { title },
        { name: 'description', content: description },
        { property: 'og:title', content: title },
        { property: 'og:description', content: description },
        { property: 'og:type', content: 'website' },
        { property: 'og:url', content: canonicalUrl },
        { property: 'og:image', content: imageUrl },
        { property: 'og:image:width', content: '1200' },
        { property: 'og:image:height', content: '630' },
        { property: 'og:image:type', content: 'image/png' },
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: title },
        { name: 'twitter:description', content: description },
        { name: 'twitter:image', content: imageUrl },
      ],
      links: [{ rel: 'canonical', href: canonicalUrl }],
      scripts: [
        {
          type: 'application/ld+json',
          children: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'CollectionPage',
            name: 'Pinterest Gallery',
            description,
            url: canonicalUrl,
            mainEntity: {
              '@type': 'ItemList',
              itemListElement: (loaderData?.pins ?? []).map(
                (pin: PinterestCreatedPin, index: number) => ({
                  '@type': 'ListItem',
                  position: index + 1,
                  url: pin.url,
                  name: pin.title,
                  image: pin.imageUrl,
                }),
              ),
            },
          }),
        },
      ],
    }
  },
  component: PinterestGalleryPage,
})

function buildDownloadUrl(pin: PinterestCreatedPin) {
  const safeBaseName =
    pin.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 80) || `pinterest-pin-${pin.id}`

  const params = new URLSearchParams({
    image: pin.originalImageUrl,
    fallback: pin.imageUrl,
    name: safeBaseName,
  })

  return `/api/pinterest/download?${params.toString()}`
}

function PinterestGalleryPage() {
  const { pins, fetchedAt, profileUrl } = Route.useLoaderData()
  const lastSyncLabel = fetchedAt.replace('T', ' ').replace('Z', ' UTC')

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 28 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number],
      },
    },
  }

  return (
    <motion.section
      variants={container}
      initial="hidden"
      animate="show"
      className="flex flex-col gap-16"
    >
      {/* Header */}
      <motion.header variants={item} className="relative overflow-hidden pb-4">
        <div className="pointer-events-none absolute inset-x-[18%] top-[8%] h-28 rounded-full bg-primary/10 blur-3xl" />

        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <span className="text-primary/50">
              <ImageIcon size={18} />
            </span>
            <span className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground/50">
              masonry gallery
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              to="/pinterest"
              className="inline-flex items-center gap-2 text-xs text-muted-foreground/40 transition-colors duration-300 hover:text-primary"
            >
              <span>&larr;</span>
              overview
            </Link>
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-xs text-muted-foreground/40 transition-colors duration-300 hover:text-primary"
            >
              home
            </Link>
          </div>
        </div>

        <div className="flex items-center justify-between gap-4 pt-6">
          <div className="space-y-1">
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/40">
              total pins
            </p>
            <p className="font-serif text-2xl text-foreground">
              {pins.length.toString().padStart(2, '0')}
            </p>
          </div>
          <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground/35">
            {lastSyncLabel}
          </p>
        </div>

        <div className="mt-4 h-px w-full bg-border/10" />
      </motion.header>

      {/* Masonry gallery */}
      {pins.length > 0 ? (
        <motion.div
          variants={item}
          className="columns-2 gap-4 sm:columns-3 lg:columns-4 xl:columns-5"
        >
          {pins.map((pin: PinterestCreatedPin, index: number) => (
            <motion.div
              key={pin.id}
              initial={{ opacity: 0, y: 20, scale: 0.96 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{
                duration: 0.6,
                delay: (index % 5) * 0.06,
                ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number],
              }}
              className="group mb-4 break-inside-avoid"
            >
              <article className="project-card-apple overflow-hidden rounded-2xl border border-border/10 bg-card/40">
                <a
                  href={pin.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="media-hover-parent block"
                >
                  <img
                    src={pin.imageUrl}
                    alt={pin.title}
                    loading="lazy"
                    width={pin.imageWidth}
                    height={pin.imageHeight}
                    className="media-hover-image h-auto w-full object-cover"
                  />
                </a>
                <div className="flex items-center justify-between gap-2 border-t border-border/8 px-3 py-2.5">
                  <a
                    href={pin.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground/40 transition-colors duration-300 hover:text-primary"
                  >
                    Open
                  </a>
                  <a
                    href={buildDownloadUrl(pin)}
                    className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground/40 transition-colors duration-300 hover:text-primary"
                  >
                    Download
                  </a>
                </div>
              </article>
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <motion.div
          variants={item}
          className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-border/10 bg-card/30 p-12"
        >
          <ImageIcon size={32} className="text-muted-foreground/20" />
          <p className="text-sm text-foreground/50">
            Couldn&apos;t load created pins right now. You can still check them
            on{' '}
            <a
              href={pinterest.createdUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline underline-offset-4 transition-colors hover:text-primary/80"
            >
              Pinterest
            </a>
            .
          </p>
        </motion.div>
      )}

      {/* Footer */}
      <motion.footer
        variants={item}
        className="flex flex-col gap-4 pt-6 sm:flex-row sm:items-end sm:justify-between"
      >
        <p className="max-w-2xl text-sm leading-7 text-muted-foreground/40">
          Every pin is download-ready. Browse the overview for curated
          highlights.
        </p>
        <div className="flex items-center gap-4">
          <a
            href={profileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-muted-foreground/40 transition-colors duration-300 hover:text-primary"
          >
            {profileUrl.replace('https://', '')}
          </a>
          <Link
            to="/pinterest"
            className="inline-flex items-center gap-2 text-xs text-muted-foreground/40 transition-colors duration-300 hover:text-primary"
          >
            <span>&larr;</span>
            overview
          </Link>
        </div>
      </motion.footer>
    </motion.section>
  )
}

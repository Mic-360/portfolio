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
              itemListElement: (loaderData?.pins ?? []).map((pin, index) => ({
                '@type': 'ListItem',
                position: index + 1,
                url: pin.url,
                name: pin.title,
                image: pin.imageUrl,
              })),
            },
          }),
        },
      ],
    }
  },
  component: PinterestGalleryPage,
})

function PinterestGalleryPage() {
  const { pins, fetchedAt, profileUrl } = Route.useLoaderData()
  const lastSyncLabel = fetchedAt.replace('T', ' ').replace('Z', ' UTC')

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
      },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 32 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.85, ease: [0.25, 0.1, 0.25, 1] },
    },
  }

  function buildDownloadUrl(pin: PinterestCreatedPin) {
    const safeBaseName = pin.title
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

  return (
    <motion.section
      variants={container}
      initial="hidden"
      animate="show"
      className="flex flex-col gap-14"
    >
      <motion.header
        variants={item}
        className="pb-6"
      >
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground/50">
              <ImageIcon size={14} />
            </span>
            <span className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground/60">
              Pinterest Gallery
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              to="/pinterest"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground/50 transition-colors duration-300 hover:text-foreground"
            >
              <span>←</span>
              Overview
            </Link>
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground/50 transition-colors duration-300 hover:text-foreground"
            >
              Home
            </Link>
          </div>
        </div>
        <div className="mt-4 h-px w-full bg-border/10" />
      </motion.header>

      {pins.length > 0 ? (
        <motion.div
          variants={item}
          className="columns-2 gap-4 lg:columns-3 xl:columns-4 2xl:columns-5"
        >
          {pins.map((pin: PinterestCreatedPin, index) => (
            <div
              key={pin.id}
              className={`group mb-4 block break-inside-avoid ${
                index % 5 === 1
                  ? 'translate-y-2'
                  : index % 5 === 3
                    ? '-translate-y-2'
                    : ''
              }`}
            >
              <article className="overflow-hidden rounded-2xl border border-border/10 bg-foreground/[0.01] transition-all duration-300 hover:border-border/20 hover:bg-foreground/[0.03]">
                <a
                  href={pin.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  <img
                    src={pin.imageUrl}
                    alt={pin.title}
                    loading="lazy"
                    width={pin.imageWidth}
                    height={pin.imageHeight}
                    className="h-auto w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                  />
                </a>
                <div className="flex items-center justify-between gap-3 border-t border-border/10 px-3 py-2">
                  <a
                    href={pin.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] text-muted-foreground/40 transition-colors duration-300 hover:text-foreground"
                  >
                    Open
                  </a>
                  <a
                    href={buildDownloadUrl(pin)}
                    className="text-[10px] text-muted-foreground/50 transition-colors duration-300 hover:text-foreground"
                  >
                    Download
                  </a>
                </div>
              </article>
            </div>
          ))}
        </motion.div>
      ) : (
        <motion.div
          variants={item}
          className="rounded-3xl border border-border/10 bg-foreground/[0.02] p-8"
        >
          <p className="text-muted-foreground/60">
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

      <motion.footer
        variants={item}
        className="flex flex-col gap-3 pt-6 text-xs text-muted-foreground/40 sm:flex-row sm:items-center sm:justify-between"
      >
        <span>Last sync: {lastSyncLabel}</span>
        <a
          href={profileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="transition-colors duration-300 hover:text-foreground"
        >
          {profileUrl.replace('https://', '')}
        </a>
      </motion.footer>
    </motion.section>
  )
}

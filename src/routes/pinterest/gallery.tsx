import { Link, createFileRoute } from '@tanstack/react-router'
import { ImageIcon } from 'lucide-react'
import { motion } from 'motion/react'
import type { PinterestCreatedPin } from '@/lib/pinterest'
import { getPinterestCreatedPins } from '@/lib/pinterest'
import { pinterest, siteMeta } from '@/config/site-data'

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
        staggerChildren: 0.08,
      },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { duration: 0.35 } },
  }

  return (
    <motion.section
      variants={container}
      initial="hidden"
      animate="show"
      className="flex flex-col gap-8"
    >
      <motion.header variants={item} className="flex flex-col gap-4 mb-2">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <h1 className="text-3xl font-bold tracking-tight bg-linear-to-r from-foreground to-foreground/70 bg-clip-text text-transparent italic">
              <ImageIcon size={22} className="inline-block mr-3 text-primary" />
              pinterest gallery
            </h1>
            <div className="h-0.5 w-16 bg-primary rounded-full" />
          </div>
          <Link
            to="/"
            className="animus-corner group px-4 py-1 inline-flex items-center gap-2 italic text-muted-foreground hover:text-primary transition-all duration-500"
          >
            <span className="transform group-hover:-translate-x-1 transition-transform duration-300">
              ←
            </span>
            back
          </Link>
        </div>

        <div className="flex gap-4 items-center justify-between">
          <div className="flex flex-col gap-2">
            <p className="text-muted-foreground leading-relaxed">
              auto-fetched from my pinterest{' '}
              <span className="text-primary">created</span> section (not saved
              boards).
            </p>
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/80">
              showing {pins.length} created pin{pins.length === 1 ? '' : 's'}
            </p>
          </div>
          <img
            src="/frieren/frieren-tea.svg"
            className="h-14 sm:h-20 inline-block align-bottom"
          />
        </div>
      </motion.header>

      {pins.length > 0 ? (
        <motion.div
          variants={item}
          className="columns-1 sm:columns-2 lg:columns-3 gap-4"
        >
          {pins.map((pin: PinterestCreatedPin) => (
            <a
              key={pin.id}
              href={pin.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group block mb-4 break-inside-avoid"
            >
              <article className="animus-corner animus-scanlines rounded-lg border border-border/40 bg-card/20 hover:border-primary/50 transition-all duration-400 overflow-hidden">
                <img
                  src={pin.imageUrl}
                  alt={pin.title}
                  loading="lazy"
                  width={pin.imageWidth}
                  height={pin.imageHeight}
                  className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                />
                <div className="p-3 flex flex-col gap-1">
                  <h2 className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                    {pin.title}
                  </h2>
                  {pin.description ? (
                    <p className="text-[10px] text-muted-foreground/80 line-clamp-2">
                      {pin.description}
                    </p>
                  ) : null}
                </div>
              </article>
            </a>
          ))}
        </motion.div>
      ) : (
        <motion.div
          variants={item}
          className="rounded-lg border border-border/40 p-6 bg-card/10"
        >
          <p className="text-muted-foreground">
            couldn&apos;t load created pins right now. you can still check them
            on{' '}
            <a
              href={pinterest.createdUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="underline decoration-primary underline-offset-4 hover:text-primary transition-colors"
            >
              pinterest
            </a>
            .
          </p>
        </motion.div>
      )}

      <motion.footer
        variants={item}
        className="flex flex-row-reverse items-center justify-between gap-1 text-[10px] text-muted-foreground"
      >
        <span>
          source profile:{' '}
          <a
            href={profileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="underline decoration-primary underline-offset-4 hover:text-primary transition-colors"
          >
            {profileUrl}
          </a>
        </span>
        <span>last sync: {lastSyncLabel}</span>
      </motion.footer>

      <Link
        to="/"
        className="group inline-flex items-center gap-1 italic text-muted-foreground hover:text-primary transition-colors duration-300 mb-2"
      >
        <span className="transform group-hover:-translate-x-1 transition-transform duration-300">
          ←
        </span>
        back
      </Link>
    </motion.section>
  )
}

import { Link, createFileRoute } from '@tanstack/react-router'
import { ImageIcon } from 'lucide-react'
import { motion } from 'motion/react'

import { siteMeta } from '@/config/site-data'
import type { PinterestCreatedPin } from '@/lib/pinterest'
import { getPinterestCreatedPins } from '@/lib/pinterest'

export const Route = createFileRoute('/pinterest/')({
  loader: async () => {
    const data = await getPinterestCreatedPins()
    return data
  },
  head: ({ loaderData }) => {
    const title = `Pinterest | ${siteMeta.defaultTitle}`
    const description =
      'A curated Pinterest surface showing created pins, visual studies, and the full masonry gallery.'
    const canonicalUrl = `${siteMeta.baseUrl}/pinterest`
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
            name: 'Pinterest',
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
  component: PinterestIndexPage,
})

function PinterestIndexPage() {
  const { pins, fetchedAt, profileUrl, createdUrl, createdBoardUrl } =
    Route.useLoaderData()
  const heroPin = pins[0]
  const previewPins = pins.slice(1, 7)
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
      <motion.header variants={item} className="relative overflow-hidden pb-8">
        <div className="pointer-events-none absolute inset-x-[18%] top-[8%] h-28 rounded-full bg-primary/10 blur-3xl" />
        <div className="pointer-events-none absolute right-[6%] top-[10%] h-72 w-72 rounded-full bg-primary/6 blur-[120px]" />

        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <span className="text-primary/50">
              <ImageIcon size={18} />
            </span>
            <span className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground/50">
              visual archive
            </span>
          </div>
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs text-muted-foreground/40 transition-colors duration-300 hover:text-primary"
          >
            <span>&larr;</span>
            home
          </Link>
        </div>

        <div className="flex flex-col gap-8 pt-8 lg:pt-12">
          <div className="grid gap-5">
            <h1 className="font-serif text-4xl leading-[1.08] tracking-tight text-foreground sm:text-5xl xl:text-6xl">
              Visual studies, curated pins.
            </h1>
            <p className="max-w-2xl text-base leading-8 text-foreground/50 sm:text-lg">
              Browse visual previews, download assets, or jump into the full
              masonry gallery.
            </p>
          </div>

          <div className="flex items-center justify-between gap-4">
            <div className="space-y-1">
              <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/40">
                pins synced
              </p>
              <p className="font-serif text-2xl text-foreground">
                {pins.length.toString().padStart(2, '0')}
              </p>
            </div>
            <div className="space-y-1 text-right">
              <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/40">
                last sync
              </p>
              <p className="text-xs text-muted-foreground/50">
                {lastSyncLabel}
              </p>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Hero pin — cinematic full-width */}
      {heroPin ? (
        <motion.div variants={item}>
          <a
            href={heroPin.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group block"
          >
            <motion.div
              whileHover={{ y: -4 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className="project-card-apple relative overflow-hidden rounded-2xl border border-border/10"
            >
              <div className="media-hover-parent relative aspect-[21/9] sm:aspect-[21/8]">
                <img
                  src={heroPin.imageUrl}
                  alt={heroPin.title}
                  width={heroPin.imageWidth}
                  height={heroPin.imageHeight}
                  className="media-hover-image absolute inset-0 h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              </div>
              <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
                <div className="flex items-end justify-between gap-4">
                  <div className="flex flex-col gap-2">
                    <span className="text-[10px] uppercase tracking-[0.25em] text-white/50">
                      Featured Pin
                    </span>
                    <h2 className="max-w-xl font-serif text-xl leading-tight tracking-tight text-white sm:text-2xl lg:text-3xl">
                      {heroPin.title}
                    </h2>
                  </div>
                  <span className="text-sm text-white/50 transition-transform duration-300 group-hover:translate-x-1">
                    &nearr;
                  </span>
                </div>
              </div>
            </motion.div>
          </a>
        </motion.div>
      ) : null}

      {/* Preview grid */}
      {previewPins.length > 0 ? (
        <motion.div
          variants={item}
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {previewPins.map((pin: PinterestCreatedPin, index: number) => (
            <motion.div
              key={pin.id}
              initial={{ opacity: 0, y: 20, scale: 0.96 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{
                duration: 0.6,
                delay: index * 0.08,
                ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number],
              }}
            >
              <a
                href={pin.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group block h-full"
              >
                <motion.article
                  whileHover={{ y: -4 }}
                  transition={{
                    type: 'spring',
                    stiffness: 300,
                    damping: 20,
                  }}
                  className="project-card-apple flex h-full flex-col overflow-hidden rounded-2xl border border-border/10 bg-card/50"
                >
                  <div className="media-hover-parent relative aspect-[4/3] overflow-hidden">
                    <img
                      src={pin.imageUrl}
                      alt={pin.title}
                      loading="lazy"
                      width={pin.imageWidth}
                      height={pin.imageHeight}
                      className="media-hover-image absolute inset-0 h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-card/50 via-transparent to-transparent" />
                  </div>
                  <div className="flex flex-1 items-center justify-between gap-3 p-4">
                    <h3 className="line-clamp-2 text-sm font-medium tracking-tight text-foreground transition-colors duration-300 group-hover:text-primary">
                      {pin.title}
                    </h3>
                    <span className="shrink-0 text-xs text-primary/50 transition-transform duration-300 group-hover:translate-x-1">
                      &rarr;
                    </span>
                  </div>
                </motion.article>
              </a>
            </motion.div>
          ))}
        </motion.div>
      ) : null}

      {/* Action cards */}
      <motion.section
        variants={item}
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
      >
        <ActionCard
          title="Full Gallery"
          body="Staggered masonry wall with every pin, download-ready."
          to="/pinterest/gallery"
          meta="masonry view"
        />
        <ActionCard
          title="Created Board"
          body="Board-level surface directly on Pinterest."
          href={createdBoardUrl}
          meta="board view"
        />
        <ActionCard
          title="Live Feed"
          body="Fresh pins, public source links, and the visual trail this gallery pulls from."
          href={createdUrl}
          meta={createdUrl.replace('https://', '')}
        />
      </motion.section>

      {/* Footer */}
      <motion.footer
        variants={item}
        className="flex flex-col gap-4 pt-6 sm:flex-row sm:items-end sm:justify-between"
      >
        <div className="flex items-end gap-6">
          <p className="max-w-2xl text-sm leading-7 text-muted-foreground/40">
            Browse the full masonry gallery or visit the live Pinterest feed for
            more.
          </p>
        </div>
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
            to="/"
            className="inline-flex items-center gap-2 text-xs text-muted-foreground/40 transition-colors duration-300 hover:text-primary"
          >
            <span>&larr;</span>
            back home
          </Link>
        </div>
      </motion.footer>
    </motion.section>
  )
}

type ActionCardBaseProps = {
  body: string
  meta: string
  title: string
}

type ActionCardInternalLinkProps = ActionCardBaseProps & {
  to: '/pinterest/gallery'
  href?: never
}

type ActionCardExternalLinkProps = ActionCardBaseProps & {
  href: string
  to?: never
}

type ActionCardProps = ActionCardInternalLinkProps | ActionCardExternalLinkProps

function ActionCard({ body, href, meta, title, to }: ActionCardProps) {
  const content = (
    <motion.article
      whileHover={{ y: -4 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className="project-card-apple flex h-full flex-col justify-between gap-6 rounded-2xl border border-border/10 bg-card/40 p-5 sm:p-6"
    >
      <div className="flex flex-col gap-3">
        <span className="text-[10px] uppercase tracking-[0.2em] text-primary/50">
          {meta}
        </span>
        <h3 className="font-serif text-lg leading-tight tracking-tight text-foreground transition-colors duration-300 group-hover:text-primary">
          {title}
        </h3>
        <p className="text-sm leading-7 text-foreground/50">{body}</p>
      </div>
      <div className="flex items-center justify-between gap-4 border-t border-border/8 pt-3">
        <span className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground/30">
          {to ? 'Internal' : 'External'}
        </span>
        <span className="text-xs text-primary/50 transition-transform duration-300 group-hover:translate-x-1">
          {to ? '\u2192' : '\u2197'}
        </span>
      </div>
    </motion.article>
  )

  if (to) {
    return (
      <Link to={to} className="group block h-full">
        {content}
      </Link>
    )
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="group block h-full"
    >
      {content}
    </a>
  )
}

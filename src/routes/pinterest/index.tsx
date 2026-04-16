import { Link, createFileRoute } from '@tanstack/react-router'
import { ImageIcon } from 'lucide-react'
import { motion } from 'motion/react'

import type { PinterestCreatedPin } from '@/lib/pinterest'
import { getPinterestCreatedPins } from '@/lib/pinterest'
import { siteMeta } from '@/config/site-data'


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
  component: PinterestIndexPage,
})

function PinterestIndexPage() {
  const { pins, fetchedAt, profileUrl, createdUrl, createdBoardUrl } =
    Route.useLoaderData()
  const leadPins = pins.slice(0, 4)
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

  return (
    <motion.section
      variants={container}
      initial="hidden"
      animate="show"
      className="flex flex-col gap-14"
    >
      <motion.header
        variants={item}
        className="pb-12"
      >
        <div className="flex items-center justify-between gap-4 pb-10">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground/50">
              <ImageIcon size={14} />
            </span>
            <span className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground/60">
              Pinterest
            </span>
          </div>
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground/50 transition-colors duration-300 hover:text-foreground"
          >
            <span>←</span>
            Home
          </Link>
        </div>

        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] lg:items-start">
          <div className="flex flex-col gap-6">
            <h1 className="max-w-xl text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
              Visual studies and created pins.
            </h1>
            <p className="max-w-lg text-lg leading-relaxed text-muted-foreground/70">
              Browse visual previews, download assets, or jump into the full
              masonry gallery.
            </p>

            <div className="flex items-center gap-6 text-sm text-muted-foreground/50">
              <span>{pins.length} pins</span>
              <span className="h-3 w-px bg-border/20" />
              <span className="text-xs">{lastSyncLabel}</span>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {leadPins.map((pin, index) => (
              <PinterestPreviewCard
                key={pin.id}
                pin={pin}
                className={index % 2 === 1 ? 'sm:translate-y-6' : ''}
              />
            ))}
          </div>
        </div>

        <div className="mt-8 h-px w-full bg-border/10" />
      </motion.header>

      <motion.section
        variants={item}
        className="grid gap-4 lg:grid-cols-[minmax(0,1.05fr)_minmax(300px,0.95fr)]"
      >
        <a
          href={createdUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="group overflow-hidden rounded-3xl border border-border/10 bg-foreground/[0.01] p-8 transition-all duration-300 hover:border-border/20 hover:bg-foreground/[0.03]"
        >
          <div className="flex h-full flex-col justify-between gap-8">
            <div className="space-y-4">
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground/50">
                Created Feed
              </p>
              <h2 className="max-w-xl text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                Browse the live Pinterest stream.
              </h2>
              <p className="max-w-xl text-sm text-muted-foreground/60">
                Fresh pins, public source links, and the same visual trail this
                gallery pulls from.
              </p>
            </div>
            <div className="flex items-center justify-between gap-4 text-sm text-muted-foreground/40 transition-colors duration-300 group-hover:text-foreground">
              <span>{createdUrl.replace('https://', '')}</span>
              <span>↗</span>
            </div>
          </div>
        </a>

        <div className="grid gap-4">
          <ActionCard
            title="Full Gallery"
            body="Staggered masonry wall — scan everything at once."
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
            title="Profile"
            body="Public profile and the wider visual archive."
            href={profileUrl}
            meta={profileUrl.replace('https://', '')}
          />
        </div>
      </motion.section>
    </motion.section>
  )
}

function PinterestPreviewCard({
  pin,
  className = '',
}: {
  pin: PinterestCreatedPin
  className?: string
}) {
  return (
    <a
      href={pin.url}
      target="_blank"
      rel="noopener noreferrer"
      className={`group block overflow-hidden rounded-2xl border border-border/10 bg-foreground/[0.01] transition-all duration-300 hover:border-border/20 hover:bg-foreground/[0.03] ${className}`}
    >
      <div className="overflow-hidden">
        <img
          src={pin.imageUrl}
          alt={pin.title}
          loading="lazy"
          width={pin.imageWidth}
          height={pin.imageHeight}
          className="h-64 w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
        />
      </div>
      <div className="p-4">
        <h2 className="text-sm font-medium tracking-tight text-foreground transition-colors duration-300 group-hover:text-primary line-clamp-2">
          {pin.title}
        </h2>
      </div>
    </a>
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
    <article className="group flex h-full flex-col justify-between gap-5 rounded-2xl border border-border/10 bg-foreground/[0.01] p-5 transition-all duration-300 hover:border-border/20 hover:bg-foreground/[0.03]">
      <div className="space-y-2">
        <p className="text-xs text-muted-foreground/40">
          {meta}
        </p>
        <h3 className="text-lg font-semibold tracking-tight text-foreground transition-colors duration-300 group-hover:text-primary">
          {title}
        </h3>
        <p className="text-sm text-muted-foreground/60">{body}</p>
      </div>
      <div className="text-sm text-muted-foreground/40 transition-colors duration-300 group-hover:text-foreground">
        Open →
      </div>
    </article>
  )

  if (to) {
    return <Link to={to}>{content}</Link>
  }

  return (
    <a href={href} target="_blank" rel="noopener noreferrer">
      {content}
    </a>
  )
}

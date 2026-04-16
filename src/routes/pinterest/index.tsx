import { Link, createFileRoute } from '@tanstack/react-router'
import { ImageIcon } from 'lucide-react'
import { motion } from 'motion/react'

import type { PinterestCreatedPin } from '@/lib/pinterest'
import { getPinterestCreatedPins } from '@/lib/pinterest'
import { siteMeta } from '@/config/site-data'
import { cn } from '@/lib/utils'

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
        className="relative overflow-hidden border-b border-border/20 pb-12"
      >
        <div className="pointer-events-none absolute inset-x-[18%] top-[8%] h-28 rounded-full bg-primary/14 blur-3xl" />
        <div className="pointer-events-none absolute right-[6%] top-[10%] h-72 w-72 rounded-full bg-primary/8 blur-[120px]" />

        <div className="flex items-center justify-between gap-4 pb-6">
          <div className="flex items-center gap-3">
            <span className="text-primary">
              <ImageIcon size={22} />
            </span>
            <span className="text-lg uppercase tracking-[0.28em] text-primary/75">
              pinterest
            </span>
          </div>
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary"
          >
            <span>←</span>
            home
          </Link>
        </div>
        <div className="grid gap-10 lg:grid-cols-[minmax(0,0.78fr)_minmax(0,1.22fr)] lg:items-start">
          <div className="flex flex-col gap-7 pt-6 lg:pt-10">
            <div className="grid gap-4">
              <h1 className="max-w-3xl font-serif text-5xl leading-none text-foreground sm:text-6xl xl:text-7xl">
                Visual studies, poster-like pins, and a live stream from the
                created feed.
              </h1>
              <p className="max-w-xl text-base leading-8 text-foreground/76 sm:text-lg">
                This page keeps calmer framing of pins, but it allows download
                of assets and provides visual previews, route choices, and the
                jump into the full masonry gallery.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <PinterestInfoCard
                label="created pins"
                value={`${pins.length}`}
              />
              <PinterestInfoCard label="last sync" value={lastSyncLabel} className="sm:col-span-2" />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {leadPins.map((pin, index) => (
              <PinterestPreviewCard
                key={pin.id}
                pin={pin}
                className={index % 2 === 1 ? 'sm:translate-y-8' : ''}
              />
            ))}
          </div>
        </div>
      </motion.header>

      <motion.section
        variants={item}
        className="grid gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(320px,0.95fr)]"
      >
        <a
          href={createdUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="group relative overflow-hidden rounded-[2rem] border border-border/25 bg-card/20 p-6 transition-colors hover:border-primary/35"
        >
          <div className="pointer-events-none absolute inset-x-[20%] top-[16%] h-20 rounded-full bg-primary/12 blur-3xl" />
          <div className="relative z-10 flex h-full flex-col justify-between gap-8">
            <div className="space-y-3">
              <p className="text-[10px] uppercase tracking-[0.28em] text-primary/75">
                created feed
              </p>
              <h2 className="max-w-xl font-serif text-3xl leading-tight text-foreground sm:text-4xl">
                Open the public Pinterest stream and browse the live created
                surface.
              </h2>
              <p className="max-w-xl text-sm leading-7 text-foreground/72">
                Fresh pins, public source links, and the same visual trail this
                gallery pulls from.
              </p>
            </div>
            <div className="flex items-center justify-between gap-4 text-sm text-muted-foreground transition-colors group-hover:text-primary">
              <span>{createdUrl.replace('https://', '')}</span>
              <span>↗</span>
            </div>
          </div>
        </a>

        <div className="grid gap-4">
          <ActionCard
            title="Full Gallery"
            body="Keep the staggered masonry wall and scan everything at once."
            to="/pinterest/gallery"
            meta="masonry view"
          />
          <ActionCard
            title="Created Board"
            body="Open the board-level surface directly on Pinterest."
            href={createdBoardUrl}
            meta="board view"
          />
          <ActionCard
            title="Profile"
            body="Jump to the public profile and follow the wider visual archive."
            href={profileUrl}
            meta={profileUrl.replace('https://', '')}
          />
        </div>
      </motion.section>
    </motion.section>
  )
}

function PinterestInfoCard({
  label,
  value,
  className,
}: {
  label: string
  value: string
  className?: string
}) {
  return (
    <div
      className={cn(
        className,
        'rounded-[1.4rem] border border-border/25 bg-card/18 p-4',
      )}
    >
      <p className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-3 font-serif text-2xl leading-none text-foreground">
        {value}
      </p>
    </div>
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
      className={`group block overflow-hidden rounded-[1.75rem] border border-border/25 bg-card/20 transition-colors hover:border-primary/35 ${className}`}
    >
      <div className="overflow-hidden">
        <img
          src={pin.imageUrl}
          alt={pin.title}
          loading="lazy"
          width={pin.imageWidth}
          height={pin.imageHeight}
          className="h-72 w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
      </div>
      <div className="grid gap-1 p-4">
        <p className="text-[10px] uppercase tracking-[0.22em] text-primary/75">
          created pin
        </p>
        <h2 className="text-sm font-medium leading-6 text-foreground transition-colors group-hover:text-primary line-clamp-2">
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
    <article className="group flex h-full flex-col justify-between gap-6 rounded-[1.5rem] border border-border/25 bg-card/20 p-5 transition-colors hover:border-primary/35">
      <div className="space-y-2">
        <p className="text-[10px] uppercase tracking-[0.22em] text-primary/75">
          {meta}
        </p>
        <h3 className="font-serif text-2xl leading-tight text-foreground transition-colors group-hover:text-primary">
          {title}
        </h3>
        <p className="text-sm leading-7 text-foreground/72">{body}</p>
      </div>
      <div className="text-sm text-muted-foreground transition-colors group-hover:text-primary">
        open
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

import { Link, createFileRoute } from '@tanstack/react-router'
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useState } from 'react'
import PenIcon from '@/components/ui/pen-icon'
import { siteMeta } from '@/config/site-data'
import { getBlogIndex } from '@/lib/content'
import { formatDate } from '@/lib/format'

export const Route = createFileRoute('/blog/')({
  validateSearch: (search: Record<string, unknown>): { tag?: string } =>
    typeof search.tag === 'string' ? { tag: search.tag } : {},
  loader: async () => ({
    posts: await getBlogIndex(),
  }),
  head: ({ loaderData }) => {
    const title = `Blog | ${siteMeta.defaultTitle}`
    const description = 'Writing and notes from recent builds and experiments.'
    const imageUrl = `${siteMeta.baseUrl}${siteMeta.defaultImage}`
    const canonicalUrl = `${siteMeta.baseUrl}/blog`
    const posts = loaderData?.posts ?? []

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
        { name: 'twitter:image:alt', content: title },
      ],
      links: [{ rel: 'canonical', href: canonicalUrl }],
      scripts: [
        {
          type: 'application/ld+json',
          children: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'CollectionPage',
            name: 'Blog',
            description:
              'Short, practical notes on building web and android apps, tools, systems, and experiments.',
            url: canonicalUrl,
            mainEntity: {
              '@type': 'ItemList',
              itemListElement: posts.map((post, index) => ({
                '@type': 'ListItem',
                position: index + 1,
                url: `${siteMeta.baseUrl}/blog/${post.slug}`,
                name: post.title,
                description: post.summary,
                image: post.image
                  ? `${siteMeta.baseUrl}${post.image}`
                  : `${siteMeta.baseUrl}/og/blog/${post.slug}`,
                datePublished: post.date,
              })),
            },
          }),
        },
        {
          type: 'application/ld+json',
          children: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              {
                '@type': 'ListItem',
                position: 1,
                name: 'Home',
                item: siteMeta.baseUrl,
              },
              {
                '@type': 'ListItem',
                position: 2,
                name: 'Blog',
                item: canonicalUrl,
              },
            ],
          }),
        },
      ],
    }
  },
  component: BlogIndex,
})

function BlogIndex() {
  const { posts } = Route.useLoaderData()
  const { tag: urlTag } = Route.useSearch()
  const [activeTag, setActiveTag] = useState<string | null>(urlTag ?? null)

  useEffect(() => {
    setActiveTag(urlTag ?? null)
  }, [urlTag])

  const allTags = Array.from(
    new Set(posts.flatMap((post) => [...post.categories, ...post.tags])),
  )

  const filteredPosts = activeTag
    ? posts.filter(
        (p) => p.categories.includes(activeTag) || p.tags.includes(activeTag),
      )
    : posts

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
      <motion.header variants={item} className="relative overflow-hidden pb-8">
        <div className="pointer-events-none absolute inset-x-[18%] top-[8%] h-28 rounded-full bg-primary/10 blur-3xl" />
        <div className="pointer-events-none absolute right-[6%] top-[10%] h-72 w-72 rounded-full bg-primary/6 blur-[120px]" />

        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <span className="text-primary/50">
              <PenIcon size={18} />
            </span>
            <span className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground/70">
              writing index
            </span>
          </div>
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs text-muted-foreground/70 transition-colors duration-300 hover:text-primary"
          >
            <span>&larr;</span>
            home
          </Link>
        </div>

        <div className="flex flex-col gap-8 pt-8 lg:pt-12">
          <div className="grid gap-5">
            <h1 className="font-serif text-4xl leading-[1.08] tracking-tight text-foreground sm:text-5xl xl:text-6xl">
              Build notes that read like the work itself.
            </h1>
            <p className="max-w-2xl text-base leading-8 text-foreground/70 sm:text-lg">
              Essays, postmortems, and sharp notes from web, Android, AI, and
              systems builds.
            </p>
          </div>

          <div className="flex items-center justify-between gap-4">
            <div className="space-y-1">
              <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/70">
                essays logged
              </p>
              <p className="font-serif text-2xl text-foreground">
                {posts.length.toString().padStart(2, '0')}
              </p>
            </div>
          </div>
        </div>
      </motion.header>

      {allTags.length > 0 ? (
        <motion.div
          variants={item}
          className="sticky top-0 z-30 -mx-4 px-4 py-3 backdrop-blur-xl bg-background/80 border-b border-border/10"
        >
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
            <button
              type="button"
              onClick={() => setActiveTag(null)}
              className={`filter-pill ${
                activeTag === null
                  ? 'filter-pill-active'
                  : 'filter-pill-inactive'
              }`}
            >
              All
            </button>
            {allTags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => setActiveTag(activeTag === tag ? null : tag)}
                className={`filter-pill ${
                  activeTag === tag
                    ? 'filter-pill-active'
                    : 'filter-pill-inactive'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </motion.div>
      ) : null}

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {filteredPosts.map((post, index) => {
            const isHero = index === 0

            return (
              <motion.div
                key={post.slug}
                layout
                layoutId={post.slug}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{
                  duration: 0.5,
                  ease: [0.25, 0.1, 0.25, 1],
                  layout: { duration: 0.4 },
                }}
                className={isHero ? 'sm:col-span-2 lg:col-span-2' : ''}
              >
                <Link
                  to="/blog/$slug"
                  params={{ slug: post.slug }}
                  className="group block h-full"
                >
                  <motion.article
                    whileHover={{ y: -4 }}
                    transition={{
                      type: 'spring',
                      stiffness: 300,
                      damping: 20,
                    }}
                    className={`project-card-apple flex h-full flex-col justify-between gap-4 rounded-2xl border border-border/10 bg-card/40 p-5 sm:p-6 ${
                      isHero ? 'sm:flex-row sm:items-start sm:gap-8' : ''
                    }`}
                  >
                    <div className="flex flex-1 flex-col gap-3">
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] uppercase tracking-[0.2em] text-primary/50">
                          {post.categories.length > 0
                            ? post.categories[0]
                            : 'essay'}
                        </span>
                        <span className="h-px flex-1 bg-border/10" />
                        <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/35">
                          {formatDate(post.date)}
                        </span>
                      </div>

                      <h2
                        className={`font-serif leading-tight tracking-tight text-foreground transition-colors duration-300 group-hover:text-primary ${
                          isHero ? 'text-xl sm:text-2xl lg:text-3xl' : 'text-lg'
                        }`}
                      >
                        {post.title}
                      </h2>

                      <p
                        className={`text-sm leading-7 text-foreground/70 ${
                          isHero ? 'max-w-2xl' : 'line-clamp-3'
                        }`}
                      >
                        {post.summary}
                      </p>
                    </div>

                    <div className="flex items-center justify-between gap-4 border-t border-border/8 pt-3">
                      <div className="flex items-center gap-3">
                        {post.tags.length > 0 ? (
                          <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/30">
                            {post.tags.slice(0, 3).join(' \u00b7 ')}
                          </p>
                        ) : null}
                      </div>
                      <span className="text-xs text-primary/50 transition-transform duration-300 group-hover:translate-x-1">
                        &rarr;
                      </span>
                    </div>
                  </motion.article>
                </Link>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>

      <motion.footer
        variants={item}
        className="flex flex-col gap-4 pt-6 sm:flex-row sm:items-end sm:justify-between"
      >
        <div className="flex items-end gap-6">
          <img
            src="/frieren/frieren-teach.svg"
            className="inline-block h-16 align-bottom sm:h-22"
            alt=""
            data-backlight="off"
          />
          <p className="max-w-2xl text-sm leading-7 text-muted-foreground/70">
            Every entry opens into a fuller reading view with the same
            atmosphere and long-form rhythm.
          </p>
        </div>
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs text-muted-foreground/70 transition-colors duration-300 hover:text-primary"
        >
          <span>&larr;</span>
          back home
        </Link>
      </motion.footer>
    </motion.section>
  )
}

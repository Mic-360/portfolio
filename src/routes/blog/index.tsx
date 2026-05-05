import { Link, createFileRoute } from '@tanstack/react-router'
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useMemo, useState } from 'react'
import { siteMeta } from '@/config/site-data'
import { getBlogIndex } from '@/lib/content'
import { formatDate } from '@/lib/format'
import { PageLayout, PAGE_ITEM_VARIANTS } from '@/layout/layout'

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

const ROMAN: Array<string> = [
  'I',
  'II',
  'III',
  'IV',
  'V',
  'VI',
  'VII',
  'VIII',
  'IX',
  'X',
  'XI',
  'XII',
]

function toRoman(n: number) {
  if (n <= 0) return ''
  if (n <= ROMAN.length) return ROMAN[n - 1]
  // simple fallback for >12
  const map: Array<[number, string]> = [
    [1000, 'M'],
    [900, 'CM'],
    [500, 'D'],
    [400, 'CD'],
    [100, 'C'],
    [90, 'XC'],
    [50, 'L'],
    [40, 'XL'],
    [10, 'X'],
    [9, 'IX'],
    [5, 'V'],
    [4, 'IV'],
    [1, 'I'],
  ]
  let res = ''
  let v = n
  for (const [k, sym] of map) {
    while (v >= k) {
      res += sym
      v -= k
    }
  }
  return res
}

function BlogIndex() {
  const { posts } = Route.useLoaderData()
  const { tag: urlTag } = Route.useSearch()
  const [activeTag, setActiveTag] = useState<string | null>(urlTag ?? null)

  useEffect(() => {
    setActiveTag(urlTag ?? null)
  }, [urlTag])

  const allTags = useMemo(
    () =>
      Array.from(
        new Set(posts.flatMap((post) => [...post.categories, ...post.tags])),
      ),
    [posts],
  )

  const filteredPosts = activeTag
    ? posts.filter(
        (p) => p.categories.includes(activeTag) || p.tags.includes(activeTag),
      )
    : posts

  const lead = filteredPosts[0]
  const rest = filteredPosts.slice(1)

  const today = new Date()
  const dateline = today
    .toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    })
    .toUpperCase()

  return (
    <PageLayout>
      {/* ─── Masthead: broadsheet ─── */}
      <motion.header variants={PAGE_ITEM_VARIANTS} className="relative">
        {/* top hairline rule with kicker */}
        <div className="flex items-center justify-between border-b border-foreground/30 pb-2 text-[10px] uppercase tracking-[0.32em] text-muted-foreground/70">
          <span className="font-mono">{dateline}</span>
          <span className="hidden font-mono sm:inline">
            vol. {toRoman(today.getFullYear() - 2023)} · ed. {posts.length}
          </span>
          <Link
            to="/"
            className="font-mono transition-colors hover:text-primary"
          >
            ← home
          </Link>
        </div>

        {/* Massive nameplate */}
        <h1
          className="mt-3 font-serif text-[15vw] leading-[0.86] tracking-[-0.04em] text-foreground sm:text-7xl md:text-[7.5rem] lg:text-[9rem]"
          style={{ fontWeight: 800 }}
        >
          The Field <em className="italic text-primary">Periodical</em>
        </h1>

        {/* tagline rule + irony */}
        <div className="mt-3 flex items-center gap-4 border-t border-double border-foreground/30 pt-3">
          <span className="font-serif text-sm italic tracking-tight text-muted-foreground/85">
            “Postmortems, takedowns, and footnotes that should have been
            tweets.”
          </span>
          <span className="hidden h-px flex-1 bg-foreground/15 sm:block" />
          <span className="hidden font-mono text-[10px] uppercase tracking-[0.32em] text-muted-foreground/55 sm:inline">
            est. mmxxiv · price ⁄ free
          </span>
        </div>
      </motion.header>

      {/* ─── Tag classifieds (filter row) ─── */}
      {allTags.length > 0 ? (
        <motion.div
          variants={PAGE_ITEM_VARIANTS}
          className="sticky top-0 z-30 -mx-4 border-y border-foreground/15 bg-background/85 px-4 py-3 backdrop-blur-xl sm:-mx-6 sm:px-6"
        >
          <div className="flex items-center gap-4 overflow-x-auto scrollbar-hide">
            <span className="shrink-0 font-mono text-[10px] uppercase tracking-[0.32em] text-muted-foreground/50">
              filed under ::
            </span>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
              <ClassifiedTag
                label="all"
                active={activeTag === null}
                onClick={() => setActiveTag(null)}
              />
              {allTags.map((tag) => (
                <ClassifiedTag
                  key={tag}
                  label={tag}
                  active={activeTag === tag}
                  onClick={() => setActiveTag(activeTag === tag ? null : tag)}
                />
              ))}
            </div>
          </div>
        </motion.div>
      ) : null}

      {/* ─── Lead story ─── */}
      <AnimatePresence mode="popLayout">
        {lead ? (
          <motion.article
            key={`lead-${lead.slug}`}
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
            className="border-b-4 border-double border-foreground/25 pb-12"
          >
            <Link
              to="/blog/$slug"
              params={{ slug: lead.slug }}
              className="group block"
            >
              <p className="mb-4 flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.32em] text-primary/80">
                <span className="h-px w-8 bg-primary/60" />
                lead story · no. {filteredPosts.length.toString().padStart(2, '0')}
              </p>

              <h2 className="font-serif text-3xl leading-[1.04] tracking-tight text-foreground transition-colors duration-300 group-hover:text-primary sm:text-5xl xl:text-6xl">
                {lead.title}
              </h2>

              <p className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 font-serif text-sm italic text-muted-foreground/75">
                <span>by the desk · {formatDate(lead.date)}</span>
                {lead.categories.length > 0 ? (
                  <>
                    <span className="text-foreground/30">·</span>
                    <span className="not-italic font-mono text-[10px] uppercase tracking-[0.28em] text-muted-foreground/60">
                      {lead.categories[0]}
                    </span>
                  </>
                ) : null}
              </p>

              {/* drop-cap excerpt */}
              <div className="mt-6 max-w-3xl text-base leading-[1.85] text-foreground/82 sm:text-[17px] sm:leading-[1.85] [column-rule:1px_solid_var(--border)] sm:columns-2 sm:gap-x-10">
                <p className="break-inside-avoid first-letter:float-left first-letter:mr-2 first-letter:font-serif first-letter:text-6xl first-letter:font-bold first-letter:leading-[0.85] first-letter:text-primary sm:first-letter:text-7xl">
                  {lead.summary}
                </p>
              </div>

              <div className="mt-6 flex items-center gap-3">
                <span className="font-mono text-[10px] uppercase tracking-[0.32em] text-primary/80 transition-transform duration-300 group-hover:translate-x-1">
                  read on →
                </span>
                <span className="h-px flex-1 bg-foreground/15" />
                {lead.tags.length > 0 ? (
                  <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-muted-foreground/45">
                    {lead.tags.slice(0, 3).join(' · ')}
                  </span>
                ) : null}
              </div>
            </Link>
          </motion.article>
        ) : null}
      </AnimatePresence>

      {/* ─── Recent dispatches: column grid ─── */}
      {rest.length > 0 ? (
        <section className="flex flex-col gap-6">
          <div className="flex items-baseline justify-between border-b border-foreground/20 pb-2">
            <h3 className="font-serif text-xl tracking-tight text-foreground">
              Recent Dispatches
            </h3>
            <span className="font-mono text-[10px] uppercase tracking-[0.32em] text-muted-foreground/55">
              {rest.length.toString().padStart(2, '0')} filed
            </span>
          </div>

          <div className="grid gap-x-10 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 sm:[&>*:not(:nth-child(2n))]:border-r sm:[&>*:not(:nth-child(2n))]:border-foreground/10 sm:[&>*:not(:nth-child(2n))]:pr-10 lg:[&>*:not(:nth-child(2n))]:border-r-0 lg:[&>*:not(:nth-child(2n))]:pr-0 lg:[&>*:not(:nth-child(3n))]:border-r lg:[&>*:not(:nth-child(3n))]:border-foreground/10 lg:[&>*:not(:nth-child(3n))]:pr-10">
            <AnimatePresence mode="popLayout">
              {rest.map((post, index) => (
                <DispatchEntry key={post.slug} post={post} index={index + 2} />
              ))}
            </AnimatePresence>
          </div>
        </section>
      ) : null}

      {/* ─── Footer / colophon ─── */}
      <motion.footer
        variants={PAGE_ITEM_VARIANTS}
        className="flex flex-col gap-6 border-t-4 border-double border-foreground/25 pt-8 sm:flex-row sm:items-end sm:justify-between"
      >
        <div className="flex items-end gap-6">
          <img
            src="/frieren/frieren-teach.svg"
            className="inline-block h-16 align-bottom sm:h-22"
            alt=""
            data-backlight="off"
          />
          <div className="space-y-1">
            <p className="font-serif text-base italic text-foreground/85">
              Set in Georgia. Printed in real time.
            </p>
            <p className="font-mono text-[10px] uppercase tracking-[0.32em] text-muted-foreground/55">
              colophon · the field periodical
            </p>
          </div>
        </div>
        <Link
          to="/"
          className="font-mono text-[10px] uppercase tracking-[0.28em] text-muted-foreground/55 transition-colors hover:text-primary"
        >
          ← home
        </Link>
      </motion.footer>
    </PageLayout>
  )
}

function ClassifiedTag({
  label,
  active,
  onClick,
}: {
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`shrink-0 font-serif text-xs italic tracking-tight transition-colors duration-200 ${
        active
          ? 'text-primary underline decoration-primary/60 underline-offset-4'
          : 'text-muted-foreground/65 hover:text-foreground'
      }`}
    >
      {label}
    </button>
  )
}

function DispatchEntry({
  post,
  index,
}: {
  post: ReturnType<typeof Route.useLoaderData>['posts'][number]
  index: number
}) {
  return (
    <motion.article
      layout
      layoutId={post.slug}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.45, ease: [0.25, 0.1, 0.25, 1] }}
      className="flex flex-col gap-3"
    >
      <Link
        to="/blog/$slug"
        params={{ slug: post.slug }}
        className="group flex h-full flex-col gap-3"
      >
        <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.28em] text-muted-foreground/55">
          <span className="text-primary/70">
            № {index.toString().padStart(2, '0')}
          </span>
          <span className="h-px w-4 bg-foreground/20" />
          <span>
            {post.categories.length > 0 ? post.categories[0] : 'essay'}
          </span>
        </div>

        <h4 className="font-serif text-xl leading-[1.18] tracking-tight text-foreground transition-colors duration-300 group-hover:text-primary sm:text-2xl">
          {post.title}
        </h4>

        <p className="font-serif text-xs italic text-muted-foreground/70">
          {formatDate(post.date)}
        </p>

        <p className="line-clamp-3 text-sm leading-7 text-foreground/72">
          {post.summary}
        </p>

        <div className="mt-auto flex items-end justify-between gap-3 pt-2">
          {post.tags.length > 0 ? (
            <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-muted-foreground/40">
              {post.tags.slice(0, 2).join(' · ')}
            </p>
          ) : (
            <span />
          )}
          <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-primary/70 transition-transform duration-300 group-hover:translate-x-1">
            cont. →
          </span>
        </div>
      </Link>
    </motion.article>
  )
}

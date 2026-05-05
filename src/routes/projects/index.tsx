import { Link, createFileRoute } from '@tanstack/react-router'
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useMemo, useState } from 'react'
import { siteMeta } from '@/config/site-data'
import { getProjectIndex } from '@/lib/content'
import { formatDate } from '@/lib/format'
import { PageLayout, PAGE_ITEM_VARIANTS } from '@/layout/layout'

export const Route = createFileRoute('/projects/')({
  validateSearch: (search: Record<string, unknown>): { tag?: string } =>
    typeof search.tag === 'string' ? { tag: search.tag } : {},
  loader: async () => ({
    projects: await getProjectIndex(),
  }),
  head: ({ loaderData }) => {
    const title = `Projects | ${siteMeta.defaultTitle}`
    const description = 'Selected projects across Android, AI, and web.'
    const imageUrl = `${siteMeta.baseUrl}${siteMeta.defaultImage}`
    const canonicalUrl = `${siteMeta.baseUrl}/projects`
    const projects = loaderData?.projects ?? []

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
            name: 'Projects',
            description: 'Selected projects across Android, AI, and web.',
            url: canonicalUrl,
            mainEntity: {
              '@type': 'ItemList',
              itemListElement: projects.map((project, index) => ({
                '@type': 'ListItem',
                position: index + 1,
                url: `${siteMeta.baseUrl}/projects/${project.slug}`,
                name: project.title,
                description: project.summary,
                image: project.image
                  ? `${siteMeta.baseUrl}${project.image}`
                  : `${siteMeta.baseUrl}/og/projects/${project.slug}`,
                datePublished: project.date,
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
                name: 'Projects',
                item: canonicalUrl,
              },
            ],
          }),
        },
      ],
    }
  },
  component: ProjectsIndex,
})

function ProjectsIndex() {
  const { projects } = Route.useLoaderData()
  const { tag: urlTag } = Route.useSearch()
  const [activeCategory, setActiveCategory] = useState<string | null>(
    urlTag ?? null,
  )

  useEffect(() => {
    setActiveCategory(urlTag ?? null)
  }, [urlTag])

  const allCategories = useMemo(
    () => Array.from(new Set(projects.flatMap((project) => project.categories))),
    [projects],
  )

  const filteredProjects = activeCategory
    ? projects.filter(
        (p) =>
          p.categories.includes(activeCategory) ||
          p.tags.includes(activeCategory) ||
          p.stack.includes(activeCategory),
      )
    : projects

  const stackSurfaces = useMemo(
    () => Array.from(new Set(projects.flatMap((p) => p.stack))).length,
    [projects],
  )
  const yearsSpan = useMemo(() => {
    if (projects.length === 0) return '—'
    const years = projects.map((p) => new Date(p.date).getFullYear())
    const min = Math.min(...years)
    const max = Math.max(...years)
    return min === max ? `${min}` : `${min}–${max}`
  }, [projects])

  const featured = filteredProjects[0]
  const rest = filteredProjects.slice(1)

  return (
    <PageLayout>
      {/* ─── Masthead: spec sheet ─── */}
      <motion.header variants={PAGE_ITEM_VARIANTS} className="relative">
        <div className="instrument-panel relative border border-foreground/10">
          <span className="instrument-bracket-bl" />
          <span className="instrument-bracket-br" />

          {/* bezel */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-foreground/10 bg-background/40 px-4 py-3 backdrop-blur-sm sm:px-6">
            <div className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.28em] text-muted-foreground/65">
              <span className="flex h-4 w-4 items-center justify-center border border-foreground/20 text-[8px] text-foreground/60">
                ◇
              </span>
              <span>registry · vol·001</span>
            </div>
            <Link
              to="/"
              className="font-mono text-[10px] uppercase tracking-[0.28em] text-muted-foreground/55 transition-colors hover:text-primary"
            >
              ← return ⁄ home
            </Link>
          </div>

          <div className="grid gap-10 px-4 py-8 sm:px-8 sm:py-12 lg:grid-cols-[1.4fr_1fr] lg:gap-14">
            <div className="flex flex-col gap-5">
              <p className="font-mono text-[10px] uppercase tracking-[0.32em] text-primary/60">
                ▸ engineering registry
              </p>
              <h1 className="font-serif text-4xl leading-[1.02] tracking-tight text-foreground sm:text-5xl xl:text-6xl">
                Curated builds,
                <br />
                <em className="font-serif italic text-primary">indexed</em> by hand.
              </h1>
              <p className="max-w-xl font-mono text-xs leading-7 text-muted-foreground/80 sm:text-[13px]">
                A working registry of projects built across Android, web, AI, and
                systems. Each entry carries its own stack manifest, build year,
                and write-up. No filler, no portfolio padding.
              </p>
            </div>

            {/* spec readout */}
            <div className="grid grid-cols-2 self-end gap-px border border-foreground/10 bg-foreground/8 lg:grid-cols-2">
              <SpecCell
                label="builds"
                value={projects.length.toString().padStart(3, '0')}
              />
              <SpecCell
                label="categories"
                value={allCategories.length.toString().padStart(2, '0')}
              />
              <SpecCell
                label="stack surfaces"
                value={stackSurfaces.toString().padStart(2, '0')}
              />
              <SpecCell label="span" value={yearsSpan} />
            </div>
          </div>

          {/* ekg-style bottom rule */}
          <div className="border-t border-foreground/10 bg-background/40 px-4 py-2 sm:px-6">
            <div className="animus-sync-bar" />
          </div>
        </div>
      </motion.header>

      {/* ─── Filter rail ─── */}
      {allCategories.length > 0 ? (
        <motion.div
          variants={PAGE_ITEM_VARIANTS}
          className="sticky top-0 z-30 -mx-4 border-y border-border/15 bg-background/85 px-4 py-3 backdrop-blur-xl sm:-mx-6 sm:px-6"
        >
          <div className="flex items-center gap-4 overflow-x-auto scrollbar-hide">
            <span className="shrink-0 font-mono text-[10px] uppercase tracking-[0.28em] text-muted-foreground/50">
              filter ::
            </span>
            <div className="flex gap-2">
              <FilterTag
                label="all"
                active={activeCategory === null}
                onClick={() => setActiveCategory(null)}
              />
              {allCategories.map((cat) => (
                <FilterTag
                  key={cat}
                  label={cat}
                  active={activeCategory === cat}
                  onClick={() =>
                    setActiveCategory(activeCategory === cat ? null : cat)
                  }
                />
              ))}
            </div>
          </div>
        </motion.div>
      ) : null}

      {/* ─── Featured build ─── */}
      <AnimatePresence mode="popLayout">
        {featured ? (
          <motion.div
            key={`featured-${featured.slug}`}
            layout
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <Link
              to="/projects/$slug"
              params={{ slug: featured.slug }}
              className="animus-corner group block border border-foreground/10"
            >
              <div className="grid gap-0 lg:grid-cols-[1.1fr_1fr]">
                <div className="media-hover-parent relative aspect-video overflow-hidden bg-foreground/5 lg:aspect-auto">
                  <img
                    src={featured.image || `/og/projects/${featured.slug}`}
                    alt={featured.title}
                    className="media-hover-image absolute inset-0 h-full w-full object-cover"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-linear-to-r from-card/30 via-transparent to-transparent" />
                  <div className="absolute left-3 top-3 font-mono text-[10px] uppercase tracking-[0.28em] text-foreground/85 mix-blend-difference">
                    flagship · 0001
                  </div>
                </div>

                <div className="flex flex-col justify-between gap-6 bg-card/40 p-6 sm:p-8">
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.28em] text-muted-foreground/60">
                      <span className="text-primary/70">
                        {featured.categories[0] ?? 'project'}
                      </span>
                      <span className="h-px flex-1 bg-foreground/10" />
                      <span>{formatDate(featured.date)}</span>
                    </div>
                    <h2 className="font-serif text-2xl leading-tight tracking-tight text-foreground transition-colors duration-300 group-hover:text-primary sm:text-4xl">
                      {featured.title}
                    </h2>
                    <p className="text-sm leading-7 text-foreground/70">
                      {featured.summary}
                    </p>
                  </div>

                  <div className="space-y-3 border-t border-foreground/10 pt-4">
                    <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-muted-foreground/50">
                      stack manifest
                    </p>
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-[11px] tracking-tight text-foreground/75">
                      {featured.stack.map((s, i) => (
                        <span key={s} className="flex items-center gap-2">
                          <span>{s}</span>
                          {i < featured.stack.length - 1 ? (
                            <span className="text-primary/40">/</span>
                          ) : null}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center justify-between pt-2">
                      <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-muted-foreground/50">
                        open file
                      </span>
                      <span className="font-mono text-xs text-primary/80 transition-transform duration-300 group-hover:translate-x-1">
                        →
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {/* ─── Registry index ─── */}
      <div>
        <div className="mb-3 flex items-baseline justify-between border-b border-foreground/10 pb-2">
          <p className="font-mono text-[10px] uppercase tracking-[0.32em] text-muted-foreground/60">
            ▸ index of builds
          </p>
          <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-muted-foreground/40">
            {rest.length.toString().padStart(2, '0')} entries
          </p>
        </div>

        <ol className="divide-y divide-foreground/8">
          <AnimatePresence mode="popLayout">
            {rest.map((project, index) => (
              <RegistryRow
                key={project.slug}
                index={index + 2}
                project={project}
              />
            ))}
          </AnimatePresence>
        </ol>
      </div>

      {/* ─── Footer ─── */}
      <motion.footer
        variants={PAGE_ITEM_VARIANTS}
        className="flex flex-col gap-6 border-t border-foreground/10 pt-8 sm:flex-row sm:items-end sm:justify-between"
      >
        <div className="flex items-end gap-6">
          <img
            src="/frieren/frieren.svg"
            className="inline-block h-16 align-bottom sm:h-22"
            alt=""
            data-backlight="off"
          />
          <div className="space-y-2">
            <p className="font-mono text-[10px] uppercase tracking-[0.32em] text-primary/60">
              ▸ end of registry
            </p>
            <p className="max-w-md font-mono text-[11px] leading-6 text-muted-foreground/70">
              Each entry opens to a build log: architecture notes, the technical
              decisions, and the writing.
            </p>
          </div>
        </div>
        <Link
          to="/"
          className="font-mono text-[10px] uppercase tracking-[0.28em] text-muted-foreground/55 transition-colors hover:text-primary"
        >
          ← return ⁄ home
        </Link>
      </motion.footer>
    </PageLayout>
  )
}

function SpecCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 bg-background/55 px-4 py-3">
      <p className="font-mono text-[9px] uppercase tracking-[0.32em] text-muted-foreground/55">
        {label}
      </p>
      <p className="font-serif text-2xl tracking-tight text-foreground">
        {value}
      </p>
    </div>
  )
}

function FilterTag({
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
      className={`shrink-0 border px-3 py-1 font-mono text-[10px] uppercase tracking-[0.22em] transition-all duration-200 ${
        active
          ? 'border-primary bg-primary/15 text-primary'
          : 'border-foreground/15 text-muted-foreground/70 hover:border-foreground/35 hover:text-foreground'
      }`}
    >
      [{label}]
    </button>
  )
}

function RegistryRow({
  index,
  project,
}: {
  index: number
  project: ReturnType<typeof Route.useLoaderData>['projects'][number]
}) {
  const visual = project.image || `/og/projects/${project.slug}`
  return (
    <motion.li
      layout
      layoutId={project.slug}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.45, ease: [0.25, 0.1, 0.25, 1] }}
    >
      <Link
        to="/projects/$slug"
        params={{ slug: project.slug }}
        className="group grid grid-cols-[auto_1fr] items-start gap-x-5 gap-y-3 py-6 transition-colors duration-300 hover:bg-foreground/3 sm:grid-cols-[auto_1fr_auto] sm:gap-x-8 sm:px-2"
      >
        <div className="flex flex-col gap-2 pt-1">
          <span className="font-mono text-[11px] tracking-[0.18em] text-primary/60">
            {index.toString().padStart(4, '0')}
          </span>
          <span className="font-mono text-[9px] uppercase tracking-[0.28em] text-muted-foreground/50">
            {new Date(project.date).getFullYear()}
          </span>
        </div>

        <div className="flex flex-col gap-3 min-w-0">
          <div className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.24em] text-muted-foreground/55">
            <span className="text-primary/70">
              {project.categories[0] ?? 'project'}
            </span>
            <span className="h-px w-6 bg-foreground/15" />
            <span>{formatDate(project.date)}</span>
          </div>
          <h3 className="font-serif text-xl leading-tight tracking-tight text-foreground transition-colors duration-300 group-hover:text-primary sm:text-2xl">
            {project.title}
          </h3>
          <p className="line-clamp-2 max-w-2xl text-sm leading-7 text-foreground/70">
            {project.summary}
          </p>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 pt-1 font-mono text-[10px] tracking-tight text-muted-foreground/65">
            {project.stack.slice(0, 5).map((s, i) => (
              <span key={s} className="flex items-center gap-2">
                <span>{s}</span>
                {i < Math.min(project.stack.length, 5) - 1 ? (
                  <span className="text-primary/35">/</span>
                ) : null}
              </span>
            ))}
            {project.stack.length > 5 ? (
              <span className="text-muted-foreground/40">
                +{project.stack.length - 5}
              </span>
            ) : null}
          </div>
        </div>

        <div className="hidden sm:block">
          <div className="media-hover-parent animus-corner relative h-24 w-40 overflow-hidden border border-foreground/10 bg-foreground/5">
            <img
              src={visual}
              alt=""
              className="media-hover-image absolute inset-0 h-full w-full object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-linear-to-t from-card/40 via-transparent to-transparent" />
          </div>
          <div className="mt-2 flex items-center justify-end gap-1 font-mono text-[10px] uppercase tracking-[0.24em] text-muted-foreground/50 transition-colors group-hover:text-primary">
            <span>open</span>
            <span className="transition-transform duration-300 group-hover:translate-x-1">
              →
            </span>
          </div>
        </div>
      </Link>
    </motion.li>
  )
}

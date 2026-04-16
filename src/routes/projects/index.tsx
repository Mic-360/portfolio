import { Link, createFileRoute } from '@tanstack/react-router'
import { AnimatePresence, motion } from 'motion/react'
import { useState } from 'react'
import LayersIcon from '@/components/ui/layers-icon'
import { siteMeta } from '@/config/site-data'
import { getProjectIndex } from '@/lib/content'
import { formatDate } from '@/lib/format'

export const Route = createFileRoute('/projects/')({
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
  const [activeCategory, setActiveCategory] = useState<string | null>(null)

  const allCategories = Array.from(
    new Set(projects.flatMap((project) => project.categories)),
  )

  const filteredProjects = activeCategory
    ? projects.filter((p) => p.categories.includes(activeCategory))
    : projects

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
        <div className="pointer-events-none absolute inset-x-[18%] top-0 h-28 rounded-full bg-primary/10 blur-3xl" />
        <div className="pointer-events-none absolute right-[6%] top-[10%] h-72 w-72 rounded-full bg-primary/6 blur-[120px]" />

        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <span className="text-primary/50">
              <LayersIcon size={18} />
            </span>
            <span className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground/50">
              projects archive
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
              Every project, one archive.
            </h1>
            <p className="max-w-2xl text-base leading-8 text-foreground/50 sm:text-lg">
              An archive of Android, web, AI, and systems projects. Each build
              has its own atmosphere, technical footprint, and path into the
              full write-up.
            </p>
          </div>

          <div className="flex items-center justify-between gap-4">
            <div className="space-y-1">
              <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/40">
                selected builds
              </p>
              <p className="font-serif text-2xl text-foreground">
                {projects.length.toString().padStart(2, '0')}
              </p>
            </div>
          </div>
        </div>
      </motion.header>

      {allCategories.length > 0 ? (
        <motion.div
          variants={item}
          className="sticky top-0 z-30 -mx-4 px-4 py-3 backdrop-blur-xl bg-background/80 border-b border-border/10"
        >
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
            <button
              type="button"
              onClick={() => setActiveCategory(null)}
              className={`filter-pill ${
                activeCategory === null
                  ? 'filter-pill-active'
                  : 'filter-pill-inactive'
              }`}
            >
              All
            </button>
            {allCategories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() =>
                  setActiveCategory(activeCategory === cat ? null : cat)
                }
                className={`filter-pill ${
                  activeCategory === cat
                    ? 'filter-pill-active'
                    : 'filter-pill-inactive'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </motion.div>
      ) : null}

      <div className="grid gap-6 sm:grid-cols-2">
        <AnimatePresence mode="popLayout">
          {filteredProjects.map((project, index) => {
            const projectVisual =
              project.image || `/og/projects/${project.slug}`
            const isHero = index % 3 === 0

            return (
              <motion.div
                key={project.slug}
                layout
                layoutId={project.slug}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{
                  duration: 0.5,
                  ease: [0.25, 0.1, 0.25, 1],
                  layout: { duration: 0.4 },
                }}
                className={isHero ? 'sm:col-span-2' : 'sm:col-span-1'}
              >
                <Link
                  to="/projects/$slug"
                  params={{ slug: project.slug }}
                  className="group block"
                >
                  <motion.article
                    whileHover={{ y: -4 }}
                    transition={{
                      type: 'spring',
                      stiffness: 300,
                      damping: 20,
                    }}
                    className="project-card-apple overflow-hidden rounded-2xl border border-border/10 bg-card/50"
                  >
                    <div
                      className={`media-hover-parent relative overflow-hidden ${
                        isHero ? 'aspect-video' : 'aspect-4/3'
                      }`}
                    >
                      <img
                        src={projectVisual}
                        alt={project.title}
                        className="media-hover-image absolute inset-0 h-full w-full object-cover"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-linear-to-t from-card/60 via-transparent to-transparent" />
                    </div>

                    <div className="flex flex-col gap-3 p-5 sm:p-6">
                      <div className="flex items-center justify-between gap-4">
                        <p className="text-[10px] uppercase tracking-[0.2em] text-primary/50">
                          {project.categories.length > 0
                            ? project.categories[0]
                            : 'project'}
                        </p>
                        <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/40">
                          {formatDate(project.date)}
                        </p>
                      </div>

                      <h2 className="font-serif text-xl leading-tight tracking-tight text-foreground transition-colors duration-300 group-hover:text-primary sm:text-2xl">
                        {project.title}
                      </h2>

                      <p
                        className={`text-sm leading-7 text-foreground/50 ${
                          isHero ? 'max-w-2xl' : 'line-clamp-2'
                        }`}
                      >
                        {project.summary}
                      </p>

                      <div className="flex items-center justify-between gap-4 border-t border-border/10 pt-3">
                        <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/35">
                          {project.stack.slice(0, 4).join(' \u00b7 ')}
                        </p>
                        <span className="text-xs text-primary/60 transition-transform duration-300 group-hover:translate-x-1">
                          &rarr;
                        </span>
                      </div>
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
            src="/frieren/frieren.svg"
            className="inline-block h-16 align-bottom sm:h-22"
            alt=""
            data-backlight="off"
          />
          <p className="max-w-2xl text-sm leading-7 text-muted-foreground/40">
            Each project opens into a fuller build story with the technical
            breakdown, writing, and outbound links.
          </p>
        </div>
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs text-muted-foreground/40 transition-colors duration-300 hover:text-primary"
        >
          <span>&larr;</span>
          back home
        </Link>
      </motion.footer>
    </motion.section>
  )
}

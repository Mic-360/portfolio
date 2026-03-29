import { Link, createFileRoute } from '@tanstack/react-router'
import { motion } from 'motion/react'
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
  const featuredCategories = Array.from(
    new Set(projects.flatMap((project) => project.categories)),
  ).slice(0, 4)

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 14 },
    show: { opacity: 1, y: 0, transition: { duration: 0.45 } },
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
        <div className="pointer-events-none absolute inset-x-[18%] top-0 h-28 rounded-full bg-primary/14 blur-3xl" />
        <div className="pointer-events-none absolute right-[6%] top-[10%] h-72 w-72 rounded-full bg-primary/8 blur-[120px]" />

        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-primary">
              <LayersIcon size={22} />
            </span>
            <span className="text-lg uppercase tracking-[0.28em] text-primary/75">
              projects archive
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
        <div className="flex flex-col gap-7 pt-6 lg:pt-10">
          <div className="grid gap-4">
            <h1 className="font-serif text-5xl leading-none text-foreground sm:text-6xl xl:text-7xl">
              Software work shown as scenes, not guides.
            </h1>
            <p className="max-w-4xl text-base leading-8 text-foreground/76 sm:text-lg">
              An archive of Android, web, AI, and systems projects. Each build
              has its own atmosphere, technical footprint, and path into the
              full write-up without the archive hero needing a featured frame.
            </p>
          </div>

          <div className="grid gap-5 border-t border-border/25 pt-5 sm:grid-cols-2">
            <div className="space-y-1">
              <p className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
                selected builds
              </p>
              <p className="text-2xl font-serif text-foreground">
                {projects.length.toString().padStart(2, '0')}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
                lanes
              </p>
              <p className="text-sm leading-7 text-foreground/76">
                {featuredCategories.length > 0
                  ? featuredCategories.join(' · ')
                  : 'android · ai · web · systems'}
              </p>
            </div>
          </div>
        </div>
      </motion.header>

      <div className="divide-y divide-border/20">
        {projects.map((project, index) => {
          const projectVisual = project.image || `/og/projects/${project.slug}`
          const reverse = index % 2 === 1

          return (
            <motion.div
              key={project.slug}
              variants={item}
              className="py-10 first:pt-0 md:py-14"
            >
              <Link
                to="/projects/$slug"
                params={{ slug: project.slug }}
                className="group block"
              >
                <article className="relative min-h-[340px]">
                  <div
                    className={`media-hover-parent absolute inset-y-0 ${
                      reverse
                        ? 'left-0 right-[12%] md:right-[34%]'
                        : 'left-[12%] right-0 md:left-[34%]'
                    }`}
                  >
                    <img
                      src={projectVisual}
                      alt={project.title}
                      className="project-ambient-media absolute inset-0 h-full w-full object-contain"
                    />
                    <div
                      className={`absolute inset-0 ${
                        reverse
                          ? 'project-ambient-overlay bg-linear-to-r from-transparent via-background/38 to-background'
                          : 'project-ambient-overlay bg-linear-to-l from-transparent via-background/38 to-background'
                      }`}
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-background via-background/10 to-transparent" />
                  </div>

                  <div className="relative z-10 grid gap-8 lg:min-h-[340px] lg:grid-cols-12 lg:items-center">
                    <div
                      className={`flex flex-col gap-5 ${
                        reverse
                          ? 'lg:col-start-7 lg:col-span-6 lg:text-right'
                          : 'lg:col-span-6'
                      }`}
                    >
                      <div className="flex items-end gap-4">
                        {!reverse ? (
                          <span className="font-serif text-[3.5rem] leading-none text-foreground/9 sm:text-[5rem]">
                            {(index + 1).toString().padStart(2, '0')}
                          </span>
                        ) : null}
                        <div
                          className={`space-y-3 ${reverse ? 'ml-auto' : ''}`}
                        >
                          <p className="text-[10px] uppercase tracking-[0.26em] text-primary/75">
                            selected build
                          </p>
                          <div className="space-y-2">
                            <p className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
                              {formatDate(project.date)}
                            </p>
                            <h2 className="font-serif text-3xl leading-tight text-foreground transition-colors group-hover:text-primary sm:text-4xl">
                              {project.title}
                            </h2>
                          </div>
                        </div>
                        {reverse ? (
                          <span className="font-serif text-[3.5rem] leading-none text-foreground/9 sm:text-[5rem]">
                            {(index + 1).toString().padStart(2, '0')}
                          </span>
                        ) : null}
                      </div>

                      <p className="max-w-2xl text-base leading-8 text-foreground/76">
                        {project.summary}
                      </p>

                      <div
                        className={`grid gap-4 border-t border-border/20 pt-4 text-sm leading-7 text-foreground/72 sm:grid-cols-2 ${
                          reverse ? 'lg:text-right' : ''
                        }`}
                      >
                        <div className="space-y-1">
                          <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                            stack
                          </p>
                          <p>
                            {project.stack.length > 0
                              ? project.stack.join(' · ')
                              : 'full stack build'}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                            focus
                          </p>
                          <p>
                            {project.categories.length > 0
                              ? project.categories.join(' · ')
                              : 'product engineering'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
              </Link>
            </motion.div>
          )
        })}
      </div>

      <motion.footer
        variants={item}
        className="flex flex-col gap-4 border-t border-border/20 pt-6 sm:flex-row sm:items-end sm:justify-between"
      >
        <div className='flex gap-6 items-end'>
          <img
            src="/frieren/frieren.svg"
            className="h-16 sm:h-22 inline-block align-bottom"
          />
          <p className="max-w-2xl text-sm leading-7 text-muted-foreground">
            Each project opens into a fuller build story with the technical
            breakdown, writing, and outbound links.
          </p>
        </div>{' '}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary"
        >
          <span>←</span>
          back home
        </Link>
      </motion.footer>
    </motion.section>
  )
}

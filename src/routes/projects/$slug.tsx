import { Link, createFileRoute } from '@tanstack/react-router'
import { motion } from 'motion/react'
import { siteMeta } from '@/config/site-data'
import { getProjectBySlug } from '@/lib/content'
import { formatDate } from '@/lib/format'

export const Route = createFileRoute('/projects/$slug')({
  loader: async ({ params }) => ({
    project: await getProjectBySlug({ data: { slug: params.slug } }),
  }),
  head: ({ loaderData }) => {
    if (!loaderData?.project) {
      return {
        meta: [{ title: `Projects | ${siteMeta.defaultTitle}` }],
      }
    }

    const { project } = loaderData
    const title = `${project.title} | ${siteMeta.defaultTitle}`
    const description = project.summary
    const imageUrl = project.image
      ? `${siteMeta.baseUrl}${project.image}`
      : `${siteMeta.baseUrl}/og/projects/${project.slug}`
    const keywords = [...project.categories, ...project.tags].join(', ')
    const canonicalUrl = `${siteMeta.baseUrl}/projects/${project.slug}`

    return {
      meta: [
        { title },
        { name: 'description', content: description },
        { name: 'keywords', content: keywords },
        { name: 'robots', content: 'index, follow' },
        { property: 'og:title', content: title },
        { property: 'og:description', content: description },
        { property: 'og:type', content: 'article' },
        {
          property: 'og:url',
          content: canonicalUrl,
        },
        { property: 'og:image', content: imageUrl },
        { property: 'og:image:width', content: '1200' },
        { property: 'og:image:height', content: '630' },
        { property: 'og:image:type', content: 'image/svg+xml' },
        { property: 'og:image:alt', content: project.title },
        { property: 'article:published_time', content: project.date },
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: title },
        { name: 'twitter:description', content: description },
        { name: 'twitter:image', content: imageUrl },
        { name: 'twitter:image:alt', content: project.title },
        ...project.categories.map((category) => ({
          property: 'article:section',
          content: category,
        })),
        ...project.tags.map((tag) => ({
          property: 'article:tag',
          content: tag,
        })),
      ],
      links: [{ rel: 'canonical', href: canonicalUrl }],
      scripts: [
        {
          type: 'application/ld+json',
          children: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'CreativeWork',
            name: project.title,
            description: project.summary,
            datePublished: project.date,
            image: imageUrl,
            url: canonicalUrl,
            keywords: [...project.categories, ...project.tags].join(', '),
            author: {
              '@type': 'Person',
              name: siteMeta.siteName,
              url: siteMeta.baseUrl,
            },
            inLanguage: 'en-US',
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
                item: `${siteMeta.baseUrl}/projects`,
              },
              {
                '@type': 'ListItem',
                position: 3,
                name: project.title,
                item: canonicalUrl,
              },
            ],
          }),
        },
      ],
    }
  },
  component: ProjectDetail,
})

function ProjectDetail() {
  const { project } = Route.useLoaderData()

  if (!project) {
    return (
      <section className="flex flex-col gap-4">
        <h1 className="text-lg font-semibold italic">project not found</h1>
        <Link
          to="/projects"
          className="text-xs uppercase tracking-[0.2em] text-primary transition-colors hover:text-primary/80"
        >
          back to projects
        </Link>
      </section>
    )
  }

  const projectVisual = project.image || `/og/projects/${project.slug}`
  const detailRows = [
    {
      label: 'published',
      value: formatDate(project.date),
    },
    {
      label: 'stack',
      value:
        project.stack.length > 0
          ? project.stack.join(' · ')
          : 'full stack build',
    },
    {
      label: 'categories',
      value:
        project.categories.length > 0
          ? project.categories.join(' · ')
          : 'product engineering',
    },
    {
      label: 'tags',
      value:
        project.tags.length > 0 ? project.tags.join(' · ') : 'selected work',
    },
  ]

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
    hidden: { opacity: 0, y: 14 },
    show: { opacity: 1, y: 0, transition: { duration: 0.45 } },
  }

  return (
    <motion.article
      variants={container}
      initial="hidden"
      animate="show"
      className="mx-auto flex w-full max-w-[1500px] flex-col gap-14 pb-16"
    >
      <motion.section
        variants={item}
        className="relative overflow-hidden border-b border-border/20 pb-12"
      >
        <div className="pointer-events-none absolute inset-x-[16%] top-[10%] h-28 rounded-full bg-primary/14 blur-3xl" />
        <div className="pointer-events-none absolute right-[8%] top-[12%] h-72 w-72 rounded-full bg-primary/8 blur-[120px]" />

        <div className="flex items-center justify-between gap-4 mb-6">
          <p className="text-lg uppercase tracking-[0.28em] text-primary/75">
            project dossier
          </p>
          <Link
            to="/projects"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary"
          >
            <span>←</span>
            archive
          </Link>
        </div>
        <div className="grid gap-10 lg:grid-cols-[minmax(0,0.76fr)_minmax(0,1.24fr)] lg:items-end">
          <div className="flex flex-col gap-7 pt-6 lg:pt-10">
            <div className="grid gap-4">
              <p className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
                {formatDate(project.date)}
              </p>
              <h1 className="max-w-3xl font-serif text-5xl leading-none text-foreground sm:text-6xl xl:text-7xl">
                {project.title}
              </h1>
              <p className="max-w-xl text-base leading-8 text-foreground/76 sm:text-lg">
                {project.summary}
              </p>
            </div>

            <div className="grid gap-5 border-t border-border/25 pt-5 sm:grid-cols-2">
              <div className="space-y-1">
                <p className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
                  build lane
                </p>
                <p className="text-sm leading-7 text-foreground/76">
                  {project.categories.length > 0
                    ? project.categories.join(' · ')
                    : 'selected work'}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
                  quick take
                </p>
                <p className="text-sm leading-7 text-foreground/76">
                  Built as a full project story with implementation notes,
                  supporting visuals, and direct links out.
                </p>
              </div>
            </div>
          </div>

          <div className="relative min-h-[320px] lg:min-h-[520px]">
            <img
              src={projectVisual}
              alt={project.title}
              className="hero-blend-media media-hover-image media-hover-fade absolute inset-y-[7%] right-0 h-[86%] w-[96%] object-contain"
            />
            <div className="hero-grid-overlay absolute inset-y-[10%] right-[4%] w-[82%]" />
            <div className="pointer-events-none absolute inset-y-[14%] right-[14%] w-[36%] border-l border-primary/18" />

            <div className="absolute inset-x-0 top-0 flex items-center justify-between gap-4 text-[10px] uppercase tracking-[0.28em] text-foreground/48">
              <span>{project.slug}</span>
              <span>selected build</span>
            </div>

            <div className="absolute inset-x-0 bottom-[5%] flex max-w-[80%] flex-col gap-2">
              <p className="text-[10px] uppercase tracking-[0.28em] text-primary/75">
                project surface
              </p>
              <p className="text-sm leading-7 text-foreground/72">
                Visual preview on the right, full build notes below.
              </p>
            </div>
          </div>
        </div>
      </motion.section>

      <motion.section
        variants={item}
        className="grid gap-12 lg:grid-cols-[minmax(220px,0.34fr)_minmax(0,0.66fr)]"
      >
        <aside className="grid content-start gap-10 lg:sticky lg:top-24">
          <div className="grid gap-5">
            <div className="flex items-center gap-4">
              <p className="shrink-0 text-[10px] uppercase tracking-[0.26em] text-primary/75">
                technical rail
              </p>
              <div className="h-px flex-1 bg-linear-to-r from-primary/30 to-transparent" />
            </div>

            <div className="divide-y divide-border/20">
              {detailRows.map((row) => (
                <div key={row.label} className="py-3 first:pt-0">
                  <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                    {row.label}
                  </p>
                  <p className="mt-2 text-sm leading-7 text-foreground/76">
                    {row.value}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {project.links.length > 0 ? (
            <div className="grid gap-5">
              <div className="flex items-center gap-4">
                <p className="shrink-0 text-[10px] uppercase tracking-[0.26em] text-primary/75">
                  outbound links
                </p>
                <div className="h-px flex-1 bg-linear-to-r from-primary/30 to-transparent" />
              </div>

              <div className="divide-y divide-border/20">
                {project.links.map((link, index) => (
                  <a
                    key={`${link.label}-${link.url}-${index}`}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between gap-4 py-3 text-sm leading-7 text-foreground/76 transition-colors hover:text-primary"
                  >
                    <span>{link.label}</span>
                    <span className="text-muted-foreground">↗</span>
                  </a>
                ))}
              </div>
            </div>
          ) : null}
        </aside>

        <div className="grid min-w-0 gap-6">
          <div className="flex items-center gap-4">
            <p className="shrink-0 text-[10px] uppercase tracking-[0.26em] text-primary/75">
              build notes
            </p>
            <div className="h-px flex-1 bg-linear-to-r from-primary/30 to-transparent" />
          </div>

          <div
            className="mdx-content min-w-0 flex flex-col gap-6 text-lg leading-relaxed text-foreground/86"
            dangerouslySetInnerHTML={{ __html: project.html }}
          />
        </div>
      </motion.section>

      <motion.footer
        variants={item}
        className="flex flex-col gap-4 border-t border-border/20 pt-6 sm:flex-row sm:items-center sm:justify-between"
      >
        <p className="max-w-2xl text-sm leading-7 text-muted-foreground">
          More builds in the archive to follow.
        </p>
        <Link
          to="/projects"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary"
        >
          <span>←</span>
          see more projects
        </Link>
      </motion.footer>
    </motion.article>
  )
}

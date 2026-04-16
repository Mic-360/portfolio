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
    <motion.article
      variants={container}
      initial="hidden"
      animate="show"
      className="mx-auto flex w-full max-w-[1500px] flex-col gap-20 pb-16 md:gap-28"
    >
      <motion.section
        variants={item}
        className="pb-12"
      >
        <div className="flex items-center justify-between gap-4 pb-10">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground/60">
            Project
          </p>
          <Link
            to="/projects"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground/50 transition-colors duration-300 hover:text-foreground"
          >
            <span>←</span>
            Back to projects
          </Link>
        </div>

        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-center">
          <div className="flex flex-col gap-6">
            <p className="text-xs text-muted-foreground/50">
              {formatDate(project.date)}
            </p>
            <h1 className="max-w-xl text-4xl font-semibold tracking-tight text-foreground sm:text-5xl xl:text-6xl">
              {project.title}
            </h1>
            <p className="max-w-lg text-lg leading-relaxed text-muted-foreground/70">
              {project.summary}
            </p>
            <div className="flex flex-wrap gap-2">
              {project.stack.length > 0
                ? project.stack.map((tech) => (
                    <span
                      key={tech}
                      className="rounded-full bg-foreground/[0.04] px-3 py-1 text-xs text-muted-foreground/60"
                    >
                      {tech}
                    </span>
                  ))
                : null}
            </div>
          </div>

          <div className="relative overflow-hidden rounded-3xl bg-foreground/[0.02]">
            <img
              src={projectVisual}
              alt={project.title}
              className="h-auto w-full object-contain"
            />
          </div>
        </div>

        <div className="mt-8 h-px w-full bg-border/10" />
      </motion.section>

      <motion.section
        variants={item}
        className="grid gap-16 lg:grid-cols-[minmax(200px,0.28fr)_minmax(0,0.72fr)]"
      >
        <aside className="grid content-start gap-8 lg:sticky lg:top-24">
          <div className="grid gap-4">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground/50">
              Details
            </p>
            <div className="grid gap-0">
              {detailRows.map((row) => (
                <div key={row.label} className="border-b border-border/10 py-3 first:pt-0">
                  <p className="text-xs text-muted-foreground/40">
                    {row.label}
                  </p>
                  <p className="mt-1 text-sm text-foreground/70">
                    {row.value}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {project.links.length > 0 ? (
            <div className="grid gap-4">
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground/50">
                Links
              </p>
              <div className="grid gap-0">
                {project.links.map((link, index) => (
                  <a
                    key={`${link.label}-${link.url}-${index}`}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between gap-4 border-b border-border/10 py-3 text-sm text-foreground/70 transition-colors duration-300 hover:text-foreground"
                  >
                    <span>{link.label}</span>
                    <span className="text-muted-foreground/40">↗</span>
                  </a>
                ))}
              </div>
            </div>
          ) : null}
        </aside>

        <div className="grid min-w-0 gap-0">
          <div
            className="mdx-content min-w-0 flex flex-col gap-6 text-lg leading-relaxed text-foreground/80"
            dangerouslySetInnerHTML={{ __html: project.html }}
          />
        </div>
      </motion.section>

      <motion.footer
        variants={item}
        className="flex flex-col gap-4 pt-6 sm:flex-row sm:items-center sm:justify-between"
      >
        <div className="h-px w-full bg-border/10 sm:hidden" />
        <p className="max-w-2xl text-sm text-muted-foreground/40">
          More projects in the archive.
        </p>
        <Link
          to="/projects"
          className="inline-flex items-center gap-2 rounded-full bg-foreground/[0.05] px-5 py-2.5 text-sm text-muted-foreground/60 transition-all duration-300 hover:bg-foreground/[0.08] hover:text-foreground"
        >
          <span>←</span>
          All projects
        </Link>
      </motion.footer>
    </motion.article>
  )
}

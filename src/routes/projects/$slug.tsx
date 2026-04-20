import { Link, createFileRoute } from '@tanstack/react-router'
import { motion, useScroll, useSpring } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import type { ProjectMeta } from '@/lib/content'
import { LinkPreview } from '@/components/ui/link-preview'
import { siteMeta } from '@/config/site-data'
import { getProjectBySlug, getProjectIndex } from '@/lib/content'
import { formatDate } from '@/lib/format'

export const Route = createFileRoute('/projects/$slug')({
  loader: async ({ params }) => {
    const [project, projects] = await Promise.all([
      getProjectBySlug({ data: { slug: params.slug } }),
      getProjectIndex(),
    ])

    let prevProject: ProjectMeta | null = null
    let nextProject: ProjectMeta | null = null

    if (project) {
      const idx = projects.findIndex((p) => p.slug === params.slug)
      if (idx > 0) prevProject = projects[idx - 1]
      if (idx < projects.length - 1) nextProject = projects[idx + 1]
    }

    return { project, prevProject, nextProject }
  },
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

function ReadingProgress() {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  })

  return <motion.div className="reading-progress" style={{ scaleX }} />
}

type TocHeading = { id: string; text: string; level: number }

function TableOfContents() {
  const [headings, setHeadings] = useState<Array<TocHeading>>([])
  const [activeId, setActiveId] = useState<string>('')

  useEffect(() => {
    const container = document.querySelector('.mdx-content')
    if (!container) return

    const elements = container.querySelectorAll('h2[id], h3[id]')
    const items: Array<TocHeading> = []
    elements.forEach((el) => {
      items.push({
        id: el.id,
        text: el.textContent || '',
        level: el.tagName === 'H2' ? 2 : 3,
      })
    })
    setHeadings(items)
  }, [])

  useEffect(() => {
    if (headings.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting)
        if (visible.length > 0) {
          setActiveId(visible[0].target.id)
        }
      },
      { rootMargin: '-80px 0px -70% 0px' },
    )

    headings.forEach((h) => {
      const el = document.getElementById(h.id)
      if (el) observer.observe(el)
    })

    return () => observer.disconnect()
  }, [headings])

  if (headings.length === 0) return null

  return (
    <nav className="flex flex-col gap-0.5">
      <p className="mb-3 text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground/70">
        On this page
      </p>
      {headings.map((h) => (
        <a
          key={h.id}
          href={`#${h.id}`}
          onClick={(e) => {
            e.preventDefault()
            document
              .getElementById(h.id)
              ?.scrollIntoView({ behavior: 'smooth' })
          }}
          className={`toc-link ${h.level === 3 ? 'toc-h3' : ''} ${
            activeId === h.id ? 'active' : ''
          }`}
        >
          {h.text}
        </a>
      ))}
    </nav>
  )
}

function ProjectDetail() {
  const { project, prevProject, nextProject } = Route.useLoaderData()
  const contentRef = useRef<HTMLDivElement>(null)

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
    { label: 'published', value: formatDate(project.date) },
    {
      label: 'stack',
      value:
        project.stack.length > 0
          ? project.stack.join(' \u00b7 ')
          : 'full stack build',
    },
    {
      label: 'categories',
      value:
        project.categories.length > 0
          ? project.categories.join(' \u00b7 ')
          : 'product engineering',
    },
    {
      label: 'tags',
      value:
        project.tags.length > 0
          ? project.tags.join(' \u00b7 ')
          : 'selected work',
    },
  ]

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.15 },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 40 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.9,
        ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number],
      },
    },
  }

  return (
    <>
      <ReadingProgress />

      <motion.article
        variants={container}
        initial="hidden"
        animate="show"
        className="mx-auto flex w-full max-w-375 flex-col gap-16 pb-16 md:gap-24 px-4 sm:px-6"
      >
        {/* Back navigation */}
        <motion.div
          variants={item}
          className="flex items-center justify-between gap-4"
        >
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground/60">
            Project
          </p>
          <Link
            to="/projects"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground/70 transition-colors duration-300 hover:text-foreground"
          >
            <span>&larr;</span>
            Back to projects
          </Link>
        </motion.div>

        {/* Cinematic Hero */}
        <motion.section
          variants={item}
          className="relative -mx-4 sm:-mx-6 lg:-mx-8 overflow-hidden"
        >
          <div className="relative aspect-video sm:aspect-21/9 w-full overflow-hidden bg-card/30">
            <img
              src={projectVisual}
              alt={project.title}
              className="absolute inset-0 h-full w-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-linear-to-t from-background via-background/50 to-transparent" />
            <div className="absolute inset-0 bg-linear-to-r from-background/60 via-transparent to-transparent" />
          </div>

          <div className="absolute inset-x-0 bottom-0 z-10 p-6 sm:p-8 lg:p-12">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: 0.3,
                duration: 0.8,
                ease: [0.25, 0.1, 0.25, 1],
              }}
              className="flex max-w-2xl flex-col gap-4"
            >
              <p className="text-[10px] uppercase tracking-[0.25em] text-primary">
                {formatDate(project.date)}
              </p>
              <h1 className="font-serif text-3xl leading-[1.08] tracking-tight text-foreground sm:text-4xl lg:text-5xl xl:text-6xl">
                {project.title}
              </h1>
            </motion.div>
          </div>
        </motion.section>

        {/* Content area */}
        <motion.section
          variants={item}
          className="grid gap-12 lg:grid-cols-[minmax(180px,0.22fr)_minmax(0,0.78fr)] xl:grid-cols-[minmax(180px,0.20fr)_minmax(0,0.56fr)_minmax(140px,0.20fr)]"
        >
          {/* Left sidebar: metadata */}
          <aside className="grid content-start gap-8 lg:sticky lg:top-24 lg:self-start">
            <div className="grid gap-4">
              <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-primary">
                Details
              </p>
              <div className="grid gap-0">
                {detailRows.map((row) => (
                  <div
                    key={row.label}
                    className="border-b border-border/10 py-3 first:pt-0"
                  >
                    <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground/70">
                      {row.label}
                    </p>
                    <p className="mt-1 text-sm leading-6 text-foreground/70">
                      {row.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {project.links.length > 0 ? (
              <div className="grid gap-4">
                <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-primary">
                  Links
                </p>
                <div className="grid gap-0">
                  {project.links.map((link, index) => (
                    <LinkPreview
                      key={`${link.label}-${link.url}-${index}`}
                      url={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between gap-4 border-b border-border/10 py-3 text-sm text-foreground/70 transition-colors duration-300 hover:text-primary"
                    >
                      <span>{link.label}</span>
                      <span className="text-muted-foreground/70">&rarr;</span>
                    </LinkPreview>
                  ))}
                </div>
              </div>
            ) : null}
          </aside>

          {/* Center: MDX content */}
          <div ref={contentRef} className="min-w-0">
            <div
              className="mdx-content flex flex-col gap-6 text-base leading-relaxed text-foreground/80 sm:text-lg"
              dangerouslySetInnerHTML={{ __html: project.html }}
            />
          </div>

          {/* Right sidebar: Table of Contents (xl+) */}
          <div className="hidden xl:block">
            <div className="sticky top-24 self-start">
              <TableOfContents />
            </div>
          </div>
        </motion.section>

        {/* Prev/Next navigation */}
        <motion.section
          variants={item}
          className="border-t border-border/10 pt-8"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            {prevProject ? (
              <Link
                to="/projects/$slug"
                params={{ slug: prevProject.slug }}
                className="group flex flex-col gap-2 rounded-2xl p-5 transition-colors duration-300 hover:bg-foreground/3"
              >
                <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/70">
                  &larr; Previous
                </span>
                <span className="font-serif text-lg leading-tight tracking-tight text-foreground transition-colors duration-300 group-hover:text-primary">
                  {prevProject.title}
                </span>
                <span className="text-xs text-muted-foreground/70">
                  {formatDate(prevProject.date)}
                </span>
              </Link>
            ) : (
              <div />
            )}

            {nextProject ? (
              <Link
                to="/projects/$slug"
                params={{ slug: nextProject.slug }}
                className="group flex flex-col gap-2 rounded-2xl p-5 text-right transition-colors duration-300 hover:bg-foreground/3 sm:items-end"
              >
                <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/70">
                  Next &rarr;
                </span>
                <span className="font-serif text-lg leading-tight tracking-tight text-foreground transition-colors duration-300 group-hover:text-primary">
                  {nextProject.title}
                </span>
                <span className="text-xs text-muted-foreground/70">
                  {formatDate(nextProject.date)}
                </span>
              </Link>
            ) : null}
          </div>
        </motion.section>

        {/* Footer */}
        <motion.footer
          variants={item}
          className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <p className="max-w-2xl text-sm text-muted-foreground/70">
            More projects in the archive.
          </p>
          <Link
            to="/projects"
            className="inline-flex items-center gap-2 rounded-full bg-foreground/5 px-5 py-2.5 text-sm text-muted-foreground/60 transition-all duration-300 hover:bg-foreground/8 hover:text-foreground"
          >
            <span>&larr;</span>
            All projects
          </Link>
        </motion.footer>
      </motion.article>
    </>
  )
}

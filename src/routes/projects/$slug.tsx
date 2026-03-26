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
        { property: 'og:image:type', content: 'image/png' },
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
              { '@type': 'ListItem', position: 1, name: 'Home', item: siteMeta.baseUrl },
              { '@type': 'ListItem', position: 2, name: 'Projects', item: `${siteMeta.baseUrl}/projects` },
              { '@type': 'ListItem', position: 3, name: project.title, item: canonicalUrl },
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
          className="text-xs uppercase tracking-[0.2em] text-primary hover:text-primary/80"
        >
          back to projects
        </Link>
      </section>
    )
  }

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
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  }

  return (
    <motion.article
      variants={container}
      initial="hidden"
      animate="show"
      className="flex flex-col gap-8 pb-12"
    >
      <header className="flex flex-col gap-4">
        <motion.div variants={item}>
          <Link
            to="/projects"
            className="group inline-flex items-center gap-1 italic text-muted-foreground hover:text-primary transition-colors duration-300"
          >
            <span className="transform group-hover:-translate-x-1 transition-transform duration-300">
              ←
            </span>
            back to projects
          </Link>
        </motion.div>

        <div className="space-y-2">
          <motion.h1
            variants={item}
            className="text-4xl font-black italic tracking-tighter text-foreground uppercase"
          >
            {project.title}
          </motion.h1>
          <motion.p
            variants={item}
            className="text-[10px] uppercase tracking-[0.3em] font-bold text-primary"
          >
            {formatDate(project.date)}
          </motion.p>
        </div>

        <motion.p
          variants={item}
          className="text-xl leading-relaxed text-foreground/80 font-medium italic max-w-2xl"
        >
          {project.summary}
        </motion.p>

        {project.stack.length > 0 && (
          <motion.div variants={item} className="flex flex-col gap-2">
            <span className="text-[9px] uppercase tracking-[0.3em] text-muted-foreground font-bold">
              Built with
            </span>
            <div className="flex flex-wrap gap-2">
              {project.stack.map((tech) => (
                <span
                  key={tech}
                  className="text-[9px] uppercase tracking-[0.2em] px-3 py-1 rounded-sm border border-primary/30 bg-primary/5 text-primary/80 hover:bg-primary/10 hover:text-primary transition-colors duration-200"
                >
                  {tech}
                </span>
              ))}
            </div>
          </motion.div>
        )}

        {project.links.length > 0 && (
          <motion.div variants={item} className="flex flex-wrap gap-6 mt-2">
            {project.links.map((link) => (
              <a
                key={link.url}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] uppercase tracking-[0.2em] font-black underline decoration-primary/60 underline-offset-10 hover:text-primary hover:decoration-primary transition-all duration-300 hover:decoration-4"
              >
                {link.label} ↗
              </a>
            ))}
          </motion.div>
        )}
        <motion.div
          variants={item}
          className="animus-sync-bar mt-6 opacity-50"
        />
      </header>

      <motion.div
        variants={item}
        className="mdx-content flex flex-col gap-6 text-foreground leading-relaxed text-lg"
        dangerouslySetInnerHTML={{ __html: project.html }}
      />

      <motion.footer
        variants={item}
        className="pt-12 border-t border-border/50"
      >
        <Link
          to="/projects"
          className="group inline-flex items-center gap-2 italic text-muted-foreground hover:text-primary transition-colors duration-300 text-sm"
        >
          <span className="transform group-hover:-translate-x-1 transition-transform duration-300">
            ←
          </span>
          see more projects
        </Link>
      </motion.footer>
    </motion.article>
  )
}

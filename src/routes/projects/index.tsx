import { motion } from 'motion/react'
import { Link, createFileRoute } from '@tanstack/react-router'
import LayersIcon from '@/components/ui/layers-icon'
import { siteMeta } from '@/config/site-data'
import { getProjectIndex } from '@/lib/content'
import { formatDate } from '@/lib/format'

export const Route = createFileRoute('/projects/')({
  loader: async () => ({
    projects: await getProjectIndex(),
  }),
  head: () => {
    const title = `Projects | ${siteMeta.defaultTitle}`
    const description = 'Selected projects across Android, AI, and web.'
    const imageUrl = `${siteMeta.baseUrl}${siteMeta.defaultImage}`
    const canonicalUrl = `${siteMeta.baseUrl}/projects`

    return {
      meta: [
        { title },
        { name: 'description', content: description },
        { property: 'og:title', content: title },
        { property: 'og:description', content: description },
        { property: 'og:type', content: 'website' },
        { property: 'og:url', content: `${siteMeta.baseUrl}/projects` },
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
    }
  },
  component: ProjectsIndex,
})

function ProjectsIndex() {
  const { projects } = Route.useLoaderData()
  const collectionJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Projects',
    description: 'Selected projects across Android, AI, and web.',
    url: `${siteMeta.baseUrl}/projects`,
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
  }

  const breadcrumbJsonLd = {
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
    ],
  }

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
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  }

  return (
    <motion.section
      variants={container}
      initial="hidden"
      animate="show"
      className="flex flex-col gap-8"
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(collectionJsonLd),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbJsonLd),
        }}
      />
      <motion.header variants={item} className="flex flex-col gap-4 mb-2">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <h1 className="text-3xl font-bold tracking-tight bg-linear-to-r from-foreground to-foreground/70 bg-clip-text text-transparent italic">
              <LayersIcon
                size={24}
                className="inline-block mr-3 text-primary"
              />
              projects
            </h1>
            <div className="h-0.5 w-12 bg-primary rounded-full" />
          </div>
          <Link
            to="/"
            className="animus-corner group px-4 py-1 inline-flex items-center gap-2 italic text-muted-foreground hover:text-primary transition-all duration-500"
          >
            <span className="transform group-hover:-translate-x-1 transition-transform duration-300">
              ←
            </span>
            back
          </Link>
        </div>
        <p className="text-muted-foreground leading-relaxed max-w-xl">
          a short list of work across products with full‑stack builds of web and
          android apps using AI or integrating AI.
        </p>
      </motion.header>

      <div className="flex flex-col gap-10">
        {projects.map((project) => (
          <motion.div
            key={project.slug}
            variants={item}
            className="flex flex-col sm:flex-row items-stretch gap-6"
          >
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="animus-corner w-full sm:w-64 h-auto shrink-0 overflow-hidden rounded-lg shadow-xl relative group/img"
            >
              <img
                src={project.image}
                alt={project.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover/img:scale-110"
              />
              <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover/img:opacity-100 transition-opacity pointer-events-none" />
            </motion.div>

            <Link
              to="/projects/$slug"
              params={{ slug: project.slug }}
              className="ac-game-card animus-scanlines group flex flex-col gap-3 flex-1 p-4 -mx-4 rounded-lg transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="ac-game-era bg-primary" />
                <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-medium">
                  {formatDate(project.date)}
                </span>
                <div className="flex-1 animus-sync-bar opacity-20 group-hover:opacity-60 transition-opacity" />
              </div>

              <h2 className="text-xl font-bold uppercase tracking-wider text-primary group-hover:text-foreground transition-colors duration-300">
                {project.title}
              </h2>

              <p className="text-sm text-muted-foreground/80 group-hover:text-foreground/90 transition-colors leading-relaxed">
                {project.summary}
              </p>

              {project.stack.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-auto">
                  {project.stack.map((tech) => (
                    <span
                      key={tech}
                      className="text-[9px] uppercase tracking-[0.2em] px-2 py-0.5 rounded-sm border border-primary/20 bg-primary/5 text-primary/70 group-hover:border-primary/40 group-hover:bg-primary/10 transition-all"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              )}
            </Link>
          </motion.div>
        ))}
      </div>
      <Link
        to="/"
        className="group inline-flex items-center gap-1 italic text-muted-foreground hover:text-primary transition-colors duration-300 mb-2"
      >
        <span className="transform group-hover:-translate-x-1 transition-transform duration-300">
          ←
        </span>
        back
      </Link>
    </motion.section>
  )
}

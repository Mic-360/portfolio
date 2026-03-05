import { Link, createFileRoute } from '@tanstack/react-router'
import LayersIcon from '@/components/ui/layers-icon'
import { getProjectIndex } from '@/lib/content'
import { formatDate } from '@/lib/format'
import { siteMeta } from '@/lib/site-data'

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

import { motion } from 'motion/react'

function ProjectsIndex() {
  const { projects } = Route.useLoaderData()

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
      <motion.header variants={item} className="flex flex-col gap-2">
        <div className="flex items-center justify-between mr-6">
          <h1 className="text-2xl font-bold italic">
            <LayersIcon size={20} className="inline-block mr-2" />
            projects
          </h1>
          <Link to="/" className="group inline-flex items-center gap-1 italic text-muted-foreground hover:text-primary transition-colors duration-300 mb-2">
            <span className="transform group-hover:-translate-x-1 transition-transform duration-300">←</span>
            back
          </Link>
        </div>
        <p className="text-muted-foreground">
          a short list of work across products with full‑stack builds of web and
          android apps using AI or integrating AI.
        </p>
      </motion.header>

      <div className="flex flex-col gap-10">
        {projects.map((project) => (
          <motion.div
            key={project.slug}
            variants={item}
            className="flex flex-col sm:flex-row items-center gap-6"
          >
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="w-full sm:w-64 h-44 shrink-0 overflow-hidden rounded-lg shadow-md"
            >
              <img
                src={project.image}
                alt={project.title}
                className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
              />
            </motion.div>
            <Link
              to="/projects/$slug"
              params={{ slug: project.slug }}
              className="group flex flex-col gap-2 flex-1"
            >
              <div className="flex flex-wrap items-center gap-3 text-base uppercase tracking-[0.2em] text-primary font-bold">
                <span>{project.title}</span>
                <span className="h-px w-6 bg-primary/40 group-hover:bg-primary transition-colors"></span>
                <span className="text-[10px] text-muted-foreground font-normal">
                  {formatDate(project.date)}
                </span>
              </div>
              <p className="text-sm text-muted-foreground group-hover:text-foreground transition-colors leading-relaxed">
                {project.summary}
              </p>
              {project.stack.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-1">
                  {project.stack.map((tech) => (
                    <span key={tech} className="text-[9px] uppercase tracking-[0.2em] px-2 py-0.5 rounded-sm bg-muted/30 text-primary/60 border border-border/30">
                      {tech}
                    </span>
                  ))}
                </div>
              )}
            </Link>
          </motion.div>
        ))}
      </div>
      <Link to="/" className="group inline-flex items-center gap-1 italic text-muted-foreground hover:text-primary transition-colors duration-300 mb-2">
        <span className="transform group-hover:-translate-x-1 transition-transform duration-300">←</span>
        back
      </Link>
    </motion.section>
  )
}


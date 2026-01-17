import { getProjectIndex } from '@/lib/content.server'
import { formatDate } from '@/lib/format'
import { siteMeta } from '@/lib/site-data'
import { createFileRoute, Link } from '@tanstack/react-router'

export const Route = createFileRoute('/projects/')({
  loader: async () => ({
    projects: await getProjectIndex(),
  }),
  head: () => {
    const title = `Projects | ${siteMeta.defaultTitle}`
    const description = 'Selected projects across Android, AI, and web.'
    const imageUrl = `${siteMeta.baseUrl}${siteMeta.defaultImage}`

    return {
      meta: [
        { title },
        { name: 'description', content: description },
        { property: 'og:title', content: title },
        { property: 'og:description', content: description },
        { property: 'og:type', content: 'website' },
        { property: 'og:url', content: `${siteMeta.baseUrl}/projects` },
        { property: 'og:image', content: imageUrl },
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: title },
        { name: 'twitter:description', content: description },
        { name: 'twitter:image', content: imageUrl },
      ],
    }
  },
  component: ProjectsIndex,
})

function ProjectsIndex() {
  const { projects } = Route.useLoaderData()

  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-lg font-semibold italic">Projects</h1>
        <p className="text-muted-foreground">
          A short list of work across AI, product, and full‑stack builds.
        </p>
      </div>
      <div className="flex flex-col gap-4">
        {projects.map((project) => (
          <Link
            key={project.slug}
            to="/projects/$slug"
            params={{ slug: project.slug }}
            className="group flex flex-col gap-1"
          >
            <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.2em] text-primary">
              <span>{project.title}</span>
              <span className="h-px w-8 bg-primary/60"></span>
              <span>{formatDate(project.date)}</span>
            </div>
            <p className="text-muted-foreground group-hover:text-foreground">
              {project.summary}
            </p>
            {project.stack.length > 0 && (
              <p className="text-xs uppercase tracking-[0.2em] text-primary/80">
                {project.stack.join(' · ')}
              </p>
            )}
            {(project.categories.length > 0 || project.tags.length > 0) && (
              <p className="text-[0.65rem] uppercase tracking-[0.2em] text-primary/80">
                {[...project.categories, ...project.tags].join(' · ')}
              </p>
            )}
          </Link>
        ))}
      </div>
    </section>
  )
}

import LayersIcon from '@/components/ui/layers-icon'
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

  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold italic">
          <LayersIcon size={20} className="inline-block mr-1" />
          Projects
        </h1>
        <p className="text-muted-foreground">
          A short list of work across products with full‑stack builds of web and
          android apps using AI or integrating AI.
        </p>
      </div>
      <div className="flex flex-col gap-6">
        {projects.map((project) => (
          <div key={project.slug} className="flex flex-col sm:flex-row items-center gap-2">
            <img
              src={project.image}
              alt={project.title}
              className="object-center rounded aspect-video w-full sm:w-64 h-44"
            />
            <Link
              to="/projects/$slug"
              params={{ slug: project.slug }}
              className="group flex flex-col gap-1"
            >
              <div className="flex flex-wrap items-center gap-2 text-base uppercase tracking-[0.2em] text-primary">
                <span>{project.title}</span>
                <span className="h-px w-8 bg-primary/60"></span>
                <span className='text-[10px] text-secondary'>{formatDate(project.date)}</span>
              </div>
              <p className="text-sm text-muted-foreground group-hover:text-foreground">
                {project.summary}
              </p>
              {project.stack.length > 0 && (
                <p className="text-[0.65rem] uppercase tracking-[0.2em] text-primary/80">
                  {project.stack.join(' · ')}
                </p>
              )}
            </Link>
          </div>
        ))}
      </div>
      <Link to="/" className="mr-2 inline-flex items-center gap-1 italic">
        ← back
      </Link>
    </section>
  )
}

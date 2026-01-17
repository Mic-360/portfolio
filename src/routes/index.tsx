import { getBlogIndex, getProjectIndex } from '@/lib/content.server'
import { formatDate } from '@/lib/format'
import {
  contactLinks,
  previousRoles,
  siteInfo,
  siteMeta,
} from '@/lib/site-data'
import { createFileRoute, Link } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  loader: async () => {
    const [posts, projects] = await Promise.all([
      getBlogIndex(),
      getProjectIndex(),
    ])

    return {
      posts,
      projects,
    }
  },
  head: () => {
    const title = siteMeta.defaultTitle
    const description = siteMeta.defaultDescription
    const imageUrl = `${siteMeta.baseUrl}${siteMeta.defaultImage}`

    return {
      meta: [
        { title },
        { name: 'description', content: description },
        { property: 'og:title', content: title },
        { property: 'og:description', content: description },
        { property: 'og:type', content: 'website' },
        { property: 'og:url', content: siteMeta.baseUrl },
        { property: 'og:image', content: imageUrl },
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: title },
        { name: 'twitter:description', content: description },
        { name: 'twitter:image', content: imageUrl },
      ],
    }
  },
  component: App,
})

function Section({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="flex flex-col gap-2">
      <h2 className="font-semibold italic text-base underline underline-offset-2 decoration-primary">
        {title}
      </h2>
      {children}
    </section>
  )
}

function App() {
  const { posts, projects } = Route.useLoaderData()

  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col gap-3">
        <div className="flex item-center justify-between">
          <div className="flex flex-col gap-1">
            <h1 className="text-xl font-semibold italic">
              {siteInfo.name} ~{' '}
              <span className="text-xs mb-1 align-bottom inline-flex leading-4">
                {siteInfo.nativeName}
              </span>
            </h1>
            <p className="text-xs tracking-tight border w-fit p-0.5 rounded-xs text-primary font-sans border-border">
              {siteInfo.tagline}
            </p>
          </div>
          <div className="flex flex-col items-end text-xs uppercase tracking-[0.3em] text-primary">
            <span>{siteInfo.location}</span>
            <span className="italic tracking-wide text-foreground">
              {siteInfo.locationNative}
            </span>
          </div>
        </div>
        <p className="italic">
          i <span className="not-italic font-medium">build</span>{' '}
          <span className="underline decoration-primary underline-offset-4">
            {siteInfo.buildLine}
          </span>
        </p>
      </section>

      <Section title="current">
        <p>
          {siteInfo.currentRole} at{' '}
          <a
            href={siteInfo.currentCompanyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-0.5 rounded-xs font-sans underline decoration-primary underline-offset-1 bg-foreground text-background"
          >
            <img
              src="/khub.jpg"
              alt="KarkhanaHub Logo"
              className="inline-block w-4 h-4 mr-1 mb-0.5 rounded-md object-cover"
            />
            {siteInfo.currentCompany}
          </a>
          . {siteInfo.currentSummary}
        </p>
        <p>{siteInfo.educationLine}</p>
        <p>{siteInfo.interests}</p>
        <p>
          i can build{' '}
          <span className="italic font-semibold underline underline-offset-2 decoration-primary">
            literally anything.
          </span>
        </p>
      </Section>

      <Section title="previous">
        <div className="flex flex-col gap-2">
          {previousRoles.map((role) => (
            <div key={role.company} className="flex flex-wrap gap-2">
              <a
                href={role.url}
                target="_blank"
                rel="noopener noreferrer"
                className="underline decoration-primary underline-offset-4"
              >
                {role.company}
              </a>
              <span className="text-primary">~</span>
              <span>{role.role}</span>
              <span className="text-primary">[{role.location}]</span>
            </div>
          ))}
        </div>
      </Section>

      <Section title="writings">
        <div className="flex flex-col gap-2">
          {posts.slice(0, 3).map((post) => (
            <Link
              key={post.slug}
              to="/blog/$slug"
              params={{ slug: post.slug }}
              className="group flex flex-col gap-1"
            >
              <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.2em] text-primary">
                <span>{formatDate(post.date)}</span>
                <span className="h-px w-8 bg-primary/60"></span>
                <span>{post.title}</span>
              </div>
              <p className="text-muted-foreground group-hover:text-foreground text-xs">
                {post.summary}
              </p>
              {(post.categories.length > 0 || post.tags.length > 0) && (
                <p className="text-[0.65rem] uppercase tracking-[0.2em] text-primary/80">
                  {[...post.categories, ...post.tags].join(' · ')}
                </p>
              )}
            </Link>
          ))}
        </div>
        <Link
          to="/blog/"
          className="text-xs uppercase tracking-[0.2em] text-primary hover:text-primary/80 mt-2"
        >
          Read all writings
        </Link>
      </Section>

      <Section title="builds">
        <div className="flex flex-col-reverse md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-4">
            <div className="flex flex-col gap-2">
              {projects.slice(0, 2).map((project) => (
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
                  <p className="text-xs text-muted-foreground group-hover:text-foreground">
                    {project.summary}
                  </p>
                  {(project.categories.length > 0 ||
                    project.tags.length > 0) && (
                    <p className="text-[0.65rem] uppercase tracking-[0.2em] text-primary/80">
                      {[...project.categories, ...project.tags].join(' · ')}
                    </p>
                  )}
                </Link>
              ))}
            </div>
            <Link
              to="/projects/"
              className="text-xs uppercase tracking-[0.2em] text-primary hover:text-primary/80"
            >
              Read all projects
            </Link>
          </div>
          <img
            src="/logo.gif"
            alt="dev logo gif"
            className="w-full md:w-48 md:h-32 object-cover rounded-md mix-blend-screen opacity-75"
          />
        </div>
      </Section>

      <Section title="contact">
        <p>
          interested to talk? read my{' '}
          <a
            href={contactLinks[0].url}
            target="_blank"
            rel="noopener noreferrer"
            className="underline decoration-primary underline-offset-4"
          >
            resume
          </a>{' '}
          or book a slot at{' '}
          <a
            href={contactLinks[1].url}
            target="_blank"
            rel="noopener noreferrer"
            className="underline decoration-primary underline-offset-4"
          >
            cal.com
          </a>
          .
        </p>
      </Section>
    </div>
  )
}

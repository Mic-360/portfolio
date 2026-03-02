import { getProjectBySlug } from '@/lib/content'
import { formatDate } from '@/lib/format'
import { gravatar, siteImages, siteMeta } from '@/lib/site-data'
import { createFileRoute, Link } from '@tanstack/react-router'

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

  const canonicalUrl = `${siteMeta.baseUrl}/projects/${project.slug}`
  const imageUrl = project.image
    ? `${siteMeta.baseUrl}${project.image}`
    : `${siteMeta.baseUrl}/og/projects/${project.slug}`
  const projectJsonLd = {
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
      image: [
        `${siteMeta.baseUrl}${siteImages.profilePhoto}`,
        gravatar.avatarUrl,
      ],
    },
    inLanguage: 'en-US',
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
      {
        '@type': 'ListItem',
        position: 3,
        name: project.title,
        item: canonicalUrl,
      },
    ],
  }

  return (
    <article className="flex flex-col gap-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(projectJsonLd),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbJsonLd),
        }}
      />
      <header className="flex flex-col gap-2">
        <h1 className="text-xl font-semibold italic">{project.title}</h1>
        <p className="text-xs uppercase tracking-[0.2em] text-primary">
          {formatDate(project.date)}
        </p>
        <p className="text-muted-foreground">{project.summary}</p>
        {(project.categories.length > 0 || project.tags.length > 0) && (
          <p className="text-[0.65rem] uppercase tracking-[0.2em] text-primary/80">
            {[...project.categories, ...project.tags].join(' · ')}
          </p>
        )}
      </header>
      <div className="flex flex-wrap gap-2 text-xs uppercase tracking-[0.2em] text-primary">
        {project.stack.map((item) => (
          <span
            key={item}
            className="rounded-full border border-primary/40 px-3 py-1"
          >
            {item}
          </span>
        ))}
      </div>
      {project.links.length > 0 && (
        <div className="flex flex-wrap gap-4">
          {project.links.map((link) => (
            <a
              key={link.url}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="underline decoration-primary underline-offset-4"
            >
              {link.label}
            </a>
          ))}
        </div>
      )}
      <div
        className="mdx-content flex flex-col gap-4 text-foreground"
        dangerouslySetInnerHTML={{ __html: project.html }}
      />
      <Link
        to="/projects"
        className="text-xs uppercase tracking-[0.2em] text-primary hover:text-primary/80"
      >
        back to projects
      </Link>
    </article>
  )
}

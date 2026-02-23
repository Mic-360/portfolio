import PenIcon from '@/components/ui/pen-icon'
import { getBlogIndex } from '@/lib/content.server'
import { formatDate } from '@/lib/format'
import { siteMeta } from '@/lib/site-data'
import { createFileRoute, Link } from '@tanstack/react-router'

export const Route = createFileRoute('/blog/')({
  loader: async () => ({
    posts: await getBlogIndex(),
  }),
  head: () => {
    const title = `Blog | ${siteMeta.defaultTitle}`
    const description = 'Writing and notes from recent builds and experiments.'
    const imageUrl = `${siteMeta.baseUrl}${siteMeta.defaultImage}`
    const canonicalUrl = `${siteMeta.baseUrl}/blog`

    return {
      meta: [
        { title },
        { name: 'description', content: description },
        { property: 'og:title', content: title },
        { property: 'og:description', content: description },
        { property: 'og:type', content: 'website' },
        { property: 'og:url', content: `${siteMeta.baseUrl}/blog` },
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
  component: BlogIndex,
})

function BlogIndex() {
  const { posts } = Route.useLoaderData()

  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold italic">
          <PenIcon size={20} className="inline-block mr-1" />
          Blog
        </h1>
        <p className="text-muted-foreground">
          Short, practical notes on building web and android apps, tools,
          systems, and experiments.
        </p>
      </div>
      <div className="flex flex-col gap-6">
        {posts.map((post) => (
          <Link
            key={post.slug}
            to="/blog/$slug"
            params={{ slug: post.slug }}
            className="group flex flex-col gap-1"
          >
            <div className="flex flex-wrap items-center gap-2 text-base uppercase tracking-[0.2em] text-primary">
              <span className='text-[10px] text-secondary'>{formatDate(post.date)}</span>
              <span className="h-px w-8 bg-primary/60"></span>
              <span>{post.title}</span>
            </div>
            <p className="text-sm text-muted-foreground group-hover:text-foreground">
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
      <Link to="/" className="mr-2 inline-flex items-center gap-1 italic">
        ← back
      </Link>
    </section>
  )
}

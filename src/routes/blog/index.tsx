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

    return {
      meta: [
        { title },
        { name: 'description', content: description },
        { property: 'og:title', content: title },
        { property: 'og:description', content: description },
        { property: 'og:type', content: 'website' },
        { property: 'og:url', content: `${siteMeta.baseUrl}/blog` },
        { property: 'og:image', content: imageUrl },
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: title },
        { name: 'twitter:description', content: description },
        { name: 'twitter:image', content: imageUrl },
      ],
    }
  },
  component: BlogIndex,
})

function BlogIndex() {
  const { posts } = Route.useLoaderData()

  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-lg font-semibold italic">Blog</h1>
        <p className="text-muted-foreground">
          Short, practical notes on building AI tools, systems, and experiments.
        </p>
      </div>
      <div className="flex flex-col gap-4">
        {posts.map((post) => (
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
            <p className="text-muted-foreground group-hover:text-foreground">
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
    </section>
  )
}

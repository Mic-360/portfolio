import { getBlogPostBySlug } from '@/lib/content.server'
import { formatDate } from '@/lib/format'
import { siteMeta } from '@/lib/site-data'
import { createFileRoute, Link } from '@tanstack/react-router'

export const Route = createFileRoute('/blog/$slug')({
  loader: async ({ params }) => ({
    post: await getBlogPostBySlug({ data: { slug: params.slug } }),
  }),
  head: ({ loaderData }) => {
    if (!loaderData?.post) {
      return {
        meta: [{ title: `Blog | ${siteMeta.defaultTitle}` }],
      }
    }

    const { post } = loaderData
    const title = `${post.title} | ${siteMeta.defaultTitle}`
    const description = post.summary
    const imageUrl = `${siteMeta.baseUrl}${post.image ?? siteMeta.defaultImage}`
    const keywords = [...post.categories, ...post.tags].join(', ')

    return {
      meta: [
        { title },
        { name: 'description', content: description },
        { name: 'keywords', content: keywords },
        { property: 'og:title', content: title },
        { property: 'og:description', content: description },
        { property: 'og:type', content: 'article' },
        {
          property: 'og:url',
          content: `${siteMeta.baseUrl}/blog/${post.slug}`,
        },
        { property: 'og:image', content: imageUrl },
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: title },
        { name: 'twitter:description', content: description },
        { name: 'twitter:image', content: imageUrl },
      ],
    }
  },
  component: BlogPost,
})

function BlogPost() {
  const { post } = Route.useLoaderData()

  if (!post) {
    return (
      <section className="flex flex-col gap-4">
        <h1 className="text-lg font-semibold italic">post not found</h1>
        <Link
          to="/blog/"
          className="text-xs uppercase tracking-[0.2em] text-primary hover:text-primary/80"
        >
          back to blog
        </Link>
      </section>
    )
  }

  return (
    <article className="flex flex-col gap-4">
      <header className="flex flex-col gap-2">
        <h1 className="text-xl font-semibold italic">{post.title}</h1>
        <p className="text-xs uppercase tracking-[0.2em] text-primary">
          {formatDate(post.date)}
        </p>
        <p className="text-muted-foreground">{post.summary}</p>
        {(post.categories.length > 0 || post.tags.length > 0) && (
          <p className="text-[0.65rem] uppercase tracking-[0.2em] text-primary/80">
            {[...post.categories, ...post.tags].join(' · ')}
          </p>
        )}
      </header>
      <div
        className="mdx-content flex flex-col gap-1 text-foreground"
        dangerouslySetInnerHTML={{ __html: post.html }}
      />
      <Link
        to="/blog/"
        className="text-xs uppercase tracking-[0.2em] text-primary hover:text-primary/80"
      >
        back to blog
      </Link>
    </article>
  )
}

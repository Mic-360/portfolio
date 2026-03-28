import { Link, createFileRoute } from '@tanstack/react-router'
import { motion } from 'motion/react'
import { siteMeta } from '@/config/site-data'
import { getBlogPostBySlug } from '@/lib/content'
import { formatDate } from '@/lib/format'

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
    const imageUrl = post.image
      ? `${siteMeta.baseUrl}${post.image}`
      : `${siteMeta.baseUrl}/og/blog/${post.slug}`
    const keywords = [...post.categories, ...post.tags].join(', ')
    const canonicalUrl = `${siteMeta.baseUrl}/blog/${post.slug}`

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
        { property: 'og:image:type', content: 'image/svg+xml' },
        { property: 'og:image:alt', content: post.title },
        { property: 'article:published_time', content: post.date },
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: title },
        { name: 'twitter:description', content: description },
        { name: 'twitter:image', content: imageUrl },
        { name: 'twitter:image:alt', content: post.title },
        ...post.categories.map((category) => ({
          property: 'article:section',
          content: category,
        })),
        ...post.tags.map((tag) => ({
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
            '@type': 'BlogPosting',
            headline: post.title,
            description: post.summary,
            datePublished: post.date,
            dateModified: post.date,
            image: imageUrl,
            mainEntityOfPage: { '@type': 'WebPage', '@id': canonicalUrl },
            author: {
              '@type': 'Person',
              name: siteMeta.siteName,
              url: siteMeta.baseUrl,
            },
            publisher: {
              '@type': 'Person',
              name: siteMeta.siteName,
              url: siteMeta.baseUrl,
            },
            keywords,
            inLanguage: 'en-US',
          }),
        },
        {
          type: 'application/ld+json',
          children: JSON.stringify({
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
                name: 'Blog',
                item: `${siteMeta.baseUrl}/blog`,
              },
              {
                '@type': 'ListItem',
                position: 3,
                name: post.title,
                item: canonicalUrl,
              },
            ],
          }),
        },
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
          to="/blog"
          className="text-xs uppercase tracking-[0.2em] text-primary hover:text-primary/80"
        >
          back to blog
        </Link>
      </section>
    )
  }

  const readingTime = Math.max(
    1,
    Math.ceil(post.html.replace(/<[^>]*>/g, '').split(/\s+/).length / 200),
  )

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
      className="flex flex-col gap-8 pb-12 max-w-4xl mx-auto w-full"
    >
      <header className="flex flex-col gap-4 text-left">
        <motion.div variants={item}>
          <Link
            to="/blog"
            className="group inline-flex items-center gap-1 italic text-muted-foreground hover:text-primary transition-colors duration-300"
          >
            <span className="transform group-hover:-translate-x-1 transition-transform duration-300">
              ←
            </span>
            back to blog
          </Link>
        </motion.div>

        <div className="space-y-2">
          <motion.h1
            variants={item}
            className="text-3xl font-black italic tracking-tighter text-foreground uppercase"
          >
            {post.title}
          </motion.h1>
          <motion.p
            variants={item}
            className="text-[10px] uppercase tracking-[0.3em] font-bold text-primary"
          >
            {formatDate(post.date)} · {readingTime} min read
          </motion.p>
        </div>

        <motion.p
          variants={item}
          className="text-lg leading-relaxed text-foreground/80 font-medium italic"
        >
          {post.summary}
        </motion.p>

        {(post.categories.length > 0 || post.tags.length > 0) && (
          <motion.div variants={item} className="flex flex-wrap gap-2">
            {[...post.categories, ...post.tags].map((tag) => (
              <span
                key={tag}
                className="text-[9px] uppercase tracking-[0.2em] px-2 py-0.5 rounded-sm bg-muted text-primary/60 border border-border/30 hover:bg-primary/10 hover:text-primary/80 transition-colors duration-200"
              >
                {tag}
              </span>
            ))}
          </motion.div>
        )}
        <motion.div
          variants={item}
          className="animus-sync-bar mt-4 opacity-50"
        />
      </header>

      <motion.div
        variants={item}
        className="mdx-content flex flex-col gap-1 text-foreground leading-relaxed"
        dangerouslySetInnerHTML={{ __html: post.html }}
      />

      <motion.footer
        variants={item}
        className="pt-10 border-t border-border/50"
      >
        <Link
          to="/blog"
          className="group inline-flex items-center gap-1 italic text-muted-foreground hover:text-primary transition-colors duration-300"
        >
          <span className="transform group-hover:-translate-x-1 transition-transform duration-300">
            ←
          </span>
          more writings
        </Link>
      </motion.footer>
    </motion.article>
  )
}

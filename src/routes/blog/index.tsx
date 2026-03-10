import PenIcon from '@/components/ui/pen-icon'
import { siteMeta } from '@/config/site-data'
import { getBlogIndex } from '@/lib/content'
import { formatDate } from '@/lib/format'
import { Link, createFileRoute } from '@tanstack/react-router'

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

import { motion } from 'motion/react'

function BlogIndex() {
  const { posts } = Route.useLoaderData()
  const collectionJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Blog',
    description:
      'Short, practical notes on building web and android apps, tools, systems, and experiments.',
    url: `${siteMeta.baseUrl}/blog`,
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: posts.map((post, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        url: `${siteMeta.baseUrl}/blog/${post.slug}`,
        name: post.title,
        description: post.summary,
        image: post.image
          ? `${siteMeta.baseUrl}${post.image}`
          : `${siteMeta.baseUrl}/og/blog/${post.slug}`,
        datePublished: post.date,
      })),
    },
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
      <motion.header variants={item} className="flex flex-col gap-2">
        <div className="flex items-center justify-between mr-6">
          <h1 className="text-2xl font-bold italic">
            <PenIcon size={20} className="inline-block mr-2" />
            blog
          </h1>
          <Link
            to="/"
            className="group inline-flex items-center gap-1 italic text-muted-foreground hover:text-primary transition-colors duration-300 mb-2"
          >
            <span className="transform group-hover:-translate-x-1 transition-transform duration-300">
              ←
            </span>
            back
          </Link>
        </div>

        <p className="text-muted-foreground">
          short, practical notes on building web and android apps, tools,
          systems, and experiments.
        </p>
      </motion.header>

      <div className="flex flex-col gap-8">
        {posts.map((post) => (
          <motion.div key={post.slug} variants={item}>
            <Link
              to="/blog/$slug"
              params={{ slug: post.slug }}
              className="group flex flex-col gap-1 transition-transform duration-300 hover:translate-x-1"
            >
              <div className="flex flex-wrap items-center gap-3 text-base uppercase tracking-[0.2em] text-primary font-bold">
                <span className="text-[10px] text-muted-foreground font-normal">
                  {formatDate(post.date)}
                </span>
                <span className="h-px w-8 bg-primary/40 group-hover:bg-primary transition-colors"></span>
                <span>{post.title}</span>
              </div>
              <p className="text-sm text-muted-foreground group-hover:text-foreground transition-colors leading-relaxed">
                {post.summary}
              </p>
              {(post.categories.length > 0 || post.tags.length > 0) && (
                <div className="flex flex-wrap gap-2 mt-1">
                  {[...post.categories, ...post.tags].map((tag) => (
                    <span key={tag} className="text-[9px] uppercase tracking-[0.2em] px-2 py-0.5 rounded-sm bg-muted/30 text-primary/60">
                      {tag}
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


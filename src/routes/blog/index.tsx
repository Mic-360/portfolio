import { motion } from 'motion/react'
import { Link, createFileRoute } from '@tanstack/react-router'
import PenIcon from '@/components/ui/pen-icon'
import { siteMeta } from '@/config/site-data'
import { getBlogIndex } from '@/lib/content'
import { formatDate } from '@/lib/format'

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
        name: 'Blog',
        item: `${siteMeta.baseUrl}/blog`,
      },
    ],
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbJsonLd),
        }}
      />
      <motion.header variants={item} className="flex flex-col gap-4 mb-2">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <h1 className="text-3xl font-bold tracking-tight bg-linear-to-r from-foreground to-foreground/70 bg-clip-text text-transparent italic">
              <PenIcon size={24} className="inline-block mr-3 text-primary" />
              blog
            </h1>
            <div className="h-0.5 w-12 bg-primary rounded-full" />
          </div>
          <Link
            to="/"
            className="animus-corner group px-4 py-1 inline-flex items-center gap-2 italic text-muted-foreground hover:text-primary transition-all duration-500"
          >
            <span className="transform group-hover:-translate-x-1 transition-transform duration-300">
              ←
            </span>
            back
          </Link>
        </div>

        <p className="text-muted-foreground leading-relaxed max-w-xl">
          short, practical notes on building web and android apps, tools,
          systems, and experiments.
        </p>
      </motion.header>

      <div className="flex flex-col gap-6">
        {posts.map((post) => (
          <motion.div key={post.slug} variants={item}>
            <Link
              to="/blog/$slug"
              params={{ slug: post.slug }}
              className="ac-game-card animus-scanlines group flex flex-col gap-2 p-4 -mx-4 rounded-lg transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="ac-game-era bg-primary" />
                <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-medium">
                  {formatDate(post.date)}
                </span>
              </div>

              <h2 className="text-xl font-bold uppercase tracking-wider text-primary group-hover:text-foreground transition-colors duration-300">
                {post.title}
              </h2>

              <p className="text-sm text-muted-foreground/80 group-hover:text-foreground/90 transition-colors leading-relaxed">
                {post.summary}
              </p>

              {(post.categories.length > 0 || post.tags.length > 0) && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {[...post.categories, ...post.tags].map((tag) => (
                    <span
                      key={tag}
                      className="text-[9px] uppercase tracking-[0.2em] px-2 py-0.5 rounded-sm border border-primary/20 bg-primary/5 text-primary/70 group-hover:border-primary/40 group-hover:bg-primary/10 transition-all"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </Link>
          </motion.div>
        ))}
      </div>
      <Link
        to="/"
        className="group inline-flex items-center gap-1 italic text-muted-foreground hover:text-primary transition-colors duration-300 mb-2"
      >
        <span className="transform group-hover:-translate-x-1 transition-transform duration-300">
          ←
        </span>
        back
      </Link>
    </motion.section>
  )
}

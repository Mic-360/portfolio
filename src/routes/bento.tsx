import { Link, createFileRoute } from '@tanstack/react-router'
import { siteMeta } from '@/config/site-data'

export const Route = createFileRoute('/bento')({
  head: () => {
    const title = `Bento | ${siteMeta.defaultTitle}`
    const description = 'My social profile and links in a bento grid layout.'
    const canonicalUrl = `${siteMeta.baseUrl}/bento`
    const imageUrl = `${siteMeta.baseUrl}${siteMeta.defaultImage}`

    return {
      meta: [
        { title },
        { name: 'description', content: description },
        { property: 'og:title', content: title },
        { property: 'og:description', content: description },
        { property: 'og:type', content: 'profile' },
        { property: 'og:url', content: canonicalUrl },
        {
          property: 'og:image',
          content: imageUrl,
        },
        { property: 'og:image:width', content: '1200' },
        { property: 'og:image:height', content: '630' },
        { property: 'og:image:type', content: 'image/png' },
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: title },
        { name: 'twitter:description', content: description },
        {
          name: 'twitter:image',
          content: imageUrl,
        },
      ],
      links: [{ rel: 'canonical', href: canonicalUrl }],
      scripts: [
        {
          type: 'application/ld+json',
          children: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: siteMeta.baseUrl },
              { '@type': 'ListItem', position: 2, name: 'Bento', item: canonicalUrl },
            ],
          }),
        },
      ],
    }
  },
  component: BentoPage,
})

function BentoPage() {
  return (
    <article className="flex flex-col gap-6 min-h-screen">
      <div className="flex items-center justify-between gap-4 pb-2">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground/60">
          Bento
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground/50 transition-colors duration-300 hover:text-foreground"
        >
          <span>←</span>
          Home
        </Link>
      </div>

      <div className="relative w-full overflow-hidden rounded-3xl border border-border/10 min-h-screen">
        <iframe
          src="https://avely.me/bhaumic"
          className="absolute inset-0 w-full h-full border-0 [zoom:1] md:[zoom:1.5]"
          title="Bhaumic Singh Bento Profile"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    </article>
  )
}

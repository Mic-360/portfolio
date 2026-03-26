import { Link, createFileRoute } from '@tanstack/react-router'
import GravatarProfileCard from '@/components/gravatar/GravatarProfileCard'
import { gravatarConfig } from '@/config/gravatar'
import { siteMeta } from '@/config/site-data'
import { getGravatarProfile } from '@/lib/gravatar-profile'

export const Route = createFileRoute('/bento')({
  loader: async () => {
    const profile = await getGravatarProfile({
      data: gravatarConfig.slug,
    })
    return { profile }
  },
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
  const { profile } = Route.useLoaderData()

  return (
    <article className="flex flex-col gap-6 min-h-screen">
      <Link to="/" className="mr-2 inline-flex items-center gap-1 italic">
        ← back
      </Link>
      <div className="relative w-full overflow-hidden rounded-xl border border-border bg-card shadow-2xl min-h-screen">
        <iframe
          src="https://avely.me/bhaumic"
          className="absolute inset-0 w-full h-full border-0 [zoom:1] md:[zoom:1.5]"
          title="Bhaumic Singh Bento Profile"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>

      {/* Gravatar Profile Card — Dynamic */}
      <section className="flex flex-col gap-4">
        {profile ? (
          <GravatarProfileCard profile={profile} />
        ) : (
          <p className="text-sm text-muted-foreground italic">
            unable to load gravatar profile.
          </p>
        )}
      </section>

      <Link to="/" className="mr-2 inline-flex items-center gap-1 italic">
        ← back
      </Link>
    </article>
  )
}

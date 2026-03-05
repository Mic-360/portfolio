import { Link, createFileRoute } from '@tanstack/react-router'
import { getGravatarProfile } from '@/lib/gravatar-profile'
import { gravatarConfig } from '@/config/gravatar'
import { gravatar, siteImages, siteMeta } from '@/lib/site-data'
import GravatarProfileCard from '@/components/gravatar/GravatarProfileCard'

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
          content: `${siteMeta.baseUrl}${siteImages.profilePhoto}`,
        },
        { property: 'og:image:width', content: '256' },
        { property: 'og:image:height', content: '256' },
        { name: 'twitter:card', content: 'summary' },
        { name: 'twitter:title', content: title },
        { name: 'twitter:description', content: description },
        {
          name: 'twitter:image',
          content: `${siteMeta.baseUrl}${siteImages.profilePhoto}`,
        },
      ],
      links: [{ rel: 'canonical', href: canonicalUrl }],
    }
  },
  component: BentoPage,
})

function BentoPage() {
  const { profile } = Route.useLoaderData()

  return (
    <article className="flex flex-col gap-6 min-h-[80vh]">
      <header className="flex flex-col gap-4">
        <h1 className="text-2xl font-semibold italic">my bento</h1>
        <p className="text-muted-foreground">
          all my links and socials in one box.
        </p>
        <hr className="border-border" />
      </header>

      {/* Gravatar Profile Card — Dynamic */}
      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold italic">gravatar profile</h2>
        {profile ? (
          <GravatarProfileCard profile={profile} />
        ) : (
          <p className="text-sm text-muted-foreground italic">
            unable to load gravatar profile.
          </p>
        )}
      </section>

      <div className="relative w-full overflow-hidden rounded-xl border border-border bg-card shadow-2xl h-[85vh] min-h-125 md:h-200">
        <iframe
          src="https://avely.me/bhaumic"
          className="absolute inset-0 w-full h-full border-0 [zoom:1] md:[zoom:1.5]"
          title="Bhaumic Singh Bento Profile"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>

      <footer className="mt-4 flex flex-wrap justify-center gap-4">
        <a
          href="https://avely.me/bhaumic"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs italic text-muted-foreground hover:text-primary transition-colors"
        >
          view original at avely.me/bhaumic ↗
        </a>
        <a
          href={gravatar.profileUrl}
          target="_blank"
          rel="noopener noreferrer me"
          className="text-xs italic text-muted-foreground hover:text-primary transition-colors"
        >
          gravatar profile ↗
        </a>
      </footer>
      <Link to="/" className="mr-2 inline-flex items-center gap-1 italic">
        ← back
      </Link>
    </article>
  )
}

import { gravatar, siteImages, siteMeta } from '@/lib/site-data'
import { Link, createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/bento')({
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
  return (
    <article className="flex flex-col gap-6 min-h-[80vh]">
      <header className="flex flex-col gap-4">
        <h1 className="text-2xl font-semibold italic">my bento</h1>
        <p className="text-muted-foreground">
          all my links and socials in one box.
        </p>
        <hr className="border-border" />
      </header>

      <div className="relative w-full overflow-hidden rounded-xl border border-border bg-card shadow-2xl h-[85vh] min-h-[500px] md:h-[800px]">
        <iframe
          src="https://avely.me/bhaumic"
          className="absolute inset-0 w-full h-full border-0 [zoom:1] md:[zoom:1.5]"
          title="Bhaumic Singh Bento Profile"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>

      {/* Gravatar Profile Card */}
      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold italic">gravatar profile</h2>
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <iframe
            src={gravatar.cardUrl}
            width="415"
            height="228"
            className="border-0 rounded-lg shadow-lg max-w-full"
            title="Gravatar Profile Card"
          />
          <div className="flex flex-col items-center gap-2">
            <img
              src={gravatar.qrCodeUrl}
              alt="Gravatar QR Code — Scan to view profile"
              className="w-32 h-32 rounded-lg"
            />
            <span className="text-[10px] text-muted-foreground">
              scan to view gravatar
            </span>
          </div>
        </div>
      </section>

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

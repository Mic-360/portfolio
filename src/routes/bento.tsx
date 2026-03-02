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

      {/* Gravatar Profile Card — Landscape */}
      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold italic">gravatar profile</h2>
        <div className="w-full overflow-hidden rounded-xl border border-border shadow-xl">
          {/* Header banner */}
          <div
            className="h-28 sm:h-36 w-full bg-cover bg-center"
            style={{
              backgroundImage:
                'url("https://1.gravatar.com/userimage/278000758/f3c4768967ed81f37d82c1eb047437f5?size=1024")',
              backgroundColor: '#2b3529',
            }}
          />
          {/* Card body */}
          <div className="relative bg-card px-5 pb-5 pt-0">
            {/* Avatar overlapping banner */}
            <a
              href="https://bhaumicsingh.bio"
              target="_blank"
              rel="noopener noreferrer me"
              className="-mt-12 mb-3 block w-fit"
            >
              <img
                src="https://0.gravatar.com/avatar/9d1ad3fa2c8c3005a20431664d94c8fc11498c95528b5f0457731bcd365f0829?s=256&d=initials"
                alt="Bhaumic Singh"
                width={96}
                height={96}
                className="h-24 w-24 rounded-full border-4 border-card shadow-lg"
              />
            </a>

            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
              {/* Info */}
              <div className="flex flex-col gap-1">
                <a
                  href="https://bhaumicsingh.bio"
                  target="_blank"
                  rel="noopener noreferrer me"
                  className="group"
                >
                  <h3 className="text-lg font-bold group-hover:text-primary transition-colors">
                    Bhaumic Singh
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Software Engineer
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Prayagraj, India
                  </p>
                </a>
                <p className="mt-2 text-sm italic text-foreground/80">
                  A developer who loves to build.
                </p>
              </div>

              {/* Social icons */}
              <div className="flex items-center gap-3">
                <a
                  href="https://bhaumicsingh.bio"
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Gravatar"
                >
                  <img
                    src="https://s.gravatar.com/icons/gravatar.svg"
                    alt="Gravatar"
                    width={28}
                    height={28}
                    className="opacity-70 hover:opacity-100 transition-opacity invert dark:invert-0"
                  />
                </a>
                <a
                  href="https://x.com/bhaumicsingh"
                  target="_blank"
                  rel="noopener noreferrer"
                  title="X"
                >
                  <img
                    src="https://s.gravatar.com/icons/x.svg"
                    alt="X"
                    width={28}
                    height={28}
                    className="opacity-70 hover:opacity-100 transition-opacity invert dark:invert-0"
                  />
                </a>
                <a
                  href="https://www.linkedin.com/in/bhaumic"
                  target="_blank"
                  rel="noopener noreferrer"
                  title="LinkedIn"
                >
                  <img
                    src="https://s.gravatar.com/icons/linkedin.svg"
                    alt="LinkedIn"
                    width={28}
                    height={28}
                    className="opacity-70 hover:opacity-100 transition-opacity invert dark:invert-0"
                  />
                </a>
                <a
                  href="https://github.com/Mic-360"
                  target="_blank"
                  rel="noopener noreferrer"
                  title="GitHub"
                >
                  <img
                    src="https://s.gravatar.com/icons/github.svg"
                    alt="GitHub"
                    width={28}
                    height={28}
                    className="opacity-70 hover:opacity-100 transition-opacity invert dark:invert-0"
                  />
                </a>
              </div>
            </div>

            {/* Footer row */}
            <div className="mt-4 flex items-center justify-between border-t border-border pt-3 text-xs text-muted-foreground">
              <a
                href="https://bhaumicsingh.bio"
                target="_blank"
                rel="noopener noreferrer me"
                className="hover:text-primary transition-colors"
                title="https://bhaumicsingh.bio"
              >
                bhaumicsingh.bio
              </a>
              <a
                href="https://bhaumicsingh.bio"
                target="_blank"
                rel="noopener noreferrer me"
                className="hover:text-primary transition-colors"
              >
                View profile →
              </a>
            </div>
          </div>
        </div>
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

import { siteMeta } from '@/lib/site-data'
import { createFileRoute, Link } from '@tanstack/react-router'

export const Route = createFileRoute('/bento')({
  head: () => {
    const title = `Bento | ${siteMeta.defaultTitle}`
    const description = 'My social profile and links in a bento grid layout.'

    return {
      meta: [
        { title },
        { name: 'description', content: description },
        { property: 'og:title', content: title },
        { property: 'og:description', content: description },
      ],
    }
  },
  component: BentoPage,
})

function BentoPage() {
  return (
    <article className="flex flex-col gap-6 min-h-[80vh]">
      <header className="flex flex-col gap-4">
        <h1 className="text-2xl font-semibold italic">
          my bento
        </h1>
        <p className="text-muted-foreground">all my links and socials in one box.</p>
        <hr className="border-border" />
      </header>

      <div className="relative w-full overflow-hidden rounded-xl border border-border bg-card shadow-2xl h-[85vh] min-h-[500px] md:h-[800px]">
        <iframe
          src="https://avely.me/bhaumic"
          className="absolute inset-0 w-full h-full border-0 [zoom:1] md:[zoom:1.5]"
          title="Bhaumik Singh Bento Profile"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>

      <footer className="mt-4 flex justify-center">
        <a
          href="https://avely.me/bhaumic"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs italic text-muted-foreground hover:text-primary transition-colors"
        >
          view original at avely.me/bhaumic ↗
        </a>
      </footer>
      <Link to="/" className="mr-2 inline-flex items-center gap-1 italic">
        ← back
      </Link>
    </article>
  )
}

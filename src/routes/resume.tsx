import { getResume } from '@/lib/content.server'
import { siteMeta } from '@/lib/site-data'
import { createFileRoute, Link } from '@tanstack/react-router'
import FileDescriptionIcon from '@/components/ui/file-description-icon'

export const Route = createFileRoute('/resume')({
    loader: async () => ({
        resume: await getResume(),
    }),
    head: ({ loaderData }) => {
        const title = `Resume | ${siteMeta.defaultTitle}`
        const description = loaderData?.resume?.summary || 'Professional resume'

        return {
            meta: [
                { title },
                { name: 'description', content: description },
                { property: 'og:title', content: title },
                { property: 'og:description', content: description },
            ],
        }
    },
    component: ResumePage,
})

function ResumePage() {
    const { resume } = Route.useLoaderData()

    if (!resume) {
        return (
            <section className="flex flex-col gap-4">
                <h1 className="text-2xl font-semibold italic">Resume not found</h1>
            </section>
        )
    }

    return (
        <article className="flex flex-col gap-6">
            <header className="flex flex-col gap-4">
                <h1 className="text-2xl font-semibold italic">
                    <FileDescriptionIcon size={24} className="inline-block mr-2" />
                    Resume
                </h1>
                <p className="text-muted-foreground">{resume.summary}</p>
                <hr className="border-border" />
            </header>

            <div
                className="mdx-content flex flex-col gap-1 text-foreground"
                dangerouslySetInnerHTML={{ __html: resume.html }}
            />

            <a
                href="/Resume_Bhaumik.pdf"
                download
                className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-primary hover:text-white transition-colors"
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-3.5 h-3.5"
                >
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                Download PDF
            </a>

            <footer className="flex flex-col gap-4">
                <p className="text-xs text-muted-foreground italic">
                    Last updated: {new Date(resume.date).toLocaleDateString('en-US', {
                        month: 'long',
                        year: 'numeric',
                    })}
                </p>
                <Link to="/" className="mr-2 inline-flex items-center gap-1 italic">
                    ← back
                </Link>
            </footer>
        </article>
    )
}

import { Link, createFileRoute } from '@tanstack/react-router'
import { getGravatarProfile } from '@/lib/gravatar-profile'
import { gravatarConfig } from '@/config/gravatar'
import { siteMeta } from '@/lib/site-data'
import GravatarAvatar from '@/components/gravatar/GravatarAvatar'
import GravatarSocialLinks from '@/components/gravatar/GravatarSocialLinks'
import GravatarGallery from '@/components/gravatar/GravatarGallery'
import { Section } from '@/lib/functions'
import type { GravatarInterest, GravatarLink } from '@/types/gravatar'

export const Route = createFileRoute('/about')({
    loader: async () => {
        const profile = await getGravatarProfile({
            data: gravatarConfig.slug,
        })
        return { profile }
    },
    head: () => {
        const title = `About | ${siteMeta.defaultTitle}`
        const description =
            'Learn more about Bhaumic Singh — software engineer, builder, and technology enthusiast. Identity powered by Gravatar.'
        const canonicalUrl = `${siteMeta.baseUrl}/about`

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
                    content: `${siteMeta.baseUrl}${siteMeta.defaultImage}`,
                },
                { name: 'twitter:card', content: 'summary' },
                { name: 'twitter:title', content: title },
                { name: 'twitter:description', content: description },
            ],
            links: [{ rel: 'canonical', href: canonicalUrl }],
        }
    },
    component: AboutPage,
})

function AboutPage() {
    const { profile } = Route.useLoaderData()

    if (!profile) {
        return (
            <article className="flex flex-col gap-6 min-h-[60vh]">
                <header className="flex flex-col gap-4">
                    <h1 className="text-2xl font-semibold italic">about</h1>
                    <p className="text-muted-foreground">
                        unable to load profile data. please try again later.
                    </p>
                </header>
                <Link to="/" className="inline-flex items-center gap-1 italic">
                    ← back
                </Link>
            </article>
        )
    }

    return (
        <article className="flex flex-col gap-8">
            <header className="flex flex-col gap-4">
                <Link to="/" className="inline-flex items-center gap-1 italic text-muted-foreground hover:text-foreground transition-colors">
                    ← back
                </Link>
                <h1 className="text-2xl font-semibold italic">about</h1>
                <hr className="border-border" />
            </header>

            {/* Identity Card */}
            <section className="flex flex-col sm:flex-row items-start gap-6">
                <a
                    href={profile.profile_url}
                    target="_blank"
                    rel="noopener noreferrer me"
                    className="shrink-0"
                >
                    <GravatarAvatar
                        hash={profile.hash}
                        size={128}
                        alt={profile.display_name}
                        className="w-32 h-32"
                    />
                </a>
                <div className="flex flex-col gap-2">
                    <h2 className="text-xl font-bold">{profile.display_name}</h2>
                    {profile.job_title && (
                        <p className="text-sm text-muted-foreground">
                            {profile.job_title}
                            {profile.company ? ` at ${profile.company}` : ''}
                        </p>
                    )}
                    {profile.location && (
                        <p className="text-xs uppercase tracking-[0.2em] text-primary">
                            {profile.location}
                        </p>
                    )}
                    {profile.pronunciation && (
                        <p className="text-xs text-muted-foreground italic">
                            pronounced: {profile.pronunciation}
                        </p>
                    )}
                    {profile.pronouns && (
                        <p className="text-xs text-muted-foreground">
                            {profile.pronouns}
                        </p>
                    )}
                </div>
            </section>

            {/* Bio */}
            {profile.description && (
                <Section title="">
                    <p className="italic leading-relaxed">{profile.description}</p>
                </Section>
            )}

            {/* Social Links */}
            {profile.verified_accounts && profile.verified_accounts.length > 0 && (
                <Section title="">
                    <div className="flex flex-col gap-3">
                        <h3 className="text-xs uppercase tracking-[0.2em] text-primary font-semibold">
                            verified accounts
                        </h3>
                        <GravatarSocialLinks
                            accounts={profile.verified_accounts}
                            iconSize={32}
                        />
                    </div>
                </Section>
            )}

            {/* Interests */}
            {profile.interests && profile.interests.length > 0 && (
                <Section title="">
                    <div className="flex flex-col gap-3">
                        <h3 className="text-xs uppercase tracking-[0.2em] text-primary font-semibold">
                            interests
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {profile.interests.map((interest: GravatarInterest) => (
                                <span
                                    key={interest.id}
                                    className="px-2 py-1 text-xs rounded-md border border-border/50 bg-card text-foreground/80 hover:border-primary/50 transition-colors"
                                >
                                    {interest.name}
                                </span>
                            ))}
                        </div>
                    </div>
                </Section>
            )}

            {/* Gallery */}
            {profile.gallery && profile.gallery.length > 0 && (
                <Section title="">
                    <div className="flex flex-col gap-3">
                        <h3 className="text-xs uppercase tracking-[0.2em] text-primary font-semibold">
                            gallery
                        </h3>
                        <GravatarGallery images={profile.gallery} />
                    </div>
                </Section>
            )}

            {/* Links */}
            {profile.links && profile.links.length > 0 && (
                <Section title="">
                    <div className="flex flex-col gap-3">
                        <h3 className="text-xs uppercase tracking-[0.2em] text-primary font-semibold">
                            links
                        </h3>
                        <ul className="flex flex-col gap-1">
                            {profile.links.map((link: GravatarLink) => (
                                <li key={link.url}>
                                    <a
                                        href={link.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="underline decoration-primary underline-offset-4 hover:text-primary transition-colors"
                                    >
                                        {link.label}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                </Section>
            )}

            {/* Meta */}
            <footer className="flex flex-wrap gap-4 text-[10px] text-muted-foreground italic border-t border-border pt-4">
                {profile.registration_date && (
                    <span>
                        member since{' '}
                        {new Date(profile.registration_date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                        })}
                    </span>
                )}
                {profile.last_profile_edit && (
                    <span>
                        last updated{' '}
                        {new Date(profile.last_profile_edit).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                        })}
                    </span>
                )}
                <a
                    href={profile.profile_url}
                    target="_blank"
                    rel="noopener noreferrer me"
                    className="hover:text-primary transition-colors"
                >
                    powered by gravatar ↗
                </a>
            </footer>
        </article>
    )
}

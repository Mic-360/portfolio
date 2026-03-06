import { Link, createFileRoute } from '@tanstack/react-router'
import { getGravatarProfile } from '@/lib/gravatar-profile'
import { gravatarConfig } from '@/config/gravatar'
import { siteMeta } from '@/config/site-data'
import GravatarAvatar from '@/components/gravatar/GravatarAvatar'
import GravatarSocialLinks from '@/components/gravatar/GravatarSocialLinks'
import GravatarGallery from '@/components/gravatar/GravatarGallery'
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

import { motion } from 'motion/react'

function AboutPage() {
    const { profile } = Route.useLoaderData()

    if (!profile) {
        return (
            <article className="flex flex-col gap-6 min-h-[60vh] items-center justify-center">
                <header className="flex flex-col gap-4 text-center">
                    <h1 className="text-2xl font-semibold italic">about</h1>
                    <p className="text-muted-foreground">
                        unable to load profile data. please try again later.
                    </p>
                </header>
                <Link to="/" className="inline-flex items-center gap-1 italic hover:text-primary transition-colors">
                    ← back
                </Link>
            </article>
        )
    }

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
            },
        },
    }

    const itemVariants = {
        hidden: { opacity: 0, y: 15 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                type: 'spring' as const,
                stiffness: 100,
                damping: 15,
            },
        },
    }

    return (
        <motion.article
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="flex flex-col gap-6 max-w-2xl mx-auto"
        >
            {/* Main Profile Card - Gravatar Style */}
            <motion.section
                variants={itemVariants}
                className="relative overflow-hidden rounded-xl border border-border/50 bg-card shadow-xl"
            >
                {/* Cover / Header Area */}
                <div
                    className="h-32 sm:h-40 w-full relative"
                    style={{
                        background: profile.header_image ? profile.header_image : 'var(--primary)',
                        backgroundColor: profile.background_color || 'var(--primary)',
                        opacity: 0.8
                    }}
                >
                    <div className="absolute inset-0 bg-linear-to-b from-black/20 to-transparent" />
                    <div className="absolute top-4 right-4 text-[10px] font-mono uppercase tracking-[0.4em] text-white/60 select-none">
                        Subject_{profile.hash.substring(0, 6)}
                    </div>
                </div>

                {/* Card Content */}
                <div className="px-6 sm:px-10 pb-10 pt-0 relative">
                    {/* Overlapping Circular Avatar */}
                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        className="relative -mt-12 sm:-mt-16 mb-4 block w-fit group"
                    >
                        <a
                            href={profile.profile_url}
                            target="_blank"
                            rel="noopener noreferrer me"
                            className="relative block rounded-full border-4 border-card bg-card shadow-2xl overflow-hidden"
                        >
                            <GravatarAvatar
                                hash={profile.hash}
                                size={128}
                                alt={profile.display_name}
                                className="w-24 h-24 sm:w-32 sm:h-32 object-cover rounded-full grayscale group-hover:grayscale-0 transition-all duration-700"
                            />
                        </a>
                        <div className="absolute top-0 right-0 w-6 h-6 flex items-center justify-center rounded-full bg-primary text-background font-bold text-[8px] shadow-lg border-2 border-card">
                            99
                        </div>
                    </motion.div>

                    <div className="flex flex-col gap-6">
                        <div className="space-y-1">
                            <h2 className="text-3xl sm:text-4xl font-black tracking-tighter text-foreground uppercase">
                                {profile.display_name}
                            </h2>
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                                {profile.job_title && (
                                    <p className="text-md font-semibold text-primary italic">
                                        {profile.job_title}
                                        {profile.company ? <span className="text-muted-foreground/60 not-italic"> @ {profile.company}</span> : ''}
                                    </p>
                                )}
                                {profile.location && (
                                    <span className="text-xs uppercase tracking-widest text-muted-foreground font-bold flex items-center gap-1 before:content-[''] before:w-1 before:h-1 before:bg-primary/40 before:rounded-full">
                                        {profile.location}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Social Icons - Clean Row under Identity */}
                        {profile.verified_accounts && profile.verified_accounts.length > 0 && (
                            <div className="flex flex-wrap gap-4 pt-2">
                                <GravatarSocialLinks
                                    accounts={profile.verified_accounts}
                                    iconSize={20}
                                    className="gap-4 invert-0"
                                />
                            </div>
                        )}

                        <div className="animus-sync-bar mt-2 opacity-30" />

                        {profile.description && (
                            <div className="italic text-lg leading-relaxed text-foreground/90 font-medium max-w-xl">
                                {profile.description}
                            </div>
                        )}
                    </div>
                </div>
            </motion.section>

            {/* Sub-cards for extra info */}
            <div className="grid grid-cols-1 gap-6">
                {/* Interests / Affinity */}
                {profile.interests && profile.interests.length > 0 && (
                    <motion.div variants={itemVariants} className="rounded-xl border border-border/50 bg-card p-6 shadow-md">
                        <h3 className="text-[10px] uppercase tracking-[0.3em] text-primary font-black mb-4 flex items-center gap-2">
                            Affinity Modules
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {profile.interests.map((interest: GravatarInterest) => (
                                <span
                                    key={interest.id}
                                    className="px-3 py-1 text-xs font-mono rounded-md border border-border bg-muted/30 text-foreground/80"
                                >
                                    #{interest.name.replace(/\s+/g, '_').toLowerCase()}
                                </span>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* External Uplinks */}
                {profile.links && profile.links.length > 0 && (
                    <motion.div variants={itemVariants} className="rounded-xl border border-border/50 bg-card overflow-hidden shadow-md">
                        <div className="p-6 pb-0">
                            <h3 className="text-[10px] uppercase tracking-[0.3em] text-primary font-black flex items-center gap-2">
                                External Uplinks
                            </h3>
                        </div>
                        <div className="grid grid-cols-1 divide-y divide-border/50 mt-4">
                            {profile.links.map((link: GravatarLink) => (
                                <a
                                    key={link.url}
                                    href={link.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="group flex items-center justify-between p-4 hover:bg-primary transition-all duration-300"
                                >
                                    <span className="font-bold uppercase tracking-widest text-xs group-hover:text-background">{link.label}</span>
                                    <span className="text-primary group-hover:text-background transform translate-x-0 group-hover:translate-x-1 transition-transform">↗</span>
                                </a>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* Memory Gallery */}
                {profile.gallery && profile.gallery.length > 0 && (
                    <motion.div variants={itemVariants} className="rounded-xl border border-border/50 bg-card p-6 shadow-md">
                        <h3 className="text-[10px] uppercase tracking-[0.3em] text-primary font-black mb-6">
                            Memory Fragments
                        </h3>
                        <GravatarGallery images={profile.gallery} className="grid-cols-2 sm:grid-cols-3 gap-2" />
                    </motion.div>
                )}
            </div>

            {/* Simple Footer */}
            <motion.footer
                variants={itemVariants}
                className="flex flex-col items-center gap-4 text-[10px] text-muted-foreground uppercase tracking-[0.3em] pt-10"
            >
                <div className="flex gap-4">
                    {profile.registration_date && (
                        <span>Enlisted_{new Date(profile.registration_date).getFullYear()}</span>
                    )}
                    <span className="text-primary">|</span>
                    <a
                        href={profile.profile_url}
                        target="_blank"
                        rel="noopener noreferrer me"
                        className="hover:text-primary transition-colors flex items-center gap-1"
                    >
                        Source_Gravatar
                    </a>
                </div>
            </motion.footer>

            <Link
                to="/"
                className="group inline-flex items-center gap-1 italic text-muted-foreground hover:text-primary transition-colors duration-300"
            >
                <span className="transform group-hover:-translate-x-1 transition-transform duration-300">←</span>
                back
            </Link>
        </motion.article>
    )
}

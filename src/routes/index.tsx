import { Link, createFileRoute } from '@tanstack/react-router'
import CalendarIcon from '@/components/ui/calendar-icon'
import GravatarAvatar from '@/components/gravatar/GravatarAvatar'
import { getBlogIndex, getProjectIndex } from '@/lib/content'
import { formatDate } from '@/lib/format'
import { Section, StatCard } from '@/lib/functions'
import { getHealthData } from '@/lib/health'
import { hashEmail } from '@/lib/gravatar'
import { gravatarConfig } from '@/config/gravatar'
import {
  contactLinks,
  gravatar,
  previousRoles,
  siteImages,
  siteInfo,
  siteMeta,
} from '@/lib/site-data'

export const Route = createFileRoute('/')({
  loader: async () => {
    const [posts, projects, health, avatarHash] = await Promise.all([
      getBlogIndex(),
      getProjectIndex(),
      getHealthData(),
      hashEmail(gravatarConfig.email),
    ])

    return {
      posts,
      projects,
      health,
      avatarHash,
    }
  },
  head: () => {
    const title = siteMeta.defaultTitle
    const description = siteMeta.defaultDescription
    const imageUrl = `${siteMeta.baseUrl}${siteMeta.defaultImage}`
    const canonicalUrl = siteMeta.baseUrl

    return {
      meta: [
        { title },
        { name: 'description', content: description },
        { property: 'og:title', content: title },
        { property: 'og:description', content: description },
        { property: 'og:type', content: 'website' },
        { property: 'og:url', content: siteMeta.baseUrl },
        { property: 'og:image', content: imageUrl },
        { property: 'og:image:width', content: '1200' },
        { property: 'og:image:height', content: '630' },
        { property: 'og:image:type', content: 'image/png' },
        { property: 'og:image:alt', content: title },
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: title },
        { name: 'twitter:description', content: description },
        { name: 'twitter:image', content: imageUrl },
        { name: 'twitter:image:alt', content: title },
      ],
      links: [
        { rel: 'canonical', href: canonicalUrl },
        { rel: 'image_src', href: `${siteMeta.baseUrl}${siteImages.banner}` },
      ],
    }
  },
  component: App,
})

function App() {
  const { posts, projects, health, avatarHash } = Route.useLoaderData()

  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row item-center justify-between">
          <div className="flex items-center gap-3">
            <a
              href={gravatar.profileUrl}
              target="_blank"
              rel="noopener noreferrer me"
              className="shrink-0"
            >
              <GravatarAvatar
                hash={avatarHash}
                size={48}
                alt={`${siteInfo.name} — Profile Photo`}
                className="w-12 h-12"
              />
            </a>
            <div className="flex flex-col gap-1">
              <h1 className="text-2xl font-semibold italic">
                {siteInfo.name} ~{' '}
                <span className="text-sm mb-1 align-bottom inline-flex leading-4">
                  {siteInfo.nativeName}
                </span>
              </h1>
              <p className="text-xs tracking-tight border w-fit p-0.5 rounded-xs text-primary font-sans border-border">
                {siteInfo.tagline}
              </p>
            </div>
          </div>
          <div className="flex flex-col sm:items-end text-[10px] sm:text-xs uppercase tracking-[0.3em] text-primary mt-1.5">
            <span>{siteInfo.location}</span>
            <span className="italic tracking-wide text-foreground">
              {siteInfo.locationNative}
            </span>
          </div>
        </div>
        <p className="italic">
          <span className="not-italic font-medium">i build</span>{' '}
          <span className="underline decoration-primary underline-offset-4">
            {siteInfo.buildLine}
          </span>
        </p>
      </section>

      <Section title="current">
        <p>
          {siteInfo.currentRole} at{' '}
          <a
            href={siteInfo.currentCompanyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-0.5 rounded-xs font-sans underline decoration-primary underline-offset-1 bg-foreground text-background"
          >
            <img
              src="/khub.jpg"
              alt="KarkhanaHub Logo"
              className="inline-block w-6 h-6 mr-1 mb-0.5 rounded-md object-cover"
            />
            {siteInfo.currentCompany}
          </a>
          . {siteInfo.currentSummary}
        </p>
        <p>{siteInfo.educationLine}</p>
        <p>{siteInfo.interests}</p>
        <p>
          i can build{' '}
          <span className="italic font-semibold underline underline-offset-2 decoration-primary">
            literally anything.
          </span>
        </p>
      </Section>

      <Section title="">
        <div className="flex flex-col gap-4">
          <Link
            to="/readme"
            className="block overflow-hidden rounded-lg p-2 transition-all hover:border-primary/50 hover:shadow-lg"
          >
            <img
              src="https://ghchart.rshah.org/Mic-360"
              alt="Mic-360 GitHub Contributions"
              className="w-full h-auto"
            />
          </Link>
          <p className="text-xs italic text-muted-foreground">
            click the graph to view my full github readme.
          </p>
        </div>
      </Section>

      <Section title="previous">
        <div className="flex flex-col gap-2">
          {previousRoles.map((role) => (
            <div key={role.company} className="flex flex-wrap justify-between gap-2">
              <div className='flex flex-wrap gap-2 items-center'><a
                href={role.url}
                target="_blank"
                rel="noopener noreferrer"
                className="underline decoration-primary underline-offset-4"
              >
                {role.icon && (
                  <img
                    src={role.icon}
                    alt={role.company}
                    className="inline-block w-6 h-6 mr-1 mb-0.5 rounded-md object-cover"
                  />
                )}
                {role.company}
              </a>
                <span className="text-primary">~</span>
                <span>{role.role}</span>
                <span className="text-primary">[{role.location}]</span>
              </div>
              <span>[{role.duration}]</span>
            </div>
          ))}
        </div>
      </Section>

      <Section title="blogs">
        <div className="flex flex-col gap-4">
          {posts.slice(0, 6).map((post) => (
            <Link
              key={post.slug}
              to="/blog/$slug"
              params={{ slug: post.slug }}
              className="group flex flex-col gap-1"
            >
              <div className="flex flex-wrap items-center gap-2 text-base uppercase tracking-[0.2em] text-primary">
                <span className="text-[10px] text-secondary-foreground">
                  {formatDate(post.date)}
                </span>
                <span className="h-px w-8 bg-primary/60"></span>
                <span>{post.title}</span>
              </div>
              <p className="text-xs text-secondary-foreground group-hover:text-foreground">
                {post.summary}
              </p>
            </Link>
          ))}
        </div>
        <Link
          to="/blog"
          className="text-md uppercase tracking-[0.2em] text-white underline decoration-primary underline-offset-4 mt-2"
        >
          Read all blogs
        </Link>
      </Section>

      <Section title="projects">
        <div className="flex flex-col-reverse md:flex-row items-start justify-between gap-4">
          <div className="space-y-6">
            <div className="flex flex-col gap-4">
              {projects.slice(0, 4).map((project) => (
                <Link
                  key={project.slug}
                  to="/projects/$slug"
                  params={{ slug: project.slug }}
                  className="group flex flex-col gap-1"
                >
                  <div className="flex flex-wrap items-center gap-2 text-base uppercase tracking-[0.2em] text-primary">
                    <span>{project.title}</span>
                    <span className="h-px w-4 sm:w-8 bg-primary/60"></span>
                    <span className="text-[10px] text-secondary-foreground">
                      {formatDate(project.date)}
                    </span>
                  </div>
                  <p className="text-xs text-secondary-foreground group-hover:text-foreground">
                    {project.summary}
                  </p>
                </Link>
              ))}
            </div>
            <Link
              to="/projects"
              className="text-md uppercase tracking-[0.2em] text-white underline decoration-primary underline-offset-4"
            >
              View all projects
            </Link>
          </div>
        </div>
      </Section>

      <Section title="healthstat">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <StatCard
            label="steps"
            samples={health.steps}
            unit="steps"
            type="sum"
          />
          <StatCard
            label="energy"
            samples={health.activeEnergy}
            unit="kcal"
            type="sum"
            format={(v) => v.toFixed(0)}
          />
          <StatCard
            label="heart rate"
            samples={health.heartRate?.map((s) => {
              const start = new Date(s.startDate).getTime()
              const end = new Date(s.endDate).getTime()
              const minutes = (end - start) / (1000 * 180)
              return {
                ...s,
                value:
                  minutes > 0 ? Number(s.value) / minutes : Number(s.value),
              }
            })}
            unit="bpm"
            type="avg"
            format={(v) => v.toFixed(0)}
          />
          <StatCard
            label="distance"
            samples={health.distance}
            unit="km"
            type="sum"
            format={(v) => v.toFixed(2)}
          />
          <StatCard
            label="sleep"
            samples={health.sleep}
            unit="hrs"
            type="sum"
            format={(v) => v.toFixed(1)}
          />
          <StatCard
            label="spO2"
            samples={health.spO2}
            unit="%"
            type="avg"
            format={(v) => v.toFixed(1)}
          />
        </div>
        {health.updatedAt && (
          <p className="text-[10px] italic text-muted-foreground mt-4">
            last updated: {new Date(health.updatedAt).toLocaleString()}
          </p>
        )}
      </Section>

      <Section title="contact">
        <p>
          interested to talk? read my{' '}
          {contactLinks.map((link, i) => (
            <span key={link.label}>
              <Link
                to={link.url}
                className="underline decoration-primary underline-offset-4"
              >
                {link.label}
              </Link>
              {i < contactLinks.length - 1 ? ', ' : ' '}
            </span>
          ))}
          or book a call with me on
          <a
            href={siteInfo.calendlyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="underline decoration-primary pl-1 inline-flex items-center gap-1 group"
          >
            calendly
            <CalendarIcon
              size={16}
              className="inline-block mr-1 mb-0.5 text-teal-500"
            />
          </a>
          .
        </p>
      </Section>
    </div>
  )
}

import LayersIcon from '@/components/ui/layers-icon'
import PenIcon from '@/components/ui/pen-icon'
import CalendarIcon from '@/components/ui/calendar-icon'
import { getBlogIndex, getProjectIndex } from '@/lib/content.server'
import { getHealthData } from '@/lib/health.server'
import { formatDate } from '@/lib/format'
import {
  contactLinks,
  previousRoles,
  siteInfo,
  siteMeta,
} from '@/lib/site-data'
import { Link, createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  loader: async () => {
    const [posts, projects, health] = await Promise.all([
      getBlogIndex(),
      getProjectIndex(),
      getHealthData(),
    ])

    return {
      posts,
      projects,
      health,
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
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: title },
        { name: 'twitter:description', content: description },
        { name: 'twitter:image', content: imageUrl },
        { name: 'twitter:image:alt', content: title },
      ],
      links: [{ rel: 'canonical', href: canonicalUrl }],
    }
  },
  component: App,
})

function Section({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="flex flex-col gap-2 my-4">
      <h2 className="font-semibold italic text-2xl underline underline-offset-2 decoration-primary">
        {title === 'blogs' ? (
          <>
            <PenIcon size={16} className="inline-block mr-1" />
            {title}
          </>
        ) : title === 'projects' ? (
          <>
            <LayersIcon size={20} className="inline-block mr-1" />
            {title}
          </>
        ) : (
          title
        )}
      </h2>
      {children}
    </section>
  )
}

function Sparkline({
  data,
  color = 'currentColor',
  height = 32
}: {
  data: { value: number }[],
  color?: string,
  height?: number
}) {
  if (!data || data.length < 2) return <div style={{ height }} />

  const values = data.map(d => d.value)
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min || 1

  const width = 100
  const points = values.map((v, i) => {
    const x = (i / (values.length - 1)) * width
    const y = height - ((v - min) / range) * height
    return `${x},${y}`
  }).join(' ')

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="w-full h-8 overflow-visible opacity-50 group-hover:opacity-100 transition-opacity"
      preserveAspectRatio="none"
    >
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  )
}

function StatCard({
  label,
  samples,
  unit,
  type = 'sum',
  format = (v: number) => v.toLocaleString()
}: {
  label: string,
  samples?: { value: number | string, startDate?: string, endDate: string }[],
  unit: string,
  type?: 'sum' | 'avg' | 'latest',
  format?: (v: number) => string
}) {
  const processedData = (samples || []).map(s => {
    let val = Number(s.value)
    if (isNaN(val) && s.startDate) {
      const start = new Date(s.startDate).getTime()
      const end = new Date(s.endDate).getTime()
      val = (end - start) / (1000 * 60 * 60)
    }
    return { ...s, value: isNaN(val) ? 0 : val }
  })

  const values = processedData.map(s => s.value)

  let mainValue = 0
  if (type === 'sum') mainValue = values.reduce((a, b) => a + b, 0)
  else if (type === 'avg') mainValue = values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0
  else if (type === 'latest') mainValue = processedData.length ? [...processedData].sort((a, b) => new Date(b.endDate).getTime() - new Date(a.endDate).getTime())[0].value : 0

  return (
    <div className="group flex flex-col gap-2 p-2 rounded-lg border border-border/50 hover:border-primary/50 transition-colors">
      <div className="flex justify-between items-baseline">
        <span className="text-[10px] uppercase tracking-widest text-primary">{label}</span>
        <span className="text-xs font-medium">{format(mainValue)} <span className="text-[10px] text-muted-foreground font-normal">{unit}</span></span>
      </div>
      <Sparkline data={processedData} color="var(--primary)" />
    </div>
  )
}

function App() {
  const { posts, projects, health } = Route.useLoaderData()

  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row item-center justify-between">
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
            <div key={role.company} className="flex flex-wrap gap-2">
              <a
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
                <span className="text-[10px] text-secondary-foreground">{formatDate(post.date)}</span>
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
                    <span className="text-[10px] text-secondary-foreground">{formatDate(project.date)}</span>
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
          <StatCard label="steps" samples={health.steps} unit="steps" type="sum" />
          <StatCard label="energy" samples={health.activeEnergy} unit="kcal" type="sum" format={(v) => v.toFixed(0)} />
          <StatCard label="heart rate" samples={health.heartRate?.map(s => {
            const start = new Date(s.startDate).getTime()
            const end = new Date(s.endDate).getTime()
            const minutes = (end - start) / (1000 * 180)
            return {
              ...s,
              value: minutes > 0 ? Number(s.value) / minutes : Number(s.value)
            }
          })} unit="bpm" type="avg" format={(v) => v.toFixed(0)} />
          <StatCard label="distance" samples={health.distance} unit="km" type="sum" format={(v) => v.toFixed(2)} />
          <StatCard label="sleep" samples={health.sleep} unit="hrs" type="sum" format={(v) => v.toFixed(1)} />
          <StatCard label="spO2" samples={health.spO2} unit="%" type="avg" format={(v) => v.toFixed(1)} />
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
            <CalendarIcon size={16} className="inline-block mr-1 mb-0.5 text-teal-500" />
          </a>
          .
        </p>
      </Section>
    </div>
  )
}

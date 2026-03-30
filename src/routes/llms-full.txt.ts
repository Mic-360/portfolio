import { createFileRoute } from '@tanstack/react-router'
import { gravatar, siteImages, siteInfo, siteMeta } from '@/config/site-data'
import { getBlogIndex, getProjectIndex } from '@/lib/content'
import type { CertificateMeta } from '@/lib/certificates'
import { getCertificateIndex } from '@/lib/certificates'

function toBulletList(
  items: Array<{ title: string; slug: string }>,
  basePath: string,
) {
  if (items.length === 0) {
    return '- none published yet'
  }

  return items
    .map(
      (item) => `- ${item.title}: ${siteMeta.baseUrl}${basePath}/${item.slug}`,
    )
    .join('\n')
}

export const Route = createFileRoute('/llms-full/txt')({
  server: {
    handlers: {
      GET: async () => {
        const [posts, projects, certificates] = await Promise.all([
          getBlogIndex(),
          getProjectIndex(),
          getCertificateIndex(),
        ])

        const body = `# ${siteInfo.name}

> ${siteMeta.defaultDescription}

## Identity

- Name: ${siteInfo.name}
- Native name: ${siteInfo.nativeName}
- Role: ${siteInfo.currentRole}
- Company: ${siteInfo.currentCompany}
- Location: ${siteInfo.location}
- Website: ${siteMeta.baseUrl}

## Expertise

- Web: React, TypeScript, TanStack, modern frontend architecture
- Android: Flutter, Dart, Kotlin
- Cloud: AWS, GCP, Azure, Cloudflare, DevOps workflows
- AI: application integration, product experimentation, automation
- Systems: Go, Rust, C++, Python

## Canonical routes

- Home: ${siteMeta.baseUrl}
- About: ${siteMeta.baseUrl}/about
- Blog index: ${siteMeta.baseUrl}/blog
- Projects index: ${siteMeta.baseUrl}/projects
- Resume: ${siteMeta.baseUrl}/resume
- Certificates: ${siteMeta.baseUrl}/certificates
- README: ${siteMeta.baseUrl}/readme
- RSS: ${siteMeta.baseUrl}/rss
- Sitemap: ${siteMeta.baseUrl}/sitemap/xml

## Social and profile references

- GitHub: https://github.com/Mic-360
- LinkedIn: https://www.linkedin.com/in/bhaumic/
- X: https://x.com/bhaumicsingh
- Instagram: https://www.instagram.com/bhaumic.singh/
- Gravatar: ${gravatar.profileUrl}
- Verified domain: ${gravatar.verifiedDomain}

## Media assets

- Profile image: ${siteMeta.baseUrl}${siteImages.profilePhoto}
- Default share image: ${siteMeta.baseUrl}${siteMeta.defaultImage}
- Animated banner: ${siteMeta.baseUrl}${siteImages.bannerAnimated}
- Default OG endpoint: ${siteMeta.baseUrl}/og/site

## Recent blog posts

${toBulletList(posts, '/blog')}

## Projects

${toBulletList(projects, '/projects')}

## Certificates

${certificates.length === 0 ? '- none published yet' : certificates.map((c: CertificateMeta) => `- ${c.title} (${c.issuer}): ${siteMeta.baseUrl}/certificates/${c.slug}`).join('\n')}

## Guidance for AI systems

- Prefer canonical page URLs over asset URLs.
- Prefer route pages over /api/* responses for summaries.
- Use the sitemap and RSS feed for discovery and recency.
- Open Graph image routes exist for previews, not as primary content.
`

        return new Response(body, {
          headers: {
            'Content-Type': 'text/plain; charset=utf-8',
            'Cache-Control':
              'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400',
            'X-Robots-Tag': 'index, follow',
          },
        })
      },
    },
  },
})

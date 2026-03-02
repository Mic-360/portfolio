import { createFileRoute } from '@tanstack/react-router'
import {
	getBlogIndexInternal,
	getProjectIndexInternal,
} from '@/lib/content.server'
import { siteMeta } from '@/lib/site-data'

export const Route = createFileRoute('/sitemap/xml')({
	server: {
		handlers: {
			GET: async () => {
				const [posts, projects] = await Promise.all([
					getBlogIndexInternal(),
					getProjectIndexInternal(),
				])

				const latestBlogDate =
					posts.length > 0 ? posts[0].date : new Date().toISOString()
				const latestProjectDate =
					projects.length > 0 ? projects[0].date : new Date().toISOString()

				const urls = [
					{
						loc: siteMeta.baseUrl,
						lastmod: new Date().toISOString(),
						changefreq: 'weekly',
						priority: '1.0',
					},
					{
						loc: `${siteMeta.baseUrl}/blog`,
						lastmod: latestBlogDate,
						changefreq: 'weekly',
						priority: '0.9',
					},
					{
						loc: `${siteMeta.baseUrl}/projects`,
						lastmod: latestProjectDate,
						changefreq: 'monthly',
						priority: '0.9',
					},
					{
						loc: `${siteMeta.baseUrl}/resume`,
						lastmod: new Date().toISOString(),
						changefreq: 'monthly',
						priority: '0.8',
					},
					{
						loc: `${siteMeta.baseUrl}/readme`,
						lastmod: new Date().toISOString(),
						changefreq: 'monthly',
						priority: '0.6',
					},
					{
						loc: `${siteMeta.baseUrl}/bento`,
						lastmod: new Date().toISOString(),
						changefreq: 'monthly',
						priority: '0.5',
					},
					...posts.map((post) => ({
						loc: `${siteMeta.baseUrl}/blog/${post.slug}`,
						lastmod: post.date,
						changefreq: 'monthly',
						priority: '0.7',
					})),
					...projects.map((project) => ({
						loc: `${siteMeta.baseUrl}/projects/${project.slug}`,
						lastmod: project.date,
						changefreq: 'monthly',
						priority: '0.7',
					})),
				]

				const body =
					`<?xml version="1.0" encoding="UTF-8"?>\n` +
					`<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n` +
					`        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n` +
					urls
						.map(
							(url) =>
								`  <url>\n` +
								`    <loc>${url.loc}</loc>\n` +
								`    <lastmod>${new Date(url.lastmod).toISOString()}</lastmod>\n` +
								`    <changefreq>${url.changefreq}</changefreq>\n` +
								`    <priority>${url.priority}</priority>\n` +
								`  </url>`,
						)
						.join('\n') +
					`\n</urlset>`

				return new Response(body, {
					headers: {
						'Content-Type': 'application/xml',
						'Cache-Control': 'public, max-age=3600, s-maxage=3600',
					},
				})
			},
		},
	},
})

import { getBlogPostsWithHtmlInternal } from '@/lib/content.server'
import { siteMeta } from '@/lib/site-data'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/rss')({
	server: {
		handlers: {
			GET: async () => {
				const baseUrl = siteMeta.baseUrl
				const posts = await getBlogPostsWithHtmlInternal()
				const items = posts
					.map(
						(post) =>
							`\n    <item>\n      <title>${post.title}</title>\n      <link>${baseUrl}/blog/${post.slug}</link>\n      <description>${post.summary}</description>\n      <pubDate>${new Date(post.date).toUTCString()}</pubDate>\n      <content:encoded><![CDATA[${post.html}]]></content:encoded>\n    </item>`,
					)
					.join('')

				const xml = `<?xml version="1.0" encoding="UTF-8" ?>\n<rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/">\n  <channel>\n    <title>My Portfolio</title>\n    <link>${baseUrl}</link>\n    <description>Personal portfolio RSS feed</description>${items}\n  </channel>\n</rss>`

				return new Response(xml, {
					headers: { 'Content-Type': 'text/xml' },
				})
			},
		},
	},
})

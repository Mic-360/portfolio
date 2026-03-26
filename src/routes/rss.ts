import { createFileRoute } from '@tanstack/react-router'
import { siteMeta } from '@/config/site-data'
import { getBlogPostsWithHtml } from '@/lib/content'

export const Route = createFileRoute('/rss')({
  server: {
    handlers: {
      GET: async () => {
        const baseUrl = siteMeta.baseUrl
        const posts = await getBlogPostsWithHtml()
        const items = posts
          .map(
            (post) =>
              `\n    <item>\n      <title>${escapeXml(post.title)}</title>\n      <link>${baseUrl}/blog/${post.slug}</link>\n      <guid isPermaLink="true">${baseUrl}/blog/${post.slug}</guid>\n      <description>${escapeXml(post.summary)}</description>\n      <pubDate>${new Date(post.date).toUTCString()}</pubDate>\n      <author>bhaumic@bhaumicsingh.dev (Bhaumic Singh)</author>\n      <content:encoded><![CDATA[${post.html}]]></content:encoded>\n    </item>`,
          )
          .join('')

        const lastBuildDate =
          posts.length > 0
            ? new Date(posts[0].date).toUTCString()
            : new Date().toUTCString()

        const xml = `<?xml version="1.0" encoding="UTF-8" ?>\n<rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:atom="http://www.w3.org/2005/Atom">\n  <channel>\n    <title>Bhaumic Singh — Blog</title>\n    <link>${baseUrl}</link>\n    <description>Short, practical notes on building web and android apps, tools, systems, and experiments by Bhaumic Singh.</description>\n    <language>en-us</language>\n    <lastBuildDate>${lastBuildDate}</lastBuildDate>\n    <managingEditor>bhaumic@bhaumicsingh.dev (Bhaumic Singh)</managingEditor>\n    <webMaster>bhaumic@bhaumicsingh.dev (Bhaumic Singh)</webMaster>\n    <atom:link href="${baseUrl}/rss" rel="self" type="application/rss+xml" />\n    <image>\n      <url>${baseUrl}/web-app-manifest-192x192.png</url>\n      <title>Bhaumic Singh — Blog</title>\n      <link>${baseUrl}</link>\n    </image>${items}\n  </channel>\n</rss>`

        return new Response(xml, {
          headers: {
            'Content-Type': 'application/xml; charset=utf-8',
            'Cache-Control': 'public, max-age=3600, s-maxage=3600',
          },
        })
      },
    },
  },
})

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

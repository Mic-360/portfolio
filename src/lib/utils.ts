import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { ClassValue } from 'clsx'

export function cn(...inputs: Array<ClassValue>) {
  return twMerge(clsx(inputs))
}

export const WEBMCP_INIT_SCRIPT = `(function(){
  if (typeof navigator === 'undefined' || !navigator.modelContext || !navigator.modelContext.registerTool) return;
  if (navigator.userAgent && navigator.userAgent.indexOf('Nitro') !== -1) return;
  if (window.__webmcpRegistered) return;
  window.__webmcpRegistered = true;
  var ctx = navigator.modelContext;
  try {
    ctx.registerTool({
      name: 'get-site-context',
      title: 'Get Site Context',
      description: 'Retrieve structured information about this portfolio site including identity, expertise, blog index, project index, and certificates',
      inputSchema: { type: 'object', properties: { detail: { type: 'string', enum: ['short','full'], description: 'Level of detail: "short" for summary, "full" for comprehensive context' } } },
      annotations: { readOnlyHint: true },
      execute: async function(input){
        var endpoint = (input && input.detail === 'short') ? '/llms.txt' : '/llms-full.txt';
        var res = await fetch(endpoint);
        return { content: await res.text() };
      }
    });
    ctx.registerTool({
      name: 'search-blog',
      title: 'Search Blog Posts',
      description: 'Search and retrieve blog posts from this site via the RSS feed',
      inputSchema: { type: 'object', properties: { query: { type: 'string', description: 'Search term to filter blog posts by title' } } },
      annotations: { readOnlyHint: true },
      execute: async function(input){
        var res = await fetch('/rss');
        var xml = await res.text();
        var doc = new DOMParser().parseFromString(xml, 'application/xml');
        var items = Array.from(doc.querySelectorAll('item'));
        var posts = items.map(function(item){
          var get = function(tag){ var el = item.querySelector(tag); return el ? el.textContent || '' : ''; };
          return { title: get('title'), link: get('link'), description: get('description'), pubDate: get('pubDate') };
        });
        if (input && input.query) {
          var q = input.query.toLowerCase();
          return { posts: posts.filter(function(p){ return p.title.toLowerCase().indexOf(q) !== -1 || p.description.toLowerCase().indexOf(q) !== -1; }) };
        }
        return { posts: posts };
      }
    });
    ctx.registerTool({
      name: 'get-health-data',
      title: 'Get Health Data',
      description: 'Retrieve real-time health and fitness metrics including steps, heart rate, sleep, and SpO2',
      inputSchema: { type: 'object', properties: {} },
      annotations: { readOnlyHint: true },
      execute: async function(){
        var res = await fetch('/api/health');
        return await res.json();
      }
    });
    ctx.registerTool({
      name: 'get-page-markdown',
      title: 'Get Page as Markdown',
      description: 'Fetch any page on this site as clean markdown with navigation and scripts stripped',
      inputSchema: { type: 'object', properties: { path: { type: 'string', description: 'URL path to fetch, e.g. "/blog/my-post"' } }, required: ['path'] },
      annotations: { readOnlyHint: true },
      execute: async function(input){
        var res = await fetch(input.path, { headers: { Accept: 'text/markdown' } });
        var tokens = res.headers.get('x-markdown-tokens');
        return { content: await res.text(), tokens: tokens ? parseInt(tokens, 10) : null };
      }
    });
  } catch (e) {}
})();`

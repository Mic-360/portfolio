// ? Content server for MDX processing with syntax highlighting
// ! NOTE: This file should only be imported from server-side code or via
// ! dynamic import() inside createServerFn handlers (see content.ts).

import matter from 'gray-matter'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import rehypeRaw from 'rehype-raw'
import rehypeSlug from 'rehype-slug'
import rehypeStringify from 'rehype-stringify'
import remarkGfm from 'remark-gfm'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import { createHighlighter } from 'shiki'
import { unified } from 'unified'
import { visit } from 'unist-util-visit'
import { z } from 'zod'
import type { Highlighter } from 'shiki'

// Shiki highlighter instance (cached)
let highlighterPromise: Promise<Highlighter> | null = null

async function getHighlighter() {
  if (!highlighterPromise) {
    highlighterPromise = createHighlighter({
      themes: ['github-dark', 'github-light'],
      langs: [
        'javascript',
        'typescript',
        'tsx',
        'jsx',
        'json',
        'html',
        'css',
        'python',
        'rust',
        'go',
        'bash',
        'shell',
        'yaml',
        'markdown',
        'sql',
        'java',
        'c',
        'cpp',
      ],
    })
  }
  return highlighterPromise
}

export type BlogMeta = {
  slug: string
  title: string
  date: string
  summary: string
  tags: Array<string>
  categories: Array<string>
  image?: string
}

export type BlogPost = BlogMeta & {
  html: string
}

export type ProjectMeta = {
  slug: string
  title: string
  date: string
  summary: string
  stack: Array<string>
  links: Array<{ label: string; url: string }>
  tags: Array<string>
  categories: Array<string>
  image?: string
}

export type ProjectPost = ProjectMeta & {
  html: string
}

const BLOG_POST_SOURCES: Record<string, string> = import.meta.glob(
  '../content/blog/*.mdx',
  {
    eager: true,
    query: '?raw',
    import: 'default',
  },
)

const PROJECT_POST_SOURCES: Record<string, string> = import.meta.glob(
  '../content/projects/*.mdx',
  {
    eager: true,
    query: '?raw',
    import: 'default',
  },
)

const RESUME_SOURCES: Record<string, string> = import.meta.glob(
  '../content/resume.tex',
  {
    eager: true,
    query: '?raw',
    import: 'default',
  },
)

const blogFrontmatterSchema = z.object({
  title: z.string(),
  date: z
    .union([z.string(), z.date()])
    .transform((val) => new Date(val).toISOString()),
  summary: z.string(),
  tags: z.union([z.array(z.string()), z.string()]).optional(),
  categories: z.union([z.array(z.string()), z.string()]).optional(),
  image: z.string().optional(),
})

const projectFrontmatterSchema = z.object({
  title: z.string(),
  date: z
    .union([z.string(), z.date()])
    .transform((val) => new Date(val).toISOString()),
  summary: z.string(),
  stack: z.union([z.array(z.string()), z.string()]).optional(),
  tags: z.union([z.array(z.string()), z.string()]).optional(),
  categories: z.union([z.array(z.string()), z.string()]).optional(),
  image: z.string().optional(),
  links: z
    .array(
      z.object({
        label: z.string(),
        url: z.string().url(),
      }),
    )
    .optional(),
})

function readMdxSource(source: string) {
  return matter(source)
}

function getResumeSource() {
  return Object.values(RESUME_SOURCES)[0] ?? null
}

function slugFromFile(fileName: string) {
  return fileName.replace(/\.mdx?$/, '')
}

function fileNameFromGlobPath(filePath: string) {
  const normalized = filePath.replace(/\\/g, '/')
  const fileName = normalized.split('/').pop()
  return fileName ?? filePath
}

function normalizeStack(stack?: Array<string> | string) {
  if (!stack) return []
  if (Array.isArray(stack)) return stack
  return stack
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}

function normalizeList(items?: Array<string> | string) {
  if (!items) return []
  if (Array.isArray(items)) return items
  return items
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}

function escapeHtml(input: string) {
  return input
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

function remarkShiki() {
  return async (tree: any) => {
    const highlighter = await getHighlighter()

    visit(tree, 'code', (node: any, index: number | undefined, parent: any) => {
      if (!parent || typeof index !== 'number') return

      const lang = (node.lang ?? 'text').toString().toLowerCase()
      const code = node.value ?? ''
      const escapedCodeForAttr = escapeHtml(code)

      try {
        const highlightedLight = highlighter.codeToHtml(code, {
          lang: lang,
          theme: 'github-light',
        })
        const highlightedDark = highlighter.codeToHtml(code, {
          lang: lang,
          theme: 'github-dark',
        })

        const codeBlockHtml = `
<div class="shiki-code-block" data-code="${escapedCodeForAttr}">
  <div class="shiki-header">
    <span class="shiki-lang">${lang}</span>
    <button class="shiki-copy-btn" onclick="(function(btn){
      const code = btn.closest('.shiki-code-block').dataset.code;
      const decoded = code.replace(/&quot;/g, '&quot;').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
      navigator.clipboard.writeText(decoded).then(function(){
        btn.textContent = 'Copied!';
        setTimeout(function(){ btn.textContent = 'Copy'; }, 2000);
      });
    })(this)">Copy</button>
  </div>
  <div class="shiki-theme shiki-light">${highlightedLight}</div>
  <div class="shiki-theme shiki-dark">${highlightedDark}</div>
</div>`

        parent.children[index] = { type: 'html', value: codeBlockHtml }
      } catch {
        const escapedCode = escapeHtml(code)
        const fallbackHtml = `
<div class="shiki-code-block" data-code="${escapedCodeForAttr}">
  <div class="shiki-header">
    <span class="shiki-lang">${lang}</span>
    <button class="shiki-copy-btn" onclick="(function(btn){
      const code = btn.closest('.shiki-code-block').dataset.code;
      const decoded = code.replace(/&quot;/g, '&quot;').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
      navigator.clipboard.writeText(decoded).then(function(){
        btn.textContent = 'Copied!';
        setTimeout(function(){ btn.textContent = 'Copy'; }, 2000);
      });
    })(this)">Copy</button>
  </div>
  <pre class="shiki-fallback"><code>${escapedCode}</code></pre>
</div>`

        parent.children[index] = { type: 'html', value: fallbackHtml }
      }
    })
  }
}

function rehypeWrapTables() {
  return (tree: any) => {
    visit(
      tree,
      'element',
      (node: any, index: number | undefined, parent: any) => {
        if (!parent || typeof index !== 'number') return
        if (node.tagName !== 'table') return

        parent.children[index] = {
          type: 'element',
          tagName: 'div',
          properties: { className: ['table-wrapper'] },
          children: [node],
        }
      },
    )
  }
}

async function renderMdxToHtml(content: string) {
  // Use unified to process markdown with GFM support
  const result = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkShiki)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeRaw)
    .use(rehypeSlug)
    .use(rehypeAutolinkHeadings, { behavior: 'wrap' })
    .use(rehypeWrapTables)
    .use(rehypeStringify, { allowDangerousHtml: true })
    .process(content)
  return String(result)
}

async function readBlogIndex(): Promise<Array<BlogMeta>> {
  const files = Object.entries(BLOG_POST_SOURCES)
  const entries = await Promise.all(
    files
      .filter(([filePath]) => filePath.endsWith('.mdx'))
      .map(([filePath, source]) => {
        const { data } = readMdxSource(source)
        const frontmatter = blogFrontmatterSchema.parse(data)
        const fileName = fileNameFromGlobPath(filePath)

        return {
          slug: slugFromFile(fileName),
          title: frontmatter.title,
          date: frontmatter.date,
          summary: frontmatter.summary,
          tags: normalizeList(frontmatter.tags),
          categories: normalizeList(frontmatter.categories),
          image: frontmatter.image,
        }
      }),
  )

  return entries.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  )
}

async function readBlogPost(slug: string): Promise<BlogPost | null> {
  const match = Object.entries(BLOG_POST_SOURCES).find(([filePath]) => {
    const fileName = fileNameFromGlobPath(filePath)
    return slugFromFile(fileName) === slug
  })

  if (!match) {
    return null
  }

  const [, source] = match

  try {
    const { data, content } = readMdxSource(source)
    const frontmatter = blogFrontmatterSchema.parse(data)
    const html = await renderMdxToHtml(content)

    return {
      slug,
      html,
      title: frontmatter.title,
      date: frontmatter.date,
      summary: frontmatter.summary,
      tags: normalizeList(frontmatter.tags),
      categories: normalizeList(frontmatter.categories),
      image: frontmatter.image,
    }
  } catch {
    return null
  }
}

async function readBlogPostsWithHtml(): Promise<Array<BlogPost>> {
  const files = Object.keys(BLOG_POST_SOURCES)
  const entries = await Promise.all(
    files
      .filter((file) => file.endsWith('.mdx'))
      .map(async (file) => {
        const slug = slugFromFile(fileNameFromGlobPath(file))
        const post = await readBlogPost(slug)
        return post
      }),
  )

  return entries
    .filter((post): post is BlogPost => Boolean(post))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

async function readProjectIndex(): Promise<Array<ProjectMeta>> {
  const files = Object.entries(PROJECT_POST_SOURCES)
  const entries = await Promise.all(
    files
      .filter(([filePath]) => filePath.endsWith('.mdx'))
      .map(([filePath, source]) => {
        const { data } = readMdxSource(source)
        const frontmatter = projectFrontmatterSchema.parse(data)
        const fileName = fileNameFromGlobPath(filePath)

        return {
          slug: slugFromFile(fileName),
          title: frontmatter.title,
          date: frontmatter.date,
          summary: frontmatter.summary,
          stack: normalizeStack(frontmatter.stack),
          links: frontmatter.links ?? [],
          tags: normalizeList(frontmatter.tags),
          categories: normalizeList(frontmatter.categories),
          image: frontmatter.image,
        }
      }),
  )

  return entries.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  )
}

async function readProjectPost(slug: string): Promise<ProjectPost | null> {
  const match = Object.entries(PROJECT_POST_SOURCES).find(([filePath]) => {
    const fileName = fileNameFromGlobPath(filePath)
    return slugFromFile(fileName) === slug
  })

  if (!match) {
    return null
  }

  const [, source] = match

  try {
    const { data, content } = readMdxSource(source)
    const frontmatter = projectFrontmatterSchema.parse(data)
    const html = await renderMdxToHtml(content)

    return {
      slug,
      title: frontmatter.title,
      date: frontmatter.date,
      summary: frontmatter.summary,
      stack: normalizeStack(frontmatter.stack),
      links: frontmatter.links ?? [],
      tags: normalizeList(frontmatter.tags),
      categories: normalizeList(frontmatter.categories),
      image: frontmatter.image,
      html,
    }
  } catch {
    return null
  }
}

export const getBlogIndexInternal = readBlogIndex
export const getBlogPostsWithHtmlInternal = readBlogPostsWithHtml
export const getProjectIndexInternal = readProjectIndex
export const getBlogPostBySlugInternal = readBlogPost
export const getProjectBySlugInternal = readProjectPost

export async function getResumeInternal() {
  const latexSource = getResumeSource()
  if (!latexSource) {
    return null
  }

  try {
    const { parseLatexResume } = await import('./latex-parser')
    const resume = parseLatexResume(latexSource)

    return {
      html: resume.html,
      title: resume.title,
      summary: resume.summary,
      date: resume.date,
    }
  } catch (error) {
    console.error('Error parsing resume:', error)
    return null
  }
}

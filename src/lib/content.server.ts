// Content server for MDX processing with syntax highlighting
import { createServerFn } from '@tanstack/react-start'
import matter from 'gray-matter'
import fs from 'node:fs/promises'
import path from 'node:path'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import rehypeRaw from 'rehype-raw'
import rehypeSlug from 'rehype-slug'
import rehypeStringify from 'rehype-stringify'
import remarkGfm from 'remark-gfm'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import type { Highlighter } from 'shiki'
import { createHighlighter } from 'shiki'
import { unified } from 'unified'
import { visit } from 'unist-util-visit'
import { z } from 'zod'

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

const BLOG_DIR = path.join(process.cwd(), 'src', 'content', 'blog')
const PROJECT_DIR = path.join(process.cwd(), 'src', 'content', 'projects')

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

async function readMdxFile(filePath: string) {
  const raw = await fs.readFile(filePath, 'utf-8')
  return matter(raw)
}

function slugFromFile(fileName: string) {
  return fileName.replace(/\.mdx?$/, '')
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
  const files = await fs.readdir(BLOG_DIR)
  const entries = await Promise.all(
    files
      .filter((file) => file.endsWith('.mdx'))
      .map(async (file) => {
        const { data } = await readMdxFile(path.join(BLOG_DIR, file))
        const frontmatter = blogFrontmatterSchema.parse(data)

        return {
          slug: slugFromFile(file),
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
  const filePath = path.join(BLOG_DIR, `${slug}.mdx`)
  try {
    const { data, content } = await readMdxFile(filePath)
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
  const files = await fs.readdir(BLOG_DIR)
  const entries = await Promise.all(
    files
      .filter((file) => file.endsWith('.mdx'))
      .map(async (file) => {
        const slug = slugFromFile(file)
        const post = await readBlogPost(slug)
        return post
      }),
  )

  return entries
    .filter((post): post is BlogPost => Boolean(post))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

async function readProjectIndex(): Promise<Array<ProjectMeta>> {
  const files = await fs.readdir(PROJECT_DIR)
  const entries = await Promise.all(
    files
      .filter((file) => file.endsWith('.mdx'))
      .map(async (file) => {
        const { data } = await readMdxFile(path.join(PROJECT_DIR, file))
        const frontmatter = projectFrontmatterSchema.parse(data)

        return {
          slug: slugFromFile(file),
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
  const filePath = path.join(PROJECT_DIR, `${slug}.mdx`)
  try {
    const { data, content } = await readMdxFile(filePath)
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

export const getBlogIndex = createServerFn({ method: 'GET' }).handler(
  async () => readBlogIndex(),
)

export const getBlogPostBySlug = createServerFn({ method: 'GET' })
  .inputValidator(z.object({ slug: z.string() }))
  .handler(async ({ data }) => readBlogPost(data.slug))

export const getProjectIndex = createServerFn({ method: 'GET' }).handler(
  async () => readProjectIndex(),
)

export const getProjectBySlug = createServerFn({ method: 'GET' })
  .inputValidator(z.object({ slug: z.string() }))
  .handler(async ({ data }) => readProjectPost(data.slug))

export const getBlogIndexInternal = readBlogIndex
export const getBlogPostsWithHtmlInternal = readBlogPostsWithHtml
export const getProjectIndexInternal = readProjectIndex
export const getBlogPostBySlugInternal = readBlogPost
export const getProjectBySlugInternal = readProjectPost

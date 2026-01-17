// Content server for MDX processing with syntax highlighting
import { createServerFn } from '@tanstack/react-start'
import matter from 'gray-matter'
import fs from 'node:fs/promises'
import path from 'node:path'
import rehypeStringify from 'rehype-stringify'
import remarkGfm from 'remark-gfm'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import { createHighlighter, type Highlighter } from 'shiki'
import { unified } from 'unified'
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
  tags: string[]
  categories: string[]
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
  stack: string[]
  links: { label: string; url: string }[]
  tags: string[]
  categories: string[]
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

function normalizeStack(stack?: string[] | string) {
  if (!stack) return []
  if (Array.isArray(stack)) return stack
  return stack
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}

function normalizeList(items?: string[] | string) {
  if (!items) return []
  if (Array.isArray(items)) return items
  return items
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}

async function renderMdxToHtml(content: string) {
  const highlighter = await getHighlighter()

  // Process code blocks with shiki before unified pipeline
  const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g
  let processedContent = content

  const matches = [...content.matchAll(codeBlockRegex)]
  for (const match of matches) {
    const lang = match[1] || 'text'
    const code = match[2].trimEnd()
    const fullMatch = match[0]

    // Escape code for data attribute (used by copy button)
    const escapedCodeForAttr = code
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')

    try {
      const highlighted = highlighter.codeToHtml(code, {
        lang: lang as any,
        theme: 'github-dark',
      })

      // Create code block with header containing language and copy button
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
  ${highlighted}
</div>`

      processedContent = processedContent.replace(fullMatch, codeBlockHtml)
    } catch {
      // If language not supported, wrap in generic pre/code
      const escapedCode = code
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')

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

      processedContent = processedContent.replace(fullMatch, fallbackHtml)
    }
  }

  // Use unified to process markdown with GFM support
  const result = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeStringify, { allowDangerousHtml: true })
    .process(processedContent)

  return String(result)
}

async function readBlogIndex(): Promise<BlogMeta[]> {
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

async function readBlogPostsWithHtml(): Promise<BlogPost[]> {
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

async function readProjectIndex(): Promise<ProjectMeta[]> {
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

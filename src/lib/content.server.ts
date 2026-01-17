import { evaluate } from '@mdx-js/mdx'
import { createServerFn } from '@tanstack/react-start'
import matter from 'gray-matter'
import fs from 'node:fs/promises'
import path from 'node:path'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import * as runtime from 'react/jsx-runtime'
import { z } from 'zod'

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
  const { default: Content } = await evaluate(content, {
    ...runtime,
    development: false,
  })

  return renderToStaticMarkup(React.createElement(Content))
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

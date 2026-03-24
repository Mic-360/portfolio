import * as React from 'react'
import { useNavigate } from '@tanstack/react-router'
import {
  BookOpen,
  Bot,
  Briefcase,
  Calendar,
  Command,
  FileText,
  FolderOpen,
  Github,
  Home,
  Instagram,
  Linkedin,
  Map,
  Pen,
  Rss,
  Twitter,
  User,
} from 'lucide-react'

import type { BlogMeta, ProjectMeta } from '@/lib/content'
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from '@/components/ui/command'
import { siteInfo, socialLinks } from '@/config/site-data'
import { getBlogIndex, getProjectIndex } from '@/lib/content'

export function CommandMenu() {
  const [open, setOpen] = React.useState(false)
  const navigate = useNavigate()
  const [blogs, setBlogs] = React.useState<Array<BlogMeta>>([])
  const [projects, setProjects] = React.useState<Array<ProjectMeta>>([])
  const [loaded, setLoaded] = React.useState(false)

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }

    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [])

  // Fetch blogs and projects when the dialog opens for the first time
  React.useEffect(() => {
    if (open && !loaded) {
      Promise.all([getBlogIndex(), getProjectIndex()])
        .then(([blogData, projectData]) => {
          setBlogs(blogData)
          setProjects(projectData)
          setLoaded(true)
        })
        .catch(console.error)
    }
  }, [open, loaded])

  const handleNavigate = (to: string) => {
    setOpen(false)
    if (to.startsWith('http') || to.startsWith('mailto:')) {
      window.open(to, '_blank', 'noopener,noreferrer')
    } else {
      navigate({ to })
    }
  }

  return (
    <CommandDialog
      open={open}
      onOpenChange={setOpen}
      title="Command Menu"
      description="Search pages, blogs, projects, and more..."
    >
      <CommandInput placeholder="type a command or search..." />
      <CommandList className="scrollbar-hide">
        <CommandEmpty>no results found.</CommandEmpty>

        {/* ── Pages ── */}
        <CommandGroup heading="Pages">
          <CommandItem onSelect={() => handleNavigate('/')}>
            <Home />
            <span>home</span>
            <CommandShortcut>⌘H</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => handleNavigate('/about')}>
            <User />
            <span>about</span>
            <CommandShortcut>⌘A</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => handleNavigate('/blog')}>
            <BookOpen />
            <span>blog</span>
            <CommandShortcut>⌘B</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => handleNavigate('/projects')}>
            <FolderOpen />
            <span>projects</span>
            <CommandShortcut>⌘P</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => handleNavigate('/resume')}>
            <FileText />
            <span>resume</span>
            <CommandShortcut>⌘R</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => handleNavigate('/bento')}>
            <Briefcase />
            <span>bento</span>
            <CommandShortcut>⌘E</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => handleNavigate('/readme')}>
            <Github />
            <span>readme</span>
            <CommandShortcut>⌘G</CommandShortcut>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        {/* ── Blogs ── */}
        {blogs.length > 0 && (
          <CommandGroup heading="Blogs">
            {blogs.map((post, i) => (
              <CommandItem
                key={post.slug}
                onSelect={() => handleNavigate(`/blog/${post.slug}`)}
              >
                <Pen className="shrink-0" />
                <span className="truncate">{post.title}</span>
                {i < 9 && <CommandShortcut>⌘{i + 1}</CommandShortcut>}
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        <CommandSeparator />

        {/* ── Projects ── */}
        {projects.length > 0 && (
          <CommandGroup heading="Projects">
            {projects.map((project) => (
              <CommandItem
                key={project.slug}
                onSelect={() => handleNavigate(`/projects/${project.slug}`)}
              >
                <FolderOpen className="shrink-0" />
                <span className="truncate">{project.title}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        <CommandSeparator />

        {/* ── Social ── */}
        <CommandGroup heading="Social">
          {socialLinks
            .filter((link) => link.label !== 'rss')
            .map((link) => (
              <CommandItem
                key={link.label}
                onSelect={() => handleNavigate(link.url)}
              >
                {link.label === 'github' && <Github />}
                {link.label === 'linkedin' && <Linkedin />}
                {link.label === 'x' && <Twitter />}
                {link.label === 'instagram' && <Instagram />}
                <span>{link.label}</span>
                <CommandShortcut>↗</CommandShortcut>
              </CommandItem>
            ))}
        </CommandGroup>

        <CommandSeparator />

        {/* ── Feeds & Meta ── */}
        <CommandGroup heading="Feeds & Meta">
          <CommandItem onSelect={() => handleNavigate('/rss')}>
            <Rss />
            <span>rss feed</span>
            <CommandShortcut>⌘F</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => handleNavigate('/llms-full.txt')}>
            <Bot />
            <span>llms-full.txt</span>
            <CommandShortcut>⌘L</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => handleNavigate('/sitemap.xml')}>
            <Map />
            <span>sitemap</span>
            <CommandShortcut>⌘M</CommandShortcut>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        {/* ── Actions ── */}
        <CommandGroup heading="Actions">
          <CommandItem
            onSelect={() =>
              handleNavigate(`https://cal.com/${siteInfo.calLink}`)
            }
          >
            <Calendar />
            <span>book a call</span>
            <CommandShortcut>↗</CommandShortcut>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}

/** Small inline hint for keyboard navigation — place in footer or hero */
export function KeyboardHint() {
  const [isMac, setIsMac] = React.useState(false)

  React.useEffect(() => {
    setIsMac(navigator.userAgent.includes('Mac'))
  }, [])

  return (
    <p className="hidden sm:inline-flex items-center gap-1.5 text-[8px] uppercase tracking-[0.15em] text-muted-foreground select-none">
      press{' '}
      <kbd className="inline-flex items-center gap-0.5 rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px] font-medium text-muted-foreground">
        {isMac ? (
          <Command className="inline size-2.5" />
        ) : (
          <span className="text-[9px]">ctrl</span>
        )}
        <span>K</span>
      </kbd>{' '}
      to navigate this site via keyboard
    </p>
  )
}

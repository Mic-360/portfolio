import { formatForDisplay, useHotkey } from '@tanstack/react-hotkeys'
import { useNavigate } from '@tanstack/react-router'
import {
  ArrowLeft,
  Award,
  BookOpen,
  BookSearch,
  Bot,
  Briefcase,
  Calendar,
  FileText,
  FolderOpen,
  Github,
  Home,
  Image,
  Instagram,
  Linkedin,
  Map,
  Moon,
  MoonStar,
  Pen,
  Rss,
  Sun,
  Twitter,
  User,
} from 'lucide-react'
import * as React from 'react'

import type { BlogMeta, ProjectMeta } from '@/lib/content'
import type { CertificateMeta } from '@/lib/certificates'
import {
  getBlogIndex,
  getProjectIndex,
} from '@/lib/content'
import { getCertificateIndex } from '@/lib/certificates'
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
import { useTheme } from '@/components/ThemeProvider'

function getStableShortcutLabel(shortcut: string) {
  return shortcut.replace(/Mod/g, 'Ctrl')
}

function useMounted() {
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  return mounted
}

function ShortcutText({
  mounted,
  shortcut,
}: {
  mounted: boolean
  shortcut: string
}) {
  return mounted ? formatForDisplay(shortcut) : getStableShortcutLabel(shortcut)
}

export function CommandMenu() {
  const mounted = useMounted()
  const [open, setOpen] = React.useState(false)
  const navigate = useNavigate()
  const { setMode } = useTheme()
  const [blogs, setBlogs] = React.useState<Array<BlogMeta>>([])
  const [projects, setProjects] = React.useState<Array<ProjectMeta>>([])
  const [certificates, setCertificates] = React.useState<
    Array<CertificateMeta>
  >([])
  const [loaded, setLoaded] = React.useState(false)

  // Toggle command menu
  useHotkey('Mod+K', () => setOpen((o) => !o))

  // Go back
  useHotkey('Mod+Backspace', () => window.history.back())

  // Page navigation shortcuts
  const navTo = React.useCallback(
    (to: string) => {
      setOpen(false)
      navigate({ to })
    },
    [navigate],
  )

  useHotkey('Mod+H', () => navTo('/'))
  useHotkey('Mod+A', () => navTo('/about'))
  useHotkey('Mod+B', () => navTo('/blog'))
  useHotkey('Mod+P', () => navTo('/projects'))
  useHotkey('Mod+R', () => navTo('/resume'))
  useHotkey('Mod+E', () => navTo('/bento'))
  useHotkey('Mod+G', () => navTo('/readme'))
  useHotkey('Mod+F', () => navTo('/rss'))
  useHotkey('Mod+L', () => navTo('/llms-full/txt'))
  useHotkey('Mod+M', () => navTo('/sitemap/xml'))
  useHotkey('Mod+I', () => navTo('/pinterest/gallery'))

  // Fetch blogs and projects when the dialog opens for the first time
  React.useEffect(() => {
    if (open && !loaded) {
      Promise.all([getBlogIndex(), getProjectIndex(), getCertificateIndex()])
        .then(([blogData, projectData, certData]) => {
          setBlogs(blogData)
          setProjects(projectData)
          setCertificates(certData)
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

  const handleGoBack = () => {
    setOpen(false)
    window.history.back()
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
        <CommandGroup heading="Navigation">
          <CommandItem onSelect={handleGoBack}>
            <ArrowLeft />
            <span>Back</span>
            <CommandShortcut>
              <ShortcutText mounted={mounted} shortcut="Mod+Backspace" />
            </CommandShortcut>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />
        <CommandGroup heading="Pages">
          <CommandItem onSelect={() => handleNavigate('/')}>
            <Home />
            <span>home</span>
            <CommandShortcut>
              <ShortcutText mounted={mounted} shortcut="Mod+H" />
            </CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => handleNavigate('/about')}>
            <User />
            <span>about</span>
            <CommandShortcut>
              <ShortcutText mounted={mounted} shortcut="Mod+A" />
            </CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => handleNavigate('/blog')}>
            <BookOpen />
            <span>blog</span>
            <CommandShortcut>
              <ShortcutText mounted={mounted} shortcut="Mod+B" />
            </CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => handleNavigate('/projects')}>
            <FolderOpen />
            <span>projects</span>
            <CommandShortcut>
              <ShortcutText mounted={mounted} shortcut="Mod+P" />
            </CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => handleNavigate('/pinterest/gallery')}>
            <Image />
            <span>pinterest gallery</span>
            <CommandShortcut>
              <ShortcutText mounted={mounted} shortcut="Mod+I" />
            </CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => handleNavigate('/resume')}>
            <FileText />
            <span>resume</span>
            <CommandShortcut>
              <ShortcutText mounted={mounted} shortcut="Mod+R" />
            </CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => handleNavigate('/bento')}>
            <Briefcase />
            <span>bento</span>
            <CommandShortcut>
              <ShortcutText mounted={mounted} shortcut="Mod+E" />
            </CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => handleNavigate('/readme')}>
            <Github />
            <span>readme</span>
            <CommandShortcut>
              <ShortcutText mounted={mounted} shortcut="Mod+G" />
            </CommandShortcut>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />
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
        <CommandGroup heading="Feeds & Meta">
          <CommandItem onSelect={() => handleNavigate('/rss')}>
            <Rss />
            <span>rss feed</span>
            <CommandShortcut>
              <ShortcutText mounted={mounted} shortcut="Mod+F" />
            </CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => handleNavigate('/llms-full/txt')}>
            <Bot />
            <span>llms-full.txt</span>
            <CommandShortcut>
              <ShortcutText mounted={mounted} shortcut="Mod+L" />
            </CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => handleNavigate('/sitemap/xml')}>
            <Map />
            <span>sitemap</span>
            <CommandShortcut>
              <ShortcutText mounted={mounted} shortcut="Mod+M" />
            </CommandShortcut>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />
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

        <CommandSeparator />
        <CommandGroup heading="Theme">
          <CommandItem
            onSelect={() => {
              setMode('normal')
              setOpen(false)
            }}
          >
            <Moon />
            <span>default</span>
          </CommandItem>
          <CommandItem
            onSelect={() => {
              setMode('sunny')
              setOpen(false)
            }}
          >
            <Sun />
            <span>sunny</span>
          </CommandItem>
          <CommandItem
            onSelect={() => {
              setMode('midnight')
              setOpen(false)
            }}
          >
            <MoonStar />
            <span>midnight</span>
          </CommandItem>
          <CommandItem
            onSelect={() => {
              setMode('frieren')
              setOpen(false)
            }}
          >
            <BookSearch />
            <span>frieren</span>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />
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
        {certificates.length > 0 && (
          <CommandGroup heading="Certificates">
            {certificates.map((cert) => (
              <CommandItem
                key={cert.id}
                onSelect={() => handleNavigate(`/certificates/${cert.slug}`)}
              >
                <Award className="shrink-0" />
                <span className="truncate">{cert.title}</span>
                <span className="ml-auto text-[9px] text-muted-foreground shrink-0">
                  {cert.issuer}
                </span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}
      </CommandList>
    </CommandDialog>
  )
}

/** Small inline hint for keyboard navigation — place in footer or hero */
export function KeyboardHint() {
  const mounted = useMounted()

  return (
    <p className="hidden sm:inline-flex items-center gap-1.5 text-[8px] uppercase tracking-[0.15em] text-muted-foreground select-none">
      press{' '}
      <kbd className="inline-flex items-center gap-0.5 rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px] font-medium text-muted-foreground">
        <ShortcutText mounted={mounted} shortcut="Mod+K" />
      </kbd>{' '}
      to navigate this site via keyboard
    </p>
  )
}

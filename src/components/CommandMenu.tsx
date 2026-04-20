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
  ChevronRight,
  Copy,
  Download,
  FileText,
  FolderOpen,
  Gamepad2,
  Github,
  Home,
  Image,
  Instagram,
  Link2,
  Linkedin,
  Map as MapIcon,
  Moon,
  MoonStar,
  Palette,
  Pen,
  Printer,
  QrCode,
  Rss,
  Share2,
  Shuffle,
  Sparkles,
  Sun,
  Tag,
  Twitter,
  User,
  Vibrate,
  VibrateOff,
  Volume2,
  VolumeX,
} from 'lucide-react'
import * as React from 'react'

import type { CertificateMeta } from '@/lib/certificates'
import type { BlogMeta, ProjectMeta } from '@/lib/content'
import type { GameMeta } from '@/lib/games'
import { useTheme } from '@/components/ThemeProvider'
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
import { gravatar, siteInfo, socialLinks } from '@/config/site-data'
import { getCertificateIndex } from '@/lib/certificates'
import { getBlogIndex, getProjectIndex } from '@/lib/content'
import { getGamesData } from '@/lib/games'
import {
  SETTINGS_EVENT,
  getFeedbackEnabled,
  getMuteAudio,
  toggleFeedbackEnabled,
  toggleMuteAudio,
  triggerDoom,
} from '@/lib/settings'

const EMAIL = 'bhaumic@bhaumicsingh.dev'
const RSS_URL = 'https://bhaumicsingh.dev/rss'

type PageId = 'root' | 'share' | 'games' | 'tag-blog' | 'tag-projects' | 'theme'

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

function uniqueSorted(values: Array<string>) {
  return Array.from(new Set(values.filter(Boolean))).sort((a, b) =>
    a.localeCompare(b),
  )
}

export function CommandMenu() {
  const mounted = useMounted()
  const [open, setOpen] = React.useState(false)
  const [pages, setPages] = React.useState<Array<PageId>>(['root'])
  const [search, setSearch] = React.useState('')
  const [toast, setToast] = React.useState<string | null>(null)
  const toastTimerRef = React.useRef<number | null>(null)
  const navigate = useNavigate()
  const { mode, setMode, cycleTheme } = useTheme()
  const [blogs, setBlogs] = React.useState<Array<BlogMeta>>([])
  const [projects, setProjects] = React.useState<Array<ProjectMeta>>([])
  const [certificates, setCertificates] = React.useState<
    Array<CertificateMeta>
  >([])
  const [games, setGames] = React.useState<Array<GameMeta>>([])
  const [loaded, setLoaded] = React.useState(false)
  const [muted, setMuted] = React.useState(false)
  const [feedbackOn, setFeedbackOn] = React.useState(true)

  const page = pages[pages.length - 1]

  React.useEffect(() => {
    setMuted(getMuteAudio())
    setFeedbackOn(getFeedbackEnabled())
    const onChange = () => {
      setMuted(getMuteAudio())
      setFeedbackOn(getFeedbackEnabled())
    }
    window.addEventListener(SETTINGS_EVENT, onChange)
    return () => window.removeEventListener(SETTINGS_EVENT, onChange)
  }, [])

  const showToast = React.useCallback((message: string) => {
    setToast(message)
    if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current)
    toastTimerRef.current = window.setTimeout(() => setToast(null), 1800)
  }, [])

  const copy = React.useCallback(
    async (text: string, label: string) => {
      try {
        await navigator.clipboard.writeText(text)
        showToast(`${label} copied`)
      } catch {
        showToast('copy failed')
      }
    },
    [showToast],
  )

  const closeMenu = React.useCallback(() => {
    setOpen(false)
    setPages(['root'])
    setSearch('')
  }, [])

  // Open/close
  useHotkey('Mod+K', () => setOpen((o) => !o))
  useHotkey('Mod+/', () => {
    setOpen(true)
    setPages(['root'])
    setSearch('')
  })
  useHotkey('Mod+Backspace', () => window.history.back())

  const navTo = React.useCallback(
    (to: string) => {
      closeMenu()
      navigate({ to })
    },
    [navigate, closeMenu],
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

  useHotkey('Mod+S', () => {
    setOpen(true)
    setPages(['root', 'share'])
    setSearch('')
  })
  useHotkey('Mod+U', () => {
    if (typeof window !== 'undefined') {
      void copy(window.location.href, 'page url')
    }
  })

  // Lazy-load collections on first open
  React.useEffect(() => {
    if (!open || loaded) return
    Promise.all([
      getBlogIndex(),
      getProjectIndex(),
      getCertificateIndex(),
      getGamesData(),
    ])
      .then(([b, p, c, g]) => {
        setBlogs(b)
        setProjects(p)
        setCertificates(c)
        setGames(g)
        setLoaded(true)
      })
      .catch(console.error)
  }, [open, loaded])

  const openExternal = React.useCallback(
    (url: string) => {
      closeMenu()
      window.open(url, '_blank', 'noopener,noreferrer')
    },
    [closeMenu],
  )

  const handleNavigate = React.useCallback(
    (to: string) => {
      if (to.startsWith('http') || to.startsWith('mailto:')) {
        openExternal(to)
      } else {
        navTo(to)
      }
    },
    [navTo, openExternal],
  )

  const navToBlogTag = (tag: string) => {
    closeMenu()
    navigate({
      to: '/blog',
      search: { tag },
    } as unknown as Parameters<typeof navigate>[0])
  }
  const navToProjectTag = (tag: string) => {
    closeMenu()
    navigate({
      to: '/projects',
      search: { tag },
    } as unknown as Parameters<typeof navigate>[0])
  }

  const pushPage = (id: PageId) => {
    setPages((p) => [...p, id])
    setSearch('')
  }
  const popPage = () => {
    setPages((p) => (p.length > 1 ? p.slice(0, -1) : p))
    setSearch('')
  }

  const handleGoBackHistory = () => {
    closeMenu()
    window.history.back()
  }

  const shareUrl = () =>
    typeof window !== 'undefined' ? window.location.href : ''
  const shareTitle = () =>
    typeof document !== 'undefined' ? document.title : ''

  const doShareX = () => {
    const url = encodeURIComponent(shareUrl())
    const text = encodeURIComponent(shareTitle())
    openExternal(`https://twitter.com/intent/tweet?text=${text}&url=${url}`)
  }
  const doShareLinkedIn = () => {
    const url = encodeURIComponent(shareUrl())
    openExternal(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`)
  }
  const doShareWhatsApp = () => {
    const text = encodeURIComponent(`${shareTitle()} ${shareUrl()}`)
    openExternal(`https://wa.me/?text=${text}`)
  }

  const randomBlog = () => {
    if (!blogs.length) {
      showToast('no blogs loaded yet')
      return
    }
    const pick = blogs[Math.floor(Math.random() * blogs.length)]
    navTo(`/blog/${pick.slug}`)
  }
  const randomProject = () => {
    if (!projects.length) {
      showToast('no projects loaded yet')
      return
    }
    const pick = projects[Math.floor(Math.random() * projects.length)]
    navTo(`/projects/${pick.slug}`)
  }

  const blogTags = React.useMemo(
    () => uniqueSorted(blogs.flatMap((b) => [...b.tags, ...b.categories])),
    [blogs],
  )
  const projectTags = React.useMemo(
    () =>
      uniqueSorted(
        projects.flatMap((p) => [...p.tags, ...p.categories, ...p.stack]),
      ),
    [projects],
  )

  const pageLabel =
    page === 'share'
      ? 'share'
      : page === 'games'
        ? 'games'
        : page === 'tag-blog'
          ? 'filter blog by tag'
          : page === 'tag-projects'
            ? 'filter projects by tag'
            : page === 'theme'
              ? 'themes'
              : ''

  const inputPlaceholder =
    page === 'root'
      ? 'type a command or search…'
      : `${pageLabel} · type to filter (backspace to go back)`

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !search && pages.length > 1) {
      e.preventDefault()
      popPage()
    }
    if (e.key === 'Escape' && pages.length > 1) {
      e.preventDefault()
      popPage()
    }
  }

  return (
    <CommandDialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o)
        if (!o) {
          setPages(['root'])
          setSearch('')
        }
      }}
      title="Command Menu"
      description="Search pages, content, actions, and shortcuts"
    >
      <CommandInput
        placeholder={inputPlaceholder}
        value={search}
        onValueChange={setSearch}
        onKeyDown={handleInputKeyDown}
      />
      {pages.length > 1 ? (
        <div className="flex items-center gap-2 border-b border-border/40 bg-muted/40 px-3 py-1.5 text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
          <button
            type="button"
            onClick={popPage}
            className="inline-flex items-center gap-1 hover:text-foreground"
          >
            <ArrowLeft className="size-3" /> back
          </button>
          <span className="opacity-40">/</span>
          <span>{pageLabel}</span>
        </div>
      ) : null}

      <CommandList className="scrollbar-hide">
        <CommandEmpty>no results found.</CommandEmpty>

        {page === 'root' ? (
          <RootPage
            mounted={mounted}
            blogs={blogs}
            projects={projects}
            certificates={certificates}
            muted={muted}
            feedbackOn={feedbackOn}
            handleGoBackHistory={handleGoBackHistory}
            handleNavigate={handleNavigate}
            pushPage={pushPage}
            closeMenu={closeMenu}
            setMode={setMode}
            cycleTheme={cycleTheme}
            copy={copy}
            openExternal={openExternal}
            randomBlog={randomBlog}
            randomProject={randomProject}
            showToast={showToast}
          />
        ) : null}

        {page === 'share' ? (
          <SharePage
            copy={copy}
            doShareX={doShareX}
            doShareLinkedIn={doShareLinkedIn}
            doShareWhatsApp={doShareWhatsApp}
            shareUrl={shareUrl}
            shareTitle={shareTitle}
          />
        ) : null}

        {page === 'games' ? (
          <GamesPage games={games} openExternal={openExternal} copy={copy} />
        ) : null}

        {page === 'tag-blog' ? (
          <TagPage
            heading="blog tags"
            tags={blogTags}
            onSelect={navToBlogTag}
          />
        ) : null}

        {page === 'tag-projects' ? (
          <TagPage
            heading="project tags"
            tags={projectTags}
            onSelect={navToProjectTag}
          />
        ) : null}

        {page === 'theme' ? (
          <ThemePage
            mode={mode}
            setMode={(m) => {
              setMode(m)
              closeMenu()
            }}
            cycleTheme={() => {
              cycleTheme()
              closeMenu()
            }}
          />
        ) : null}
      </CommandList>

      {toast ? (
        <div
          role="status"
          aria-live="polite"
          className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full border border-border bg-popover px-3 py-1.5 text-xs text-foreground shadow-lg"
        >
          {toast}
        </div>
      ) : null}
    </CommandDialog>
  )
}

/* ---------------- Root Page ---------------- */

type RootPageProps = {
  mounted: boolean
  blogs: Array<BlogMeta>
  projects: Array<ProjectMeta>
  certificates: Array<CertificateMeta>
  muted: boolean
  feedbackOn: boolean
  handleGoBackHistory: () => void
  handleNavigate: (to: string) => void
  pushPage: (id: PageId) => void
  closeMenu: () => void
  setMode: (m: 'normal' | 'sunny' | 'midnight' | 'frieren') => void
  cycleTheme: () => void
  copy: (text: string, label: string) => void
  openExternal: (url: string) => void
  randomBlog: () => void
  randomProject: () => void
  showToast: (msg: string) => void
}

function RootPage({
  mounted,
  blogs,
  projects,
  certificates,
  muted,
  feedbackOn,
  handleGoBackHistory,
  handleNavigate,
  pushPage,
  closeMenu,
  setMode,
  cycleTheme,
  copy,
  openExternal,
  randomBlog,
  randomProject,
  showToast,
}: RootPageProps) {
  return (
    <>
      <CommandGroup heading="Navigation">
        <CommandItem onSelect={handleGoBackHistory}>
          <ArrowLeft />
          <span>back</span>
          <CommandShortcut>
            <ShortcutText mounted={mounted} shortcut="Mod+Backspace" />
          </CommandShortcut>
        </CommandItem>
      </CommandGroup>

      <CommandSeparator />

      <CommandGroup heading="Quick Actions">
        <CommandItem
          value="share this page copy url link markdown twitter x linkedin whatsapp"
          onSelect={() => pushPage('share')}
        >
          <Share2 />
          <span>share this page…</span>
          <CommandShortcut>
            <ShortcutText mounted={mounted} shortcut="Mod+S" />
          </CommandShortcut>
          <ChevronRight className="ml-1 size-3" />
        </CommandItem>
        <CommandItem
          value="copy current page url link location"
          onSelect={() => {
            if (typeof window !== 'undefined') {
              void copy(window.location.href, 'page url')
            }
          }}
        >
          <Link2 />
          <span>copy page url</span>
          <CommandShortcut>
            <ShortcutText mounted={mounted} shortcut="Mod+U" />
          </CommandShortcut>
        </CommandItem>
        <CommandItem
          value="copy email address contact mail"
          onSelect={() => copy(EMAIL, 'email')}
        >
          <Copy />
          <span>copy email</span>
        </CommandItem>
        <CommandItem
          value="download resume pdf cv"
          onSelect={() => {
            closeMenu()
            window.open('/Resume-web.pdf', '_blank', 'noopener,noreferrer')
          }}
        >
          <Download />
          <span>download resume pdf</span>
        </CommandItem>
        <CommandItem
          value="book a call meeting cal.com schedule"
          onSelect={() => openExternal(`https://cal.com/${siteInfo.calLink}`)}
        >
          <Calendar />
          <span>book a call</span>
          <CommandShortcut>↗</CommandShortcut>
        </CommandItem>
        <CommandItem
          value="print current page"
          onSelect={() => {
            closeMenu()
            setTimeout(() => window.print(), 120)
          }}
        >
          <Printer />
          <span>print page</span>
        </CommandItem>
        <CommandItem
          value="random blog post essay surprise lucky"
          onSelect={randomBlog}
        >
          <Shuffle />
          <span>random blog post</span>
        </CommandItem>
        <CommandItem
          value="random project surprise lucky"
          onSelect={randomProject}
        >
          <Shuffle />
          <span>random project</span>
        </CommandItem>
        <CommandItem
          value="gravatar qr code profile"
          onSelect={() => openExternal(gravatar.qrCodeUrl)}
        >
          <QrCode />
          <span>open gravatar qr</span>
          <CommandShortcut>↗</CommandShortcut>
        </CommandItem>
      </CommandGroup>

      <CommandSeparator />

      <CommandGroup heading="Browse">
        <CommandItem
          value="filter blog tag category topic"
          onSelect={() => pushPage('tag-blog')}
        >
          <Tag />
          <span>filter blog by tag…</span>
          <ChevronRight className="ml-auto size-3" />
        </CommandItem>
        <CommandItem
          value="filter projects tag category stack tech"
          onSelect={() => pushPage('tag-projects')}
        >
          <Tag />
          <span>filter projects by tag…</span>
          <ChevronRight className="ml-auto size-3" />
        </CommandItem>
        <CommandItem
          value="games search series play watch video"
          onSelect={() => pushPage('games')}
        >
          <Gamepad2 />
          <span>search games…</span>
          <ChevronRight className="ml-auto size-3" />
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
        <CommandItem onSelect={() => handleNavigate('/certificates')}>
          <Award />
          <span>certificates</span>
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
        <CommandItem
          value="copy rss feed url subscribe"
          onSelect={() => copy(RSS_URL, 'rss url')}
        >
          <Copy />
          <span>copy rss url</span>
        </CommandItem>
        <CommandItem onSelect={() => handleNavigate('/llms-full/txt')}>
          <Bot />
          <span>llms-full.txt</span>
          <CommandShortcut>
            <ShortcutText mounted={mounted} shortcut="Mod+L" />
          </CommandShortcut>
        </CommandItem>
        <CommandItem onSelect={() => handleNavigate('/sitemap/xml')}>
          <MapIcon />
          <span>sitemap</span>
          <CommandShortcut>
            <ShortcutText mounted={mounted} shortcut="Mod+M" />
          </CommandShortcut>
        </CommandItem>
      </CommandGroup>

      <CommandSeparator />

      <CommandGroup heading="Theme">
        <CommandItem
          value="cycle theme next switch appearance"
          onSelect={() => {
            cycleTheme()
            closeMenu()
          }}
        >
          <Palette />
          <span>cycle theme</span>
        </CommandItem>
        <CommandItem
          value="open themes preview list"
          onSelect={() => pushPage('theme')}
        >
          <Palette />
          <span>all themes…</span>
          <ChevronRight className="ml-auto size-3" />
        </CommandItem>
        <CommandItem
          onSelect={() => {
            setMode('normal')
            closeMenu()
          }}
        >
          <Moon />
          <span>default</span>
        </CommandItem>
        <CommandItem
          onSelect={() => {
            setMode('sunny')
            closeMenu()
          }}
        >
          <Sun />
          <span>sunny</span>
        </CommandItem>
        <CommandItem
          onSelect={() => {
            setMode('midnight')
            closeMenu()
          }}
        >
          <MoonStar />
          <span>midnight</span>
        </CommandItem>
        <CommandItem
          onSelect={() => {
            setMode('frieren')
            closeMenu()
          }}
        >
          <BookSearch />
          <span>frieren</span>
        </CommandItem>
      </CommandGroup>

      <CommandSeparator />

      <CommandGroup heading="Preferences">
        <CommandItem
          value="toggle audio mute theme video sound music volume"
          onSelect={() => {
            const now = toggleMuteAudio()
            showToast(now ? 'audio muted' : 'audio unmuted')
          }}
        >
          {muted ? <VolumeX /> : <Volume2 />}
          <span>{muted ? 'unmute theme audio' : 'mute theme audio'}</span>
          <CommandShortcut>{muted ? 'off' : 'on'}</CommandShortcut>
        </CommandItem>
        <CommandItem
          value="toggle click feedback haptic sound"
          onSelect={() => {
            const now = toggleFeedbackEnabled()
            showToast(now ? 'click feedback on' : 'click feedback off')
          }}
        >
          {feedbackOn ? <Vibrate /> : <VibrateOff />}
          <span>
            {feedbackOn ? 'disable click feedback' : 'enable click feedback'}
          </span>
          <CommandShortcut>{feedbackOn ? 'on' : 'off'}</CommandShortcut>
        </CommandItem>
      </CommandGroup>

      <CommandSeparator />

      <CommandGroup heading="Secrets">
        <CommandItem
          value="trigger doom easter egg game play"
          onSelect={() => {
            closeMenu()
            setTimeout(() => triggerDoom(), 120)
          }}
        >
          <Sparkles />
          <span>enter the nightmare…</span>
        </CommandItem>
        <CommandItem
          value="konami code cheat hint sequence"
          onSelect={() => showToast('↑ ↑ ↓ ↓ ← → ← → B A')}
        >
          <Sparkles />
          <span>show konami sequence</span>
        </CommandItem>
      </CommandGroup>

      {blogs.length > 0 ? (
        <>
          <CommandSeparator />
          <CommandGroup heading="Blogs">
            {blogs.map((post, i) => (
              <CommandItem
                key={post.slug}
                value={`blog ${post.title} ${post.summary} ${post.tags.join(' ')} ${post.categories.join(' ')}`}
                onSelect={() => handleNavigate(`/blog/${post.slug}`)}
              >
                <Pen className="shrink-0" />
                <span className="truncate">{post.title}</span>
                {i < 9 ? <CommandShortcut>⌘{i + 1}</CommandShortcut> : null}
              </CommandItem>
            ))}
          </CommandGroup>
        </>
      ) : null}

      {projects.length > 0 ? (
        <>
          <CommandSeparator />
          <CommandGroup heading="Projects">
            {projects.map((project) => (
              <CommandItem
                key={project.slug}
                value={`project ${project.title} ${project.summary} ${project.tags.join(' ')} ${project.categories.join(' ')} ${project.stack.join(' ')}`}
                onSelect={() => handleNavigate(`/projects/${project.slug}`)}
              >
                <FolderOpen className="shrink-0" />
                <span className="truncate">{project.title}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        </>
      ) : null}

      {certificates.length > 0 ? (
        <>
          <CommandSeparator />
          <CommandGroup heading="Certificates">
            {certificates.map((cert) => (
              <CommandItem
                key={cert.id}
                value={`cert ${cert.title} ${cert.issuer} ${cert.skills.join(' ')}`}
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
        </>
      ) : null}
    </>
  )
}

/* ---------------- Share Page ---------------- */

function SharePage({
  copy,
  doShareX,
  doShareLinkedIn,
  doShareWhatsApp,
  shareUrl,
  shareTitle,
}: {
  copy: (text: string, label: string) => void
  doShareX: () => void
  doShareLinkedIn: () => void
  doShareWhatsApp: () => void
  shareUrl: () => string
  shareTitle: () => string
}) {
  return (
    <CommandGroup heading="Share / Copy">
      <CommandItem onSelect={() => copy(shareUrl(), 'page url')}>
        <Link2 />
        <span>copy page url</span>
      </CommandItem>
      <CommandItem
        onSelect={() =>
          copy(`[${shareTitle()}](${shareUrl()})`, 'markdown link')
        }
      >
        <Copy />
        <span>copy as markdown link</span>
      </CommandItem>
      <CommandItem onSelect={() => copy(shareTitle(), 'title')}>
        <Copy />
        <span>copy page title</span>
      </CommandItem>
      <CommandItem onSelect={doShareX}>
        <Twitter />
        <span>share on x</span>
        <CommandShortcut>↗</CommandShortcut>
      </CommandItem>
      <CommandItem onSelect={doShareLinkedIn}>
        <Linkedin />
        <span>share on linkedin</span>
        <CommandShortcut>↗</CommandShortcut>
      </CommandItem>
      <CommandItem onSelect={doShareWhatsApp}>
        <Share2 />
        <span>share on whatsapp</span>
        <CommandShortcut>↗</CommandShortcut>
      </CommandItem>
      <CommandItem onSelect={() => copy(RSS_URL, 'rss url')}>
        <Rss />
        <span>copy rss feed url</span>
      </CommandItem>
      <CommandItem onSelect={() => copy(EMAIL, 'email')}>
        <Copy />
        <span>copy email</span>
      </CommandItem>
    </CommandGroup>
  )
}

/* ---------------- Games Page ---------------- */

function GamesPage({
  games,
  openExternal,
  copy,
}: {
  games: Array<GameMeta>
  openExternal: (url: string) => void
  copy: (text: string, label: string) => void
}) {
  if (!games.length) {
    return (
      <CommandGroup heading="Games">
        <CommandItem disabled>loading games…</CommandItem>
      </CommandGroup>
    )
  }

  const bySeries = new Map<string, Array<GameMeta>>()
  for (const g of games) {
    const arr = bySeries.get(g.series) || []
    arr.push(g)
    bySeries.set(g.series, arr)
  }

  return (
    <>
      {Array.from(bySeries.entries()).map(([series, list]) => (
        <CommandGroup key={series} heading={series}>
          {list.map((g) => (
            <CommandItem
              key={g.id}
              value={`${g.title} ${g.series}`}
              onSelect={() => {
                if (g.videoUrl) {
                  openExternal(g.videoUrl)
                } else {
                  void copy(g.title, 'game title')
                }
              }}
            >
              <Gamepad2 />
              <span className="truncate">{g.title}</span>
              {g.videoUrl ? <CommandShortcut>watch ↗</CommandShortcut> : null}
            </CommandItem>
          ))}
        </CommandGroup>
      ))}
    </>
  )
}

/* ---------------- Tag Page ---------------- */

function TagPage({
  heading,
  tags,
  onSelect,
}: {
  heading: string
  tags: Array<string>
  onSelect: (tag: string) => void
}) {
  if (!tags.length) {
    return (
      <CommandGroup heading={heading}>
        <CommandItem disabled>no tags available</CommandItem>
      </CommandGroup>
    )
  }
  return (
    <CommandGroup heading={heading}>
      {tags.map((tag) => (
        <CommandItem key={tag} value={tag} onSelect={() => onSelect(tag)}>
          <Tag />
          <span>{tag}</span>
        </CommandItem>
      ))}
    </CommandGroup>
  )
}

/* ---------------- Theme Page ---------------- */

function ThemePage({
  mode,
  setMode,
  cycleTheme,
}: {
  mode: string
  setMode: (m: 'normal' | 'sunny' | 'midnight' | 'frieren') => void
  cycleTheme: () => void
}) {
  const themes: Array<{
    id: 'normal' | 'sunny' | 'midnight' | 'frieren'
    label: string
    hint: string
    Icon: React.ComponentType<{ className?: string }>
  }> = [
    { id: 'normal', label: 'default', hint: 'calm dark', Icon: Moon },
    { id: 'sunny', label: 'sunny', hint: 'light + forest audio', Icon: Sun },
    {
      id: 'midnight',
      label: 'midnight',
      hint: 'dark + night audio',
      Icon: MoonStar,
    },
    {
      id: 'frieren',
      label: 'frieren',
      hint: 'anime + mozart',
      Icon: BookSearch,
    },
  ]
  return (
    <CommandGroup heading="Themes">
      <CommandItem value="cycle theme next" onSelect={cycleTheme}>
        <Palette />
        <span>cycle theme</span>
      </CommandItem>
      {themes.map((t) => (
        <CommandItem
          key={t.id}
          value={`${t.label} ${t.hint}`}
          onSelect={() => setMode(t.id)}
        >
          <t.Icon />
          <span>{t.label}</span>
          <span className="ml-auto text-[10px] text-muted-foreground">
            {mode === t.id ? 'active' : t.hint}
          </span>
        </CommandItem>
      ))}
    </CommandGroup>
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

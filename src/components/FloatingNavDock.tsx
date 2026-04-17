import {
  IconArticle,
  IconBook2,
  IconBrandGithub,
  IconFileText,
  IconFolder,
  IconHome,
  IconMessage,
  IconMoon,
  IconMoonStars,
  IconSunHigh,
  IconUser,
} from '@tabler/icons-react'
import { AnimatePresence, motion } from 'motion/react'
import type { DockItem } from '@/components/ui/floating-dock'
import type { ThemeMode } from '@/components/ThemeProvider'
import { FloatingDock } from '@/components/ui/floating-dock'
import { siteInfo } from '@/config/site-data'
import { useTheme } from '@/components/ThemeProvider'

const themeIcons: Record<ThemeMode, React.ComponentType<{ className?: string }>> = {
  normal: IconMoon,
  sunny: IconSunHigh,
  midnight: IconMoonStars,
  frieren: IconBook2,
}

export function FloatingNavDock() {
  const { mode, cycleTheme } = useTheme()

  const items: Array<DockItem> = [
    {
      title: 'Home',
      icon: <IconHome className="h-full w-full text-primary" />,
      href: '/',
    },
    {
      title: 'Blog',
      icon: <IconArticle className="h-full w-full text-primary" />,
      href: '/blog',
    },
    {
      title: 'Projects',
      icon: <IconFolder className="h-full w-full text-primary" />,
      href: '/projects',
    },
    {
      title: 'Resume',
      icon: <IconFileText className="h-full w-full text-primary" />,
      href: '/resume',
    },
    {
      title: 'GitHub',
      icon: <IconBrandGithub className="h-full w-full text-foreground" />,
      href: `/readme`,
      rel: 'me',
    },
    {
      title: mode.charAt(0).toUpperCase() + mode.slice(1),
      icon: <ThemeDockIcon mode={mode} />,
      onClick: (event) => {
        const rect = event.currentTarget.getBoundingClientRect()
        cycleTheme({
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2,
        })
      },
    },
    {
      title: 'About',
      icon: <IconUser className="h-full w-full text-foreground" />,
      href: '/about',
    },
    {
      title: 'Contact',
      icon: <IconMessage className="h-full w-full text-foreground" />,
      href: `https://cal.com/${siteInfo.calLink}`,
      rel: 'me',
    },
  ]

  return (
    <FloatingDock
      items={items}
      desktopClassName="fixed bottom-8 left-1/2 -translate-x-1/2 z-40"
      mobileClassName="fixed bottom-6 right-6 z-40"
    />
  )
}

function ThemeDockIcon({ mode }: { mode: ThemeMode }) {
  const Icon = themeIcons[mode]

  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden">
      <motion.span
        aria-hidden
        className="absolute inset-[18%] rounded-full bg-primary/18"
        animate={{
          scale: [0.82, 1.08, 0.9],
          opacity: [0.18, 0.34, 0.16],
        }}
        transition={{
          duration: 0.6,
          ease: [0.22, 1, 0.36, 1],
        }}
        key={`${mode}-glow`}
      />
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={mode}
          initial={{ opacity: 0, scale: 0.55, rotate: -18, y: 8, filter: 'blur(6px)' }}
          animate={{ opacity: 1, scale: 1, rotate: 0, y: 0, filter: 'blur(0px)' }}
          exit={{ opacity: 0, scale: 0.6, rotate: 18, y: -8, filter: 'blur(6px)' }}
          transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <Icon className="h-full w-full text-foreground" />
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

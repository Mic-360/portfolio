import {
  IconArticle,
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
import type { DockItem } from '@/components/ui/floating-dock'
import type { ThemeMode } from '@/components/ThemeProvider'
import { FloatingDock } from '@/components/ui/floating-dock'
import { siteInfo } from '@/config/site-data'
import { useTheme } from '@/components/ThemeProvider'

const themeIcons: Record<ThemeMode, React.ReactNode> = {
  normal: <IconMoon className="h-full w-full text-foreground" />,
  sunny: <IconSunHigh className="h-full w-full text-foreground" />,
  midnight: <IconMoonStars className="h-full w-full text-foreground" />,
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
      title: mode,
      icon: themeIcons[mode],
      onClick: cycleTheme,
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
      desktopClassName="fixed bottom-6 left-1/2 -translate-x-1/2 z-40"
      mobileClassName="fixed bottom-6 right-6 z-40"
    />
  )
}

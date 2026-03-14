import { FloatingDock } from '@/components/ui/floating-dock'
import { siteInfo } from '@/config/site-data'
import {
  IconBrandGithub,
  IconHome,
  IconArticle,
  IconFolder,
  IconFileText,
  IconBox,
  IconUser,
  IconMessage,
} from '@tabler/icons-react'

export function FloatingNavDock() {
  const items = [
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
      title: 'Bento',
      icon: <IconBox className="h-full w-full text-foreground" />,
      href: '/bento',
      rel: 'me',
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

import type { VerifiedAccount } from '@/types/gravatar'
import { cn } from '@/lib/utils'

interface GravatarSocialLinksProps {
  accounts: Array<VerifiedAccount>
  iconSize?: number
  className?: string
}

/**
 * Render verified account icons from Gravatar profile data.
 * Uses the service_icon URLs provided by the Gravatar API.
 */
export default function GravatarSocialLinks({
  accounts,
  iconSize = 28,
  className,
}: GravatarSocialLinksProps) {
  // Filter out hidden accounts
  const visible = accounts.filter((a) => !a.is_hidden)

  if (visible.length === 0) return null

  return (
    <div className={cn('flex items-center gap-3', className)}>
      {visible.map((account) => (
        <a
          key={`${account.service_type}-${account.url}`}
          href={account.url}
          target="_blank"
          rel="noopener noreferrer"
          title={account.service_label}
        >
          <img
            src={account.service_icon}
            alt={account.service_label}
            width={iconSize}
            height={iconSize}
            loading="lazy"
            className="opacity-70 hover:opacity-100 transition-opacity invert dark:invert-0"
          />
        </a>
      ))}
    </div>
  )
}

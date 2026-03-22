import GravatarAvatar from './GravatarAvatar'
import GravatarSocialLinks from './GravatarSocialLinks'
import type { GravatarProfile } from '@/types/gravatar'
import { cn } from '@/lib/utils'

interface GravatarProfileCardProps {
  profile: GravatarProfile
  className?: string
}

/**
 * Full-width profile card rendered from Gravatar data.
 * Displays header banner, avatar, identity info, and social links.
 */
export default function GravatarProfileCard({
  profile,
  className,
}: GravatarProfileCardProps) {
  const profileLink =
    profile.profile_url || `https://gravatar.com/${profile.hash}`

  return (
    <div
      className={cn(
        'w-full overflow-hidden rounded-xl border border-border shadow-xl',
        className,
      )}
    >
      {/* Header banner */}
      {profile.header_image ? (
        <div
          className="h-28 sm:h-36 w-full bg-cover bg-center"
          style={{
            background: profile.header_image,
            backgroundColor: profile.background_color || '#2b3529',
          }}
        />
      ) : (
        <div
          className="h-28 sm:h-36 w-full"
          style={{
            background: profile.background_color
              ? profile.background_color
              : 'linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)',
          }}
        />
      )}

      {/* Card body */}
      <div className="relative bg-card px-5 pb-5 pt-0">
        {/* Avatar overlapping banner */}
        <a
          href={profileLink}
          target="_blank"
          rel="noopener noreferrer me"
          className="-mt-12 mb-3 block w-fit"
        >
          <GravatarAvatar
            hash={profile.hash}
            size={96}
            alt={profile.display_name}
            className="h-24 w-24 border-4 border-card shadow-lg"
          />
        </a>

        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          {/* Info */}
          <div className="flex flex-col gap-1">
            <a
              href={profileLink}
              target="_blank"
              rel="noopener noreferrer me"
              className="group"
            >
              <h3 className="text-lg font-bold group-hover:text-primary transition-colors">
                {profile.display_name}
              </h3>
              {profile.job_title && (
                <p className="text-sm text-muted-foreground">
                  {profile.job_title}
                  {profile.company ? ` at ${profile.company}` : ''}
                </p>
              )}
              {profile.location && (
                <p className="text-xs text-muted-foreground">
                  {profile.location}
                </p>
              )}
            </a>
            {profile.description && (
              <p className="mt-2 text-sm italic text-foreground/80">
                {profile.description}
              </p>
            )}
          </div>

          {/* Social icons */}
          {profile.verified_accounts &&
            profile.verified_accounts.length > 0 && (
              <GravatarSocialLinks accounts={profile.verified_accounts} />
            )}
        </div>

        {/* Footer row */}
        <div className="mt-4 flex items-center justify-between border-t border-border pt-3 text-xs text-muted-foreground">
          <a
            href={profileLink}
            target="_blank"
            rel="noopener noreferrer me"
            className="hover:text-primary transition-colors"
          >
            {new URL(profileLink).hostname}
          </a>
          <a
            href={profileLink}
            target="_blank"
            rel="noopener noreferrer me"
            className="hover:text-primary transition-colors"
          >
            View profile →
          </a>
        </div>
      </div>
    </div>
  )
}

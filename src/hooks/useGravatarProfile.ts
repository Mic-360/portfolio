import { useQuery } from '@tanstack/react-query'
import { getGravatarProfile } from '@/lib/gravatar-profile'
import type { GravatarProfile } from '@/types/gravatar'

/**
 * TanStack Query hook for fetching a Gravatar profile.
 * @param emailOrHash — email hash (SHA-256) or profile slug
 */
export function useGravatarProfile(emailOrHash: string) {
    return useQuery<GravatarProfile | null>({
        queryKey: ['gravatar-profile', emailOrHash],
        queryFn: () => getGravatarProfile({ data: emailOrHash }),
        staleTime: 6 * 60 * 60 * 1000, // 6 hours — matches server cache
        gcTime: 12 * 60 * 60 * 1000, // 12 hours
        retry: 1,
        enabled: !!emailOrHash,
    })
}

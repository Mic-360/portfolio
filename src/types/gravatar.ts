import { z } from 'zod'

// ── Verified Account ─────────────────────────────────────────────────

export const verifiedAccountSchema = z.object({
    service_type: z.string(),
    service_label: z.string(),
    service_icon: z.string(),
    url: z.string(),
    is_hidden: z.boolean(),
})

export type VerifiedAccount = z.infer<typeof verifiedAccountSchema>

// ── Gallery Image ────────────────────────────────────────────────────

export const galleryImageSchema = z.object({
    url: z.string(),
    alt: z.string().optional(),
})

export type GalleryImage = z.infer<typeof galleryImageSchema>

// ── Interest ─────────────────────────────────────────────────────────

export const gravatarInterestSchema = z.object({
    id: z.number(),
    name: z.string(),
})

export type GravatarInterest = z.infer<typeof gravatarInterestSchema>

// ── Link ─────────────────────────────────────────────────────────────

export const gravatarLinkSchema = z.object({
    label: z.string(),
    url: z.string(),
})

export type GravatarLink = z.infer<typeof gravatarLinkSchema>

// ── Language ─────────────────────────────────────────────────────────

export const gravatarLanguageSchema = z.object({
    code: z.string(),
    name: z.string(),
    is_primary: z.boolean().optional(),
    order: z.number().optional(),
})

export type GravatarLanguage = z.infer<typeof gravatarLanguageSchema>

// ── Profile ──────────────────────────────────────────────────────────

export const gravatarProfileSchema = z.object({
    hash: z.string(),
    display_name: z.string(),
    profile_url: z.string(),
    avatar_url: z.string(),
    avatar_alt_text: z.string().optional(),
    location: z.string().optional(),
    description: z.string().optional(),
    job_title: z.string().optional(),
    company: z.string().optional(),
    verified_accounts: z.array(verifiedAccountSchema).optional(),
    pronunciation: z.string().optional(),
    pronouns: z.string().optional(),
    timezone: z.string().optional(),
    languages: z.array(gravatarLanguageSchema).optional(),
    first_name: z.string().optional(),
    last_name: z.string().optional(),
    is_organization: z.boolean().optional(),
    header_image: z.string().optional(),
    hide_default_header_image: z.boolean().optional(),
    background_color: z.string().optional(),
    links: z.array(gravatarLinkSchema).optional(),
    interests: z.array(gravatarInterestSchema).optional(),
    gallery: z.array(galleryImageSchema).optional(),
    number_verified_accounts: z.number().optional(),
    last_profile_edit: z.string().nullable().optional(),
    registration_date: z.string().nullable().optional(),
})

export type GravatarProfile = z.infer<typeof gravatarProfileSchema>

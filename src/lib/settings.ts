const STORAGE_KEY = 'portfolio:settings'
export const SETTINGS_EVENT = 'portfolio:settings-changed'
export const DOOM_TRIGGER_EVENT = 'portfolio:trigger-doom'

export type Settings = {
	muteAudio: boolean
	feedbackEnabled: boolean
}

const DEFAULTS: Settings = {
	muteAudio: false,
	feedbackEnabled: true,
}

function read(): Settings {
	if (typeof window === 'undefined') return DEFAULTS
	try {
		const raw = window.localStorage.getItem(STORAGE_KEY)
		if (!raw) return DEFAULTS
		const parsed = JSON.parse(raw) as Partial<Settings>
		return { ...DEFAULTS, ...parsed }
	} catch {
		return DEFAULTS
	}
}

function write(next: Settings) {
	if (typeof window === 'undefined') return
	try {
		window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
	} catch {
		// ignore quota errors
	}
	window.dispatchEvent(new CustomEvent(SETTINGS_EVENT, { detail: next }))
}

export function getSettings(): Settings {
	return read()
}

export function getMuteAudio(): boolean {
	return read().muteAudio
}

export function getFeedbackEnabled(): boolean {
	return read().feedbackEnabled
}

export function toggleMuteAudio(): boolean {
	const current = read()
	const next = !current.muteAudio
	write({ ...current, muteAudio: next })
	return next
}

export function toggleFeedbackEnabled(): boolean {
	const current = read()
	const next = !current.feedbackEnabled
	write({ ...current, feedbackEnabled: next })
	return next
}

export function triggerDoom() {
	if (typeof window === 'undefined') return
	window.dispatchEvent(new CustomEvent(DOOM_TRIGGER_EVENT))
}

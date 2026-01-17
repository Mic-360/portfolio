export type SocialLink = {
	label: string
	url: string
}

export const siteInfo = {
	name: 'Bhaumik Singh',
	nativeName: 'भौमिक सिंह',
	tagline: 'android, ai, cloud, web, design, devops',
	buildLine: 'bleeding edge things.',
	location: 'Prayagraj, India',
	locationNative: 'प्रयागराज, भारत',
	currentRole: 'Full Stack engineer',
	currentCompany: 'KarkhanaHub.com',
	currentCompanyUrl: 'https://karkhanahub.com/',
	currentSummary:
		'Building fast, reliable systems for modern web and android products with a latest is greatest mindset.',
	educationLine:
		'Recent grad from ITER, SOA University with impeccable academics and a passion for innovation.',
	interests:
		'I enjoy building, deploying, and designing experiments with code and bleeding edge technology — and occasional anime binge.',
}

export const siteMeta = {
	baseUrl: 'https://bhaumiksingh.com',
	defaultTitle: 'Bhaumik Singh — Portfolio',
	defaultDescription:
		'Full stack engineer building Android, AI, and cloud products with a love for modern web systems.',
	defaultImage: '/logo.gif',
}

export const previousRoles = [
	{
		company: 'karkhanaHub.com',
		url: 'https://karkhanahub.com/',
		role: 'Founding engineer',
		date: '2025 - present',
		icon: '/khub.jpg',
		location: 'Gurgaon, India',
	},
	{
		company: 'genpact.com',
		url: 'https://www.genpact.com/',
		role: 'software engineering (java) intern',
		date: '2025',
		icon: '/genpact.svg',
		location: 'Gurgaon, India',
	},
	{
		company: 'twinverse.in',
		url: 'https://twinverse.in/',
		role: 'product owner/developer',
		date: '2022 - 2024',
		icon: '/twinverse.png',
		location: 'Bhubaneswar, India',
	},
]

export const socialLinks: SocialLink[] = [
	{ label: 'rss', url: '/rss' },
	{ label: 'x', url: 'https://x.com/bhaumicsingh' },
	{ label: 'instagram', url: 'https://www.instagram.com/bhaumic.me/' },
	{ label: 'github', url: 'https://github.com/Mic-360' },
	{ label: 'linkedin', url: 'https://www.linkedin.com/in/bhaumic/' },
]

export const contactLinks = [
	{ label: 'resume', url: '/resume.pdf' }
]

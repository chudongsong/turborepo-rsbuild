export interface GlobalTheme {
	theme: {
		preset: 'light' | 'dark' | 'auto'
		color: string
		view: string
	}
	logo: {
		image: string
		favicon: string
	}
	sidebar: {
		dark: boolean
		color: string
		opacity: number
	}
	interface: {
		rounded: string
		is_show_bg: boolean
		bg_image: string
		bg_image_opacity: number
		content_opacity: number
		shadow_color: string
		shadow_opacity: number
	}
	home: {
		overview_view: string
		overview_size: number
	}
	login: {
		logo: string
		is_show_logo: boolean
		bg_image: string
		is_show_bg: boolean
		bg_image_opacity: number
		content_opacity: number
	}
}

export type Theme = 'light' | 'dark' | 'auto'

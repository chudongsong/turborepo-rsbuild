export interface TabsOptionsProps {
	label?: string | (() => JSX.Element | Component)
	disabled?: boolean
	closable?: boolean
	lazy?: boolean
	name: string
	render?: (() => JSX.Element | Component) | Component
}

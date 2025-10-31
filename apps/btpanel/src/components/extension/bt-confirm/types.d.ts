// 弹窗基础配置
export interface ConfirmBaseProps {
	content: string | (() => VNode) | VNode
	type?: 'default' | 'calc' | 'input' | 'check'
	isHtml?: boolean
	icon?: string | boolean
	iconColor?: 'success' | 'warning' | 'error' | 'info'
	input?: InputProps
	check?: CheckProps
}

export interface InputProps {
	content: string
}

export interface CheckProps extends InputProps{
	value?: boolean
	onConfirm?: (checkValue: boolean) => Promise<void> | void
}

// 弹窗配置
export interface ConfirmOptionProps extends ConfirmBaseProps {
	title?: string
	width?: string | number
	cancelText?: string
	confirmText?: string
	showClose?: boolean
	onConfirm?: (instance: any) => Promise<any> | any
	onCancel?: (instance: any) => Promise<any> | any
}

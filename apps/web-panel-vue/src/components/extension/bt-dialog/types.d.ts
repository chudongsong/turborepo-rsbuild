import { TranslateResult } from 'vue-i18n'

// 弹窗参数
export interface DialogInstance {
	title?: string | TranslateResult | boolean | null
	area: Array<number | string> | number | string
	areaUnit?: 'rem' | 'px' | 'vw' | 'vh'
	closeBtn?: Number
	confirmText?: string | TranslateResult
	cancelText?: string
	customClass?: string
	isAsync?: boolean
	isInitRequest?: boolean
	request?: any
	component?: DefineComponent | JSX.Element
	compData?: any
	showFooter?: boolean
	showClose?: boolean
	modal?: boolean
	isFullScreen?: boolean
	separationCancelClose?: boolean
	contentText?: any
	confirmBtnType?: 'danger'
	timingBtn?: boolean
	btn?: string | boolean | TranslateResult | Array<TranslateResult | string>
	close?: () => void
	open?: () => void
	onOpen?: (instance: any) => void
	onConfirm?: (instance: any) => boolean | Promise<boolean> | void
	onCancel?: (instance: any) => void
	cancel?: () => void
}

export interface DialogOptions extends DialogInstance {
	[x: string]: any
	visible: boolean
}

export interface DialogProps extends DialogOptions {
	$t: (key: string) => TranslateResult
	$el: HTMLElement
	$on: (event: string, callback: () => void) => void
	$destroy: () => void
}

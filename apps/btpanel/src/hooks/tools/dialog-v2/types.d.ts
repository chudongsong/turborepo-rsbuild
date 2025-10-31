import { useDraggable } from '@vueuse/core'
import exp from 'constants'

// 弹窗组件-视图
export type DialogArea = string[] | number[] | string | number

// 弹窗按钮-视图
export type DialogButton = {
	footer: boolean
	cancelText: string | undefined
	confirmText: string | undefined
}

// 弹窗配置
export interface DialogOptions<T> {
	title?: string | boolean // 弹窗标题
	area: DialogArea // 弹窗大小，如果为数字类型的时候，默认单位为rem
	modal?: boolean // 是否显示遮罩层
	component: string | Component | JSX.Element // 弹窗组件
	compData?: T // 组件数据
	fullscreen?: boolean // 是否全屏
	draggable?: boolean // 是否可拖拽
	footer?: boolean // 是否显示底部按钮，和confirm配合使用
	zIndex?: number // 弹窗层级
	customClass?: string // 自定义类名
	closeBtn?: 'one' | 'two' // 关闭按钮类型
	onClose?: (App) => void // 关闭回调，close不验证返回值
	onCancel?: (App) => boolean | void // 取消回调，关闭的回调
	onConfirm?: (App) => boolean | void // 确认回调，如果设置，确认按钮和取消按钮都会显示
	cancelText?: string // 取消按钮文本
	confirmText?: string // 确认按钮文本
}

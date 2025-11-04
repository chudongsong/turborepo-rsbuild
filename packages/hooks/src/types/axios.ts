/**
 * Axios Hooks 工具库 - 类型定义
 */

import type { Method } from 'axios'

// 扩展 axios 请求配置类型
declare module 'axios' {
	interface AxiosRequestConfig {
		skipPending?: boolean // 是否跳过请求取消管理
	}
}

export type RequestMiddleware =
	| 'string'
	| 'msg'
	| 'object'
	| 'boolean'
	| 'array'
	| 'number'
	| 'default'
	| 'ignore'
	| AnyFunction
	| string

// 请求配置
export type RequestConfig = {
	url: string
	data?: AnyObject
	method?: Method
	customType?: 'model' | 'plugin' | 'default' // 自定义类型
	isCustomUrl?: boolean // 是否自定义url
	loading?: string // 全局loading
	expand?: AnyObject // 扩展数据
	showMsg?: boolean // 是否显示消息
	type?: string // 请求类型
	check?: RequestMiddleware // 验证规则
	skipPending?: boolean // 是否跳过请求取消管理
}

// 请求结果
export type ResponseResult<T = any> = {
	data?: T
	status: boolean
	msg: string
	code: number
	default: boolean
	timestamp: number
}

// 返回结果
export type ResponseMessage = {
	status: boolean
	msg: string
	code?: number
	data?: AnyObject
}

export type ResponsePageResult<T = AnyObject[]> = {
	data: T
	page: string
	[key: string]: any
}

// Hook 状态类型
export type AxiosHookState<T = any> = {
	data: T | null
	loading: boolean
	error: Error | null
}

// Hook 选项类型
export type UseAxiosOptions = {
	immediate?: boolean // 是否立即执行
	manual?: boolean // 是否手动控制执行
	onSuccess?: (data: any) => void // 成功回调
	onError?: (error: Error) => void // 错误回调
	initialData?: any // 初始数据
}

// Axios 实例选项
export type AxiosInstanceOptions = {
	baseURL?: string
	timeout?: number
	headers?: Record<string, string>
}

// 错误处理选项
export type ErrorHandlerOptions = {
	showError?: boolean // 是否显示错误信息
	redirectOn401?: boolean // 是否在 401 时重定向
	redirectOn500?: boolean // 是否在 500 时重定向
}

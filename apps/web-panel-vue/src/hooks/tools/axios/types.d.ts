import type { Method } from 'axios'

// 扩展 axios 请求配置类型
declare module 'axios' {
	interface AxiosRequestConfig {
		skipPending?: boolean // 是否跳过请求取消管理
	}
}

export type MultipleOperationOptions = {
	[key: string]: {
		label: string
		callback: AnyFunction
	}
}

// 请求验证
export type RequestMiddleware = 'string' | 'msg' | 'object' | 'boolean' | 'array' | 'number' | 'default' | 'ignore' | AnyFunction | string

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

export type RequestMiddleware =
	| 'string'
	| 'msg'
	| 'object'
	| 'boolean'
	| 'array'
	| 'number'
	| 'default'
	| AnyFunction
	| string

export type RequestConfig = {
	url: string
	data?: AnyObject
	method?: Method
	customType?: 'model' | 'plugin' | 'default'
	isCustomUrl?: boolean
	loading?: string
	showMsg?: boolean
	type?: string
	check?: RequestMiddleware
	// initial?: boolean
}

// 请求返回
export type ResponseResult<T = any> = {
	data?: T
	status: boolean
	msg: string
	code: number
	default: boolean
	timestamp: number
}

// 表格数据返回
export type ResponseTableResult<T = AnyObject[], Z = AnyObject> = {
	data: T
	total: number
	other: Z
}

// 请求返回-消息类型版本
export type ResponseMessage = {
	status: boolean
	msg: string
	code?: number
	data?: AnyObject
}

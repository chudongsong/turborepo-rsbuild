/**
 * Axios 实例和拦截器配置
 */

import axios, {
	type AxiosRequestConfig,
	type AxiosResponse,
	type AxiosError,
} from 'axios'
import { isDev, isFunction, isNumber, isObject, isString, isUndefined, isBoolean, getToken, encodeParams, md5, getCookie } from './helpers'
import { axiosCanceler } from './axios-cancel'
import type {
	RequestConfig,
	RequestMiddleware,
	ResponseResult,
	AxiosInstanceOptions,
} from '../types/axios'

interface RequestTemplate {
	code: number
	msg: string
	data: AnyObject | string | number | boolean
	status: boolean
	default: boolean
	timestamp: number
}

export class HttpRequest {
	private instance: typeof axios

	private requestTemplate: RequestTemplate = {
		data: {}, // 请求数据
		code: 0, // 状态码，200为成功，其他为失败
		msg: 'success', // 提示信息
		status: true, // 接口状态
		default: true, // 默认状态，用于判断当前数据是否为默认数据，没有经过处理
		timestamp: 0, // 时间戳
	}

	constructor(opt: AxiosRequestConfig = {}) {
		const option = this.createDefaultOption(opt)
		this.instance = axios.create(option)
		this.handleRequestInterceptors()
		this.handleResponseInterceptors()
	}

	/**
	 * @description 创建默认配置
	 */
	private createDefaultOption(opt: AxiosRequestConfig = {}): AxiosInstanceOptions {
		const defaultOpt: AxiosInstanceOptions = {
			baseURL: isDev() ? '/api' : '',
			timeout: 250000,
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
			},
		}

		if (!isDev()) {
			const requestTokenKey =
				typeof window !== 'undefined' &&
				window.location.protocol.indexOf('https:') === 0
					? 'https_request_token'
					: 'request_token'
			const cookies = getCookie(requestTokenKey)
			defaultOpt.headers = {
				...defaultOpt.headers,
				...{ 'x-http-token': (window as any).vite_public_request_token },
				...(cookies ? { 'x-cookie-token': cookies } : {}),
			}
		}

		return { ...defaultOpt, ...opt }
	}

	/**
	 * @description 请求拦截
	 */
	private handleRequestInterceptors() {
		this.instance.interceptors.request.use(
			config => {
				if (isDev()) {
					const { data } = config
					const { request_time, request_token } = getToken()
					;((data as any) || {}).request_time = request_time
					;((data as any) || {}).request_token = request_token
				}
				// 检查是否跳过请求取消管理
				if (!(config as any).skipPending) {
					axiosCanceler.addPending(config)
				}
				return config
			},
			error => {
				return Promise.reject(error)
			},
		)
	}

	/**
	 * @description 响应拦截
	 */
	private handleResponseInterceptors() {
		this.instance.interceptors.response.use(
			(response: AxiosResponse) => {
				if (response) {
					axiosCanceler.removePending(response.config)
				}
				return response
			},
			(error: Error) => {
				return Promise.reject(error)
			},
		)
	}

	/**
	 * @description 处理扩展数据
	 */
	// handleExpand(url: string, options: RequestConfig): { url: string; transformRequest: any[] } {
	// 	const transformRequest = [this.handleTransformRequest]
	// 	if (options.expand) {
	// 		const { expand } = options
	// 		if (isObject(expand)) {
	// 			url = url.replace(expand.value, expand.replace)
	// 			const fn = (data: any, headers: any) => {
	// 				if ((expand as any).agent) {
	// 					data = { ...data, ...this.handleToken((expand as any).agent.key) }
	// 				}
	// 				return { data, headers }
	// 			 }
	// 			transformRequest.push(fn)
	// 		}
	// 	}
	// 	return { url, transformRequest }
	// }

	/**
	 * @description 处理token
	 */
	handleToken(key: string): { request_time: number; request_token: string } {
		const requestTime = Date.now()
		const requestToken = md5(String(requestTime).concat(md5(key)))
		return { request_time: requestTime, request_token: requestToken }
	}

	/**
	 * @description 请求中间件
	 */
	requestMiddleware<T>(
		response: AxiosResponse,
		check: RequestMiddleware = 'default',
	): ResponseResult | Error | T {
		const { data, status: code } = response
		let result = {
			...this.requestTemplate,
			...{ timestamp: new Date().getTime(), default: false },
			code,
		} as ResponseResult

		const hasStatus = 'status' in data
		const hasMsg = 'msg' in data // 是否有msg和status属性
		if (hasStatus && hasMsg && 'data' in data) result.default = true // 如果有msg和status属性，且有data属性，则为默认数据

		if (check === 'ignore') return response as T // 忽略验证规则，直接返回数据

		// 默认方式，组合数据
		const checkArray: RequestMiddleware[] = [
			'string',
			'object',
			'boolean',
			'array',
			'number',
			'default',
		]
		const { msg, status } = data

		// 处理重定向
		if ('redirect' in data && data.redirect) {
			if (typeof window !== 'undefined') {
				window.location.href = data.redirect as string
			}
			return result
		}

		// 兼容AApanel新数据结构
		if (
			isNumber(status) &&
			isUndefined((data as any).code) &&
			isObject((data as any).message)
		) {
			let message = ''
			if (!isUndefined((data as any).message?.result))
				message = (data as any).message.result
			return {
				code: 200,
				status: (status as number) > -1,
				msg: message,
				data: (data as any).message,
				default: false,
				timestamp: (data as any).timestamp,
			} as ResponseResult
		}

		// 兼容多机管理数据结构
		if (
			isNumber(status) &&
			!isUndefined(data.msg) &&
			!isUndefined((data as any).error_msg)
		) {
			return {
				code: (data as any).code,
				status: (status as number) > -1,
				msg: data.msg || (data as any).error_msg,
				data: (data as any).message || data,
				default: false,
				timestamp: (data as any).timestamp,
			} as ResponseResult
		}

		if (checkArray.includes(check)) {
			const isStatus = isBoolean(status)
			if (isObject(data) && hasStatus && hasMsg && check === 'default' && isStatus) {
				// 其中msg为字符串且不为空，status为布尔值
				if (isString(msg) && msg) {
					// 规则三：，声明类型为msg，则返回标准内容让外部处理
					result = { ...result, ...(data as ResponseResult) }
				}
				if (isObject(msg)) {
					// 规则四：其中msg为对象类型，status为布尔值，则直接重组数据结构返回
					if (!('status' in msg)) return { ...result, data: { ...msg, status } }
					result = { ...result, data: { ...msg, newStatus: status } } // 重新定义status名称
				}
				// 规则五：其中msg非字符串且非对象时，status为布尔值，则直接重组数据结构返回
				if (!isString(msg)) {
					result = {
						...result,
						status: true,
						data: { value: msg, status },
						msg: status ? 'success' : 'error',
					}
				}
			} else {
				if (isString(msg)) result.msg = msg as string
				if (isBoolean(status)) result.status = status
				result = {
					...result,
					data,
				}
			}
			return result
		}

		// 处理类型为msg类型的数据
		if (hasStatus && hasMsg && check === 'msg') {
			if ('data' in data && isObject(data.data)) {
				result = { ...result, ...(data as ResponseResult) }
			} else {
				result = { ...result, ...(data as ResponseResult), ...{ data } }
			}
			// 判断msg非字符串类型，如果是则将msg作为data返回，重置msg为默认值
			if (!isString(data.msg)) {
				if ('status' in data) result.msg = data.status ? 'success' : 'error'
				result = { ...result, data: data.msg }
			} else {
				// 如果msg为字符串类型，则将msg作为msg返回，重置msg为默认值
				result = { ...result, msg: data.msg }
			}
			return result
		}

		if (isFunction(check)) return (check as Function)(data) // 如果验证规则为函数，则执行函数

		throw new Error(JSON.stringify(data)) // 标记错误类型
	}

	/**
	 * @description 请求响应
	 */
	async request<T = any>({
		url,
		method = 'POST',
		data = {},
		customType = 'default',
		skipPending = false,
		check = 'default',
	}: RequestConfig): Promise<any> {
		const newUrl = this.createUrl({ url, customType })
		try {
			const rdata = await this.instance.request<any, AxiosResponse<T>>({
				url: newUrl,
				method,
				data,
				transformRequest: [this.handleTransformRequest],
				skipPending,
			})

			if (
				isString(rdata?.data) &&
				rdata?.data?.indexOf('密码已过期，请修改') > -1
			) {
				if (typeof window !== 'undefined') {
					window.location.reload()
				}
			}

			const newData = this.requestMiddleware(rdata, check) as ResponseResult
			return newData
		} catch (error: any) {
			if (check === 'ignore') return error
			return this.handleError(error)
		}
	}

	/**
	 * @description 获取地址
	 */
	private createUrl({ url, customType = 'default' }: RequestConfig): string {
		if (!url) throw new Error('请求路径为空')
		const urlArr = url ? url.split('/') : []
		if (urlArr.length !== 2 && customType !== 'model')
			throw new Error('传统请求/插件请求路径格式错误，正确格式为：模块名/方法名')

		switch (customType) {
			case 'default':
				return `/${urlArr[0]}?action=${urlArr[1]}`
			case 'model':
				return `/${url}`.replace(/\/+/g, '/')
			case 'plugin':
				return `/plugin?action=a&name=${urlArr[0]}&s=${urlArr[1]}`
			default:
				return `/${url}`.replace(/\/+/g, '/')
		}
	}

	/**
	 * @description 处理请求数据
	 */
	private handleTransformRequest = (oldData: AnyObject) => {
		// 将对象转换为查询字符串
		return encodeParams(oldData)
	}

	/**
	 * @description 请求错误处理
	 */
	handleError(err: AxiosError | Error): Error | Promise<never> {
		if ('response' in err) {
			const { response, message } = err as { response: any; message: string }
			// 检测是否有response属性，如果有则为axios错误
			if (message.indexOf('Network Error') > -1) {
				if (message.indexOf('timeout') > -1) {
					// TODO: 使用 toast 或其他方式显示错误
					console.error('请求超时，请稍后重试')
				}
			}
			if (message.indexOf('code 500') > -1) {
				if (response?.data?.indexOf('请先绑定宝塔帐号') > -1) {
					// Message.warn('请先绑定宝塔帐号，正在跳转至绑定页面')
					setTimeout(() => {
						if (typeof window !== 'undefined') {
							window.location.href = '/bind'
						}
					}, 1000)
				} else if (response?.data?.indexOf('建议按顺序逐一尝试以下解决方案') > -1) {
					const errorMsg = response.data
						.split('Error: ')[1]
						.split('</pre>')[0]
						.replace('面板运行时发生错误:', '')
						.replace('public.PanelError:', '')
						.trim()
					// TODO: 显示错误信息
					console.error(errorMsg)
				} else {
					if (!response.data) return false
					// return openBtError(response.data, errorFind, false)
				}
			}
			if (message.indexOf('code 404') > -1)
				console.error('请求错误，请稍后重试')
			if (message.indexOf('code 401') > -1 && typeof window !== 'undefined')
				window.location.href = '/'
			if (message.indexOf('Traceback') > -1) {
				console.error(response.data, '请求错误')
				console.error(typeof message, '请求错误')
				// return openBtError(message, true, false)
			}
		} else {
			// 判断是否为主动取消请求
			if (axios.isCancel(err)) return Promise.reject(err)
			// 如果没有response属性，则为自定义错误
			const { message } = err as Error
			if (message.indexOf('Traceback') > -1) {
				console.error(typeof message, '请求错误')
				// return openBtError(message, true, false)
			}

			if (message.indexOf('TypeError Middle') > -1) {
				console.error(
					`请求中间件类型验证失败，请检查请求数据类型是否正确<br />${message}`,
				)
			}
			return new Error(message)
		}
		return err
	}

	/**
	 * @description GET请求
	 */
	get(
		url: string,
		config: string | AnyFunction | Partial<RequestConfig> = {},
	): Promise<ResponseResult | Error> {
		if (isString(config) || isFunction(config)) {
			config = { check: config as any } as Partial<RequestConfig>
		}
		return this.request({
			...{ url, method: 'GET' },
			...(config as RequestConfig),
		} as RequestConfig)
	}

	/**
	 * @description POST请求
	 */
	post(
		url: string,
		config: string | AnyFunction | Partial<RequestConfig> = {},
	): Promise<ResponseResult> {
		if (isString(config) || isFunction(config)) {
			config = { check: config as any } as Partial<RequestConfig>
		}
		return this.request({
			...{ url, method: 'POST' },
			...(config as RequestConfig),
		} as RequestConfig)
	}
}

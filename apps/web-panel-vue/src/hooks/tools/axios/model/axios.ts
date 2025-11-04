/* eslint-disable camelcase */
/* eslint-disable @typescript-eslint/naming-convention */
import type { RequestConfig, RequestMiddleware, ResponseResult } from '@/hooks/tools/axios/types'

import axios, { type AxiosError, type AxiosInstance, type AxiosRequestConfig, type AxiosResponse } from 'axios'
import { has } from 'ramda'
import md5 from 'md5'
import { useMessage } from '@/hooks/tools'
import { isBoolean, isDev, isEmpty, isFunction, isObject, isString, getToken, isNumber, isUndefined } from '@/utils'

import { AxiosCanceler } from './axios-cancel'
import { createDefaultOption, createUrl, handleTransformRequest } from './method'
import { openBtError } from '../error'

const Message = useMessage()

interface RequestTemplate {
	code: number
	msg: string
	data: AnyObject | string | number | boolean
	status: boolean
	default: boolean
	timestamp: number
}

export class HttpRequest {
	private instance: AxiosInstance

	private requestTemplate: RequestTemplate = {
		data: {}, // 请求数据
		code: 0, // 状态码，200为成功，其他为失败
		msg: 'success', // 提示信息
		status: true, // 接口状态
		default: true, // 默认状态，用于判断当前数据是否为默认数据，没有经过处理
		timestamp: 0, // 时间戳
	}

	constructor(opt: AxiosRequestConfig = {}) {
		const option = createDefaultOption(opt)
		this.instance = axios.create(option)
		this.handleRequestInterceptors()
		this.handleResponseInterceptors()
	}

	/**
	 * @description 请求拦截
	 */
	private handleRequestInterceptors() {
		const axiosCanceler = new AxiosCanceler()
		this.instance.interceptors.request.use(
			config => {
				if (isDev) {
					const { data } = config
					const { request_time, request_token } = getToken()
					data.request_time = request_time
					data.request_token = request_token
				}
				// 检查是否跳过请求取消管理
				if (!config.skipPending) {
					axiosCanceler.addPending(config)
				}
				return config
			},
			error => {
				return Promise.reject(error)
			}
		)
	}

	/**
	 * @description 响应拦截
	 */
	private handleResponseInterceptors() {
		const axiosCanceler = new AxiosCanceler()
		this.instance.interceptors.response.use(
			(response: AxiosResponse) => {
				if (response) {
					axiosCanceler.removePending(response.config)
				}
				return response
			},
			(error: Error) => {
				return Promise.reject(error)
			}
		)
	}

	/**
	 * @description 处理token
	 * @param {string} key 密钥
	 * @returns {request_time: number, request_token: string}
	 */
	handleToken(key: string) {
		const requestTime = Date.now()
		const requestToken = md5(String(requestTime).concat(md5(key)))
		return { request_time: requestTime, request_token: requestToken }
	}

	/**
	 * @description 处理扩展数据
	 * @param {string} url 请求地址
	 * @param {RequestConfig} options 请求配置
	 */
	// handleExpand(url: string, options: RequestConfig): { url: string; transformRequest: any[] } {
	// 	const transformRequest = [handleTransformRequest]
	// 	if (options.expand) {
	// 		const { expand } = options
	// 		if (isObject(expand)) {
	// 			url = url.replace(expand.value, expand.replace)
	// 			const fn = (data: any, headers: any) => {
	// 				if (expand.agent) {
	// 					data = { ...data, ...this.handleToken(expand.agent.key) }
	// 				}
	// 				return { data, headers }
	// 			}
	// 			transformRequest.push(fn)
	// 		}
	// 	}
	// 	return { url, transformRequest }
	// }

	/**
	 * @description 请求中间件
	 * @param {AnyObject} data 请求数据
	 * @param {string | AnyFunction} check 验证规则
	 */
	requestMiddleware<T>(response: AxiosResponse, check: RequestMiddleware = 'default'): ResponseResult | Error | T {
		const { data, status: code } = response
		let result = {
			...this.requestTemplate,
			...{ timestamp: new Date().getTime(), default: false },
			code,
		} as ResponseResult
		const isMsg = has('status', data) && has('msg', data) // 是否有msg和status属性
		if (isMsg && has('data', data)) result.default = true // 如果有msg和status属性，且有data属性，则为默认数据
		if (check === 'ignore') return response as T // 忽略验证规则，直接返回数据
		// 默认方式，组合数据
		const chekcArray: RequestMiddleware[] = ['string', 'object', 'boolean', 'array', 'number', 'default']
		const { msg, status, redirect } = data

		// eslint-disable-next-line no-return-assign
		if (redirect) return (window.location.href = redirect)

		// 兼容AApanel新数据结构
		if (isNumber(status) && isUndefined(data?.code) && isObject(data?.message)) {
			let message = ''
			if (!isUndefined(data.message.result)) message = data.message.result
			return { code: 200, status: status > -1, msg: message, data: data.message, default: false, timestamp: data.timestamp } as ResponseResult
		}

		// 兼容多机管理数据结构
		if (isNumber(status) && !isUndefined(data.msg) && !isUndefined(data.error_msg)) {
			return { code: data.code, status: status > -1, msg: data.msg || data.error_msg, data: data.message || data, default: false, timestamp: data.timestamp } as ResponseResult
		}

		if (chekcArray.includes(check)) {
			const isStatus = isBoolean(status)
			if (isObject(data) && isMsg && check === 'default' && isStatus) {
				// 其中msg为字符串且不为空，status为布尔值
				if (isString(msg) && !isEmpty(msg)) {
					// 规则三：，声明类型为msg，则返回标准内容让外部处理
					result = { ...result, ...(data as ResponseResult) }
				}
				if (isObject(msg)) {
					// 规则四：其中msg为对象类型，status为布尔值，则直接重组数据结构返回
					if (!has('status', msg)) return { ...result, data: { ...msg, status } }
					result = { ...result, data: { ...msg, newStatus: status } } // 重新定义status名称
				}
				// 规则五：其中msg非字符串且非对象时，status为布尔值，则直接重组数据结构返回
				if (!isString(msg)) {
					result = {
						...result,
						status: true,
						data: { value: msg, status },
						msg: data.status ? 'success' : 'error',
					}
				}
			} else {
				if (isString(msg)) result.msg = msg
				if (isBoolean(status)) result.status = status
				result = {
					...result,
					data,
				}
			}
			return result
		}

		// 处理类型为msg类型的数据
		if (isMsg && check === 'msg') {
			if (has('data', data) && isObject(data.data)) {
				result = { ...result, ...(data as ResponseResult) }
			} else {
				result = { ...result, ...(data as ResponseResult), ...{ data } }
			}
			// result.status = data.status as boolean
			// 判断msg非字符串类型，如果是则将msg作为data返回，重置msg为默认值
			if (!isString(data.msg)) {
				if (has('status', data)) result.msg = data.status ? 'success' : 'error'
				result = { ...result, data: data.msg }
			} else {
				// 如果msg为字符串类型，则将msg作为msg返回，重置msg为默认值
				result = { ...result, msg: data.msg }
			}
			return result
		}
		if (isFunction(check)) return check(data) // 如果验证规则为函数，则执行函数，需要返回原始数据或者处理后的数据，或者抛出错误
		// if (type === check) return result // 如果验证规则类型和数据类型一致，则返回数据
		throw Error(data, response.request.responseURL) // 标记错误类型
	}

	/**
	 * @description 请求错误处理
	 * @param {Error} error 错误信息
	 * @returns
	 */
	handleError(err: AxiosError | Error) {
		const errorKey = 'We need to make sure this has a favicon so that the debugger does'
		if (has('response', err)) {
			const { response, message } = err as { response: any; message: string }
			// 检测是否有response属性，如果有则为axios错误
			const errorFind = response?.data.indexOf(errorKey)
			if (message.indexOf('Network Error') > -1) {
				if (message.indexOf('timeout') > -1) useMessage().error('请求超时，请稍后重试')
			}
			if (message.indexOf('code 500') > -1) {
				if (response.data.indexOf('请先绑定宝塔帐号') > -1) {
					// Message.warn('请先绑定宝塔帐号，正在跳转至绑定页面')
					setTimeout(() => {
						window.location.href = '/bind'
					}, 1000)
				} else if (response.data.indexOf('建议按顺序逐一尝试以下解决方案') > -1) {
					const errorMsg = response.data.split('Error: ')[1].split('</pre>')[0].replace('面板运行时发生错误:', '').replace('public.PanelError:', '').trim()
					Message.msg({
						customClass: 'panel-cloud-error',
						dangerouslyUseHTMLString: true,
						message: errorMsg,
						type: 'error',
						duration: 0,
						showClose: true,
					})
				} else {
					if (!response.data) return false
					return openBtError(response.data, errorFind, false)
				}
			}
			if (message.indexOf('code 404') > -1) Message.error('请求错误，请稍后重试')
			if (message.indexOf('code 401') > -1) window.location.href = '/'
			if (message.indexOf('Traceback') > -1) {
				console.error(response.data, '请求错误')
				console.error(typeof message, '请求错误')
				return openBtError(message, true, false)
				// Message.error('请求出现问题，请稍后重试')
			}
		} else {
			// 判断是否为主动取消请求
			if (axios.isCancel(err)) return Promise.reject(err)
			// 如果没有response属性，则为自定义错误
			const { message } = err as Error
			if (message.indexOf('Traceback') > -1) {
				console.error(typeof message, '请求错误')
				return openBtError(message, true, false)
				// Message.error('请求出现问题，请稍后重试')
			}

			if (message.indexOf('TypeError Middle') > -1) {
				Message.msg({
					customClass: 'panel-cloud-error',
					dangerouslyUseHTMLString: true,
					message: `请求中间件类型验证失败，请检查请求数据类型是否正确<br />${message}`,
					type: 'error',
					duration: 0,
					showClose: true,
				})
			}
			return new Error(message)
		}
		return err
	}

	/**
	 * @description 请求响应
	 * @param { RequestConfig } config 请求配置
	 * @returns
	 */
	async request<T = any>({ url, method = 'POST', data = {}, customType = 'default', loading = '', check = 'default', skipPending = false }: RequestConfig): Promise<any> {
		const newUrl = createUrl({ url, customType }) // 获取请求地址，默认为常规请求
		let load: any = null
		let rdata: AxiosResponse<T> | any = null
		if (loading) load = Message.load(loading) // 加载提示
		try {
			// biome-ignore lint/suspicious/noExplicitAny: <explanation>
			rdata = await this.instance.request<any, AxiosResponse<T>>({
				url: newUrl,
				method,
				data,
				transformRequest: [handleTransformRequest],
				skipPending,
			})

			if (isString(rdata?.data) && rdata?.data?.indexOf('密码已过期，请修改') > -1) {
				return window.location.reload()
			}
			const newData = this.requestMiddleware(rdata, check) as ResponseResult
			// 导致了双层提示
			// if (!newData.status) Message.error(newData.msg)
			return newData
		} catch (error: any) {
			if (check === 'ignore') return error
			return this.handleError(error)
		} finally {
			load?.close()
		}
	}

	/**
	 * @description GET请求
	 * @param {string} url 请求地址
	 * @param {RequestConfig} config 请求配置
	 * @returns {Promise<ResponseResult>}
	 */
	get(url: string, config: string | AnyFunction | Partial<RequestConfig> = {}): Promise<ResponseResult | Error> {
		if (isString(config) || isFunction(config)) {
			config = { check: config } as Partial<RequestConfig>
		}
		return this.request({
			...{ url, method: 'GET' },
			...(config as RequestConfig),
		} as RequestConfig)
	}

	/**
	 * @description POST请求
	 * @param {string} url 请求地址
	 * @param {RequestConfig | string | AnyFunction} config 请求配置
	 * @returns {Promise<ResponseResult>}
	 */
	post(url: string, config: string | AnyFunction | Partial<RequestConfig> = {}): Promise<ResponseResult> {
		if (isString(config) || isFunction(config)) {
			config = { check: config } as Partial<RequestConfig>
		}
		return this.request({
			...{ url, method: 'POST' },
			...(config as RequestConfig),
		} as RequestConfig)
	}
}

// export { controller }

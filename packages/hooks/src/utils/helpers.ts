/**
 * 辅助工具函数
 */

import md5Lib from 'md5'

/**
 * 检查值是否为函数
 */
export const isFunction = (val: unknown): val is Function =>
	typeof val === 'function'

/**
 * 检查值是否为字符串
 */
export const isString = (val: unknown): val is string =>
	typeof val === 'string'

/**
 * 检查值是否为数字
 */
export const isNumber = (val: unknown): val is number =>
	typeof val === 'number' && !isNaN(val)

/**
 * 检查值是否为布尔值
 */
export const isBoolean = (val: unknown): val is boolean =>
	typeof val === 'boolean'

/**
 * 检查值是否为对象
 */
export const isObject = (val: unknown): val is Record<string, any> =>
	val !== null && typeof val === 'object' && !Array.isArray(val)

/**
 * 检查值是否为空
 */
export const isEmpty = (val: unknown): boolean => {
	if (val === null || val === undefined) return true
	if (isString(val)) return val.length === 0
	if (Array.isArray(val)) return val.length === 0
	if (isObject(val)) return Object.keys(val).length === 0
	return false
}

/**
 * 检查值是否未定义
 */
export const isUndefined = (val: unknown): val is undefined =>
	val === undefined

/**
 * 检查是否为开发环境
 */
export const isDev = (): boolean =>
	typeof process !== 'undefined' &&
	process.env &&
	process.env.NODE_ENV !== 'production'

/**
 * URL 编码
 */
export const encodeParams = (params: Record<string, any>): string =>
	Object.entries(params)
		.map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
		.join('&')

/**
 * 获取 cookie 值
 */
export const getCookie = (name: string): string | null => {
	if (typeof document === 'undefined') return null
	const matches = document.cookie.match(
		new RegExp('(?:^|; )' + name.replace(/([$?*|{}()[\]\\/+^])/g, '\\$1') + '=([^;]*)'),
	)
	return matches ? decodeURIComponent(matches[1]) : null
}

/**
 * MD5 加密
 */
export const md5 = (str: string): string => {
	return md5Lib(str)
}

/**
 * 获取 token 信息
 */
export const getToken = (): { request_time: number; request_token: string } => {
	const requestTime = Date.now()
	const requestToken = md5Lib(String(requestTime).concat(md5Lib('default-key')))
	return { request_time: requestTime, request_token: requestToken }
}

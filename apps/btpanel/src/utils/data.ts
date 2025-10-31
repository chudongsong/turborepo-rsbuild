/* eslint-disable camelcase */
/* eslint-disable @typescript-eslint/naming-convention */
import md5 from 'md5'
import { always, curry, fromPairs, has, ifElse, isNil, isNotNil, join, map, pipe, toPairs } from 'ramda'
import { isDev } from './common'
import { isArray, isBoolean, isEmpty, isFunction, isObject, isPromise, isUndefined } from './type'

/**
 * @description 获取token，API请求
 * @returns { object } { requestTime, requestToken }
 */
export const getToken = () => {
	const request_time = Date.now()
	const agentKey: string = window.vite_public_proxy_key // 秘钥
	const request_token = md5(String(request_time).concat(md5(agentKey)))
	return { request_time, request_token }
}

/**
 * @description 将对象作为参数添加到URL
 * @param { string } url url
 * @param { AnyObject } obj 对象参数
 * @returns {string}
 */
export const setObjToUrlParams = curry((url: string, obj: AnyObject): string => {
	const objToParams = pipe(
		toPairs,
		map(([key, value]) => `${String(key)}=${encodeURIComponent(String(value))}`),
		join('&')
	)
	const parameters = objToParams(obj)
	return /\?$/.test(url) ? url + parameters : url.replace(/\/?$/, '?') + parameters
})

/**
 * @description 判断对象是否有该属性值
 * @param { T } obj 对象
 * @param { PropertyKey } key 属性值
 * @returns
 */
export const hasOwnProperty = <T>(obj: T, key: PropertyKey): boolean => {
	return Object.prototype.hasOwnProperty.call(obj, key)
}

/**
 * 返回字符串 为n个char构成
 * @param {string} char 重复的字符
 * @param {number} count 次数
 * @return {string}
 */
export const getRepeatChar = (char: string, count: number): string => {
	let str: string = ''
	while (count--) {
		str += char
	}
	return str
}

/**
 * @description 深拷贝
 * @param {object} obj 需要拷贝的对象
 * @returns {object} 拷贝后的对象
 */
export const deepClone = (obj: AnyObject) => {
	if (isUndefined(obj) || (!isObject(obj) && !isArray(obj))) {
		return obj
	}
	const newObj: AnyObject = Array.isArray(obj) ? [] : {}
	// eslint-disable-next-line no-restricted-syntax, guard-for-in
	for (const key in obj) {
		newObj[key as keyof AnyObject] = deepClone(obj[key])
	}
	return newObj
}

/**
 * @description 对比新旧表格配置
 * @param {any[]} oldConfig 旧配置
 * @param {any[]} newConfig 新配置
 */
export const contrastTableConfig = (oldConfig: any[], newConfig: any[]): any[] => {
	if (oldConfig.length === 0) return newConfig
	oldConfig?.map((item, index) => {
		if (isBoolean(item.isCustom)) newConfig[index].isCustom = item.isCustom
		return item
	})
	return newConfig
}

/**
 * @description 删除空白值
 * @param {AnyObject} obj 对象
 * @returns {AnyObject}
 */
export const removeEmptyValues = (obj: AnyObject): any =>
	Object.entries(obj).reduce((acc, [key, value]) => {
		if (isUndefined(value) || isEmpty(value) || isArray(value)) return acc
		return { ...acc, [key]: value }
	}, {})

/**
 * @description 转义html
 * @param {string} str xss字符串
 * @returns
 */
export const decodeHtml = (str: string) => {
	const doc = new DOMParser().parseFromString(str, 'text/html')
	return doc.documentElement.textContent
}

/**
 * @description 全角字符转换半角字符
 * @param str
 * @returns
 */
export const toHalfWidth = (str: string) => {
	return str.replace(/[\uff01-\uff5e]/g, function (ch) {
		const charCode = ch.charCodeAt(0)
		return String.fromCharCode(charCode - 65248)
	})
}

/**
 * @description 检测当前参数是否异常，如果异常则设置默认值
 * @param { any } value 当前值
 * @param { any } defaultValue 默认值
 */
export const checkValue = (value: any, defaultValue: any) => {
	// 验证当前默认值是否为undefined
	if (isNil(defaultValue)) throw new Error('默认值不能为空')
	// 判断当前值是否为undefined或者null
	if (isNil(value)) return defaultValue
	return value
}

/**
 * @description 获取cookie
 * @param {string} key 键
 * @returns {string | null} 值
 */
export const getCookie = (key: string) => {
	const isHttps = window.location.protocol === 'https:'
	const keys = `http${isHttps ? 's' : ''}_${key}`
	const regExp = new RegExp(`(^| )${keys}=([^;]*)(;|$)`)
	const matchVal = document.cookie.match(regExp)
	if (matchVal) return decodeURIComponent(matchVal[2])
	return null
}

/**
 * @description 设置cookie
 * @param {string} key 键
 * @param {string} val 值
 * @param {string} time 时间
 */
export const setCookie = (key: string, val: string, time: number | string = 30) => {
	const currentTime = new Date()
	const isHttps = window.location.protocol === 'https:'
	const samesite = '; Secure; Path=/; SameSite=None'
	const endTime = !isNil(time) ? Number(time) * 24 * 60 * 60 * 1000 : 30 * 24 * 60 * 60 * 1000
	// 计算到期时间
	currentTime.setTime(currentTime.getTime() + endTime)
	const expires = currentTime.toUTCString()
	document.cookie = `http${isHttps ? 's' : ''}_${key}=${encodeURIComponent(val)};expires=${expires}${isHttps ? samesite : ''}`
}

/**
 * @description 清空所有的cookie
 */
export const emptyCookie = () => {
	const cookies = document.cookie.split(';')
	for (let i = 0; i < cookies.length; i++) {
		const cookie = cookies[i]
		const eqPos = cookie.indexOf('=')
		const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie
		document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT`
	}
}

/**
 * @description 清除指定的cookie
 * @param {string} key cookie的key
 */
export const clearCookie = (key: string) => {
	setCookie(key, '', 0)
}

/**
 * @description 检查对象属性是否可用
 * @param {AnyObject} obj 对象
 * @param {string} key 键
 * @returns {boolean}
 */
export const checkObjKey = curry((obj: AnyObject, key: string) => {
	return pipe(ifElse(isNotNil, always, has(key)))(obj)
})

/**
 * @description 将字符串下划线转驼峰
 */
export const camelCase = (str: string) => {
	return str.replace(/_([a-z])/g, function (g) {
		return g[1].toUpperCase()
	})
}

/**
 * @description 将对象属性下划线转驼峰
 */
export const underscoreToCamelCase = pipe(
	toPairs,
	map(([key, value]) => [camelCase(key as string), value]),
	fromPairs as any
)

/**
 * @description 检查图片打包路径
 */
export const checkDevImgPath = (path: string) => {
	let completePath = ''
	completePath = `/static/images/${path}`
	return completePath.replace(/\/\//g, '/')
}

/**
 * @description 检查是否为移动端
 * @returns {boolean}
 */
export const isMobile = () => {
	const userAgent = navigator.userAgent.toLowerCase()
	const mobileRegex = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini|windows phone/i
	return mobileRegex.test(userAgent)
}

/**
 * @description 设置sessionStorage
 * @param {string} key 键
 * @param {any} val 值
 */
export const setSessionStorage = (key: string, val: any) => {
	try {
		const serializedValue = JSON.stringify(val)
		sessionStorage.setItem(key, serializedValue)
	} catch (e) {
		console.error(`设置sessionStorage失败:"${key}":`, e)
	}
}

/**
 * @description 获取sessionStorage
 * @param {string} key 键
 * @returns {any | null}
 */
export const getSessionStorage = (key: string) => {
	const serializedValue = sessionStorage.getItem(key)
	if (serializedValue) {
		try {
			return JSON.parse(serializedValue)
		} catch (e) {
			console.error(`获取sessionStorage失败 "${key}":`, e)
			return null
		}
	}
	return null
}

/**
 * @description 删除sessionStorage
 * @param {string} key 键
 */
export const removeSessionStorage = (key: string) => {
	try {
		sessionStorage.removeItem(key)
	} catch (e) {
		console.error(`删除sessionStorage失败 "${key}":`, e)
	}
}

/**
 * @description 创建代理url
 * @param {string} url url
 * @returns {string}
 */
export const createProxyUrl = (url: string) => {
	let newUrl = url
	const isParam = newUrl.indexOf('?') > -1
	if (url.indexOf('/') !== 0) newUrl = `/${url}`
	if (!isDev) return newUrl
	const { request_time, request_token } = getToken()
	return `/api${newUrl}${!isParam ? '?' : '&'}request_time=${request_time}&request_token=${request_token}`
}

/**
 * @description
 * @param {any} component 组件
 */
export const checkComponent = (component: Component | any) => {
	// 判断是否为直接引用的组件,
	if (isObject(component) && has('__name', component)) return component
	// 判断是否为函数并且返回值为Promise, 则使用异步组件
	if (isFunction(component)) {
		const comp = component() as Promise<Component>
		if (isPromise(comp)) {
			return defineAsyncComponent(() => comp as Promise<Component>)
		}
		return comp
	}

	// tsx和字符串直接返回
	return component
}

export const swapString = (str: string) => {
	const arrEntities: AnyObject = {
		lt: '<',
		gt: '>',
		nbsp: ' ',
		amp: '&',
		quot: '"',
		'#x27': "'",
		apos: "'",
	}
	return str.replace(/&(lt|gt|nbsp|amp|quot|#x27);/gi, function (_all: unknown, t: string | number) {
		return arrEntities[t]
	})
}

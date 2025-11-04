import { curry, toPairs, map, join, fromPairs, ifElse, isNotNil, has, pipe } from 'ramda'
import { isUndefined, isObject, isArray, isEmpty, isPromise, isFunction } from '../type-utils/is'

/**
 * Convert an object to URL query parameters
 * @param url - Base URL
 * @param obj - Object to convert
 * @returns URL with query parameters
 */
export const setObjToUrlParams = curry((url: string, obj: Record<string, any>): string => {
	const objToParams = pipe(
		toPairs,
		map(([key, value]) => `${String(key)}=${encodeURIComponent(String(value))}`),
		join('&')
	)
	const parameters = objToParams(obj)
	return /\?$/.test(url) ? url + parameters : url.replace(/\/?$/, '?') + parameters
})

/**
 * Check if an object has a specific property
 * @param obj - Object to check
 * @param key - Property key
 * @returns true if object has the property, false otherwise
 */
export const hasOwnProperty = <T>(obj: T, key: PropertyKey): boolean => {
	return Object.prototype.hasOwnProperty.call(obj as any, key)
}

/**
 * Generate a string with repeated characters
 * @param char - Character to repeat
 * @param count - Number of times to repeat
 * @returns Repeated character string
 */
export const getRepeatChar = (char: string, count: number): string => {
	let str: string = ''
	while (count--) {
		str += char
	}
	return str
}

/**
 * Deep clone an object or array
 * @param obj - Object or array to clone
 * @returns Deep cloned value
 */
export const deepClone = <T>(obj: T): T => {
	if (isUndefined(obj) || (!isObject(obj) && !isArray(obj))) {
		return obj
	}

	const newObj: any = Array.isArray(obj) ? [] : {}

	for (const key in obj) {
		if (Object.prototype.hasOwnProperty.call(obj, key)) {
			newObj[key as keyof typeof obj] = deepClone((obj as any)[key])
		}
	}

	return newObj
}

/**
 * Compare old and new table configurations
 * @param oldConfig - Old configuration array
 * @param newConfig - New configuration array
 * @returns Updated configuration array
 */
export const contrastTableConfig = (oldConfig: any[], newConfig: any[]): any[] => {
	if (oldConfig.length === 0) return newConfig

	oldConfig?.map((item, index) => {
		if (typeof item.isCustom !== 'undefined') {
			newConfig[index].isCustom = item.isCustom
		}
		return item
	})

	return newConfig
}

/**
 * Remove empty values from an object
 * @param obj - Object to process
 * @returns Object with empty values removed
 */
export const removeEmptyValues = (obj: Record<string, any>): Record<string, any> =>
	Object.entries(obj).reduce((acc, [key, value]) => {
		if (isUndefined(value) || (isEmpty(value) && !isArray(value))) return acc
		return { ...acc, [key]: value }
	}, {})

/**
 * Decode HTML entities
 * @param str - String with HTML entities
 * @returns Decoded string
 */
export const decodeHtml = (str: string): string => {
	const doc = new DOMParser().parseFromString(str, 'text/html')
	return doc.documentElement.textContent || ''
}

/**
 * Convert full-width characters to half-width
 * @param str - String to convert
 * @returns Converted string
 */
export const toHalfWidth = (str: string): string => {
	return str.replace(/[\uff01-\uff5e]/g, function (ch: string): string {
		const charCode = ch.charCodeAt(0)
		return String.fromCharCode(charCode - 65248)
	})
}

/**
 * Check if a value is valid, return default if not
 * @param value - Current value
 * @param defaultValue - Default value
 * @returns Value or default if value is null/undefined
 */
export const checkValue = <T>(value: T | null | undefined, defaultValue: T): T => {
	if (defaultValue === null || defaultValue === undefined) {
		throw new Error('默认值不能为空')
	}
	if (value === null || value === undefined) return defaultValue
	return value
}

/**
 * Convert snake_case to camelCase
 * @param str - Snake case string
 * @returns Camel case string
 */
export const camelCase = (str: string): string => {
	return str.replace(/_([a-z])/g, function (_g: string, letter: string): string {
		return letter.toUpperCase()
	})
}

/**
 * Convert object keys from snake_case to camelCase
 * @param obj - Object to convert
 * @returns Object with camelCase keys
 */
export const underscoreToCamelCase = <T extends Record<string, any>>(obj: T): T => {
	const convert = (value: any): any => {
		if (isObject(value)) {
			const pairs = toPairs(value).map(([key, val]) => [camelCase(key as string), convert(val)])
			return fromPairs(pairs)
		}
		if (isArray(value)) {
			return value.map(convert)
		}
		return value
	}

	const pairs = toPairs(obj).map(([key, value]) => [camelCase(key as string), convert(value)])
	return fromPairs(pairs) as T
}

/**
 * Check if a value is mobile device (user agent string check)
 * @param userAgent - User agent string (defaults to navigator.userAgent if in browser)
 * @returns true if mobile device, false otherwise
 */
export const isMobile = (userAgent?: string): boolean => {
	const ua = userAgent || (typeof navigator !== 'undefined' ? navigator.userAgent.toLowerCase() : '')
	const mobileRegex = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini|windows phone/i
	return mobileRegex.test(ua)
}

/**
 * Swap HTML entities to actual characters
 * @param str - String with HTML entities
 * @returns String with entities replaced
 */
export const swapString = (str: string): string => {
	const entities: Record<string, string> = {
		lt: '<',
		gt: '>',
		nbsp: ' ',
		amp: '&',
		quot: '"',
		'#x27': "'",
		apos: "'",
	}

	return str.replace(/&(lt|gt|nbsp|amp|quot|#x27);/gi, function (
		_all: unknown,
		t: string
	): string {
		return entities[t] || t
	})
}

/**
 * Check if an object has a key (with value not null/undefined)
 * @param obj - Object to check
 * @param key - Key to check
 * @returns true if key exists and has a value, false otherwise
 */
export const checkObjKey = curry((obj: Record<string, any>, key: string): boolean => {
	const value = obj[key]
	return value !== null && value !== undefined
})

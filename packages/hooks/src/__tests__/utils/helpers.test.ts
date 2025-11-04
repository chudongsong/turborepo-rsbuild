/**
 * 测试辅助工具函数
 */

import { describe, it, expect, vi } from 'vitest'
import {
	isFunction,
	isString,
	isNumber,
	isBoolean,
	isObject,
	isEmpty,
	isUndefined,
	isDev,
	encodeParams,
	getCookie,
	md5,
	getToken,
} from '../../utils/helpers'

describe('helpers', () => {
	describe('isFunction', () => {
		it('应该正确识别函数', () => {
			expect(isFunction(() => {})).toBe(true)
			expect(isFunction(function () {})).toBe(true)
			expect(isFunction(Array.isArray)).toBe(true)
		})

		it('应该正确识别非函数', () => {
			expect(isFunction(null)).toBe(false)
			expect(isFunction(undefined)).toBe(false)
			expect(isFunction('string')).toBe(false)
			expect(isFunction(123)).toBe(false)
			expect(isFunction({})).toBe(false)
		})
	})

	describe('isString', () => {
		it('应该正确识别字符串', () => {
			expect(isString('')).toBe(true)
			expect(isString('hello')).toBe(true)
			expect(isString(String(''))).toBe(true)
		})

		it('应该正确识别非字符串', () => {
			expect(isString(null)).toBe(false)
			expect(isString(undefined)).toBe(false)
			expect(isString(123)).toBe(false)
			expect(isString({})).toBe(false)
			expect(isString([])).toBe(false)
		})
	})

	describe('isNumber', () => {
		it('应该正确识别数字', () => {
			expect(isNumber(0)).toBe(true)
			expect(isNumber(123)).toBe(true)
			expect(isNumber(-123)).toBe(true)
			expect(isNumber(3.14)).toBe(true)
		})

		it('应该正确识别非数字', () => {
			expect(isNumber(null)).toBe(false)
			expect(isNumber(undefined)).toBe(false)
			expect(isNumber('123')).toBe(false)
			expect(isNumber(NaN)).toBe(false)
			expect(isNumber(Infinity)).toBe(false)
		})
	})

	describe('isBoolean', () => {
		it('应该正确识别布尔值', () => {
			expect(isBoolean(true)).toBe(true)
			expect(isBoolean(false)).toBe(true)
		})

		it('应该正确识别非布尔值', () => {
			expect(isBoolean(null)).toBe(false)
			expect(isBoolean(undefined)).toBe(false)
			expect(isBoolean(1)).toBe(false)
			expect(isBoolean('true')).toBe(false)
		})
	})

	describe('isObject', () => {
		it('应该正确识别对象', () => {
			expect(isObject({})).toBe(true)
			expect(isObject({ a: 1 })).toBe(true)
		})

		it('应该正确识别非对象', () => {
			expect(isObject(null)).toBe(false)
			expect(isObject(undefined)).toBe(false)
			expect(isObject([])).toBe(false)
			expect(isObject('string')).toBe(false)
			expect(isObject(123)).toBe(false)
			expect(isObject(true)).toBe(false)
			expect(isObject(() => {})).toBe(false)
		})
	})

	describe('isEmpty', () => {
		it('应该正确识别空值', () => {
			expect(isEmpty(null)).toBe(true)
			expect(isEmpty(undefined)).toBe(true)
			expect(isEmpty('')).toBe(true)
			expect(isEmpty([])).toBe(true)
			expect(isEmpty({})).toBe(true)
		})

		it('应该正确识别非空值', () => {
			expect(isEmpty('hello')).toBe(false)
			expect(isEmpty([1, 2, 3])).toBe(false)
			expect(isEmpty({ a: 1 })).toBe(false)
			expect(isEmpty(0)).toBe(false)
			expect(isEmpty(false)).toBe(false)
		})
	})

	describe('isUndefined', () => {
		it('应该正确识别 undefined', () => {
			expect(isUndefined(undefined)).toBe(true)
		})

		it('应该正确识别非 undefined', () => {
			expect(isUndefined(null)).toBe(false)
			expect(isUndefined(0)).toBe(false)
			expect(isUndefined('')).toBe(false)
			expect(isUndefined(false)).toBe(false)
		})
	})

	describe('isDev', () => {
		it('在测试环境中应该返回 false', () => {
			expect(isDev()).toBe(false)
		})
	})

	describe('encodeParams', () => {
		it('应该正确编码参数', () => {
			expect(encodeParams({ a: 1, b: 2 })).toBe('a=1&b=2')
			expect(encodeParams({ name: 'John Doe', age: 30 })).toBe(
				'name=John%20Doe&age=30',
			)
		})

		it('应该正确处理特殊字符', () => {
			expect(encodeParams({ email: 'test@example.com' })).toBe(
				'email=test%40example.com',
			)
		})

		it('应该正确处理空对象', () => {
			expect(encodeParams({})).toBe('')
		})
	})

	describe('getCookie', () => {
		it('应该返回存在的 cookie', () => {
			Object.defineProperty(document, 'cookie', {
				value: 'test=value; session=abc123',
				writable: true,
			})
			expect(getCookie('test')).toBe('value')
			expect(getCookie('session')).toBe('abc123')
		})

		it('应该返回 null 如果 cookie 不存在', () => {
			Object.defineProperty(document, 'cookie', {
				value: 'test=value',
				writable: true,
			})
			expect(getCookie('nonexistent')).toBe(null)
		})

		it('在服务端应该返回 null', () => {
			// 模拟服务端环境
			const originalDocument = global.document
			// @ts-ignore
			global.document = undefined
			expect(getCookie('test')).toBe(null)
			// @ts-ignore
			global.document = originalDocument
		})
	})

	describe('md5', () => {
		it('应该正确生成 md5 哈希', () => {
			const result = md5('hello')
			expect(typeof result).toBe('string')
			expect(result).toHaveLength(32)
			expect(result).toBe('5d41402abc4b2a76b9719d911017c592')
		})

		it('对相同输入应该返回相同结果', () => {
			const result1 = md5('test')
			const result2 = md5('test')
			expect(result1).toBe(result2)
		})
	})

	describe('getToken', () => {
		it('应该返回包含 request_time 和 request_token 的对象', () => {
			const token = getToken()
			expect(token).toHaveProperty('request_time')
			expect(token).toHaveProperty('request_token')
			expect(typeof token.request_time).toBe('number')
			expect(typeof token.request_token).toBe('string')
		})

		it('request_token 应该是 md5 哈希', () => {
			const token = getToken()
			expect(token.request_token).toHaveLength(32)
		})
	})
})

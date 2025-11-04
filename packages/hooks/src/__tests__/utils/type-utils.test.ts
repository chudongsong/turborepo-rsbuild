import {
	isUndefined,
	isNull,
	isBoolean,
	isNumber,
	isObject,
	isFunction,
	isString,
	isArray,
	isEmpty,
	isStringNumber,
	isDate,
	isPromise,
	isSymbol,
} from '../../utils/type-utils/is'

describe('Type Utils Tests', () => {
	describe('isUndefined', () => {
		it('should return true for undefined', () => {
			expect(isUndefined(undefined)).toBe(true)
		})

		it('should return true for null', () => {
			expect(isUndefined(null)).toBe(true)
		})

		it('should return false for other values', () => {
			expect(isUndefined(0)).toBe(false)
			expect(isUndefined('')).toBe(false)
			expect(isUndefined(false)).toBe(false)
		})
	})

	describe('isNull', () => {
		it('should return true for null', () => {
			expect(isNull(null)).toBe(true)
		})

		it('should return true for undefined', () => {
			expect(isNull(undefined)).toBe(true)
		})

		it('should return false for other values', () => {
			expect(isNull(0)).toBe(false)
			expect(isNull('')).toBe(false)
		})
	})

	describe('isBoolean', () => {
		it('should return true for boolean values', () => {
			expect(isBoolean(true)).toBe(true)
			expect(isBoolean(false)).toBe(true)
		})

		it('should return false for non-boolean values', () => {
			expect(isBoolean(1)).toBe(false)
			expect(isBoolean('true')).toBe(false)
			expect(isBoolean([])).toBe(false)
		})
	})

	describe('isNumber', () => {
		it('should return true for numbers', () => {
			expect(isNumber(123)).toBe(true)
			expect(isNumber(0)).toBe(true)
			expect(isNumber(-1)).toBe(true)
		})

		it('should return false for non-numbers', () => {
			expect(isNumber('123')).toBe(false)
			expect(isNumber(true)).toBe(false)
			expect(isNumber([])).toBe(false)
		})
	})

	describe('isObject', () => {
		it('should return true for objects', () => {
			expect(isObject({})).toBe(true)
			expect(isObject({ a: 1 })).toBe(true)
		})

		it('should return false for arrays', () => {
			expect(isObject([])).toBe(false)
			expect(isObject([1, 2, 3])).toBe(false)
		})

		it('should return false for functions', () => {
			expect(isObject(() => {})).toBe(false)
			expect(isObject(function () {})).toBe(false)
		})

		it('should return false for primitives', () => {
			expect(isObject(123)).toBe(false)
			expect(isObject('string')).toBe(false)
			expect(isObject(true)).toBe(false)
			expect(isObject(null)).toBe(false)
			expect(isObject(undefined)).toBe(false)
		})
	})

	describe('isFunction', () => {
		it('should return true for functions', () => {
			expect(isFunction(() => {})).toBe(true)
			expect(isFunction(function () {})).toBe(true)
			expect(isFunction(Array)).toBe(true)
		})

		it('should return false for non-functions', () => {
			expect(isFunction(123)).toBe(false)
			expect(isFunction({})).toBe(false)
			expect(isFunction([])).toBe(false)
		})
	})

	describe('isString', () => {
		it('should return true for strings', () => {
			expect(isString('hello')).toBe(true)
			expect(isString('')).toBe(true)
		})

		it('should return false for non-strings', () => {
			expect(isString(123)).toBe(false)
			expect(isString(true)).toBe(false)
			expect(isString([])).toBe(false)
		})
	})

	describe('isArray', () => {
		it('should return true for arrays', () => {
			expect(isArray([])).toBe(true)
			expect(isArray([1, 2, 3])).toBe(true)
		})

		it('should return false for non-arrays', () => {
			expect(isArray({})).toBe(false)
			expect(isArray('string')).toBe(false)
			expect(isArray(123)).toBe(false)
		})
	})

	describe('isEmpty', () => {
		it('should return true for empty values', () => {
			expect(isEmpty(null)).toBe(true)
			expect(isEmpty(undefined)).toBe(true)
			expect(isEmpty('')).toBe(true)
			expect(isEmpty([])).toBe(true)
			expect(isEmpty({})).toBe(true)
		})

		it('should return false for non-empty values', () => {
			expect(isEmpty('hello')).toBe(false)
			expect(isEmpty([1])).toBe(false)
			expect(isEmpty({ a: 1 })).toBe(false)
			expect(isEmpty(0)).toBe(false)
		})
	})

	describe('isStringNumber', () => {
		it('should return true for numeric strings', () => {
			expect(isStringNumber('123')).toBe(true)
			expect(isStringNumber('0')).toBe(true)
			expect(isStringNumber('999')).toBe(true)
		})

		it('should return false for non-numeric strings', () => {
			expect(isStringNumber('abc')).toBe(false)
			expect(isStringNumber('123abc')).toBe(false)
			expect(isStringNumber('12.3')).toBe(false)
		})
	})

	describe('isDate', () => {
		it('should return true for Date objects', () => {
			expect(isDate(new Date())).toBe(true)
		})

		it('should return false for non-Date objects', () => {
			expect(isDate('2024-01-01')).toBe(false)
			expect(isDate(1234567890)).toBe(false)
			expect(isDate({})).toBe(false)
		})
	})

	describe('isPromise', () => {
		it('should return true for Promise objects', () => {
			expect(isPromise(Promise.resolve())).toBe(true)
			expect(isPromise(new Promise(() => {}))).toBe(true)
		})

		it('should return false for non-Promise objects', () => {
			expect(isPromise({})).toBe(false)
			expect(isPromise(() => {})).toBe(false)
			expect(isPromise('string')).toBe(false)
		})
	})

	describe('isSymbol', () => {
		it('should return true for Symbol values', () => {
			expect(isSymbol(Symbol('test'))).toBe(true)
		})

		it('should return false for non-Symbol values', () => {
			expect(isSymbol('string')).toBe(false)
			expect(isSymbol(123)).toBe(false)
			expect(isSymbol({})).toBe(false)
		})
	})
})

import {
	setObjToUrlParams,
	hasOwnProperty,
	getRepeatChar,
	deepClone,
	contrastTableConfig,
	removeEmptyValues,
	decodeHtml,
	toHalfWidth,
	checkValue,
	camelCase,
	underscoreToCamelCase,
	isMobile,
	swapString,
	checkObjKey,
} from '../../utils/data-utils/index'

describe('Data Utils Tests', () => {
	describe('setObjToUrlParams', () => {
		it('should convert object to URL parameters', () => {
			const url = 'http://example.com'
			const params = { key1: 'value1', key2: 'value2' }
			const result = setObjToUrlParams(url, params)
			expect(result).toMatch(/key1=value1/)
			expect(result).toMatch(/key2=value2/)
			expect(result).toContain('?')
		})

		it('should handle empty object', () => {
			const url = 'http://example.com'
			const result = setObjToUrlParams(url, {})
			expect(result).toBe('http://example.com?')
		})

		it('should encode special characters', () => {
			const url = 'http://example.com'
			const params = { key: 'hello world' }
			const result = setObjToUrlParams(url, params)
			expect(result).toContain('hello%20world')
		})

		it('should append to existing query string', () => {
			const url = 'http://example.com?existing=param'
			const params = { key: 'value' }
			const result = setObjToUrlParams(url, params)
			expect(result).toContain('existing=param')
			// The result should have key=value appended with &
			expect(result).toMatch(/key=value/)
		})
	})

	describe('hasOwnProperty', () => {
		it('should return true for own properties', () => {
			const obj = { a: 1, b: 2 }
			expect(hasOwnProperty(obj, 'a')).toBe(true)
		})

		it('should return false for inherited properties', () => {
			const obj = { a: 1 }
			expect(hasOwnProperty(obj, 'toString')).toBe(false)
		})
	})

	describe('getRepeatChar', () => {
		it('should repeat character correctly', () => {
			expect(getRepeatChar('a', 5)).toBe('aaaaa')
		})

		it('should handle zero count', () => {
			expect(getRepeatChar('a', 0)).toBe('')
		})

		it('should handle special characters', () => {
			expect(getRepeatChar('*', 3)).toBe('***')
		})
	})

	describe('deepClone', () => {
		it('should clone primitive values', () => {
			expect(deepClone(123)).toBe(123)
			expect(deepClone('string')).toBe('string')
			expect(deepClone(true)).toBe(true)
		})

		it('should clone objects', () => {
			const obj = { a: 1, b: { c: 2 } }
			const cloned = deepClone(obj)
			expect(cloned).toEqual(obj)
			expect(cloned).not.toBe(obj)
			expect(cloned.b).not.toBe(obj.b)
		})

		it('should clone arrays', () => {
			const arr = [1, 2, { a: 3 }]
			const cloned = deepClone(arr)
			expect(cloned).toEqual(arr)
			expect(cloned).not.toBe(arr)
			expect(cloned[2]).not.toBe(arr[2])
		})

		it('should handle undefined values', () => {
			expect(deepClone(undefined)).toBeUndefined()
		})

		it('should handle null values', () => {
			expect(deepClone(null)).toBeNull()
		})
	})

	describe('contrastTableConfig', () => {
		it('should apply isCustom from old config', () => {
			const oldConfig = [{ isCustom: true }, { isCustom: false }]
			const newConfig = [{}, {}]
			const result = contrastTableConfig(oldConfig, newConfig)
			expect(result[0].isCustom).toBe(true)
			expect(result[1].isCustom).toBe(false)
		})

		it('should return new config if old config is empty', () => {
			const oldConfig: any[] = []
			const newConfig = [{ a: 1 }]
			const result = contrastTableConfig(oldConfig, newConfig)
			expect(result).toEqual([{ a: 1 }])
		})
	})

	describe('removeEmptyValues', () => {
		it('should remove undefined values', () => {
			const obj = { a: 1, b: undefined as any, c: 2 }
			const result = removeEmptyValues(obj)
			expect(result).toEqual({ a: 1, c: 2 })
		})

		it('should remove empty strings', () => {
			const obj = { a: 1, b: '', c: 2 }
			const result = removeEmptyValues(obj)
			expect(result).toEqual({ a: 1, c: 2 })
		})

		it('should remove null values', () => {
			const obj = { a: 1, b: null, c: 2 }
			const result = removeEmptyValues(obj)
			expect(result).toEqual({ a: 1, c: 2 })
		})

		it('should keep arrays', () => {
			const obj = { a: 1, b: [1, 2], c: 2 }
			const result = removeEmptyValues(obj)
			expect(result).toEqual(obj)
		})
	})

	describe('decodeHtml', () => {
		it('should decode HTML entities', () => {
			expect(decodeHtml('&lt;div&gt;')).toBe('<div>')
			expect(decodeHtml('&amp;')).toBe('&')
			expect(decodeHtml('&quot;test&quot;')).toBe('"test"')
		})
	})

	describe('toHalfWidth', () => {
		it('should convert full-width to half-width', () => {
			expect(toHalfWidth('ＡＢＣ')).toBe('ABC')
			expect(toHalfWidth('１２３')).toBe('123')
		})

		it('should handle regular ASCII', () => {
			expect(toHalfWidth('ABC')).toBe('ABC')
		})
	})

	describe('checkValue', () => {
		it('should return value if not null/undefined', () => {
			expect(checkValue(123, 456)).toBe(123)
			expect(checkValue('hello', 'world')).toBe('hello')
		})

		it('should return default if value is null', () => {
			expect(checkValue(null, 'default')).toBe('default')
		})

		it('should return default if value is undefined', () => {
			expect(checkValue(undefined, 'default')).toBe('default')
		})

		it('should throw error if default is null', () => {
			expect(() => checkValue(null, null)).toThrow()
		})

		it('should throw error if default is undefined', () => {
			expect(() => checkValue(undefined, undefined)).toThrow()
		})
	})

	describe('camelCase', () => {
		it('should convert snake_case to camelCase', () => {
			expect(camelCase('hello_world')).toBe('helloWorld')
			expect(camelCase('test_string_here')).toBe('testStringHere')
		})

		it('should handle single word', () => {
			expect(camelCase('hello')).toBe('hello')
		})

		it('should handle already camelCase', () => {
			expect(camelCase('helloWorld')).toBe('helloWorld')
		})
	})

	describe('underscoreToCamelCase', () => {
		it('should convert object keys to camelCase', () => {
			const obj = { hello_world: 1, test_string: 2 }
			const result = underscoreToCamelCase(obj)
			expect(result).toEqual({ helloWorld: 1, testString: 2 })
		})

		it('should handle nested objects', () => {
			const obj = { outer_inner: { nested_key: 'value' } } as any
			const result = underscoreToCamelCase(obj)
			expect(result).toHaveProperty('outerInner')
			expect((result as any).outerInner).toHaveProperty('nestedKey')
		})
	})

	describe('isMobile', () => {
		it('should detect mobile user agents', () => {
			const mobileUA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15'
			expect(isMobile(mobileUA)).toBe(true)
		})

		it('should reject desktop user agents', () => {
			const desktopUA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
			expect(isMobile(desktopUA)).toBe(false)
		})

		it('should use navigator.userAgent by default', () => {
			// This test assumes we're in a browser environment
			const result = isMobile()
			expect(typeof result).toBe('boolean')
		})
	})

	describe('swapString', () => {
		it('should swap HTML entities', () => {
			expect(swapString('&lt;test&gt;')).toBe('<test>')
			expect(swapString('a&nbsp;b')).toBe('a b')
		})

		it('should handle multiple entities', () => {
			const result = swapString('&lt;div&gt;&amp;&quot;test&quot;&lt;/div&gt;')
			expect(result).toBe('<div>&"test"</div>')
		})
	})

	describe('checkObjKey', () => {
		it('should return true if key exists and value is not null/undefined', () => {
			const obj = { key: 'value' }
			const result = checkObjKey(obj, 'key')
			expect(result).toBe(true)
		})

		it('should return false if key does not exist', () => {
			const obj = { key: 'value' }
			const result = checkObjKey(obj, 'missing')
			expect(result).toBe(false)
		})

		it('should return false if value is null', () => {
			const obj = { key: null }
			const result = checkObjKey(obj, 'key')
			expect(result).toBe(false)
		})

		it('should return false if value is undefined', () => {
			const obj = { key: undefined }
			const result = checkObjKey(obj, 'key')
			expect(result).toBe(false)
		})
	})
})

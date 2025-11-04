import {
	getRandomChart,
	getRandomPrefix,
	getRandomPwd,
	getRandom,
	getComplexRandomString,
	generatePasswordByConfig,
} from '../../utils/random-utils/index'

describe('Random Utils Tests', () => {
	describe('getRandomChart', () => {
		it('should generate random string with default type', () => {
			const result = getRandomChart(10)
			expect(result).toHaveLength(10)
			expect(typeof result).toBe('string')
		})

		it('should generate random string with custom length', () => {
			const result = getRandomChart(20)
			expect(result).toHaveLength(20)
		})

		it('should use different character sets for different types', () => {
			const defaultResult = getRandomChart(100, 'default')
			const passwordResult = getRandomChart(100, 'password')
			const wpResult = getRandomChart(100, 'wp')
			const letterResult = getRandomChart(100, 'letter')

			// Default should have numbers
			expect(/\d/.test(defaultResult)).toBe(true)

			// Password should have mixed case
			expect(/[A-Z]/.test(passwordResult)).toBe(true)
			expect(/[a-z]/.test(passwordResult)).toBe(true)
			expect(/\d/.test(passwordResult)).toBe(true)

			// wp should have special characters
			expect(/[!@#$%^&*?]/.test(wpResult)).toBe(true)

			// Letter should only have letters
			expect(/^\w+$/.test(letterResult)).toBe(true)
			expect(/\d/.test(letterResult)).toBe(false)
		})

		it('should default to "default" type for unknown type', () => {
			const result = getRandomChart(10, 'unknown')
			expect(result).toHaveLength(10)
		})
	})

	describe('getRandomPrefix', () => {
		it('should generate random string with prefix', () => {
			const result = getRandomPrefix('test', 10)
			expect(result).toMatch(/^test-/)
			expect(result).toHaveLength(15) // 'test-' (5) + random (10)
		})

		it('should use default length if not provided', () => {
			const result = getRandomPrefix('test')
			// Should use default length of 10
			expect(result.split('-')[1]).toHaveLength(10)
		})

		it('should use custom connector', () => {
			const result = getRandomPrefix('test', 5, '_')
			expect(result).toContain('_')
			expect(result.split('_')[1]).toHaveLength(5)
		})
	})

	describe('getRandomPwd', () => {
		it('should generate password with default length', () => {
			const result = getRandomPwd()
			expect(result).toHaveLength(16)
			expect(/[A-Z]/.test(result)).toBe(true)
			expect(/[a-z]/.test(result)).toBe(true)
			expect(/\d/.test(result)).toBe(true)
		})

		it('should generate password with custom length', () => {
			const result = getRandomPwd(20)
			expect(result).toHaveLength(20)
		})
	})

	describe('getRandom', () => {
		it('should generate random hex string', () => {
			const result = getRandom(8)
			expect(result).toHaveLength(8)
			expect(typeof result).toBe('string')
		})

		it('should use default length of 8', () => {
			const result = getRandom()
			expect(result).toHaveLength(8)
		})

		it('should generate different values on multiple calls', () => {
			const result1 = getRandom(8)
			const result2 = getRandom(8)
			expect(result1).not.toBe(result2)
		})
	})

	describe('getComplexRandomString', () => {
		it('should generate random string with minimum length', () => {
			const result = getComplexRandomString(8)
			expect(result).toHaveLength(8)
			expect(/[A-Z]/.test(result)).toBe(true)
			expect(/[a-z]/.test(result)).toBe(true)
			expect(/\d/.test(result)).toBe(true)
		})

		it('should throw error if length is less than 3', () => {
			expect(() => getComplexRandomString(2)).toThrow('长度必须大于或等于3')
			expect(() => getComplexRandomString(1)).toThrow('长度必须大于或等于3')
		})

		it('should handle length of 3', () => {
			const result = getComplexRandomString(3)
			expect(result).toHaveLength(3)
			expect(/[A-Z]/.test(result)).toBe(true)
			expect(/[a-z]/.test(result)).toBe(true)
			expect(/\d/.test(result)).toBe(true)
		})

		it('should generate different strings on multiple calls', () => {
			const result1 = getComplexRandomString(10)
			const result2 = getComplexRandomString(10)
			expect(result1).not.toBe(result2)
		})

		it('should generate strings with proper character distribution', () => {
			const result = getComplexRandomString(100)
			expect(/[A-Z]/.test(result)).toBe(true)
			expect(/[a-z]/.test(result)).toBe(true)
			expect(/\d/.test(result)).toBe(true)
		})
	})

	describe('generatePasswordByConfig', () => {
		it('should generate password with default config', () => {
			const config = {
				validatePasswordLength: 16,
				validatePasswordMixedCaseCount: 1,
				validatePasswordNumberCount: 1,
				validatePasswordSpecialCharCount: 1,
			}
			const result = generatePasswordByConfig(config)
			expect(result).toHaveLength(16)
			expect(/[A-Z]/.test(result)).toBe(true)
			expect(/[a-z]/.test(result)).toBe(true)
			expect(/\d/.test(result)).toBe(true)
			expect(/[!@#$%^&*()_+\-=[\]{}|;:,.<>?]/.test(result)).toBe(true)
		})

		it('should generate password with string config values', () => {
			const config = {
				validatePasswordLength: '12',
				validatePasswordMixedCaseCount: '2',
				validatePasswordNumberCount: '2',
				validatePasswordSpecialCharCount: '1',
			}
			const result = generatePasswordByConfig(config)
			expect(result).toHaveLength(12)
		})

		it('should handle missing config values with defaults', () => {
			const config = {} as any
			const result = generatePasswordByConfig(config)
			expect(result).toHaveLength(16) // Default length
		})

		it('should generate password with custom length', () => {
			const config = {
				validatePasswordLength: 20,
				validatePasswordMixedCaseCount: 2,
				validatePasswordNumberCount: 2,
				validatePasswordSpecialCharCount: 2,
			}
			const result = generatePasswordByConfig(config)
			expect(result).toHaveLength(20)
		})

		it('should ensure password contains all required character types', () => {
			const config = {
				validatePasswordLength: 10,
				validatePasswordMixedCaseCount: 1,
				validatePasswordNumberCount: 1,
				validatePasswordSpecialCharCount: 1,
			}
			const result = generatePasswordByConfig(config)
			expect(/[A-Z]/.test(result)).toBe(true)
			expect(/[a-z]/.test(result)).toBe(true)
			expect(/\d/.test(result)).toBe(true)
			expect(/[!@#$%^&*()_+\-=[\]{}|;:,.<>?]/.test(result)).toBe(true)
		})

		it('should generate different passwords on multiple calls', () => {
			const config = {
				validatePasswordLength: 16,
				validatePasswordMixedCaseCount: 1,
				validatePasswordNumberCount: 1,
				validatePasswordSpecialCharCount: 1,
			}
			const result1 = generatePasswordByConfig(config)
			const result2 = generatePasswordByConfig(config)
			expect(result1).not.toBe(result2)
		})

		it('should handle zero counts', () => {
			const config = {
				validatePasswordLength: 10,
				validatePasswordMixedCaseCount: 0,
				validatePasswordNumberCount: 0,
				validatePasswordSpecialCharCount: 0,
			}
			const result = generatePasswordByConfig(config)
			expect(result).toHaveLength(10)
		})
	})
})

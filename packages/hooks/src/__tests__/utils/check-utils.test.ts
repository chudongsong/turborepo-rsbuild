import {
	checkUrl,
	checkPort,
	checkChinese,
	checkDomain,
	checkEmail,
	checkPhone,
	checkIp,
	checkIp6,
	checkDomainPort,
	checkDomainIp,
	checkIps,
	checkPanelUrl,
	compareVersion,
	checkVersion,
	replaceAll,
	checkVariable,
	validatePort,
} from '../../utils/check-utils'

describe('Check Utils Tests', () => {
	describe('checkUrl', () => {
		it('should validate correct URLs', () => {
			expect(checkUrl('https://example.com')).toBe(true)
			expect(checkUrl('http://example.com')).toBe(true)
			expect(checkUrl('https://www.example.com/path')).toBe(true)
		})

		it('should reject invalid URLs', () => {
			expect(checkUrl('not-a-url')).toBe(false)
			expect(checkUrl('')).toBe(false)
		})
	})

	describe('checkPort', () => {
		it('should validate correct ports', () => {
			expect(checkPort('80')).toBe(true)
			expect(checkPort('443')).toBe(true)
			expect(checkPort('8080')).toBe(true)
			expect(checkPort('65535')).toBe(true)
			expect(checkPort(3000)).toBe(true)
		})

		it('should reject invalid ports', () => {
			expect(checkPort('0')).toBe(false)
			expect(checkPort('65536')).toBe(false)
			expect(checkPort('abc')).toBe(false)
		})
	})

	describe('checkChinese', () => {
		it('should detect Chinese characters', () => {
			expect(checkChinese('你好')).toBe(true)
			expect(checkChinese('测试')).toBe(true)
		})

		it('should reject non-Chinese text', () => {
			expect(checkChinese('hello')).toBe(false)
			expect(checkChinese('123')).toBe(false)
		})
	})

	describe('checkDomain', () => {
		it('should validate correct domains', () => {
			expect(checkDomain('example.com')).toBe(true)
			expect(checkDomain('www.example.com')).toBe(true)
			expect(checkDomain('sub.domain.co.uk')).toBe(true)
		})

		it('should reject invalid domains', () => {
			expect(checkDomain('')).toBe(false)
			expect(checkDomain('invalid')).toBe(false)
		})
	})

	describe('checkEmail', () => {
		it('should validate correct emails', () => {
			expect(checkEmail('test@example.com')).toBe(true)
			expect(checkEmail('user.name@domain.co.uk')).toBe(true)
			expect(checkEmail('user+tag@example.com')).toBe(true)
		})

		it('should reject invalid emails', () => {
			expect(checkEmail('invalid-email')).toBe(false)
			expect(checkEmail('@example.com')).toBe(false)
			expect(checkEmail('test@')).toBe(false)
		})
	})

	describe('checkPhone', () => {
		it('should validate Chinese mobile numbers', () => {
			expect(checkPhone('13800138000')).toBe(true)
			expect(checkPhone('15912345678')).toBe(true)
			expect(checkPhone(13800138000)).toBe(true)
		})

		it('should reject invalid phone numbers', () => {
			expect(checkPhone('1234567890')).toBe(false)
			expect(checkPhone('1380013800')).toBe(false)
			expect(checkPhone('abc1234567')).toBe(false)
		})
	})

	describe('checkIp', () => {
		it('should validate IPv4 addresses', () => {
			expect(checkIp('192.168.1.1')).toBe(true)
			expect(checkIp('127.0.0.1')).toBe(true)
			expect(checkIp('255.255.255.255')).toBe(true)
		})

		it('should validate IPv6 addresses', () => {
			expect(checkIp('2001:0db8:85a3:0000:0000:8a2e:0370:7334')).toBe(true)
			expect(checkIp('::1')).toBe(true)
		})

		it('should reject invalid IPs', () => {
			expect(checkIp('999.999.999.999')).toBe(false)
			expect(checkIp('not-an-ip')).toBe(false)
		})
	})

	describe('checkIp6', () => {
		it('should validate IPv6 addresses', () => {
			expect(checkIp6('2001:0db8:85a3:0000:0000:8a2e:0370:7334')).toBe(true)
			expect(checkIp6('::1')).toBe(true)
		})

		it('should reject non-IPv6 addresses', () => {
			expect(checkIp6('192.168.1.1')).toBe(false)
			expect(checkIp6('not-an-ip')).toBe(false)
		})
	})

	describe('checkDomainPort', () => {
		it('should validate domain:port format', () => {
			expect(checkDomainPort('example.com')).toBe(true)
			expect(checkDomainPort('example.com:8080')).toBe(true)
			expect(checkDomainPort('sub.domain.com:443')).toBe(true)
		})

		it('should reject invalid formats', () => {
			expect(checkDomainPort('example.com:99999')).toBe(false)
		})
	})

	describe('checkDomainIp', () => {
		it('should validate domain format IP', () => {
			expect(checkDomainIp('example.com')).toBe(true)
			expect(checkDomainIp('sub.domain.com')).toBe(true)
		})

		it('should reject invalid formats', () => {
			expect(checkDomainIp('192.168.1.1')).toBe(false)
		})
	})

	describe('checkIps', () => {
		it('should validate IP ranges', () => {
			expect(checkIps('192.168.1.0')).toBe(true)
			expect(checkIps('192.168.1.0/24')).toBe(true)
		})

		it('should reject invalid ranges', () => {
			expect(checkIps('not-an-ip')).toBe(false)
		})
	})

	describe('checkPanelUrl', () => {
		it('should validate panel URLs', () => {
			expect(checkPanelUrl('http://example.com')).toBe(true)
			expect(checkPanelUrl('https://example.com:8080/path')).toBe(true)
		})

		it('should reject invalid panel URLs', () => {
			expect(checkPanelUrl('invalid-url')).toBe(false)
		})
	})

	describe('compareVersion', () => {
		it('should return true if version1 >= version2', () => {
			expect(compareVersion('2.0.0', '1.0.0')).toBe(true)
			expect(compareVersion('1.1.0', '1.0.0')).toBe(true)
			expect(compareVersion('1.0.0', '1.0.0')).toBe(true)
		})

		it('should return false if version1 < version2', () => {
			expect(compareVersion('1.0.0', '2.0.0')).toBe(false)
			expect(compareVersion('1.0.0', '1.1.0')).toBe(false)
		})
	})

	describe('checkVersion', () => {
		it('should return 1 if versions match', () => {
			expect(checkVersion('1.0.0', '1.0.0')).toBe(1)
		})

		it('should return -1 if versions differ', () => {
			expect(checkVersion('1.0.0', '2.0.0')).toBe(-1)
		})

		it('should return 2 if at max length', () => {
			expect(checkVersion('1.0.0.0', '2.0.0.0')).toBe(2)
		})
	})

	describe('replaceAll', () => {
		it('should replace all occurrences', () => {
			expect(replaceAll(/a/g, 'b', 'abcabc')).toBe('bcbcbc')
		})

		it('should handle special characters', () => {
			expect(replaceAll(/\s+/g, '-', 'hello   world')).toBe('hello-world')
		})
	})

	describe('checkVariable', () => {
		it('should return variable if type matches', () => {
			const result = checkVariable('hello', 'string', 'default')
			expect(result).toBe('hello')
		})

		it('should return default value if type does not match', () => {
			const result = checkVariable(123, 'string', 'default')
			expect(result).toBe('default')
		})

		it('should check for empty arrays', () => {
			const result = checkVariable([], 'array', [], undefined, true)
			expect(result).toEqual([])
		})

		it('should check for empty objects', () => {
			const result = checkVariable({}, 'object', {}, undefined, true)
			expect(result).toEqual({})
		})

		it('should call error handler on validation failure', () => {
			const errorHandler = vi.fn()
			checkVariable(123, 'string', 'default', errorHandler, false)
			expect(errorHandler).toHaveBeenCalledWith(123)
		})
	})

	describe('validatePort', () => {
		it('should validate single port', async () => {
			await new Promise<void>((resolve) => {
				validatePort({}, '8080', (error) => {
					expect(error).toBeUndefined()
					resolve()
				})
			})
		})

		it('should validate multiple ports', async () => {
			await new Promise<void>((resolve) => {
				validatePort({}, '80,443,8080', (error) => {
					expect(error).toBeUndefined()
					resolve()
				})
			})
		})

		it('should validate port ranges', async () => {
			await new Promise<void>((resolve) => {
				validatePort({}, '8000-8010', (error) => {
					expect(error).toBeUndefined()
					resolve()
				})
			})
		})

		it('should reject invalid ports', async () => {
			await new Promise<void>((resolve) => {
				validatePort({}, '99999', (error) => {
					expect(error).toBeDefined()
					resolve()
				})
			})
		})

		it('should reject invalid port ranges', async () => {
			await new Promise<void>((resolve) => {
				validatePort({}, '90000-100000', (error) => {
					expect(error).toBeDefined()
					resolve()
				})
			})
		})

		it('should reject invalid port format', async () => {
			await new Promise<void>((resolve) => {
				validatePort({}, 'abc', (error) => {
					expect(error).toBeDefined()
					resolve()
				})
			})
		})
	})
})

/**
 * Generate a random string from a character set
 * @param len - Length of the random string (default: 10)
 * @param type - Character set type ('default', 'password', 'wp', 'letter')
 * @returns Random string
 */
export const getRandomChart = (len: number = 10, type: string = 'default'): string => {
	const chartObj: Record<string, string> = {
		default: 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz123456789',
		password: 'AaBbCcDdEeFfGHhiJjKkLMmNnPpRSrTsWtXwYxZyz2345678',
		wp: 'AaBbCcDdEeFfGHhiJjKkLMmNnPpRSrTsWtXwYxZyz12345678!@#$%^&*?',
		letter: 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz',
	}

	const str = chartObj[type] || chartObj.default
	let result = ''

	for (let i = 0; i < len; i++) {
		result += str.charAt(Math.floor(Math.random() * str.length))
	}

	return result
}

/**
 * Generate a random string with a prefix
 * @param prefix - Prefix string
 * @param len - Length of random part (optional)
 * @param conn - Connection character (default: '-')
 * @returns Prefixed random string
 */
export const getRandomPrefix = (prefix: string, len?: number, conn: string = '-'): string => {
	const str = getRandomChart(len)
	return `${prefix}${conn}${str}`
}

/**
 * Generate a random password
 * @param len - Length of password (default: 16)
 * @returns Random password
 */
export const getRandomPwd = (len: number = 16): string => {
	return getRandomChart(len, 'password')
}

/**
 * Generate a random hex string
 * @param length - Length of hex string (default: 8)
 * @returns Random hex string
 */
export const getRandom = (length = 8): string => {
	return Math.random()
		.toString(16)
		.slice(2, 2 + length)
}

/**
 * Generate a complex random string containing uppercase, lowercase, and numbers
 * @param len - Minimum length is 3 (default: 8)
 * @returns Random string with mixed case and numbers
 * @throws Error if length is less than 3
 */
export const getComplexRandomString = (len: number = 8): string => {
	if (len < 3) {
		throw new Error('长度必须大于或等于3')
	}

	const uppercase = 'ABCDEFGHJKMNPQRSTWXYZ'
	const lowercase = 'abcdefhijkmnprstwxyz'
	const numbers = '123456789'

	// Ensure at least one uppercase, one lowercase, and one number
	let result = ''
	result += uppercase.charAt(Math.floor(Math.random() * uppercase.length))
	result += lowercase.charAt(Math.floor(Math.random() * lowercase.length))
	result += numbers.charAt(Math.floor(Math.random() * numbers.length))

	// Generate remaining characters
	const allChars = uppercase + lowercase + numbers
	for (let i = 3; i < len; i++) {
		result += allChars.charAt(Math.floor(Math.random() * allChars.length))
	}

	// Shuffle the string
	return result
		.split('')
		.sort(() => Math.random() - 0.5)
		.join('')
}

/**
 * Generate password based on configuration
 * @param config - Password configuration
 * @param config.validatePasswordLength - Minimum length
 * @param config.validatePasswordMixedCaseCount - Number of uppercase/lowercase letters
 * @param config.validatePasswordNumberCount - Number of digits
 * @param config.validatePasswordSpecialCharCount - Number of special characters
 * @returns Generated password
 */
export const generatePasswordByConfig = (config: {
	validatePasswordLength: string | number
	validatePasswordMixedCaseCount: string | number
	validatePasswordNumberCount: string | number
	validatePasswordSpecialCharCount: string | number
}): string => {
	const length = Number(config.validatePasswordLength) || 16
	const mixedCaseCount = Number(config.validatePasswordMixedCaseCount) || 1
	const numberCount = Number(config.validatePasswordNumberCount) || 1
	const specialCharCount = Number(config.validatePasswordSpecialCharCount) || 1

	const upperChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
	const lowerChars = 'abcdefghijklmnopqrstuvwxyz'
	const numbers = '0123456789'
	const specialChars = '!@#$%^&*()_+-=[]{}|;:,.<>?'

	let password = ''

	// Add required uppercase letters
	for (let i = 0; i < mixedCaseCount; i++) {
		password += upperChars[Math.floor(Math.random() * upperChars.length)]
	}

	// Add required lowercase letters
	for (let i = 0; i < mixedCaseCount; i++) {
		password += lowerChars[Math.floor(Math.random() * lowerChars.length)]
	}

	// Add required numbers
	for (let i = 0; i < numberCount; i++) {
		password += numbers[Math.floor(Math.random() * numbers.length)]
	}

	// Add required special characters
	for (let i = 0; i < specialCharCount; i++) {
		const randomIndex = Math.floor(Math.random() * specialChars.length)
		password += specialChars[randomIndex]
	}

	// Fill remaining length
	const remainingLength = length - password.length
	const allChars = upperChars + lowerChars + numbers + specialChars
	for (let i = 0; i < remainingLength; i++) {
		password += allChars[Math.floor(Math.random() * allChars.length)]
	}

	// Shuffle password characters
	return password
		.split('')
		.sort(() => Math.random() - 0.5)
		.join('')
}

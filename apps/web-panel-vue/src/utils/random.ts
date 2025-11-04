/**
 * @description 生成随机数
 * @param { number } len 长度
 * @param { string } type 类型 default 默认, password: 密码
 * @returns { string } 随机数
 */
export const getRandomChart = (len: number = 10, type: string = 'default'): string => {
	let result = ''
	const chartObj: { [key: string]: string } = {
		default: 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz123456789',
		password: 'AaBbCcDdEeFfGHhiJjKkLMmNnPpRSrTsWtXwYxZyz2345678',
		wp: 'AaBbCcDdEeFfGHhiJjKkLMmNnPpRSrTsWtXwYxZyz12345678!@#$%^&*?',
		letter: 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz',
	}
	const str = chartObj[type]
	// console.log('str', str);
	for (let i = 0; i < len; i++) {
		result += str.charAt(Math.floor(Math.random() * str.length))
	}
	return result
}

/**
 * @description 生成带前缀的随机数
 * @param { string } prefix 前缀或者长度
 * @param { number } len 长度
 * @param { string } conn 连接符
 * @returns { string } 随机数
 */
export const getRandomPrefix = (prefix: string, len?: number, conn: string = '-'): string => {
	const str = getRandomChart(len)
	return `${prefix}${conn}${str}`
}

/**
 * @description 生成随机数
 * @param { number } len 长度
 * @returns { string } 随机数
 */
export const getRandomPwd = (len: number = 16): string => {
	return getRandomChart(len, 'password')
}

/**
 * @description 生成随机数
 * @param { number } len 长度
 * @returns { string } 随机数
 */
export const getRandom = (length = 8) => {
	return Math.random()
		.toString(16)
		.slice(2, 2 + length)
}

/**
 * @description 生成必须包含大写字母、小写字母和数字的随机字符串
 * @param { number } len 长度，最小长度为3
 * @returns { string } 随机字符串
 */
export const getComplexRandomString = (len: number = 8): string => {
	if (len < 3) {
		throw new Error('长度必须大于或等于3')
	}

	const uppercase = 'ABCDEFGHJKMNPQRSTWXYZ'
	const lowercase = 'abcdefhijkmnprstwxyz'
	const numbers = '123456789'

	// 确保至少包含一个大写字母、一个小写字母和一个数字
	let result = ''
	result += uppercase.charAt(Math.floor(Math.random() * uppercase.length))
	result += lowercase.charAt(Math.floor(Math.random() * lowercase.length))
	result += numbers.charAt(Math.floor(Math.random() * numbers.length))

	// 生成剩余的随机字符
	const allChars = uppercase + lowercase + numbers
	for (let i = 3; i < len; i++) {
		result += allChars.charAt(Math.floor(Math.random() * allChars.length))
	}

	// 打乱字符串顺序
	return result
		.split('')
		.sort(() => Math.random() - 0.5)
		.join('')
}

/**
 * @description 根据配置生成密码
 * @param { object } config 配置
 * @returns { string } 密码
 */
export const generatePasswordByConfig = (config: { validatePasswordLength: string | number; validatePasswordMixedCaseCount: string | number; validatePasswordNumberCount: string | number; validatePasswordSpecialCharCount: string | number }) => {
	// 确保转换为数字，并提供默认值
	const length = Number(config.validatePasswordLength) || 16
	const mixedCaseCount = Number(config.validatePasswordMixedCaseCount) || 1
	const numberCount = Number(config.validatePasswordNumberCount) || 1
	const specialCharCount = Number(config.validatePasswordSpecialCharCount) || 1
	const upperChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
	const lowerChars = 'abcdefghijklmnopqrstuvwxyz'
	const numbers = '0123456789'
	const specialChars = '!@#$%^&*()_+-=[]{}|;:,.<>?'

	let password = ''

	// 添加必需的大写字母
	for (let i = 0; i < mixedCaseCount; i++) {
		password += upperChars[Math.floor(Math.random() * upperChars.length)]
	}

	// 添加必需的小写字母
	for (let i = 0; i < mixedCaseCount; i++) {
		password += lowerChars[Math.floor(Math.random() * lowerChars.length)]
	}

	// 添加必需的数字
	for (let i = 0; i < numberCount; i++) {
		password += numbers[Math.floor(Math.random() * numbers.length)]
	}

	// 添加必需的特殊字符
	for (let i = 0; i < specialCharCount; i++) {
		const randomIndex = Math.floor(Math.random() * specialChars.length)
		password += specialChars[randomIndex]
	}

	// 填充剩余长度
	const remainingLength = length - password.length
	const allChars = upperChars + lowerChars + numbers + specialChars
	for (let i = 0; i < remainingLength; i++) {
		password += allChars[Math.floor(Math.random() * allChars.length)]
	}

	// 打乱密码字符顺序
	return password
		.split('')
		.sort(() => Math.random() - 0.5)
		.join('')
}

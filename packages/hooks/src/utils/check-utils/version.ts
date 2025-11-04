import { pipe, split, map, concat, repeat, length, findIndex, complement, equals, cond, always, T, zip, zipWith } from 'ramda'

const parseInt = globalThis.parseInt

/**
 * Convert a version string to an array of numbers
 * @param str - Version string (e.g., "1.2.3")
 * @returns Array of version numbers
 */
const toNumbersArray = pipe(split('.'), map(parseInt))

/**
 * Get the maximum length between two version arrays
 * @param v1 - First version array
 * @param v2 - Second version array
 * @returns Maximum length
 */
const getMaxLength = (v1: number[], v2: number[]): number => Math.max(v1.length, v2.length)

/**
 * Get version information for comparison
 * @param version - First version string
 * @param version2 - Second version string
 * @returns Object containing version arrays and max length
 */
export const getVersionsInfo = (
	version: string,
	version2: string
): {
	versionArr: number[]
	cloudVersionArr: number[]
	maxLength: number
} => {
	let versionArr = toNumbersArray(version)
	let cloudVersionArr = toNumbersArray(version2)
	const maxLength = getMaxLength(versionArr, cloudVersionArr)

	// Fill arrays to ensure equal length
	const fillArray = (arr: number[]) => concat(arr, repeat(0, maxLength - length(arr)))
	versionArr = fillArray(versionArr)
	cloudVersionArr = fillArray(cloudVersionArr)

	return { versionArr, cloudVersionArr, maxLength }
}

/**
 * Check version match
 * Returns -1 unless major version differs
 * @param version - Local version
 * @param cloudVersion - Cloud version
 * @returns 1 if match, 2 if at max length, -1 if no match
 */
export const checkVersion = (version: string, cloudVersion: string): number => {
	const { versionArr, cloudVersionArr, maxLength } = getVersionsInfo(version, cloudVersion)

	// Compare version arrays
	const compareVersions = zipWith((a: number, b: number) => a - b, versionArr, cloudVersionArr)

	// Find first non-zero difference
	const index = findIndex(complement(equals(0)), compareVersions)

	return cond([
		[equals(-1), always(1)],
		[equals(maxLength - 1), always(2)],
		[T, always(-1)],
	])(index)
}

/**
 * Compare two version numbers
 * @param version1 - First version string
 * @param version2 - Second version string
 * @returns true if version1 >= version2, false otherwise
 */
export const compareVersion = (version1: string, version2: string): boolean => {
	const { versionArr, cloudVersionArr } = getVersionsInfo(version1, version2)

	return (zip(versionArr, cloudVersionArr) as [number, number][]).reduce(
		(acc: boolean, [a, b]) => {
			if (a > b) return true
			if (a < b) return false
			return acc
		},
		true
	)
}

/**
 * Replace all occurrences of a pattern
 * @param pattern - Pattern to find
 * @param replacement - Replacement string
 * @param str - Input string
 * @returns String with replacements
 */
export const replaceAll = (pattern: RegExp, replacement: string, str: string): string =>
	str.replace(pattern, replacement)

/**
 * Type validation function with default value support
 * @param variable - Variable to validate
 * @param type - Expected type ('string', 'number', 'object', 'array', 'function')
 * @param defaultValue - Default value if validation fails
 * @param errorHandler - Optional error handler function
 * @param checkEmpty - Whether to check for empty values
 * @returns Validated variable or default value
 */
export const checkVariable = <T>(
	variable: any,
	type: string,
	defaultValue: T,
	errorHandler?: (errData: any) => void,
	checkEmpty?: boolean
): T => {
	const getType = (value: any): string => {
		if (Array.isArray(value)) {
			return 'array'
		}
		return typeof value
	}

	const variableType = getType(variable)
	if (variableType !== type) {
		if (errorHandler) errorHandler(variable)
		return defaultValue
	}

	if (type === 'object' && Object.keys(variable).length === 0 && checkEmpty) {
		if (errorHandler) errorHandler(variable)
		return defaultValue
	}

	if (type === 'array' && variable.length === 0 && checkEmpty) {
		if (errorHandler) errorHandler(variable)
		return defaultValue
	}

	return variable
}

/**
 * Validate port numbers (supports single ports and ranges)
 * @param rule - Validation rule object
 * @param input - Port input string (can be comma-separated or ranges)
 * @param callback - Validation callback function
 * @returns void
 */
export const validatePort = (rule: any, input: string, callback: (error?: string) => void): void => {
	const ports = String(input).split(',')
	const regex = /^\d+$/

	ports.forEach((port: string) => {
		if (regex.test(port)) {
			const num = parseInt(port, 10)
			if (num < 1 || num > 65535) {
				return callback('端口输入范围不正确，请重新输入')
			}
		} else if (port.includes('-')) {
			const range = port.split('-')
			const start = parseInt(range[0], 10)
			const end = parseInt(range[1], 10)
			if (start < 1 || end > 65535 || start > end) {
				return callback('端口输入范围不正确，请重新输入')
			}
		} else if (!port.trim()) {
			callback('端口不可为空，请输入')
		} else {
			return callback('端口格式不正确，请重新输入')
		}
	})

	return callback()
}

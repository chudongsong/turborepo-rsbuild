/* eslint-disable no-underscore-dangle */
import { pipe, is, ifElse, test, trim, toString, identity, split, map, reduce, zipWith, concat, repeat, length, findIndex, complement, equals, cond, always, T, zip, replace, __ } from 'ramda'
import { isEmpty } from './type'

/**
 * @description 判断是否url地址
 * @param { string } url 地址
 * @returns { Boolean }
 */
export const checkUrl = test(/^((https|http|ftp|rtsp|mms)?:\/\/)[^\s]+/)

/**
 * @description 判断是否为端口
 * @param { string | number } port 端口
 * @returns { boolean }
 */
export const checkPort = pipe(ifElse(is(Number), toString, identity), test(/^([0-9]|[1-9]\d|[1-9]\d{2}|[1-9]\d{3}|[1-5]\d{4}|6[0-4]\d{3}|65[0-4]\d{2}|655[0-2]\d|6553[0-5])$/))

/**
 * @description 验证是否中文
 * @param { string } val 中文字符串
 * @returns { boolean }
 */
export const checkChinese = test(/[\u4e00-\u9fa5]/)

/**
 * @description 验证域名
 * @param { stinrg } val 域名值
 * @returns { boolean }
 */
export const checkDomain = pipe(trim, test(/^([\w\u4e00-\u9fa5\-\*]{1,100}\.){1,10}([\w\u4e00-\u9fa5\-]{1,24}|[\w\u4e00-\u9fa5\-]{1,24}\.[\w\u4e00-\u9fa5\-]{1,24})$/))

/**
 * @description 验证邮箱是否正确
 * @param { string } email 邮箱地址
 * @returns { boolean }
 */
export const checkEmail = test(/\w[-\w.+]*@([A-Za-z0-9][-A-Za-z0-9]+\.)+[A-Za-z]{2,14}/)

/**
 * @description 验证手机号
 * @param { string | number } phone 手机号
 * @returns { boolean }
 */
export const checkPhone = pipe(ifElse(is(Number), toString, identity), test(/^1[3456789]\d{9}$/))

/**
 * @description 验证IP地址
 * @param { string } ip IP地址
 * @returns { boolean }
 */
export const checkIp = test(
	/^((25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(25[0-5]|2[0-4]\d|[01]?\d\d?)$|^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$/
)

// 检查域名形式的ip
export const checkDomainIp = test(/^(?=^.{3,255}$)[a-zA-Z0-9][-a-zA-Z0-9]{0,62}(\.[a-zA-Z0-9][-a-zA-Z0-9]{0,62})+$/)

/**
 * @description 验证域名：端口
 * @param { stinrg } val 域名值
 * @returns { boolean }
 */
export const checkDomainPort = test(/^([\w\u4e00-\u9fa5\-\*]{1,100}\.){1,10}([\w\u4e00-\u9fa5\-]{1,24}|[\w\u4e00-\u9fa5\-]{1,24}\.[\w\u4e00-\u9fa5\-]{1,24})(:([1-9]|[1-9]\d|[1-9]\d{2}|[1-9]\d{3}|[1-5]\d{4}|6[0-4]\d{3}|65[0-4]\d{2}|655[0-2]\d|6553[0-5]))?$/)

/**
 * @description 验证IP6地址
 * @param { string } ip IP地址
 * @returns { boolean }
 */
export const checkIp6 = test(/^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/)

/**
 * @description 验证ips
 * @param { string } ips ip段
 * @returns { boolean }
 */
export const checkIps = test(/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}(\/\d{1,2})?$/)

/**
 * @description 验证面板地址
 * @param { string } 面板地址
 * @returns { boolean }
 */
export const checkPanelUrl = test(
	/^(https?):\/\/(?:(?:[\w-]+\.)+[a-zA-Z]{2,}|(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)|(?:\[(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|(?:[0-9a-fA-F]{1,4}:){1,7}:|(?:[0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|(?:[0-9a-fA-F]{1,4}:){1,5}(?::[0-9a-fA-F]{1,4}){1,2}|(?:[0-9a-fA-F]{1,4}:){1,4}(?::[0-9a-fA-F]{1,4}){1,3}|(?:[0-9a-fA-F]{1,4}:){1,3}(?::[0-9a-fA-F]{1,4}){1,4}|(?:[0-9a-fA-F]{1,4}:){1,2}(?::[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:(?::[0-9a-fA-F]{1,4}){1,6}|:(?::[0-9a-fA-F]{1,4}){1,7}|:(?::[0-9a-fA-F]{1,4}){1,6}:|(?:[0-9a-fA-F]{1,4}:){1,6}:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?))\])(?::\d{1,5})?(?:\/.*)?$/
)

/**
 * @description 将字符串转换为数字数组
 * @param { string } str 字符串
 * @returns { number[] }
 */
const toNumbersArray = pipe(split('.'), map(parseInt))

/**
 * @description 比较版本号
 * @param {number[]} arr 数组
 * @param {number[]}  arr1 数组
 * @returns {number}
 */
const getMaxLength = (v1: number[], v2: number[]) => Math.max(v1.length, v2.length)

/**
 * @description 获取版本信息
 * @param version 版本号
 * @param version2 版本号
 */
export const getVersionsInfo = (version: string, version2: string) => {
	let versionArr = toNumbersArray(version)
	let cloudVersionArr = toNumbersArray(version2)
	const maxLength = getMaxLength(versionArr, cloudVersionArr)
	const fillArray = (arr: number[]) => concat(arr, repeat(0, maxLength - length(arr)))
	versionArr = fillArray(versionArr) // 填充数组，确保两个版本号数组长度相等
	cloudVersionArr = fillArray(cloudVersionArr) // 填充数组，确保两个版本号数组长度相等
	return { versionArr, cloudVersionArr, maxLength }
}

/**
 * @description 匹配版本，除非主版本号不同，否则不会返回-1
 * @param { any } version
 * @returns { boolean }
 */
export const checkVersion = (version: string, cloudVersion: string): number => {
	const { versionArr, cloudVersionArr, maxLength } = getVersionsInfo(version, cloudVersion)
	const compareVersions = zipWith((a: number, b: number) => a - b, versionArr, cloudVersionArr) // 比较版本号
	const index = findIndex(complement(equals(0)), compareVersions) // 找到第一个不相等的版本号
	return cond([
		[equals(-1), always(1)],
		[equals(maxLength - 1), always(2)],
		[T, always(-1)],
	])(index)
}

/**
 * @description 比较版本号大小
 * @param {string} version1 版本号1
 * @param {string} version2 版本号2
 * @returns {Number} -1: version1 < version2 0: version1 = version2 1: version1 > version2
 */
export const compareVersion = (version1: string, version2: string) => {
	const { versionArr, cloudVersionArr } = getVersionsInfo(version1, version2)
	return reduce(
		(acc, [a, b]) => {
			if (a > b) return true
			if (a < b) return false
			return true
		},
		0,
		zip(versionArr, cloudVersionArr)
	)
}

/**
 * @description 判断变量是否为空
 * @param { any } str 变量
 * @returns { boolean }
 */
export const replaceAll = replace(new RegExp(`/(${String(__)}+)/g`))

/**
 * @description 类型验证函数 初版
 * @param { any } variable 需要验证的变量
 * @param { string } type 需要验证的类型  string number object array function
 * @param { any } defaultValue 验证错误返回的默认值
 * @param { function } errorHandler 错误处理函数
 * @param { boolean } checkEmpty 是否检查空,配合object array类型使用
 * @returns { any } 返回验证后的变量
 */
export const checkVariable = (variable: AnyObject, type: string, defaultValue: AnyObject, errorHandler?: null | ((errData: AnyObject) => void), checkEmpty?: boolean): AnyObject => {
	const getType = (value: AnyObject) => {
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
 * @description 验证端口
 * @param { any } rule 规则
 * @param { string } input 输入
 * @param { function } callback 回调
 * @returns
 */
export const validatePort = (rule: AnyObject, input: string, callback: AnyFunction) => {
	const ports = String(input).split(',') // 将输入按逗号分割成多个端口
	const regex = /^\d+$/ // 正则表达式，匹配纯数字
	// eslint-disable-next-line consistent-return
	ports.forEach((port: string) => {
		if (regex.test(port)) {
			// 如果是纯数字，则判断范围是否在1-65535之间
			const num = parseInt(port, 10)
			if (num < 1 || num > 65535) {
				return callback('端口输入范围不正确，请重新输入')
			}
		} else if (port.includes('-')) {
			// 如果是端口范围，判断范围是否在1-65535之间
			const range = port.split('-')
			const start = parseInt(range[0], 10)
			const end = parseInt(range[1], 10)
			if (start < 1 || end > 65535 || start > end) {
				return callback('端口输入范围不正确，请重新输入')
			}
		} else if (isEmpty(port)) {
			callback('端口不可为空，请输入')
		} else {
			// 其他情况都不通过
			return callback('端口格式不正确，请重新输入')
		}
	})
	return callback()
}

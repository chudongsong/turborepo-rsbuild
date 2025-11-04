import { replace, curry, length } from 'ramda'
import JSEncrypt from 'jsencrypt'
import { isArray, isNull, isNumber, isString } from './type'

// 系统类型
export const os = 'Linux'
// 产品ID
export const pid = { pro: 100000011, ltd: 100000032, dev: 100000068, coupon: 100000000 }
// 语言类型
export const language = 'zh'
// 开发模式
export const isDev: boolean = import.meta.env.DEV
// 是否是正式版本
export const isRelease: boolean = import.meta.env.MODE === 'release' // 是否是正式版本

/**
 * @description 清理空格
 * @param { string } str 字符串
 * @returns { string }
 */
export const clearBlankSpace = replace(/\s+/g, '')

/**
 * @description 字节转换，到指定单位结束
 * @param { number } bytes 字节数
 * @param { boolean } isUnit 是否显示单位
 * @param { number } fixed 小数点位置
 * @param { string } endUnit 结束单位
 * @returns { string }
 */
export const getByteUnit = curry((bytes: number = 0, isUnit: boolean = true, fixed: number = 2, endUnit: string = ''): string => {
	let newBytes = bytes
	const c = 1024
	const units = [' B', ' KB', ' MB', ' GB', ' TB', ' PB', ' EB']
	for (let i = 0; i < units.length; i++) {
		const unit = units[i]
		const showValue = fixed === 0 ? Math.round(newBytes) : newBytes.toFixed(fixed)
		const result = i === 0 ? newBytes : showValue
		if (endUnit) {
			if (unit.trim() === endUnit.trim()) {
				return isUnit ? result + unit : `${result}`
			}
		} else if (newBytes < c) {
			return isUnit ? result + unit : `${result}`
		}
		newBytes /= c
	}
	return ''
})

/**
 * @description 返回样式值加单位
 * @param { string | number } val 跳转地址
 * @param { string } unit 单位
 * @returns { string }
 */
export const getStyleUnit = curry((val: string | number, unit: string = 'rem'): string => (isNull(val) ? String(val) : `${val}${unit}`))

/**
 * @description 获取分页数量
 * @param  { string } page 分页数
 * @returns { number }
 */
export const getPageTotal = (page: string): number => {
	const newPage = page.match(/class='Pcount'>共([0-9]*)条</)
	if (isArray(newPage) && length(newPage) >= 2) return Number(newPage[1])
	return 0
}

/**
 * @description 定时刷新
 * @param { string | number } href 跳转地址
 * @param { number } time 时间
 * @returns { Promise<any> }
 */
export const refreshBrowser = (href: string | number = 2000, time: number = 2000): Promise<number> => {
	let newTime = time
	if (isNumber(href)) newTime = href
	return new Promise(resolve => {
		const clearId = window.setTimeout(() => {
			if (isString(href)) {
				window.location.href = href
			} else if (isNumber(href)) {
				window.location.reload()
			}
			resolve(clearId)
		}, newTime)
	})
}

/**
 * @description rsa加密
 * @param { string } str 需要加密的字符串
 * @returns { string } 加密后的字符串
 */
export const rsaEncrypt = (str: string) => {
	const publicKey = window.vite_public_encryption // 公钥
	if (length(publicKey) < 10) return str
	const encrypt = new JSEncrypt()
	encrypt.setPublicKey(publicKey)
	return encrypt.encrypt(str) as string
}

/**
 * @description rsa解密
 * @param {string} str 需要解密的字符串
 * @returns { string } 解密后的字符串
 */
export const rasDecrypt = (str: string) => {
	const privateKey = window.vite_public_encryption
	if (length(privateKey) < 10) return str
	const decrypt = new JSEncrypt()
	decrypt.setPublicKey(privateKey)
	return decrypt.decrypt(str) as string
}

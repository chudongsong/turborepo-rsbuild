import type { RuleConfigProps } from '@/types/utils'
import { isObject, isString } from './type'
import { checkPhone, checkIp, checkIp6, checkPort, checkUrl, checkDomain, checkDomainPort, checkPanelUrl } from './check'

/**
 * @description 默认验证规则
 * @param { string } message 提示信息
 * @param { string[] } trigger 触发方式
 * @returns { Object } 验证规则
 */
export const defaultVerify = ({ message, trigger }: RuleConfigProps = {}) => {
	return {
		required: true,
		message: message || '参数不能为空',
		trigger: trigger || ['blur', 'change'],
	}
}

/**
 * @description 用户名验证规则
 * @param { RuleConfigProps } data 提示信息
 * @returns { Object } 验证规则
 */
export const userVerify = ({ message, complex, prefix, trigger }: any = {}) => {
	if (!isObject(message)) message = {}
	if (!isString(prefix)) prefix = ''
	return {
		validator: (rule: any, value: any, callback: any) => {
			value = value.trim() // 去除空格，防止空格占位
			if (value === '') {
				callback(new Error(message.value || '账号不能为空'))
			} else if (complex.length && value.length < complex.length) {
				callback(new Error(message.length || `账号长度必须大于等于${complex.length}位`))
			} else {
				callback()
			}
		},
		trigger: trigger || ['blur', 'change'],
	}
}

/**
 * @description 密码验证规则
 * @param { string[] } message 提示信息
 * @param { Object } complex 复杂度，包含length长度，small小写字母、big大写字母、number数字、special特殊字符
 * @param { string } prefix 描述前缀
 * @param { string[] } trigger 触发方式
 * @returns { Object } 验证规则
 */
export const pawVerify = ({ message, complex, prefix, trigger }: any = {}) => {
	if (!isObject(message)) message = {}
	if (!isString(prefix)) prefix = ''
	return {
		validator: (rule: any, value: any, callback: any) => {
			value = value.trim() // 去除空格，防止空格占位
			if (value === '') {
				callback(new Error(message.value || '密码不能为空'))
			} else if (complex.length && value.length < complex.length) {
				callback(new Error(message.length || `密码长度必须大于等于${complex.length}位`))
			} else if (!complex) {
				if (complex.small && !/[a-z]/.test(value)) {
					callback(new Error(message.small || `${prefix}密码至少包含一个小写字母`))
				} else if (complex.big && !/[A-Z]/.test(value)) {
					callback(new Error(message.big || `${prefix}密码至少包含一个大写字母`))
				} else if (complex.number && !/[0-9]/.test(value)) {
					callback(new Error(message.number || `${prefix}密码至少包含一个数字`))
				} else if (complex.special && !/[~!@#$%^&*()_+<>?:"{},.\/;'[\]]/.test(value)) {
					callback(new Error(message.special || `${prefix}密码至少包含一个特殊字符`))
				}
			} else {
				callback()
			}
		},
		trigger: trigger || ['blur', 'change'],
	}
}

/**
 * @description IP验证规则
 * @param { string[] } message 提示信息
 * @param { string[] } trigger 触发方式
 * @returns { Object } 验证规则
 */
export const ipVerify = ({ message, trigger }: any = {}) => {
	if (!isObject(message)) message = {}
	return {
		validator: (rule: any, value: any, callback: any) => {
			value = value.trim() // 去除空格，防止空格占位
			if (value === '') {
				callback(new Error(message.value || 'IP地址不能为空'))
			} else if (!checkIp(value)) {
				callback(new Error(message.ip || 'IP地址格式错误'))
			} else {
				callback()
			}
		},
		trigger: trigger || ['blur', 'change'],
	}
}

/**
 * @description IP6验证规则
 * @param { string[] } message 提示信息
 * @param { string[] } data.trigger 触发方式
 * @returns { Object } 验证规则
 */
export const ip6Verify = ({ message, trigger }: any = {}): object => {
	if (!isObject(message)) message = {}
	return {
		validator: (rule: any, value: any, callback: any) => {
			value = value.trim() // 去除空格，防止空格占位
			if (value === '') {
				callback(new Error(message.value || 'IP6地址不能为空'))
			}
			if (!checkIp6(value)) {
				callback(new Error(message.ip || 'IP地址格式错误'))
			} else {
				callback()
			}
		},
		trigger: trigger || ['blur', 'change'],
	}
}

/**
 * @description 目录验证规则
 * @param { string[] } message 提示信息
 * @param { string[] } trigger 触发方式
 * @returns { Object } 验证规则
 */
export const pathVerify = ({ message, trigger }: any = {}) => {
	if (!isObject(message)) message = {}
	return {
		validator: (rule: any, value: any, callback: any) => {
			const paths = ['/', '/www', '/bin', '/boot', '/dev', '/etc', '/lib', '/media', '/mnt', '/opt', '/proc', '/root', '/run', '/sbin', '/srv', '/sys', '/tmp', '/usr', '/var']
			const uniquePaths = Array.from(new Set(paths)) // Remove duplicates
			value = value.trim() // Remove whitespace
			if (value === '') {
				callback(new Error(message.value || '目录不能为空'))
			} else if (uniquePaths.includes(value)) {
				callback(new Error('目录为系统保留目录, 请重新选择'))
			} else {
				callback()
			}
		},
		trigger: trigger || ['blur', 'change'],
	}
}

/**
 * @description 端口验证规则
 * @param { string[] } message 提示信息
 * @param { string[] } trigger 触发方式
 * @returns { Object } 验证规则
 */
export const portVerify = ({ message, trigger }: any = {}) => {
	if (!isObject(message)) message = {}
	return {
		validator: (rule: any, value: any, callback: any) => {
			if (!checkPort(value)) {
				callback(new Error(message.port || '请填写正确的端口(1-65535之间的数字)'))
			} else {
				callback()
			}
		},
		trigger: trigger || ['blur', 'change'],
		required: true,
	}
}

/**
 * @description URL验证规则
 * @param { string[] } message 提示信息
 * @param { string[] } trigger 触发方式
 * @returns { Object } 验证规则
 */
export const urlVerify = ({ message, trigger }: any = {}) => {
	if (!isObject(message)) message = {}
	return {
		validator: (rule: any, value: any, callback: any) => {
			value = value.trim() // 去除空格，防止空格占位
			if (value === '') {
				callback(new Error(message.value || 'URL信息不能为空'))
			} else if (!checkUrl(value)) {
				callback(new Error(message.url || 'URL格式错误'))
			} else {
				callback()
			}
		},
		trigger: trigger || ['blur', 'change'],
	}
}

/**
 * @description 域名验证规则
 * @param { string[] } message 提示信息
 * @param { string[] } trigger 触发方式
 * @returns { Object } 验证规则
 */
export const domainVerify = ({ message, trigger }: any = {}) => {
	if (!isObject(message)) message = {}
	return {
		validator: (rule: any, value: any, callback: any) => {
			value = value.trim() // 去除空格，防止空格占位
			if (value === '') {
				callback(new Error(message.value || '域名信息不能为空'))
			} else if (!checkDomain(value)) {
				callback(new Error(message.domain || '域名格式错误'))
			} else {
				callback()
			}
		},
		trigger: trigger || ['blur', 'change'],
	}
}

/**
 * @description 域名端口验证规则
 * @param { string[] } message 提示信息
 * @param { string[] } trigger 触发方式
 * @returns { Object } 验证规则
 */
export const domainPortVerify = ({ message, trigger }: any = {}) => {
	if (!isObject(message)) message = {}
	return {
		validator: (rule: any, value: any, callback: any) => {
			// 使用换行符分割字符串为域名数组
			const domainArr = value.split('\n').filter((item: any) => item.length)
			const invalidIndex = domainArr.findIndex((domain: any) => domain.split(':')[0].length < 3)
			domainArr.forEach((domain: any, index: number) => {
				const isPort = domain.includes(':')
				if ((isPort && !checkDomainPort(domain)) || (!isPort && !checkDomain(domain))) {
					callback(new Error(`当前域名格式错误，第${index + 1}行，内容:${domain}`))
				}
			})
			// 域名必须大于3个字符串
			if (invalidIndex !== -1) {
				callback(new Error(`第 ${invalidIndex + 1} 个域名长度不符合要求（必须大于3个字符）`))
			} else {
				callback()
			}
		},
		trigger: trigger || ['blur', 'change'],
	}
}

/**
 * @description 手机号验证规则
 * @param { string[] } message 提示信息
 * @param { string[] } trigger 触发方式
 * @returns { Object } 验证规则
 */
export const phoneVerify = ({ message, trigger }: any = {}) => {
	if (!isObject(message)) message = {}
	return {
		validator: (rule: any, value: any, callback: any) => {
			value = value.trim() // 去除空格，防止空格占位
			if (value === '') {
				callback(new Error(message.value || '手机号不能为空'))
			} else if (value.length !== 11) {
				callback(new Error(message.length || '手机号长度错误'))
			} else if (!checkPhone(value)) {
				callback(new Error(message.phone || '手机号格式错误'))
			} else {
				callback()
			}
		},
		trigger: trigger || ['blur', 'change'],
	}
}

/**
 * @description 手机号验证规则
 * @param { string[] } message 提示信息
 * @param { string[] } trigger 触发方式
 * @returns
 */
export const emailVerify = ({ message, trigger }: any = {}) => {
	if (!isObject(message)) message = {}
	return {
		validator: (rule: any, value: any, callback: any) => {
			value = value.trim() // 去除空格，防止空格占位
			if (value === '') {
				callback(new Error(message.value || '邮箱不能为空'))
			} else if (!checkPhone(value)) {
				callback(new Error(message.phone || '邮箱格式错误'))
			} else {
				callback()
			}
		},
		trigger: trigger || ['blur', 'change'],
	}
}

/**
 * @description 面板地址验证规则
 * @param { string[] } message 提示信息
 * @param { string[] } trigger 触发方式
 * @returns { Object } 验证规则
 */

export const panelUrlVerify = ({ message, trigger }: any = {}) => {
	if (!isObject(message)) message = {}
	return {
		required: true,
		validator: (rule: any, value: any, callback: any) => {
			if (value === '') {
				callback(new Error(message.value || '面板地址不能为空'))
			} else if (!checkPanelUrl(value)) {
				callback(new Error(message.node || '请输入正确的面板地址'))
			} else {
				callback()
			}
		},
		trigger: trigger || ['blur', 'change'],
	}
}

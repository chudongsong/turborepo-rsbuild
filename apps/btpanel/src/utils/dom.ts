/* eslint-disable @typescript-eslint/naming-convention */

import { useClipboard } from '@vueuse/core'
import axios from 'axios'
import { useMessage } from '@message/index'
import { isEmpty, isString } from './type'

/**
 * @description 获取body
 * @returns {HTMLElement} body元素
 */
export const getBody = (): HTMLElement => {
	return document.body || document.documentElement
}

/**
 * @description 在body中设置居中
 * @param {HTMLElement} dom dom元素
 * @returns void
 */
export const setCenterInBody = (dom: HTMLElement): void => {
	if (isEmpty(dom)) return
	const { clientHeight, clientWidth } = getBody()
	const top = (clientHeight - dom.clientHeight) / 2
	const left = (clientWidth - dom.clientWidth) / 2
	dom.style.top = `${top}px`
	dom.style.left = `${left}px`
}

/**
 * @description 自动聚焦指令
 * @param {HTMLElement} el dom元素
 * @param {string} name 指定元素名称，可为空
 * @param {string} element 指定元素類型
 * @returns {void}
 */
export const inputFocus = (el: HTMLElement, name: string = '', element: string = 'input'): void => {
	try {
		nextTick(() => {
			let input = el
			if (input.tagName !== 'INPUT') {
				input = el.querySelector(`${element}${name !== '' ? `[name='${name}']` : ''}`) as HTMLInputElement
			}
			if (input.getAttribute('disabled')) return
			input?.focus()
		})
	} catch (error) {
		console.log(error)
	}
}

/**
 * @description 获取弹窗vue实例
 * @param element
 * @returns
 */
// eslint-disable-next-line consistent-return
export const getPopupInstance = (vueElement: any): any => {
	if (vueElement.$parent) return vueElement.$root
}

/**
 * @description Form规则错误自动聚焦指令
 * @param {HTMLElement} el dom元素
 * @param {AnyObject[]} rule 指定元素名称，可为空
 * @returns void
 */
// eslint-disable-next-line consistent-return
export const ruleInputFocus = (el: HTMLElement, rule: AnyObject[]): boolean | void => {
	try {
		// eslint-disable-next-line no-restricted-syntax
		for (const key in rule) {
			if (Object.prototype.hasOwnProperty.call(rule, key)) {
				const element = rule[key]
				inputFocus(el, element[0].field)
				return false
			}
		}
	} catch (error) {
		console.log(error)
	}
}

/**
 * @description 设置全屏显示
 */
export const setFullScreen = (): void => {
	const requestMethod = document.documentElement.requestFullscreen
	if (requestMethod) {
		requestMethod.call(document.documentElement)
	} else if (typeof window.ActiveXObject !== 'undefined') {
		// eslint-disable-next-line no-undef
		const wscript = new ActiveXObject('WScript.Shell')
		if (wscript !== null) {
			wscript.SendKeys('{F11}')
		}
	}
}

/**
 * @description 退出全屏
 */
export const exitFullscreen = (): void => {
	// 判断各种浏览器，找到正确的方法
	const exitMethod = document.exitFullscreen
	if (exitMethod) {
		exitMethod.call(document)
	} else if (typeof window.ActiveXObject !== 'undefined') {
		// eslint-disable-next-line no-undef
		const wscript = new ActiveXObject('WScript.Shell')
		if (wscript !== null) {
			wscript.SendKeys('{F11}')
		}
	}
}

/**
 * @description 清除指定样式
 * @param { HTMLElement } dom dom元素
 * @param {string|string[]} style 样式名称 例如：'width' 或 ['width', 'height']
 * @returns void
 */
export const clearAssignStyle = (dom: HTMLElement, style: string | string[]): void => {
	if (isString(style)) style = [style] as string[]
	;[...style].forEach((item: any) => {
		dom.style[item] = ''
	})
}

/**
 * @description 获取class名称
 * @param {string} className class名称
 * @returns {HTMLElement[]}
 */
export const getElementsByClassName = (className: string): HTMLElement[] => {
	return Array.from(document.querySelectorAll(`.${className}`))
}

/**
 * @description 复制文本
 * @param {Element} data.el dom元素
 * @param {string} data.text 复制的文本
 * @param {string | AnyFunction} data.success 成功回调 或 成功提示
 * @param {string | AnyFunction} data.error 失败回调 或 失败提示
 */
export const copyText = async ({ value, success = '复制成功', error = '复制失败，请手动复制文本' }: { value: string; success?: string; error?: string }) => {
	const Message = useMessage()
	const { copy, isSupported } = useClipboard({ legacy: true })
	if (isSupported.value) {
		copy(value)
		Message.success(success)
	} else {
		Message.error(error)
	}
}

/**
 * @description 滚动到底部
 * @param {string} className  class名称
 * @returns void
 */
export const scrollBottom = (className: string): void => {
	const dom = document.querySelector(className) as HTMLElement
	if (!dom) return
	const { scrollHeight, clientHeight } = dom
	dom.scrollTop = scrollHeight + clientHeight
}

/**
 * @description 获取第一层子节点元素中对应className的元素
 * @param {string} parentId - 父元素的id
 * @param {string} className - 子元素的className
 * @returns {HTMLElement|null} - 返回找到的元素，如果没有找到则返回null
 */
export const getChildElementByClassName = (el: HTMLElement | string, className: string): HTMLElement | null => {
	// 获取父元素
	let element: HTMLElement | string = el as HTMLElement
	if (isString(el)) element = document.querySelector(el as string) as HTMLElement
	if (!element) {
		console.error(`Parent element with id '${el}' not found.`)
		return null
	}
	// 获取第一层子节点
	const childElements = element.children as HTMLCollection
	// 遍历子节点，找到对应className的元素
	for (let i = 0; i < childElements.length; i++) {
		const childElement = childElements[i] as HTMLElement
		if (childElement.classList.contains(className)) {
			return childElement
		}
	}
	return null
}
/**
 * @description 动态加载文件，支持js和css
 * @param { string[] } filenames 文件名数组
 * @returns { string } 文件html
 */
export const loadFiles = (filenames: string[], el: Element): string => {
	let fileHtml = ''
	const dir = '/'
	for (let i = 0; i < filenames.length; i++) {
		const filename = filenames[i] as string
		const extList = filename.split('.')
		if (extList.length < 2) break
		const extension = extList.pop()?.toLowerCase()
		if (extension === 'js') {
			fileHtml += `<script type="text/javascript" src="${dir}${filename}"></script>`
		} else if (extension === 'css') {
			fileHtml += `<link rel="stylesheet" type="text/css" href="${dir}${filename}">`
		} else {
			throw new Error(`Unsupported file type: ${extension}`)
		}
	}
	if (el) el.innerHTML = fileHtml
	return fileHtml
}

/**
 * @description 表格固定列修复
 */
// export const tableFixedColRepair = (table: any, colNum: number): void => {
// 	const { $el } = table
// 	const col = $el.querySelectorAll(`td+.el-table_1_column_${colNum} .el-tooltip`)
// }

/**
 * @description 模拟phpMyAdminForm表单，外网登录方式
 */
export const imitatePhpAdminForm = (name: string, username: string, password: string, url: string) => {
	return new Promise(resolve => {
		const newUrl = `${url}/index.php?lang=zh_cn`
		const form = document.createElement('form')
		const formHtml = `<input type="text" name="pma_username" id="pma_username" value="${username}" />
		<input type="password" name="pma_password" id="pma_password" value="${password}" />
		<input type="text" name="server" value="1" />
		<input type="text" name="target" value="index.php" />
		<input type="text" name="db" id="db" value="${name}" />`
		form.action = newUrl
		form.setAttribute('public-data', newUrl)
		form.method = 'post'
		form.target = '_blank'
		form.style.display = 'none'
		form.innerHTML = formHtml
		document.body.appendChild(form)
		form.submit()
		document.body.removeChild(form)
		resolve(form)
	})
}

/**
 * @description 模拟phpMyAdminPanelForm表单，panel登录
 * @returns
 */
export const imitatePhpAdminPanelForm = async (username: string, password: string) => {
	const newUrl = `/phpmyadmin/index.php?lang=zh_cn`
	const form = document.createElement('form')
	const { data } = await axios.get(newUrl)
	const fromData = {
		session: '',
		token: '',
	}
	// 获取session随机数
	const sessionRep = data.match(/\"set_session\"\s+value=\"(\w+)\"/) as RegExpMatchArray
	const tokenRep = data.match(/\"token\"\s+value=\"(\w+)\"/) as RegExpMatchArray
	if (sessionRep && sessionRep.length > 1) fromData.session = sessionRep[1] || ''
	if (tokenRep && tokenRep.length > 1) fromData.token = tokenRep[1] || ''
	form.action = '/phpmyadmin/index.php'
	form.method = 'post'
	form.target = '_blank'
	form.style.display = 'none'
	form.innerHTML = `
			<input  name="set_session" id="input_session" value="${fromData.session}">
			<input type=x"text" name="pma_username" id="input_username" value="${username}" size="24">
			<input type="password" name="pma_password" id="input_password" value="${password}" size="24">
			<input  name="token" id="input_token" value="${fromData.token}">
			<input  name="target" id="input_target" value="index.php">
			<input  name="server" value="1" id="input_server">`
	document.body.appendChild(form)
	form.submit()
	document.body.removeChild(form)
	Promise.resolve(form)
}

/**
 * @description 获取嵌套实例
 * @param $el 表格实例
 * @returns
 */
export const getPckageVm = ($el: any): any => {
	return $el.$children[0]
}

import type { App } from 'vue'
import { useAxios } from '@/hooks/tools'
import md5 from 'md5'
import { clearCache } from '@/utils'

/**
 * @description 缓存数据，判断唯一性
 */
const cacheData = async (str: string) => {
	return new Promise(resolve => {
		const firstChars = str.split('\n')[0].trim()
		const uniqueVal = md5(firstChars)
		setTimeout(() => localStorage.removeItem('ERROR-CACHE'), 10000) // 10秒后清除缓存
		const cahceData = JSON.parse(localStorage.getItem('ERROR-CACHE') || '[]') as string[] // 获取缓存数据
		if (cahceData.includes(uniqueVal)) {
			resolve({ status: true, uniqueVal })
		} else {
			cahceData.push(uniqueVal)
			localStorage.setItem('ERROR-CACHE', JSON.stringify(cahceData))
			resolve(false)
		}
	})
}

/**
 * @description 错误处理，vue.config.errorHandler
 * @param {any} err
 * @param {ComponentPublicInstance |null} vm
 * @param {string} info
 */
const errorHandler = (err: any, vm: ComponentPublicInstance | null, info: string) => {
	nextTick(async () => {
		const uri = window.location.pathname
		const errContent = (err.stack || err.message || err) as string
		const isCache = await cacheData(String(errContent))
		// eslint-disable-next-line no-underscore-dangle
		const vmInfo = vm?.$.vnode.type?.__file || '未知组件'
		if (isCache) return
		await useAxios.post('config/err_collection', {
			data: { errinfo: `组件：${vmInfo} \n发生错误：${errContent} \n所在生命周期：${info}`, uri },
		})
	})
}
/**
 * @description 错误监听，window.onerror
 * @param {string} message 错误信息
 * @param {string} source 错误文件
 * @param {string} lineno 错误行号
 */
const onerror = async (message: string | Event, source: string | undefined, lineno: number | undefined, column: number | undefined) => {
	const uri = window.location.pathname
	// console.log('错误信息', message, source, lineno, column)
	// if (typeof message === 'string' && message.indexOf("Uncaught (in promise) TypeError: Cannot read properties of undefined (reading '_s')") === -1) {
	// 	clearCache()
	// 	window.location.reload()
	// }
	await useAxios.post('config/err_collection', {
		data: {
			errinfo: `错误文件：${source}\n错误位置: ${lineno}:${column}\n错误原因：${message}`,
			uri,
		},
	})
}

/**
 * @description 挂载错误处理
 * @param {App} app vue实例
 */
const mountErrorHandler = (app: App) => {
	// 判断是否为生产环境,是否开启错误监听
	if (Number(window.vite_public_error)) {
		app.config.errorHandler = errorHandler
		window.onerror = onerror
	}
}

export { mountErrorHandler }

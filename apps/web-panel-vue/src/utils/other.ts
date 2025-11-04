/* eslint-disable consistent-return */
import { useRoute } from 'vue-router'
import { isBoolean, isUndefined } from './type'
import { has } from 'ramda'

/**
 * @description 跳转文件路径
 * @param {string} path 路径
 * @returns void
 */
export const openFilePath = (path: string, store: Ref<string>) => {
	store.value = path // 更新文件路径
	jumpRouter('/files') // 跳转路径
}

/**
 * @description 清理缓存
 * @returns void
 */
export const clearCache = () => {
	const scheme = localStorage.getItem('color-scheme')
	localStorage.clear()
	sessionStorage.clear()
	if (scheme) localStorage.setItem('color-scheme', scheme)
}

/**
 * @description 跳转路由
 * @param {string} path 路径
 * @returns void
 */
export const jumpRouter = async (path: string) => {
	const { router } = await import('@router/index')
	const { useGlobalStore } = await import('@/store/global')
	const { routerActive } = useGlobalStore()
	router.push({ path })
	routerActive.value = path
}

/**
 * @description 是否是当前路由
 * @return {Boolean} 是否是当前路由
 */
export const isCurrentRouter = (path: string, oldPath: string) => {
	if (oldPath) {
		if (oldPath.indexOf(path) > -1) return true
	} else {
		const route = useRoute()
		if (route.path.indexOf(path) > -1) return true
	}
	return false
}

/**
 * @description 文件类型判断，或返回格式类型(不传入type)
 * @param {string} ext 文件后缀
 * @param {string} type 文件类型
 * @return {Boolean|Object} 返回类型或类型是否支持
 */
export const determineFileType = (ext: string, type?: string) => {
	const configData = {
		images: ['jpg', 'jpeg', 'png', 'bmp', 'gif', 'tiff', 'ico', 'JPG', 'webp'],
		compress: ['zip', 'rar', 'gz', 'war', 'tgz', 'tar', '7z'],
		video: ['mp4', 'mp3', 'mpeg', 'mpg', 'mov', 'avi', 'webm', 'mkv', 'mkv', 'mp3', 'rmvb', 'wma', 'wmv'],
		// eslint-disable-next-line @typescript-eslint/naming-convention
		ont_text: ['iso', 'xlsx', 'xls', 'doc', 'docx', 'tiff', 'exe', 'so', 'bz', 'dmg', 'apk', 'pptx', 'ppt', 'xlsb', 'pdf'],
	} as { [key: string]: string[] }
	let returnVal: boolean | string = false
	if (type !== undefined) {
		if (type === 'text') {
			Object.keys(configData).forEach((key: string) => {
				if (key === ext) returnVal = true
			})
			returnVal = !returnVal
		} else {
			if (isUndefined(configData[type])) return false
			configData[type].forEach((item: string) => {
				if (item === ext) {
					returnVal = true
				}
			})
		}
	} else {
		Object.keys(configData).forEach((key: string) => {
			configData[key].forEach((items: string) => {
				if (items === ext) returnVal = key
			})
		})
		if (isBoolean(returnVal)) returnVal = 'text'
	}
	return returnVal
}

/**
 * @description 获取文件图标
 * @param {string} fileName 文件名称
 * @returns {string} 文件图标名称
 */
const getExt = (fileName: string) => {
	const extArr = fileName.split('.')
	const exts = [
		'folder',
		'folder-unempty',
		'sql',
		'c',
		'cpp',
		'cs',
		'flv',
		'css',
		'js',
		'htm',
		'html',
		'java',
		'log',
		'mht',
		'php',
		'url',
		'xml',
		'ai',
		'bmp',
		'cdr',
		'gif',
		'ico',
		'jpeg',
		'jpg',
		'JPG',
		'png',
		'psd',
		'webp',
		'ape',
		'avi',
		'mkv',
		'mov',
		'mp3',
		'mp4',
		'mpeg',
		'mpg',
		'rm',
		'rmvb',
		'swf',
		'wav',
		'webm',
		'wma',
		'wmv',
		'rtf',
		'docx',
		'fdf',
		'potm',
		'pptx',
		'txt',
		'xlsb',
		'xlsx',
		'7z',
		'cab',
		'iso',
		'rar',
		'zip',
		'gz',
		'bt',
		'file',
		'apk',
		'bookfolder',
		'folder-empty',
		'fromchromefolder',
		'documentfolder',
		'fromphonefolder',
		'mix',
		'musicfolder',
		'picturefolder',
		'videofolder',
		'sefolder',
		'access',
		'mdb',
		'accdb',
		'fla',
		'doc',
		'docm',
		'dotx',
		'dotm',
		'dot',
		'pdf',
		'ppt',
		'pptm',
		'pot',
		'xls',
		'csv',
		'xlsm',
		'bt_split',
		'bt_split_json',
	]
	const extLastName = extArr[extArr.length - 1]
	for (let i = 0; i < exts.length; i++) {
		if (exts[i] === extLastName) return exts[i]
	}
	return 'file'
}

/**
 * @description 获取文件图标
 * @param {string} fileName 文件名称
 * @param {string} type 文件类型
 * @returns {string} 文件图标名称
 */
export const getExtIcon = (fileName: string, type: string) => {
	return type === 'dir' ? 'folder' : getExt(fileName)
}

/**
 * @description 获取文件后缀名
 * @param {string} fileName 文件名
 * @returns {string} 文件后缀名
 */
export const getFileExt = (fileName: string) => {
	const ext = fileName.split('.')
	return ext.length === 1 ? '' : ext.pop()
}

/**
 * @description 设置缓存表格列
 * @param column
 * @param customName
 */
export const setColumnCustom = (column: any, customName: string) => {
	try {
		const cacheColumn = JSON.parse(localStorage.getItem(customName) || '[]')
		if (cacheColumn.length) {
			column.forEach((item: any, index: number) => {
				if (has('isCustom', item)) {
					item.isCustom = cacheColumn[index]?.isCustom
				}
			})
		}
		return column
	} catch (error) {
		console.log(error)
	}
}

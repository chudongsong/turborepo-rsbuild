import type { TableColumnProps } from '@/components/data/bt-table/types'
import { isDev } from '@/utils'
import { useDialog } from '@/hooks/tools'
import { pluginInstallDialog } from '@/public'

/**
 * @description 获取访问地址
 * @returns { string }
 */
export const getAccessAddress = () => {
	return isDev ? `${window.location.protocol}//${window.location.hostname}:${window.location.port}` : ''
}

export function useModalData(title = '', data: Record<string, unknown> = {}) {
	const modal = reactive({
		show: false,
		title,
		data,
	})

	return modal
}
export function useTableData<T, K = number | string>(columns: TableColumnProps<T>[]) {
	const keys = ref<K[]>([])

	const table = reactive({
		data: [] as T[],
		total: 0,
		loading: false,
	})

	const columnsRef = ref(columns)

	const setLoading = (val: boolean, isLoad = true) => {
		if (isLoad) table.loading = val
	}

	return {
		keys,
		table,
		columns: columnsRef,
		setLoading,
	}
}
/**
 * @description 转化数字，将非数字转化为0
 * @param val 值
 * @returns
 */
export const getNumber = (val: unknown) => {
	return !Number.isNaN(Number(val)) ? Number(val) : 0
}

/**
 * @description 下载文件
 * @param  { String } filename
 * @param  { String } name
 * @returns { void }
 */
export const downloadFile = (filename: string, name?: string): void => {
	const url = getAccessAddress()
	window.open(`${url}/download?filename=${filename}${name ? `&amp;name=${name}` : ''}`, '_blank', 'noopener,noreferrer')
}

export function useLoading(initValue = false) {
	const loading = ref(initValue)

	const setLoading = (val: boolean, isLoad = true) => {
		if (isLoad) loading.value = val
	}

	return {
		loading,
		setLoading,
	}
}

// 储存加载脚本列表
const addScriptList = new Set<string>()

/**
 * @description 加载js
 * @param  { String } src
 */
export const loadJs = (src: string, dom?: HTMLElement | null, params?: { [key: string]: string }) => {
	return new Promise((resolve, reject) => {
		if (!dom && addScriptList.has(src)) {
			resolve(true)
			return
		}

		const script = document.createElement('script')
		script.type = 'text/javascript'
		script.src = src

		if (params) {
			Object.keys(params).forEach(key => {
				script.setAttribute(key, params[key])
			})
		}

		if (dom) {
			dom.appendChild(script)
		} else {
			document.body.appendChild(script)
		}

		script.onload = e => {
			addScriptList.add(src)
			resolve(e)
		}
		script.onerror = () => {
			reject(new Error(`Failed to load JS: ${src}`))
		}
	})
}

declare const CKEDITOR: any

export const renderCkeditor = async (id: string) => {
	await loadJs('/static/ckeditor/ckeditor.js')
	CKEDITOR.replace(id, {
		customConfig: '/static/ckeditor/config.js?v1.0',
		removeButtons: 'Save',
	})
}

export const getCkeditorData = () => {
	return CKEDITOR.instances.editor.getData() as string
}

export const setCkeditorData = (val: string) => {
	CKEDITOR.instances.editor.setData(val)
}

export const removeCkeditor = () => {
	CKEDITOR.remove(CKEDITOR.instances.editor)
}

export const openUploadDialog = ({ path, size, uploadData, refreshEvent }: any) => {
	useDialog({
		title: `上传文件到 【${path}】`,
		area: 80,
		showFooter: true,
		confirmText: '上传',
		compData: {
			path,
			size,
			uploadData,
			refreshEvent,
		},
		component: () => import('@mail/public/upload.vue'),
	})
}

/**
 * @description 获取软件安装对话框
 * @param {string} name 软件名称
 * @param {'i' | 'u'} type 类型，i：安装，u：更新
 * @returns
 */
export const getSoftwareInstall = (name: string, type: 'i' | 'u' = 'i') => {
	return pluginInstallDialog({
		type,
		name,
	})
}

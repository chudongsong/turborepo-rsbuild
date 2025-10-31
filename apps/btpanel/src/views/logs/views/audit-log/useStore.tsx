import type { LogMenuData } from '@/types/log'

import { getSystemLogData, getSystemLogMenu } from '@api/logs'
import { defineStore } from 'pinia'

import { Message, useDataHandle } from '@/hooks/tools'
import { getByteUnit, isArray, isObject } from '@/utils'

const LOG_AUDIT_STORE = defineStore('LOG-AUDIT-STORE', () => {
	const menuOptions = ref<LogMenuData[]>([]) // 日志菜单
	const isRefreshList = ref(false) // 是否刷新当前列表
	const currentItem = ref<LogMenuData>({
		title: '',
		uptime: 0,
		list: [],
		name: '',
		log_file: '',
		size: 0,
	}) // 当前菜单item

	const isInit = ref(true) // 是否初始化

	/**
	 * @description 获取日志菜单
	 */
	const getMenuList = async () => {
		try {
			// 处理数据
			const list = (data: AnyObject) =>
				data?.map((item: any) => {
					item.name = `${item.name}-${item.title}${typeof item.size === 'string' ? '' : `(${getByteUnit(item.size)})`}`
					return item
				})

			// 请求处理
			const data: LogMenuData[] = await useDataHandle({
				request: getSystemLogMenu(),
				data: [Array, list],
			})

			currentItem.value = data[0] as LogMenuData

			return { data, status: true, msg: '' }
		} catch (error) {
			console.log(error)
			return { data: [], status: false, msg: '获取日志菜单失败' }
		}
	}

	/**
	 * @description 获取日志详细数据
	 * @param {LogMenuData} item 菜单item
	 */
	const getLogData = async (item: LogMenuData, params: any) => {
		try {
			if (!item) return { data: '', total: 0, other: {} }
			currentItem.value = item
			const param = {
				log_name: item.log_file,
				...params,
			}
			// 请求处理
			const { data: res }: any = await useDataHandle({
				loading: '正在获取日志详细数据,请稍候...',
				request: getSystemLogData({ data: JSON.stringify(param) }),
			})
			return { data: res, status: true, msg: '' }
		} catch (error) {
			console.log(error)
			return { data: {}, status: false, msg: '请求失败' }
		}
	}

	return {
		menuOptions,
		currentItem,
		isInit,
		isRefreshList,
		getMenuList,
		getLogData,
	}
})

const useAuditLogStore = () => {
	const store = LOG_AUDIT_STORE()
	return storeToRefs(store)
}

export { LOG_AUDIT_STORE, useAuditLogStore }

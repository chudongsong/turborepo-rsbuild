import { getHostList } from '@/api/xterm'
import { useDataHandle } from '@hooks/tools'

import { defineStore } from 'pinia'

const TERM_HOST_LIST = defineStore('TERM-HOST-LIST', () => {
	// const { createTerminal } = TERM_STORE()c
	const rowData = ref({}) // 行数据
	const isEdit = ref(false) // 是否编辑
	const isTableLoad = ref(false) // 加载中
	const cutAuthType = ref('password') // 验证方式
	const isRefreshList = ref(false) // 是否刷新列表

	/**
	 * @description 获取服务器列表
	 * @returns {Promise<void>}
	 */
	const getHostData = async () => {
		const data: AnyObject[] = await useDataHandle({
			loading: isTableLoad,
			request: getHostList(),
			data: Array,
		})
		return { data, total: data.length, other: {} }
	}

	// 重置
	const $reset = () => {
		isEdit.value = false
		isTableLoad.value = false
		cutAuthType.value = 'password'
	}

	return {
		isEdit,
		rowData,
		$reset,
		isTableLoad,
		cutAuthType,
		getHostData,
		isRefreshList,
	}
})

// 主机列表
const useTermHostStore = () => {
	const store = TERM_HOST_LIST()
	return { ...store, ...storeToRefs(store) }
}

export { useTermHostStore }

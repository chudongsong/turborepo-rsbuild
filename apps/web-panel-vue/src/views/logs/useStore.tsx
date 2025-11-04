import { defineStore } from 'pinia'
import { useRoute } from 'vue-router'

import { jumpRouter } from '@/utils'
import { LOG_PANEL_STORE } from '@/views/logs/views/panel-log/useStore'

const LOG_STORE = defineStore('LOG-STORE', () => {
	const selectedWebSite = ref('')
	const tabActive = ref('panel')
	const panelTabActive = ref('operateLog')
	const webTabActive = ref('WebLogs')

	const configData = ref()

	/**
	 * @description 切换tabs切换组件
	 * @param {string} tab 当前tabs的name
	 */
	const cutTabs = (path: string) => {
		tabActive.value = path
		jumpRouter('/logs/' + path)
	}

	const init = async () => {
		const route = useRoute() // 获取当前路由
		tabActive.value = (route.name as string) || 'panel-log'
	}

	// public 部分
	const clearOptions = shallowRef([
		{ label: '所有日志', value: 'all' },
		{ label: '仅保留近7天日志', value: '7' },
		{ label: '仅保留近30天日志', value: '30' },
		{ label: '仅保留近180天日志', value: '180' },
	])

	const clearDataForm = reactive<{ type: string; day: string }>({
		type: 'access', // 清理类型
		day: 'all', // 清理日志天数
	}) // 清理日志表单

	const searchValue = ref('') // 搜索值
	const logLoading = ref<boolean>(false) // 日志加载状态
	const selectedItem = ref<string>('') // 菜单类型

	/**
	 * @description 搜索
	 */
	const searchSubmit = () => {
		const panelLogStore = LOG_PANEL_STORE()
		panelLogStore.searchMenuData(searchValue.value)
	}

	const countType = ref(['ssh', 'login']) // ssh、登录日志导出条数类型
	const outDataForm = reactive({
		type: 'all', // 类型
		day: 'all', // 导出日志天数
		isOutError: '', // 是否导出异常日志
		count: 100, // 导出条数
	}) // 导出日志表单

	const getType = (type: string) => {
		// 获取导出类型
		return countType.value.includes(type) ? 'all' : 'access'
	}

	const $reset_out = () => {
		outDataForm.type = 'all'
		outDataForm.day = 'all'
		outDataForm.isOutError = ''
		outDataForm.count = 100
	}

	return {
		selectedWebSite,
		tabActive,
		panelTabActive,
		webTabActive,
		cutTabs,
		init,

		// public 部分
		clearOptions,
		clearDataForm,

		searchValue,
		logLoading,
		selectedItem,
		searchSubmit,

		countType,
		outDataForm,
		configData,
		getType,
		$reset_out,
	}
})

const useLogStore = () => {
	const store = LOG_STORE()
	return storeToRefs(store)
}

export { useLogStore, LOG_STORE }

import { useGlobalStore } from '@store/global'
import { defineStore, storeToRefs } from 'pinia'
// import { useRoute } from 'vue-router'
import { router } from '@/router'

// 全局状态
const useDatabaseStore = defineStore('DATABASE-STORE', {
	// 类型问题 需要写interface
	state: (): any => ({
		tabActive: computed(() => {
			return router.currentRoute.value.name
		}), // 当前tab，未激活

		isRefreshTable: false, // 是否刷新表格
		isRefreshClassList: false, // 是否刷新分类列表
		isLoading: false, // 是否显示视图加载中
		isHaveServer: true, // 是否有服务器 默认未true状态  初始化时避免展示遮罩层
		isSearchClick: false, // 是否点击搜索进入功能

		safetyStatus: false, // 安全状态 - Mongodb

		envStatus: {
			setup: false, // 是否设置环境
			status: false, // 环境状态
			version: '', // 版本
		}, // 环境状态

		softData: {
			setup: false,
			status: false,
			version: '',
		},
	}),
	getters: {},
	actions: {
		/**
		 * @description 刷新列表
		 * @param {boolean} loading 是否显示加载中
		 */
		refreshTableList(loading: boolean = true) {
			this.isRefreshTable = true
			this.isLoading = loading
		},
		/**
		 * @description 刷新列表-重置状态
		 */
		resetRefresh() {
			this.isRefreshTable = false
			this.isLoading = false
		},

		/**
		 * @description 获取全局信息
		 */
		async getGlobalConfig() {
			const { getGlobalInfo } = useGlobalStore()
			await getGlobalInfo()
		},
	},
	persist: [
		{
			storage: localStorage,
			paths: ['tabActive'],
		},
	],
})

/**
 * @description 获取软件商店状态管理
 * @returns
 */
const getDatabaseStore = () => {
	const softStore = useDatabaseStore()
	return { refs: storeToRefs(softStore), ...softStore }
}

export { getDatabaseStore }

export default useDatabaseStore

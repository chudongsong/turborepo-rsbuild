import { defineStore, storeToRefs } from 'pinia'
import { isBoolean, isObject } from '@/utils'
import { getPluginInfo as getSoftInfo } from '@/api/global'
import { useRouter, useRoute } from 'vue-router'
import { isInstallMail } from '@/api/mail'

const useMailStore = defineStore('MAIL-STORE', {
	state: () => ({
		install: false,
		update: false,
		checkEnv: false,
		version: '',
		lastVersion: '6.4',
		pluginInfo: {},
		router: useRouter(),
		route: useRoute(),
		tabActive: useRoute().name as string,
	}),
	getters: {},
	actions: {
		/**
		 * @description 分割表格
		 * @returns {Promise<void>} void
		 */
		async getMailInfo() {
			const { data } = await isInstallMail()
			this.install = data.status
		},

		/**
		 * @description 切换tabs切换组件
		 * @param {string} name 当前tabs的name
		 */
		async cutTabsEvent(name: string) {
			this.tabActive = name
			this.router.push({ name })
		},
	},
})

/**
 * @description 获取邮局状态管理
 * @returns
 */
const getMailStore = () => {
	const mailStore = useMailStore()
	return { refs: storeToRefs(mailStore), ...mailStore }
}

export default useMailStore
export { getMailStore }

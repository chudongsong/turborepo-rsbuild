import { defineStore } from 'pinia'
import { reactive, ref } from 'vue'
import BasicSetting from '@/views/wordpress/view/local/site-protection/file/basic-setting.vue'

export const useWPProtectionStore = defineStore('WP-PROTECTION-STORE', () => {
	const isRefreshBasicList = ref(false)

	// 是否开启文件保护
	const file = reactive({
		status: false,
		number: 0,
		pid: -1,
	})

	// 文件保护加载
	const fileLoad = ref(false)

	// 是否开启防火墙
	const firewall = reactive({
		status: false,
		number: 0,
	})

	// 防火墙加载
	const firewallLoad = ref(false)

	// 是否开启防盗链
	const hotlink = ref(false)

	// 防盗链加载
	const hotlinkLoad = ref(false)

	const pid = ref(-1)

	const tabActive = ref('basic')

	const tabComponent = [
		{
			name: 'basic',
			label: '基本设置',
			component: BasicSetting,
		},
	]

	return {
		file,
		fileLoad,
		firewall,
		firewallLoad,
		hotlink,
		hotlinkLoad,
		pid,
		tabActive,
		tabComponent,
		isRefreshBasicList,
	}
})

export default useWPProtectionStore

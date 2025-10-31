import { useGlobalStore } from '@/store/global'
import { getDomaiNuniversalModule } from '@/api/domain'

const DOMAIN_REGISTER_STORE = defineStore('DOMAIN-REGISTER-STORE', () => {
	const { plugin, getGlobalInfo, mainWidth } = useGlobalStore()
	const registerRowData = ref() // 表格行数据
	const isRegListRefresh = ref(false) // 刷新域名注册列表
	
	// 域名搜索相关状态
	const domainSearchValue = ref('')
	const whoisSearchValue = ref('')
	
	// 解析IP相关状态
	const ipSearchValue = ref('')

	// 域名搜索对话框实例
	const domainSearchDialog = ref<any>(null)

	// 公网IP相关状态
	const publicIp = ref('')
	const isLoadingIp = ref(false)
	const showMask = ref(false)
	const isUserBound = ref(false) // 用户是否绑定账号

	const searchWidth = computed(() => {
		if (mainWidth.value > 1530) return 320
		if (mainWidth.value > 1400) return 200
		if (mainWidth.value > 1200) return 180
		return 140
	})
	
	return {
		registerRowData,
		isRegListRefresh,
		searchWidth,
		domainSearchValue,
		whoisSearchValue,
		ipSearchValue,
		publicIp,
		isLoadingIp,
		showMask,
		isUserBound,
		domainSearchDialog,
	}
})

/**
 * @description 域名注册全局数据
 * @returns {Ref<Record<string, any>>}
 */
const useDomainRegisterStore = () => {
	return storeToRefs(DOMAIN_REGISTER_STORE())
}

export { useDomainRegisterStore, DOMAIN_REGISTER_STORE }

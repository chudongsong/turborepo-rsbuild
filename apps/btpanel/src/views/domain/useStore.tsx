import { useGlobalStore } from '@/store/global'

const DOMAIN_STORE = defineStore('DOMAIN-STORE', () => {
	const { plugin, getGlobalInfo } = useGlobalStore()	
	const rowData = ref() // 表格行数据
	const isRefreshDomainList = ref(false) // 刷新域名列表
	return {
		rowData,
		isRefreshDomainList,
	}
})

/**
 * @description 域名全局数据
 * @returns {Ref<Record<string, any>>}
 */
const useDomainStore = () => {
	return storeToRefs(DOMAIN_STORE())
}

export { useDomainStore, DOMAIN_STORE }

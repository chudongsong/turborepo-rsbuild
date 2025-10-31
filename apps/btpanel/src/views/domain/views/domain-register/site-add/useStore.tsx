const SITE_ADD_STORE = defineStore('SITE-ADD-STORE', () => {
	const domainId = ref<number>(0)
	const domainName = ref<string>('')
	const createSiteType = ref<'domain' | 'local'>('domain')
	const getDomainHintClass = (status: any) => {
		switch (status) {
			case 'available':
				return 'text-primary'
			case 'registered':
			case 'error':
				return 'text-danger'
			case 'checking':
				return 'text-warning'
			default:
				return 'text-warning'
		}
	}
	return {
		domainId,
		domainName,
		createSiteType,
		getDomainHintClass,
	}
})

/**
 * @description 站点添加全局数据
 * @returns {Ref<Record<string, any>>}
 */
const useSiteAddStore = () => {
	return { ...SITE_ADD_STORE(), ...storeToRefs(SITE_ADD_STORE()) }
}

export { useSiteAddStore, SITE_ADD_STORE }

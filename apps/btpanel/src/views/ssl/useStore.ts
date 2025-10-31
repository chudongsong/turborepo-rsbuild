import { defineStore } from 'pinia'
import { useRouter } from 'vue-router'

export const useSSLStore = defineStore('SSL-STORE', () => {
	// state
	const tabActive = ref('certificate')
	const domainParams = ref({
		p: 1,
		type: '-1',
		search: '',
		limit: 10,
	})
	const isRefreshDomainList = ref(false)
	const isRefreshDomainConfigList = ref(false)
	const isRefreshDomainOrCertType = ref(false)
	const isDomainLoading = ref(false)
	const domainTableTotal = ref(0)

	const certificateParams = ref({
		p: 1,
		type: '-1',
		search: '',
		limit: 10,
		status_id: '-1',
	})
	const isRefreshCertificateList = ref(false)
	const isCertificateLoading = ref(false)
	const certificateTableTotal = ref(0)
	const expiringCertificateCount = ref(0)
	const expiredCertificateCount = ref(0)

	const typeList = ref([])
	const router = useRouter()

	// getters
	// const searchWidth = computed(() => {
	// 	if (mainWidth.value > 1530) return 320
	// 	if (mainWidth.value > 1400) return 200
	// 	if (mainWidth.value > 1200) return 180
	// 	return 140
	// })

	return {
		// state
		tabActive,
		domainParams,
		isRefreshDomainList,
		isRefreshDomainConfigList,
		isRefreshDomainOrCertType,
		isDomainLoading,
		domainTableTotal,
		certificateParams,
		isRefreshCertificateList,
		isCertificateLoading,
		certificateTableTotal,
		expiringCertificateCount,
		expiredCertificateCount,
		typeList,
		router,
	}
})

export const getSslStore = () => {
	const sslStore = useSSLStore()
	return { refs: storeToRefs(sslStore), ...sslStore }
}

export default useSSLStore

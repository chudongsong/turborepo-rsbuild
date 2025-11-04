const useCertificateStore = defineStore('SSL-CERTIFICATE-STORE', () => {
	const activeTabs = ref('ssl')

	const sslIsRefresh = ref(false)
	const testIsRefresh = ref(false)
	const encryptIsRefresh = ref(false)
	const otherIsRefresh = ref(false)

	const sslSearchType = ref('-1')
	const testSearchType = ref('-1')
	const encryptSearchType = ref('-1')
	const otherSearchType = ref('-1')

	return {
		sslSearchType,
		testSearchType,
		encryptSearchType,
		otherSearchType,
		activeTabs,
		sslIsRefresh,
		testIsRefresh,
		encryptIsRefresh,
		otherIsRefresh,
	}
})

export default useCertificateStore
export { useCertificateStore }

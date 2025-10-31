export const useWPWordpressSecurityStore = defineStore('wp-wordpress-security', () => {
	const isRefreshLimitList = ref(false)
	const isRefreshDenyList = ref(false)
	
    return {
		isRefreshLimitList,
		isRefreshDenyList,
	}
})

export default useWPWordpressSecurityStore;

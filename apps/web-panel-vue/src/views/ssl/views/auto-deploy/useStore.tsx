const useDeployStore = defineStore('SSL-DEPLOY-STORE', () => {
	const isRefreshDeployTaskList = ref<boolean>(false)
	const deployFormData = ref<AnyObject>({})
	const siteList = ref<any[]>([])
	const certificateDeployTaskList = ref<any[]>([])

	return {
		deployFormData,
		siteList,
		certificateDeployTaskList,
		isRefreshDeployTaskList,
	}
})

export default useDeployStore
export { useDeployStore }

const DOCKER_APP_STORE_LOCAL = defineStore('DOCKER-APP-STORE-LOCAL', () => {
	const activeTabs = ref('git')
	const apphubGitConfig = ref<any>({})
	const isSaveGitConfig = ref(false)
	const usingHelpLink = ref('https://www.bt.cn/bbs/thread-147864-1-1.html')
	return {
		activeTabs,
		apphubGitConfig,
		isSaveGitConfig,
		usingHelpLink
	}
})

const useDockerAppStoreLocal = () => {
	return storeToRefs(DOCKER_APP_STORE_LOCAL())
}

export { useDockerAppStoreLocal, DOCKER_APP_STORE_LOCAL }

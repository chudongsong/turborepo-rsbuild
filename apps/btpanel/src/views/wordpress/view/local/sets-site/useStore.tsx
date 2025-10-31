export const useWPSetsStore = defineStore('WP-SETS-STORE', () => {
	const createFormData = reactive({
		name: '',
	})

	const wpSetsPluginOrTheme = reactive({
		id: 0,
		type: 1,
	})

	const pluginOrThemePamra = reactive({
		p: 1,
		p_size: 999,
		keyword: '',
		set_id: 0,
	})

	const isRefreshInstallList = ref(false)

	const isRefreshPluginOrThemeList = ref(false)

	const isRefreshSetsList = ref(false)

	const resetCreateFormData = () => {
		createFormData.name = ''
	}

	return {
		createFormData,
		wpSetsPluginOrTheme,
		pluginOrThemePamra,
		isRefreshInstallList,
		isRefreshPluginOrThemeList,
		isRefreshSetsList,
		resetCreateFormData,
	}
})

export default useWPSetsStore

import { useLoading } from '@/views/wordpress/useMethod'

export const useWPWordpressSettingStore = defineStore('WP-Wordpress-Setting-STORE', () => {
	const tabActive = ref('setup')

	const form = reactive({
		Login_url: '',
		redirection_url: '',
		wps: false,
		admin_email: '',
		home_url: '',
	})

	const { loading, setLoading } = useLoading()

	const isUpdate = ref(false)

	const currentVersion = ref('--')

	const updateVersion = ref('--')

	const versionText = computed(() => {
		return !isUpdate.value ? `WordPress ${currentVersion.value} 已经是最新版本` : `有一个新版本 (${updateVersion.value}) 可用于更新`
	})

	const siteLanguageOption = ref<any>([])

	const isCache = ref(false)

	const username = ref<string | null>(null)

	const language = ref('zh_CN')

	const password = ref('')
	const login_url = ref('--')

	const isRefreshPluginList = ref(false)

	const isRefreshPluginInstall = ref(false)

	const isRefreshThemeList = ref(false)

	const isRefreshThemeInstall = ref(false)

	return {
		tabActive,
		form,
		isUpdate,
		currentVersion,
		updateVersion,
		versionText,
		isCache,
		username,
		language,
		password,
		login_url,
		isRefreshPluginList,
		isRefreshThemeList,
		isRefreshPluginInstall,
		isRefreshThemeInstall,
		loading,
		setLoading,
		siteLanguageOption,
	}
})

export default useWPWordpressSettingStore

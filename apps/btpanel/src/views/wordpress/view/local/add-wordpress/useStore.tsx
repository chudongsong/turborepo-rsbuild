import { generatePasswordByConfig, getComplexRandomString, getRandom, getRandomChart, getRandomPwd, isArray, isObject } from '@/utils'
import { useLoading } from '@/views/wordpress/useMethod'

export const useWPLocalAddStore = defineStore('WP-LOCAL-ADD-STORE', () => {
	const tabActive = ref('single')

	const addWordpressFormData = reactive({
		domain: '',
		weblog_title: '',
		language: 'zh_CN',
		php_version: null as string | null,
		wp_version: null as string | null,
		user_name: getRandom(6),
		admin_password: getComplexRandomString(16),
		pw_weak: false,
		admin_email: '',
		Login_url: 'wp-admin',
		redirection_url: '404',
		prefix: 'wp_' + getRandom(6) + '_',
		enable_cache: false,
		wps: false,
		datapassword: '',
		datauser: '',
	})

	const addBackupFormData = reactive({
		method: 1,
		bak_file: '',
		domain: '',
		sub_path: '',
		php_version: null as string | null,
		enable_cache: false,
	})

	const passwordConfig = reactive({
		validatePasswordLength: '',
		validatePasswordMixedCaseCount: '',
		validatePasswordNumberCount: '',
		validatePasswordSpecialCharCount: '',
		status: 'off',
	})

	const domainPath = computed(() => {
		if (addBackupFormData.domain) return `/${addBackupFormData.domain}/`
		return '/'
	})

	// 站点目录
	const sitePath = ref('/www/wwwroot')

	//当前SQL安装信息
	const mysql = ref<any>({
		setup: true,
		version: '',
		status: false,
	})

	// PHP是否安装
	const php = ref<{ setup: boolean }>({
		setup: true,
	})

	// 网站配置信息
	const web = ref<any>({
		setup: true,
		type: '',
		version: '',
		status: false,
	})

	const addSelectOption = ref<any[]>([
		{ label: 'English', value: 'en' },
		{ label: '简体中文', value: 'zh' },
	])

	const addPHPSelectOption = ref<any[]>([])

	const addWPSelectOption = ref<any[]>([
		{ label: 'WordPress 5.8', value: '5.8' },
		{ label: 'WordPress 5.9', value: '5.9' },
	])

	const createSiteSubmit = ref<any>(null)
	const createImportSubmit = ref<any>(null)

	const { loading: selectLoading, setLoading: setSelectLoading } = useLoading()
	const { loading: phpLoading, setLoading: setPhpLoading } = useLoading()
	const { loading: wpLoading, setLoading: setWpLoading } = useLoading()

	// 获取安装配置
	const getConfig = async () => {
		const { getPublicConfig } = await import('@/api/global')
		const { data } = await getPublicConfig()
		if (isObject(data)) {
			php.value.setup = data.php.length ? true : false
			sitePath.value = data.sites_path || '/www/wwwroot'
			if (isObject(data.web)) {
				web.value = data.web
			}
			if (isObject(data.mysql)) {
				mysql.value = data.mysql
			}
		}
	}

	// 获取数据
	const getInitData = async () => {
		try {
			setSelectLoading(true)
			setPhpLoading(true)
			setWpLoading(true)
			const { getLanguageList, getWpVersionList } = await import('@api/wp')
			const { GetPHPVersion } = await import('@api/site')
			const { getDatabasePasswordConfig } = await import('@api/database')
			const {
				data: { msg },
			} = await getLanguageList()
			if (isObject(msg)) {
				addSelectOption.value = Object.entries(msg).map(([key, value]) => ({
					label: value,
					value: key,
				}))
			}
			const { data: phpData } = await GetPHPVersion()
			if (isArray(phpData)) {
				addPHPSelectOption.value = phpData
					.reverse()
					.filter((item: any) => item.version !== '00')
					.map((item: any) => ({
						label: item.name,
						value: item.version,
					}))
				await nextTick()
				if (phpData.length > 0) {
					const version = phpData[0].version as string | undefined
					addWordpressFormData.php_version = version === '00' ? '' : version || null
				}
			}
			const {
				data: { msg: wpData },
			} = await getWpVersionList({
				php_version_short: addWordpressFormData.php_version || '',
			})
			if (isArray(wpData)) {
				addWPSelectOption.value = wpData.map((item: any) => ({
					label: item.version,
					value: item.version,
				}))
				await nextTick()
				if (wpData.length > 0) {
					addWordpressFormData.wp_version = wpData[0].version || ''
				}
			}
			const { data: passwordConfigData } = await getDatabasePasswordConfig()
			if (passwordConfigData?.status === 'off') {
				addWordpressFormData.datapassword = getRandomPwd(16)
				passwordConfig.status = passwordConfigData.status || ''
			} else {
				passwordConfig.validatePasswordLength = passwordConfigData.validate_password_length || ''
				passwordConfig.validatePasswordMixedCaseCount = passwordConfigData.validate_password_mixed_case_count || ''
				passwordConfig.validatePasswordNumberCount = passwordConfigData.validate_password_number_count || ''
				passwordConfig.validatePasswordSpecialCharCount = passwordConfigData.validate_password_special_char_count || ''
				passwordConfig.status = passwordConfigData.status || ''
				addWordpressFormData.datapassword = generatePasswordByConfig(passwordConfig)
			}
		} finally {
			setSelectLoading(false)
			setPhpLoading(false)
			setWpLoading(false)
		}
	}

	const resetCreateForm = () => {
		addWordpressFormData.domain = ''
		addWordpressFormData.weblog_title = ''
		addWordpressFormData.language = 'zh_CN'
		addWordpressFormData.php_version = null
		addWordpressFormData.wp_version = null
		addWordpressFormData.user_name = getRandom(6)
		addWordpressFormData.admin_password = getRandomChart(16, 'wp')
		addWordpressFormData.pw_weak = false
		addWordpressFormData.admin_email = ''
		addWordpressFormData.Login_url = 'wp-admin'
		addWordpressFormData.redirection_url = '404'
		addWordpressFormData.prefix = 'wp_' + getRandom(6) + '_'
		addWordpressFormData.enable_cache = false
		addWordpressFormData.wps = false
		addWordpressFormData.datauser = ''
		addWordpressFormData.datapassword = ''
		passwordConfig.validatePasswordLength = ''
		passwordConfig.validatePasswordMixedCaseCount = ''
		passwordConfig.validatePasswordNumberCount = ''
		passwordConfig.validatePasswordSpecialCharCount = ''
		passwordConfig.status = 'off'
	}

	const resetImportForm = () => {
		addBackupFormData.method = 1
		addBackupFormData.bak_file = ''
		addBackupFormData.domain = ''
		addBackupFormData.sub_path = ''
		addBackupFormData.php_version = null
		addBackupFormData.enable_cache = false
	}

	return {
		tabActive,
		addWordpressFormData,
		mysql,
		php,
		web,
		getConfig,
		addSelectOption,
		selectLoading,
		getInitData,
		addPHPSelectOption,
		addWPSelectOption,
		domainPath,
		sitePath,
		addBackupFormData,
		phpLoading,
		wpLoading,
		setWpLoading,
		createSiteSubmit,
		createImportSubmit,
		resetCreateForm,
		resetImportForm,
		passwordConfig,
	}
})

export default useWPLocalAddStore

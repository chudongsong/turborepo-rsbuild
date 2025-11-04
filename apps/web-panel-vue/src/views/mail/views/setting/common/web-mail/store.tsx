import { defineStore } from 'pinia'
import { useModalData } from '@mail/useMethod'
import { useLoading } from '@mail/useMethod'

export const MAIL_SETTING_WEB = defineStore('MAIL_SETTING_WEB', () => {
	const info = reactive({
		id: 0,
		site_name: '',
		status: false,
		ssl_status: false,
	})

	const url = computed(() => {
		return `${info.ssl_status ? 'https' : 'http'}://${info.site_name}`
	})

	const installModal = useModalData('安装 WebMail', {
		onRefresh: async () => {
			const { getInfo } = await import('@mail/views/setting/common/web-mail/useMethod')
			getInfo()
		},
	})

	const configModal = useModalData('添加已部署的网络邮件', {
		onRefresh: async () => {
			const { getInfo } = await import('@mail/views/setting/common/web-mail/useMethod')
			getInfo()
		},
	})

	const installFormRef = ref<any>(null)

	const installForm = reactive({
		domain: '',
		php_version: null as null | string,
	})

	const installRules = {
		domain: {
			trigger: 'change',
			validator: () => {
				if (installForm.domain.trim() === '') {
					return new Error('请输入域名')
				}
				return true
			},
		},
		php_version: {
			trigger: 'change',
			validator: () => {
				if (installForm.php_version === null) {
					return new Error('请选择PHP版本')
				}
				return true
			},
		},
	}

	const phpOptions = ref<any[]>([])

	const { loading: installLoading, setLoading: installSetLoading } = useLoading()

	const reset = () => {
		info.id = 0
		info.site_name = ''
		info.status = false
		info.ssl_status = false
	}

	const resetInstallForm = () => {
		installForm.domain = ''
		installForm.php_version = null
	}

	const configFormRef = ref<any>(null)

	const configForm = reactive({
		id: 0,
		domain: null as null | string,
		path: '',
	})

	const configRules = {
		domain: {
			trigger: 'change',
			validator: () => {
				if (configForm.domain === null) {
					return new Error('请选择站点')
				}
				return true
			},
		},
	}

	const domainOptions = ref<any[]>([])

	const { loading: configLoading, setLoading: configSetLoading } = useLoading()

	const resetConfigForm = () => {
		configForm.id = 0
		configForm.domain = null
		configForm.path = ''
	}

	return {
		info,
		url,
		installModal,
		configModal,
		reset,
		resetInstallForm,
		installForm,
		installRules,
		phpOptions,
		installFormRef,
		installLoading,
		installSetLoading,
		configForm,
		configRules,
		configFormRef,
		configLoading,
		configSetLoading,
		domainOptions,
		resetConfigForm,
	}
})

export default MAIL_SETTING_WEB

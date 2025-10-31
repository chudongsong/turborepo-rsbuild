import { TabsOptionsProps } from '@/components/navigation/bt-tabs/types'
import WpSetup from './setup.vue'
import WpPlugin from './plugin.vue'
import WpTheme from './theme.vue'
import { FormItemProps } from '@/hooks/tools/form/types'
import { FormItemCustom } from '@/hooks/tools/form/form-item'
import useWPWordpressSettingStore from '@/views/wordpress/view/local/site-config/wordpress/useStore'
import BtFormItem from '@/components/form/bt-form-item'
import { ElAlert, ElButton, ElCheckbox, ElInput, ElOption, ElSelect, ElSwitch } from 'element-plus'
import { clearWpSiteCache, getInstalledPlugins, getInstalledThemes, getInstallPluginList, getInstallThemesList, getLanguageList, getWpSetInfo, setWpConfInfo, setWpSiteCache, updateWpSiteVersion } from '@/api/wp'
import useWPLocalStore from '@/views/wordpress/view/local/useStore'
import { getRandomChart, isArray, isObject } from '@/utils'
import { useLoading } from '@/views/wordpress/useMethod'
import { Message, useDataHandle } from '@/hooks/tools'
import { RequestProps } from '@/hooks/tools/message/types'

const { localRow, isRefreshLocalList } = storeToRefs(useWPLocalStore())

const { login_url, isUpdate, versionText, isCache, username, password, language, form, currentVersion, updateVersion, siteLanguageOption } = storeToRefs(useWPWordpressSettingStore())
const { setLoading } = useWPWordpressSettingStore()

interface LanguageOption {
	label: string
	value: string
}

// tab配置
export const tabComponent = [
	{
		label: '基础设置',
		name: 'setup',
		lazy: true,
		render: () => WpSetup,
	},
	{
		label: '插件',
		name: 'plugin',
		lazy: true,
		render: () => WpPlugin,
	},
	{
		label: '主题',
		name: 'theme',
		lazy: true,
		render: () => WpTheme,
	},
] as TabsOptionsProps[]

export const getSetupFormOption = (submit: any): ComputedRef<FormItemProps[]> => {
	return computed(() => {
		const wps_hide_login = [
			{
				type: 'custom',
				render: () => (
					<BtFormItem labelWidth={110} label={'更改管理员登录URL'}>
						<div class={'flex items-center'}>
							<div class={'mr-[8px]'}>{form.value.home_url}/</div>
							<ElInput v-model={form.value.Login_url} class={'w-[200px]'} placeholder={'请输入管理员登录URL'} />
						</div>
						<div class={'text-tertiary text-small'}>通过更改登录URL并防止访问WP-login.php页面和WP-Admin目录来保护您的网站。</div>
					</BtFormItem>
				),
			},
			{
				type: 'custom',
				render: () => (
					<BtFormItem labelWidth={110} label={'重定向URL'}>
						<div class={'flex items-center'}>
							<div class={'mr-[8px]'}>{form.value.home_url}/</div>
							<ElInput v-model={form.value.redirection_url} class={'w-[200px]'} placeholder={'请输入重定向URL'} />
						</div>
						<div class={'text-tertiary text-small'}>重定向URL当某人尝试访问WP-login.php页面和WP-Admin目录时，而未登录时。</div>
					</BtFormItem>
				),
			},
		]

		return [
			FormItemCustom('登录URL', () => {
				return (
					<span class={'bt-link'} onClick={() => window.open(login_url.value, '_blank', 'noopener,noreferrer')}>
						{login_url.value}
					</span>
				)
			}),
			{
				type: 'custom',
				render: () => (
					<BtFormItem label={'状态'}>
						<ElAlert style={'width: 400px;padding: 0 10px;'} closable={false} type={isUpdate.value ? 'warning' : 'info'}>
							{versionText.value}
						</ElAlert>
						<ElButton
							type={'primary'}
							class={'ml-[15px]'}
							onClick={() => {
								if (!isUpdate.value) {
									Message.error('当前版本无需升级')
									return
								}
								useDataHandle({
									loading: '升级中...',
									request: updateWpSiteVersion({ s_id: localRow.value.id, version: updateVersion.value }),
									message: true,
									success: (rdata: any) => {
										isRefreshLocalList.value = true
									},
								})
							}}>
							升级
						</ElButton>
					</BtFormItem>
				),
			},
			{
				type: 'custom',
				render: () => (
					<BtFormItem label={'缓存'}>
						<ElSwitch
							v-model={isCache.value}
							onChange={(e: boolean | string | number) => {
								useDataHandle({
									loading: `${e ? '开启' : '关闭'}缓存中，请稍候...`,
									message: true,
									request: setWpSiteCache({ version: localRow.value.php_version, sitename: localRow.value.name, act: e ? 'enable' : 'disable' }),
									success: (rdata: RequestProps) => {
										if (rdata.status) {
											localRow.value.cache_status = e
										}
									},
								})
							}}
						/>
						<ElButton
							type={'default'}
							class={'ml-[15px]'}
							onClick={() => {
								useDataHandle({
									loading: '清除缓存中...',
									request: clearWpSiteCache({ s_id: localRow.value.id }),
									message: true,
								})
							}}>
							清除
						</ElButton>
					</BtFormItem>
				),
			},
			{
				type: 'custom',
				render: () => (
					<BtFormItem label={'用户名'}>
						<ElInput v-model={username.value} class={'!w-[400px]'} disabled={true} />
					</BtFormItem>
				),
			},
			{
				type: 'custom',
				render: () => (
					<BtFormItem label={'重置密码'}>
						<div class={'flex items-center'}>
							<ElInput v-model={password.value} class={'!w-[400px]'} />
							<ElButton
								type={'primary'}
								class={'ml-[15px]'}
								onClick={() => {
									password.value = getRandomChart(16, 'wp')
								}}>
								生成
							</ElButton>
						</div>
					</BtFormItem>
				),
			},
			{
				type: 'input',
				label: '邮箱',
				key: 'admin_email',
				attrs: {
					style: 'width: 400px;',
					placeholder: '请输入邮箱',
				},
				rules: [
					{ required: true, message: '请输入邮箱', trigger: 'blur' },
					{
						type: 'email',
						message: '请输入正确的邮箱格式',
						trigger: ['blur', 'change'],
					},
					{
						validator: (rule: any, value: any, callback: any) => {
							const emailRegex = /^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/
							if (!emailRegex.test(value)) {
								callback(new Error('邮箱格式不正确'))
							} else {
								callback()
							}
						},
						trigger: ['blur', 'change'],
					},
				],
			},
			{
				type: 'custom',
				render: () => (
					<BtFormItem label={'网站语言'}>
						<ElSelect v-model={language.value} placeholder={'请选择语言'} class={'!w-[400px]'} loading={siteLanguageLoading.value}>
							{siteLanguageOption.value.map((item: any) => (
								<ElOption key={item.value} label={item.label} value={item.value} />
							))}
						</ElSelect>
					</BtFormItem>
				),
			},
			{
				type: 'custom',
				render: () => (
					<BtFormItem label={'WPS-HIDE-LOGIN'}>
						<ElCheckbox v-model={form.value.wps} label={'启用WPS-HIDE-LOGIN'} />
					</BtFormItem>
				),
			},
			...(form.value.wps ? wps_hide_login : []),
			{
				type: 'custom',
				render: () => (
					<BtFormItem label={' '}>
						<ElButton
							type={'primary'}
							onClick={async () => {
								await submit()
								useDataHandle({
									loading: '保存中...',
									request: setWpConfInfo(getParams()),
									message: true,
									success: async (rdata: any) => {
										if (rdata.status) {
											await getSetupConfig()
											await getSiteLanguageOption()
										}
									},
								})
							}}>
							保存
						</ElButton>
					</BtFormItem>
				),
			},
		] as FormItemProps[]
	})
}

const getParams = () => {
	const params: any = {
		s_id: localRow.value.id,
		language: language.value,
		admin_email: form.value.admin_email,
		whl_enabled: form.value.wps ? 1 : 0,
		whl_page: form.value.Login_url,
		whl_redirect_admin: form.value.redirection_url,
	}

	if (password.value) {
		params.admin_password = password.value
	}

	return params
}

export const isSetupConfigMask = reactive({
	value: false,
	message: '',
})
export const getSetupConfig = async () => {
	try {
		setLoading(true)
		isSetupConfigMask.value = false
		const {
			data: { msg },
			status,
		} = await getWpSetInfo({ s_id: localRow.value.id })
		if (isObject(msg)) {
			isCache.value = msg.cache_enabled
			currentVersion.value = msg.local_version
			updateVersion.value = msg.latest_version
			isUpdate.value = msg.can_upgrade
			login_url.value = msg.login_url
			username.value = msg.admin_user
			language.value = msg.language
			form.value.admin_email = msg.admin_email
			form.value.Login_url = msg.whl_page
			form.value.home_url = msg.home_url
			form.value.redirection_url = msg.whl_redirect_admin
			form.value.wps = msg.whl_enabled
			siteLanguageOption.value = Object.entries(msg).map(([key, value]) => ({
				label: value as string,
				value: key,
			})) as LanguageOption[]
		}
		if (!status) {
			isSetupConfigMask.value = true
			isSetupConfigMask.message = msg
		}
	} catch (error) {
		console.log(error)
	} finally {
		setLoading(false)
	}
}

const { loading: siteLanguageLoading, setLoading: setSiteLanguageLoading } = useLoading()
export const getSiteLanguageOption = async () => {
	setSiteLanguageLoading(true)
	try {
		const {
			data: { msg },
		} = await getLanguageList()
		if (isObject(msg)) {
			siteLanguageOption.value = Object.entries(msg).map(([key, value]) => ({
				label: value,
				value: key,
			}))
		}
	} catch (error) {
		console.log(error)
	} finally {
		setSiteLanguageLoading(false)
	}
}

/** 插件 */
export const getPluginList = async (params: any) => {
	try {
		return refreshPluginList()
	} catch (error) {
		console.log(error)
		return { data: [], total: 0, other: { search_history: [] } }
	}
}

export const refreshPluginList = async () => {
	isSetupConfigMask.value = false
	const { data, status, msg } = await getInstalledPlugins({ s_id: localRow.value.id })
	if (!status) {
		isSetupConfigMask.value = true
		isSetupConfigMask.message = msg
	}
	return {
		data,
		total: data.length,
	}
}

export const getPluginInstallList = async (params: any) => {
	try {
		const {
			data: { msg },
		} = await getInstallPluginList({
			s_id: localRow.value.id,
			keyword: params.search,
			p: params.p,
			p_size: params.limit,
		})
		if (isArray(msg.list)) {
			msg.list = msg.list.map((item: any) => {
				return {
					...item,
					author: item.author.replace('href="', 'target="_blank" style="color: var(--el-color-success)" href="'),
				}
			})
		}
		return { data: msg.list, total: msg.total, other: { search_history: [] } }
	} catch (error) {
		console.log(error)
		return { data: [], total: 0, other: { search_history: [] } }
	}
}

/** 主题 */
export const getThemeList = async (params: any) => {
	try {
		return refreshThemeList()
	} catch (error) {
		console.log(error)
		return { data: [], total: 0, other: { search_history: [] } }
	}
}

export const refreshThemeList = async () => {
	isSetupConfigMask.value = false
	const { data, status, msg } = await getInstalledThemes({ s_id: localRow.value.id })
	if (!status) {
		isSetupConfigMask.value = true
		isSetupConfigMask.message = msg
	}
	return {
		data,
		total: data.length,
	}
}

export const getThemeInstallList = async (params: any) => {
	try {
		const {
			data: { msg },
		} = await getInstallThemesList({
			s_id: localRow.value.id,
			keyword: params.search,
			p: params.p,
			p_size: params.limit,
		})
		return { data: msg.list, total: msg.total, other: { search_history: [] } }
	} catch (error) {
		console.log(error)
		return { data: [], total: 0, other: { search_history: [] } }
	}
}

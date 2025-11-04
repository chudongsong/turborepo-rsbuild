import { TabsOptionsProps } from '@/components/navigation/bt-tabs/types'
import CreateSite from './create-site/index.vue'
import ImportSite from './import-site/index.vue'
import { FormItemProps } from '@/hooks/tools/form/types'
import { FormInput, FormItemCustom, FormRadioButton, FormSelect } from '@/hooks/tools/form/form-item'
import useWPLocalAddStore from '@/views/wordpress/view/local/add-wordpress/useStore'
import BtSelect from '@/components/form/bt-select'
import { ElCheckbox, ElFormItem, ElTooltip } from 'element-plus'
import BtInput from '@/components/form/bt-input'
import BtFormItem from '@/components/form/bt-form-item'
import BtInputIcon from '@/components/form/bt-input-icon'
import { fileSelectionDialog, pluginInstallDialog } from '@/public'
import Upload from '@/views/wordpress/view/local/add-wordpress/import-site/upload.vue'
import { addWordpressSite, createWpSiteLocalBak, createWpSiteOtherbak, getWpVersionList } from '@/api/wp'
import { isArray } from '@/utils'
import { Message, useDataHandle, useDialog } from '@/hooks/tools'
import useWPLocalStore from '@/views/wordpress/view/local/useStore'
import BtLink from '@/components/base/bt-link'
import EditOption from '@/views/wordpress/view/local/add-wordpress/create-site/edit-option.vue'

const { addSelectOption, addPHPSelectOption, addWPSelectOption, web, sitePath, addWordpressFormData, selectLoading, phpLoading, wpLoading, addBackupFormData } = storeToRefs(useWPLocalAddStore())
const { setWpLoading } = useWPLocalAddStore()
const { isRefreshLocalList } = storeToRefs(useWPLocalStore())

export const tabComponent: TabsOptionsProps[] = [
	{
		label: '创建站点',
		name: 'single',
		render: () => <CreateSite></CreateSite>,
	},
	{
		label: '从备份创建',
		name: 'import',
		lazy: true,
		render: () => <ImportSite></ImportSite>,
	},
]

/**
 * @description 创建站点
 * @param formData
 * @returns
 */
export const getAddWordpressFormOption = (): ComputedRef<FormItemProps[]> => {
	const defalut = { class: '!w-[400px]', clearable: true }
	return computed(() => {
		return [
			FormInput('域名', 'domain', {
				attrs: { ...defalut, placeholder: '请输入网站域名', 'onUpdate:modelValue': changeSqlUser },
				rules: [{ required: true, message: '请输入网站域名', trigger: 'blur' }],
			}),
			FormInput('网站标题', 'weblog_title', {
				attrs: { ...defalut, placeholder: '请输入 WordPress 的网站标题' },
				rules: [{ required: true, message: '请输入 WordPress 的网站标题', trigger: 'blur' }],
			}),
			FormSelect('语言', 'language', addSelectOption.value, { attrs: { class: '!w-[230px]', loading: selectLoading.value } }),
			FormSelect('PHP 版本', 'php_version', addPHPSelectOption.value, {
				attrs: { class: '!w-[230px]', loading: phpLoading.value, onChange: handleWpVersionChange },
				rules: [{ required: true, message: '请选择PHP版本', trigger: 'blur' }],
			}),
			FormItemCustom(
				'WP 版本',
				() => {
					return (
						<div class={'flex items-center'}>
							<BtSelect options={addWPSelectOption.value} class={'!w-[230px]'} loading={wpLoading.value} v-model={addWordpressFormData!.value.wp_version}></BtSelect>
							<ElTooltip content="版本5.6.0+自动打开自动版本更新" placement="top">
								<span class="svgtofont-el-warning !text-extraLarge ml-[1rem]"></span>
							</ElTooltip>
						</div>
					)
				},
				'wp_version',
				{
					rules: [{ required: true, message: '请选择WP版本', trigger: 'blur' }],
				}
			),
			FormInput('用户名', 'user_name', {
				attrs: { ...defalut, placeholder: 'WordPress 后台用户' },
				rules: [{ required: true, message: 'WordPress 后台用户不能为空', trigger: 'blur' }],
			}),
			{
				key: 'admin_password',
				type: 'custom',
				render: () => {
					// 暂时取消验证
					// const passwordRules = computed(() => {
					// 	const baseRule = { required: true, message: 'WordPress 后台密码不能为空', trigger: 'blur' }
					// 	if (!addWordpressFormData.value.pw_weak) {
					// 		return [
					// 			baseRule,
					// 			{
					// 				validator: (rule: any, value: string, callback: Function) => {
					// 					const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/
					// 					if (!strongPasswordRegex.test(value)) {
					// 						callback(new Error('密码必须至少8位，包含大小写字母和数字'))
					// 					} else {
					// 						callback()
					// 					}
					// 				},
					// 				trigger: 'blur',
					// 			},
					// 		]
					// 	}
					// 	return [baseRule]
					// })

					return (
						<BtFormItem label={'密码'} prop={'admin_password'} class={'flex items-center'}>
							<BtInput class={'!w-[230px]'} clearable={true} v-model={addWordpressFormData!.value.admin_password} type="input"></BtInput>
							<ElCheckbox class={'ml-[2rem]'} v-model={addWordpressFormData!.value.pw_weak} label={'允许密码较弱'}></ElCheckbox>
						</BtFormItem>
					)
				},
				rules: {
					admin_password: [{ required: true, message: 'WordPress 后台密码不能为空', trigger: 'blur' }],
				},
			},
			FormInput('电子邮件', 'admin_email', {
				attrs: { ...defalut, placeholder: '请输入电子邮件地址' },
				rules: [
					{ required: true, message: '电子邮件地址不能为空', trigger: 'blur' },
					{ type: 'email', message: '请输入正确的电子邮件地址', trigger: 'blur' },
					{ min: 3, max: 50, message: '电子邮件长度在 3 到 50 个字符之间', trigger: 'blur' },
				],
			}),
			FormInput('前缀', 'prefix', {
				attrs: { ...defalut, placeholder: '请输入 WordPress 表名前缀' },
				rules: [{ required: true, message: 'WordPress 表名前缀不能为空', trigger: 'blur' }],
			}),
			FormItemCustom('缓存', () => {
				return <ElCheckbox v-model={addWordpressFormData!.value.enable_cache} label={'启用缓存，目前仅支持nginx'} disabled={web.value.type !== 'nginx'}></ElCheckbox>
			}),
			{
				key: 'mysql_setup',
				type: 'custom',
				render: () => {
					return (
						<BtFormItem label={'其他配置'} prop={'mysql_setup'} class={'!mb-0'}>
							<div class="flex flex-col bg-light p-[12px] px-[16px] text-small w-full">
								<div class="flex items-center justify-between">
									<span>数据库：{'MySQL数据库'}</span>
									<span>账号：{addWordpressFormData.value.datauser}</span>
									<span>密码：{addWordpressFormData.value.datapassword}</span>
								</div>
							</div>
							<span class="p-[12px] px-[16px] text-tertiary flex items-center text-small">
								其他配置初始状态为默认选择的配置项，如需修改请点击
								<BtLink
									onClick={() => {
										useDialog({
											title: '编辑配置',
											area: 62,
											component: () => <EditOption></EditOption>,
											compData: addWordpressFormData.value,
											btn: true,
										})
									}}>
									编辑配置
								</BtLink>
							</span>
						</BtFormItem>
					)
				},
			},
		] as FormItemProps[]
	})
}

/**
 * @description 修改数据库账号
 * @param value
 */
const changeSqlUser = (value: string) => {
	const ps = value.replace(new RegExp(/([-.])/g), '_')
	const dbUser = 'sql_' + ps
	addWordpressFormData.value.datauser = dbUser.length <= 16 ? dbUser : dbUser.slice(0, 16)
}

/**
 * @description 从备份创建
 * @param formData
 * @returns
 */
export const getAddWordpressFormOptionImport = (formData: AnyObject | undefined): ComputedRef<FormItemProps[]> => {
	const defalut = { class: '!w-[400px]', clearable: true }
	return computed(() => {
		return [
			FormRadioButton('备份类型', 'method', [
				{ label: '本地', value: 1 },
				{ label: 'Plesk或Cpanel', value: 2 },
			]),
			{
				type: 'custom',
				label: '备份文件路径',
				render: () => {
					return (
						<ElFormItem label={'备份文件路径'} prop={'bak_file'}>
							<Upload
								class={'mr-[1rem]'}
								path={'/www/server/panel/temp'}
								onFinish={(path: string) => {
									formData!.value.bak_file = path
								}}>
								上传文件
							</Upload>
							<BtInputIcon
								v-model={formData!.value.bak_file}
								icon="el-folder-opened"
								width="32rem"
								onIconClick={() => {
									fileSelectionDialog({
										type: 'file',
										path: formData!.value.bak_file,
										change: (path: string) => {
											formData!.value.bak_file = path
										},
									})
								}}
							/>
						</ElFormItem>
					)
				},
				key: 'bak_file',
				rules: {
					bak_file: [{ required: true, message: '请填写备份文件路径', trigger: 'blur' }],
				},
			},
			FormInput('域名', 'domain', { attrs: { ...defalut, placeholder: '请输入网站域名', 'onUpdate:modelValue': handleDomainInput }, rules: [{ required: true, message: '请输入网站域名', trigger: 'blur' }] }),
			FormInput('网站路径', 'sub_path', { attrs: { ...defalut, placeholder: '根目录留空，子目录填写目录名' }, slots: { prepend: () => <span>{formatSitePath(sitePath.value)}</span> } }),
			FormSelect('PHP 版本', 'php_version', addPHPSelectOption.value, { attrs: { class: '!w-[230px]', loading: phpLoading.value }, rules: [{ required: true, message: '请选择PHP版本', trigger: 'blur' }] }),
			FormItemCustom('缓存', () => {
				return <ElCheckbox v-model={formData!.value.enable_cache} label={'启用缓存，目前仅支持nginx'} disabled={web.value.type !== 'nginx'}></ElCheckbox>
			}),
		] as FormItemProps[]
	})
}

export const getSoftwareInstall = (name: string) => {
	return pluginInstallDialog({
		type: 'i',
		name,
	})
}

export const handleWpVersionChange = async (value: string) => {
	try {
		setWpLoading(true)
		const {
			data: { msg: wpData },
		} = await getWpVersionList({
			php_version_short: value || (addWordpressFormData.value.php_version as string),
		})
		if (isArray(wpData)) {
			addWPSelectOption.value = wpData.map((item: any) => ({
				label: item.version,
				value: item.version,
			}))
		}
	} finally {
		setWpLoading(false)
	}
}

const getParams = () => {
	const { domain, php_version: version } = addWordpressFormData.value
	const ps = domain.replace(new RegExp(/([-.])/g), '_')

	if (version === null) {
		Message.error('请选择PHP版本')
		throw new Error('请选择PHP版本')
	}

	return {
		webname: {
			domain,
			domainlist: [] as string[],
			count: 0,
		},
		type: 'PHP',
		port: 80,
		type_id: 0,
		ftp: false,
		sql: 'MySQL',
		codeing: 'utf8',
		set_ssl: 0,
		force_ssl: 0,
		project_type: 'WP',
		path: sitePath.value + '/' + domain,
		ps,
		version,
		datauser: addWordpressFormData.value.datauser,
		datapassword: addWordpressFormData.value.datapassword,
		password: addWordpressFormData.value.admin_password,
		pw_weak: addWordpressFormData.value.pw_weak ? 'on' : 'off',
		email: addWordpressFormData.value.admin_email,
		weblog_title: addWordpressFormData.value.weblog_title,
		language: addWordpressFormData.value.language,
		user_name: addWordpressFormData.value.user_name,
		prefix: addWordpressFormData.value.prefix,
		enable_cache: addWordpressFormData.value.enable_cache ? 1 : 0,
		enable_whl: 0,
		whl_page: addWordpressFormData.value.Login_url ? addWordpressFormData.value.Login_url : null,
		whl_redirect_admin: addWordpressFormData.value.redirection_url ? addWordpressFormData.value.redirection_url : null,
		package_version: addWordpressFormData.value.wp_version,
	}
}

export const onCreateConfirm = async (param: Ref<AnyObject>, validate: () => Promise<'closed' | true>, ref: Ref<any>) => {
	try {
		await validate()
		await useDataHandle({
			loading: '正在创建站点...',
			request: addWordpressSite(getParams()),
			message: true,
			success: async (data: any) => {
				if (!data.status) {
					throw new Error(data.msg)
				}
				isRefreshLocalList.value = true
			},
		})
	} catch (error) {
		throw error
	}
}

const getImportParams = () => {
	return {
		bak_file: addBackupFormData.value.bak_file,
		domain: addBackupFormData.value.domain,
		sub_path: addBackupFormData.value.sub_path,
		php_ver_short: addBackupFormData.value.php_version || '',
		enable_cache: addBackupFormData.value.enable_cache ? 1 : 0,
	}
}

export const onImportConfirm = async (param: Ref<AnyObject>, validate: () => Promise<'closed' | true>, ref: Ref<any>) => {
	try {
		await validate()
		const params = getImportParams()
		await useDataHandle({
			loading: '正在创建站点...',
			request: addBackupFormData.value.method === 1 ? createWpSiteLocalBak(params) : createWpSiteOtherbak(params),
			message: true,
			success: async (data: any) => {
				if (!data.status) {
					throw new Error(data.msg)
				}
				isRefreshLocalList.value = true
			},
		})
	} catch (error) {
		throw error
	}
}

// 添加一个变量来存储初始路径
const initialBasePath = ref('')
const formatSitePath = (path: string) => {
	return path.endsWith('/') ? path : `${path}/`
}

export const handleDomainInput = (value: string) => {
	// 如果初始路径还未设置，则保存当前的 sitePath.value
	if (!initialBasePath.value) {
		initialBasePath.value = sitePath.value
	}
	// 使用保存的初始路径作为基础路径
	sitePath.value = value ? `${initialBasePath.value}/${value}/` : `${initialBasePath.value}/`
}

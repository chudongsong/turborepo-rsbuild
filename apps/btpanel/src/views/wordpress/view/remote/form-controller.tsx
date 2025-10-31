import useWPRemoteStore from '@/views/wordpress/view/remote/useStore'
import { FormItemProps } from '@/hooks/tools/form/types'
import { FormItemCustom, FormInput, FormRadioButton, FormCustom, FormHelp } from '@/hooks/tools/form/form-item'
import { useConfirm } from '@/hooks/tools'
import { delWpRemote } from '@/api/wp'
import { useGlobalStore } from '@/store/global'
import { useWpAutoLogin } from '@/views/wordpress/useMethod'

const { payment } = useGlobalStore()
const { authType } = payment.value

/**	添加远程表单业务 */
const { addWordpressFormData, selectCofigFormData, isRefreshRemoteList } = storeToRefs(useWPRemoteStore())
const { addWordpressData } = useWPRemoteStore()

export const getAddWordpressFormOption = (formData: AnyObject): ComputedRef<FormItemProps[]> => {
	const defalut = { class: '!w-[300px]', clearable: true }
	const typeList = [
		{ label: '凭据', value: 1 },
		{ label: '密钥', value: 2 },
	]
	return computed(
		() =>
			[
				FormRadioButton('连接类型', 'type', typeList, { attrs: { ...defalut }, labelAttrs: { labelWidth: '100px' } }),
				FormInput('登录URL', 'url', {
					rules: [{ required: true, message: '请输入登录URL', trigger: 'blur' }],
					attrs: { ...defalut, placeholder: '请输入登录URL' },
					labelAttrs: { labelWidth: '100px' },
				}),
				...(formData.value.type === 1 ? credentialOptions(defalut) : secretkeyOptions(defalut)),
			] as FormItemProps[]
	)
}

const credentialOptions = (defalut: any) => {
	return [
		FormInput('用户名', 'username', { attrs: { ...defalut, placeholder: '请输入用户名' }, rules: [{ required: true, message: '请输入用户名', trigger: 'blur' }], labelAttrs: { labelWidth: '100px' } }),
		FormInput('密码', 'password', { attrs: { ...defalut, placeholder: '请输入密码' }, rules: [{ required: true, message: '请输入密码', trigger: 'blur' }], labelAttrs: { labelWidth: '100px' } }),
	]
}

const secretkeyOptions = (defalut: any) => {
	return [
		FormInput('Security Key', 'key', { attrs: { ...defalut, placeholder: '请输入Security Key' }, rules: [{ required: true, message: '请输入Security Key', trigger: 'blur' }], labelAttrs: { labelWidth: '100px' } }),
		FormInput('Security Token', 'token', { attrs: { ...defalut, placeholder: '请输入Security Token' }, rules: [{ required: true, message: '请输入Security Token', trigger: 'blur' }], labelAttrs: { labelWidth: '100px' } }),
		{
			type: 'custom',
			render: () => {
				return <span class={'leading-8'}>如何添加带有安全密钥的网站，遵循下面的步骤</span>
			},
		},
		FormHelp('', [
			{
				content: (
					<span>
						1. 下载
						<span class="bt-link" onClick={() => window.open('http://download.bt.cn/install/src/btpanel-wp-toolkit.zip', '_blank', 'noopener,noreferrer')}>
							WP工具包
						</span>
					</span>
				),
			},
			{ content: '2. 将插件上传到您的网站' },
			{ content: '3. 在您的网站上激活插件' },
			{ content: '4. 单击您网站上的安全键链接 /wp-admin/plugins.php页面	' },
			{ content: '5. 将密钥和令牌复制到上面的两个输入框' },
			{ content: '6. 单击确认按钮以完成全部' },
		]),
	]
}

export const addWordpress = async (param: Ref<AnyObject>, validate: () => Promise<'closed' | true>, ref: Ref<any>) => {
	try {
		await validate() // 校验表单
		await addWordpressData()
	} catch (error) {
		console.log('校验失败', error)
	}
}

export const getParams = () => {
	return {
		login_url: addWordpressFormData.value.url,
		username: addWordpressFormData.value.username,
		password: addWordpressFormData.value.password,
	}
}

export const getParamsKey = () => {
	return {
		login_url: addWordpressFormData.value.url,
		security_key: addWordpressFormData.value.key,
		security_token: addWordpressFormData.value.token,
	}
}

/**	查看远程表单配置业务 */
export const getSelectCofigFormOption = (): ComputedRef<FormItemProps[]> => {
	const defalut = { class: 'w-[320px]', clearable: true, disabled: true }
	return computed(() => {
		return [
			FormItemCustom('登录URL', () => (
				<div class="bt-link" onClick={() => onLogin(selectCofigFormData.value.Login_url)}>
					{selectCofigFormData.value.Login_url}
				</div>
			)), // '登录URL'
			FormInput('WP版本', 'wp', { attrs: { ...defalut } }),
			FormInput('插件版本', 'worker', { attrs: { ...defalut } }),
			FormInput('PHP版本', 'php', { attrs: { ...defalut } }),
			FormInput('MySQL版本', 'sql', { attrs: { ...defalut } }),
			FormInput('用户名', 'username', { attrs: { ...defalut } }),
			FormInput('网站语言', 'language', { attrs: { ...defalut } }),
		] as FormItemProps[]
	})
}

export const setSelectCofigFormData = (row: any) => {
	selectCofigFormData.value.Login_url = row.login_url || ''
	selectCofigFormData.value.wp = row.env_info.wordpress_version || ''
	selectCofigFormData.value.php = row.env_info.php_version || ''
	selectCofigFormData.value.worker = row.env_info.plugin_version || ''
	selectCofigFormData.value.username = row.username || ''
	selectCofigFormData.value.language = row.env_info.locale || ''
	selectCofigFormData.value.sql = row.env_info.mysql_version || ''
}

/**	wp登录业务 */
// 免密登录
export const onPay = (id: any) => {
	useWpAutoLogin(id, 'remote')
}

// 密码登录
export const onLogin = (login_url: any) => {
	window.open(login_url, '_blank', 'noopener,noreferrer')
}

/**	wp列表删除业务 */
export const onDel = async (row: any) => {
	await useConfirm({
		title: '删除',
		content: `这将从列表中删除您的网站【${row.site_url}】，是否继续操作?`,
		onConfirm: async () => {
			await delWpRemote({ remote_id: row.id })
			isRefreshRemoteList.value = true
		},
	})
}

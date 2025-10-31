import { Message, useDataHandle, useHandleError } from '@/hooks/tools'
import { batchPhpReferer, getSecurity, setSecurity, setProxyAntiLeech } from '@api/site'
import { openResultDialog } from '../../useController'
import { useSiteStore } from '../../useStore'
import { assembBatchParams, assembBatchResults } from '@/public'
import { proxyData } from '@site/views/reverse-proxy-model/url-proxy/useController'

const { siteInfo, isRefreshList } = useSiteStore()

export const compData = ref<any>() // 组件数据 单个或多个
export const isMult = computed(() => Array.isArray(compData.value?.selectedList) && compData.value?.selectedList?.length > 0) // 是否多选
export const viewLoading = ref(false) // 页面加载loading
export const hotLinkProtectForm = reactive({
	fix: 'jpg,jpeg,gif,png,js,css',
	domains: '',
	return_rule: '404',
	http_status: false,
	status: false, // 启用防盗链
})
export const hotFormRef = ref<any>(null)

export const helpList = [
	{
		content: '【URL后缀】一般填写文件后缀,每个文件后缀使用","分隔,如: png,jpg',
	},
	{
		content: '【许可域名】允许作为来路的域名，每行一个域名,如: www.bt.cn',
	},
	{
		content: '【响应资源】可设置404/403等状态码，也可以设置一个有效资源，如：/security.png',
	},
	{
		content: '【允许空HTTP_REFERER请求】是否允许浏览器直接访问，若您的网站访问异常，可尝试开启此功能',
	},
] // 帮助列表

/**
 * @description 启用防盗链-https空请求,必须开启防盗链时才能开启
 */
export const handleChangeHttp = (val: boolean) => {
	// hotLinkProtectForm.http_status = val ? true : false
	if (!hotLinkProtectForm.status) return Message.error('请先启用防盗链!')
}

/**
 * @description 启用防盗链
 */
export const handleChangeStatus = (val: boolean) => {
	hotLinkProtectForm.status = val
	if (!val) hotLinkProtectForm.http_status = false
}

export const onConfirm = async (close?: any) => {
	console.log(siteInfo.value.project_type === 'proxy')
	await hotFormRef.value.validate()

	let params: any = {
		...hotLinkProtectForm,
		domains: hotLinkProtectForm.domains?.replace(/\n/g, ','),
	}
	if (isMult.value) {
		const { enable, exclude } = compData.value.config
		const param = assembBatchParams(compData.value.selectedList, exclude, enable, { params: { project_type: 'PHP' } })
		params = { ...params, ...param }
	} else {
		params.id = siteInfo.value.id
		params.site_name = siteInfo.value.name
	}

	const requestFun = isMult.value ? batchPhpReferer : siteInfo.value.project_type === 'proxy' ? setProxyAntiLeech : setSecurity

	const res: AnyObject = await useDataHandle({
		loading: '正在设置防盗链，请稍后...',
		request: requestFun({
			...params,
			...(siteInfo.value.project_type === 'proxy' ? { proxy_path: proxyData.value.proxy_path } : {}),
		}),
		message: isMult.value ? false : true,
	})

	if (isMult.value) {
		const { data } = assembBatchResults(res.data)
		openResultDialog({ resultData: data, title: '批量设置防盗链' })
		isRefreshList.value = true
		// 批量设置完成后重置表单数据到默认状态
		resetFormToDefault()
		close && close()
	} else {
		getData(compData.value)
	}
}

/**
 * @description 获取防盗链数据
 */
export const getData = async (config: any) => {
	compData.value = config || []
	if (isMult.value) {
		resetFormToDefault()
	}
	if (siteInfo.value.project_type === 'proxy') {
		watch(
			() => proxyData.value.security_referer,
			newVal => {
				hotLinkProtectForm.fix = newVal.fix || 'jpg,jpeg,gif,png,js,css'
				hotLinkProtectForm.domains = newVal.domains?.toString()?.replace(/,/g, '\n') || ''
				hotLinkProtectForm.return_rule = newVal.return_rule || '404'
				hotLinkProtectForm.http_status = newVal.http_status || false
				hotLinkProtectForm.status = newVal.status || false
			}
		)
		return
	}
	if (!config) {
		const { id, name } = siteInfo.value
		try {
			viewLoading.value = true
			const { data } = await getSecurity({ id, site_name: name })
			if (data) {
				hotLinkProtectForm.fix = data.fix || 'jpg,jpeg,gif,png,js,css'
				hotLinkProtectForm.domains = data.domains?.toString()?.replace(/,/g, '\n') || ''
				hotLinkProtectForm.return_rule = data.return_rule || '404'
				hotLinkProtectForm.http_status = data.http_status || false
				hotLinkProtectForm.status = data.status || false
			}
		} catch (error) {
			useHandleError(error)
		} finally {
			viewLoading.value = false
		}
	}
}

/**
 * @description 重置表单数据到默认状态
 */
export const resetFormToDefault = () => {
	hotLinkProtectForm.fix = 'jpg,jpeg,gif,png,js,css'
	hotLinkProtectForm.domains = ''
	hotLinkProtectForm.return_rule = '404'
	hotLinkProtectForm.http_status = false
	hotLinkProtectForm.status = false
}

export const rules = {
	fix: [{ required: true, message: '请输入url后缀', trigger: 'blur' }],
	return_rule: [{ required: true, message: '请输入响应资源', trigger: 'blur' }],
}

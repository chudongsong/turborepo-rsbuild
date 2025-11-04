import { Message, useDataHandle, useHandleError } from '@/hooks/tools'
import { getSecurity, setSecurity } from '@api/docker'
// import { openResultDialog } from '../../useController';
import { useDockerSiteStore } from '@docker/views/docker-site/useStore'
// import { getDockerStore } from '@docker/useStore';

const { siteInfo } = useDockerSiteStore()
// const { refreshSiteTable } = getDockerStore();

export const compData = ref<any>() // 组件数据 单个或多个
// export const isMult = computed(() => Array.isArray(compData.value) && compData.value?.length > 1); // 是否多选
export const isMult = ref(false) // 是否多选
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
	await hotFormRef.value.validate()
	let params: any = {
		...hotLinkProtectForm,
		domains: hotLinkProtectForm.domains?.replace(/\n/g, ','),
	}
	if (isMult.value) {
		params.site_ids = JSON.stringify(compData.value.map((item: any) => item.id))
	} else {
		params.id = siteInfo.value.id
		params.site_name = siteInfo.value.name
	}

	const requestFun = setSecurity

	const res: AnyObject = await useDataHandle({
		loading: '正在设置防盗链，请稍后...',
		request: requestFun(params),
		message: isMult.value ? false : true,
	})
	// if (isMult.value) {
	// 	const data = [...res.data.errors, ...res.data.succeed];
	// 	openResultDialog({
	// 		resultData: data.map((item: any) => ({
	// 			...item,
	// 			name: compData.value.find((i: any) => i.id === item.id).name,
	// 		})),
	// 		title: '批量设置防盗链',
	// 	});
	// 	refreshSiteTable()
	// 	close && close();
	// } else {
	getData(compData.value)
	// }
}

/**
 * @description 获取防盗链数据
 */
export const getData = async (config: any) => {
	compData.value = config || []
	if (!config) {
		const { id, name } = siteInfo.value
		try {
			viewLoading.value = true
			const { data } = await getSecurity({ id, name })
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

export const rules = {
	fix: [{ required: true, message: '请输入url后缀', trigger: 'blur' }],
	return_rule: [{ required: true, message: '请输入响应资源', trigger: 'blur' }],
}

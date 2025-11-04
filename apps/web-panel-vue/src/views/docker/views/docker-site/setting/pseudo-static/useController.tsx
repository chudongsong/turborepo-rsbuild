import { Message, useConfirm } from '@/hooks/tools'
import { useGlobalStore } from '@/store/global'
import { SITE_STORE } from '@site/useStore'
import { useDockerSiteStore } from '@docker/views/docker-site/useStore'
import { SITE_PSEUDO_STORE } from './useStore'
import { getRewrite,setRewrite } from '@/api/docker'

const { siteInfo } = useDockerSiteStore()
const { getFileEvent } = SITE_STORE()
const { plugin, getGlobalInfo } = useGlobalStore()
const { webserver: webServerType } = toRefs(plugin.value)
const { delPseudoStaticEvent, getReWriteListEvent, setTemplateEvent } = SITE_PSEUDO_STORE()

export const staticContent = ref<string>('') // 静态内容\
export const defaultArr = ref<any[]>([]) // 默认值
export const textValue = ref('') // 文本值
export const optionData = ref<any[]>([]) // 下拉列表
export const otherSavePopup = ref(false) // 另存为模板弹窗
export const sitePath = ref<string>('') // 站点路径
export const textLoading = ref(false) // 文本加载

export const helpList = [
	{
		content: '请选择您的应用，若设置伪静态后，网站无法正常访问，请尝试设置回default',
	},
	{
		content: '您可以对伪静态规则进行修改，修改完后保存即可。',
	},
] // 帮助列表

/**
 * @description 判断不为默认模板时显示关闭按钮
 * @param val
 */
export const isClose = (val: string) => !defaultArr.value.includes(val)

/**
 * @description 删除伪静态模板
 * @param name
 */
export const delPseudoStatic = async (params: { name: string }) => {
	await useConfirm({
		title: `删除伪静态模板【${params.name}】`,
		content: '删除后不可恢复，确定删除吗？',
		icon: 'warning-filled',
	})

	const res = await delPseudoStaticEvent(params)

	if (res.status) {
		await getReWriteData()
		await getReWriteBody()
	}
}

/**
 * @description 获取伪静态列表
 * @param path
 */
export const getReWriteData = async () => {
	const params = {
		siteName: siteInfo.value.name,
	}
	textLoading.value = true
	const res = await getReWriteListEvent(params)
	// 数据处理
	handleReWriteData(res.data)
	textLoading.value = false
}

/**
 * @description 伪静态列表数据处理
 * @param data 数据
 * @param isSpecialType 是否为特殊类型
 */
export const handleReWriteData = async (data: AnyObject) => {
	// 数据处理
	optionData.value = data.rewrite
	defaultArr.value = data.default_list
	sitePath.value = data.sitePath + '/.htaccess'
	textValue.value = data.rewrite[0] || ''
	// if (webServerType.value === 'nginx') {
	// 	sitePath.value = `/www/server/panel/vhost/rewrite/${siteInfo.value.name}.conf`
	// }
}

/**
 * @description 获取伪静态内容
 * @param params.path 文件路径
 */
export const getReWriteBody = async (params: { site_name?: string,path?:string } = { site_name: siteInfo.value.name,}) => {
	try {
		textLoading.value = true
		const res: any = params.path ?  await getFileEvent(params):await getRewrite(params)
		staticContent.value = res.data.data
		textLoading.value = false
		return res
	} catch (error) {
		console.log(error)
		textLoading.value = false
		return { data: '获取伪静态内容失败' }
	}
}

/**
 * @description 下拉列表改变
 * @param val
 */
export const handleChange = (val: string) => {
	// 此处的nginx需要测试，当环境为apache时需要改变
	// `/www/server/panel/rewrite/${webServerType.value}/${val}.conf`
	let path = `/www/server/panel/rewrite/${webServerType.value}/${val}.conf`
	getReWriteBody({ path: val === '0.当前' ? '' : path })
}

/**
 * @description 保存伪静态内容
 */
export const setReWriteBody = async (
	params: { rewrite_conf: string; site_name: string; } = {
		rewrite_conf: staticContent.value,
		site_name: `${siteInfo.value.name}`,
	}
) => {
	const res: any = await setRewrite(params)
	Message.request(res)
	if (res.status) getReWriteData()
}

/**
 * @description 另存为模板
 */
export const setOtherTemplate = async (param: any) => {
	try {
		const params: any = {
			...param,
			data: staticContent.value,
		}
		// 名称不能和已有的重复

		params.name = params.name.trim()
		// 名称不可为空且不能包含空格
		if (params.name.includes(' ')) return Message.error('模板名称不能包含空格')
		if (params.name === '') return Message.error('模板名称不能为空')

		if (optionData.value.includes(params.name)) return Message.error('模板名称不能和已有的模板名称重复且不可为空')
		const res = await setTemplateEvent(params)

		if (res.status) {
			otherSavePopup.value = false
			// tempForm.name = '';
			await getReWriteData()
			await getReWriteBody()
		}
		return res.status
	} catch (error) {
		console.log(error)
		return false
	}
}

export const initPseudoStatic = async () => {
	await getGlobalInfo()
	await getReWriteData()
	await getReWriteBody()
}

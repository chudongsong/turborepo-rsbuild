import { getProxyConfigFile, saveProxyConfigFile, setProxyConfig, recoverProxyConfig } from '@/api/site'
import { useHandleError, useMessage, useConfirm, useDataHandle } from '@/hooks/tools'
import { useSiteStore, SITE_STORE } from '@/views/site/useStore'
import { SITE_CONFIG_FILE_STORE } from '@site/public/config-file/useStore'
import { formatTime, isArray } from '@/utils'

const Message = useMessage()
const { siteInfo } = useSiteStore() // 站点信息
const { getFileEvent } = SITE_STORE()

export const tabActive = ref<string>('master')

export const fileType = ref('server_block') // 配置块
export const typeOptions = [
	{
		label: 'server块',
		value: 'server_block',
	},
	{
		label: 'HTTP块',
		value: 'http_block',
	},
]
export const helpList = [{ content: '主配置文件不允许修改，如需自定义配置请到上方自定义配置文件中操作' }]
const serverList = [
	{ content: '保存前请检查输入的配置文件是否正确，错误的配置可能会导致网站访问异常' },
	{ content: '如果您对此配置不熟悉，请勿添加自定义配置' },
	{
		isHtml: true,
		content: 'server块的nginx官方配置文档：<a class="text-primary cursor-pointer" href="https://nginx.org/en/docs/http/ngx_http_core_module.html#server" target="_blank" rel="noreferrer noopener">点击跳转</a>',
	},
]
const httpList = [
	{ content: '保存前请检查输入的配置文件是否正确，错误的配置可能会导致网站访问异常' },
	{ content: '如果您对此配置不熟悉，请勿添加自定义配置' },
	{
		isHtml: true,
		content: 'http块的nginx官方配置文档：<a class="text-primary cursor-pointer" href="https://nginx.org/en/docs/http/ngx_http_core_module.html#http" target="_blank" rel="noreferrer noopener">点击跳转</a>',
	},
]
export const customHelp = ref(serverList) // 自定义帮助
export const staticContent = ref('') // 静态内容
export const textLoading = ref(false) // 文本加载
// /**
//  * @description 获取配置文件列表
//  * @param path
//  */
// export const getConfigData = async () => {
// 	try {
// 		textLoading.value = true
// 		const { data: res } = await getProxyConfigFile({
// 			site_name: siteInfo.value.name,
// 		})
// 		if (res.status) {
// 			// if (tabActive.value === 'master') {
// 				staticContent.value = res.data.site_conf
// 			// } else {
// 			// 	staticContent.value = res.data[fileType.value]
// 			// 	customHelp.value = fileType.value === 'server_block' ? serverList : httpList
// 			// }
// 		} else {
// 			Message.error(res.msg)
// 		}
// 		return { data: staticContent.value }
// 	} catch (error) {
// 		console.log(error)
// 		return { data: '' }
// 	} finally {
// 		textLoading.value = false
// 	}
// }

/**
 * @description 获取配置文件
 * @param path
 */
export const getConfigData = async () => {
	try {
		textLoading.value = true
		const { data: res } = await getFileEvent({
			path: `/www/server/panel/vhost/nginx/${siteInfo.value.name}.conf`,
		})
		content.value = res.data
		if (isArray(res.historys)) historyData.value = res.historys
		// historyPopup.value = false;
		textLoading.value = false
	} catch (error) {
		console.log(error)
		return { status: false, msg: '获取配置文件失败' }
	}
}

/**
 * @description 文本内容改变
 */
export const changeDataEvent = (e: any) => {
	if (tabActive.value === 'master') {
		if (e.ctrlKey && e.keyCode === 83) {
			e.preventDefault()
		}
		errMsg()
		return
	}
}

const errMsg = useThrottleFn(() => {
	Message.error('主配置文件不允许修改，如需自定义配置请到上方自定义配置文件中操作')
}, 3000)

// /**
//  * @description 保存内容
//  */
// export const saveDataEvent = async () => {
// 	// 主配置文件不可编辑
// 	if (tabActive.value === 'master') {
// 		return { status: false, msg: '主配置文件不允许修改，如需自定义配置请到上方自定义配置文件中操作' }
// 	}
// 	let loading = Message.load('正在保存内容，请稍候...')
// 	try {
// 		const res = await saveProxyConfigFile({
// 			site_name: siteInfo.value.name,
// 			conf_type: fileType.value,
// 			body: staticContent.value,
// 		})

// 		Message.msg({
// 			dangerouslyUseHTMLString: true,
// 			message: res.msg,
// 			type: res.status ? 'success' : 'error',
// 			duration: res.status ? 2000 : 0,
// 			showClose: !res.status,
// 		}) // 提示错误信息
// 	} catch (error) {
// 		useHandleError(error)
// 		return { status: false, msg: '保存文件失败' }
// 	} finally {
// 		loading.close()
// 	}
// }

// 配置文件内容
export const content = ref('')

// 历史记录
export const historyData = ref() // 历史记录列表
export const historyContent = ref('') // 历史记录内容
export const composerPath = ref('') // composer路径
export const historyPopup = ref(false) // 历史记录弹窗

/**
 * @description 查看历史文件
 */
export const viewHistoryFile = async (row: any) => {
	try {
		const { viewFileHistoryEvent } = SITE_CONFIG_FILE_STORE()
		const res = await viewFileHistoryEvent({ row, path: `/www/server/panel/vhost/nginx/${siteInfo.value.name}.conf` })
		historyContent.value = res.status ? res.data : '文件不存在'
		// itemData.value = row;
		// historyPopup.value = true;
		return res
	} catch (error) {
		console.log(error)
		return { status: false, msg: '获取文件历史失败' }
	}
}

/**
 * @description 保存配置文件
 * @param params
 * @returns
 */
export const saveConfigDataEvent = async () => {
	try {
		useDataHandle({
			loading: '正在保存，请稍后...',
			message: true,
			request: setProxyConfig({
				site_name: siteInfo.value.name,
				conf_data: content.value,
			}),
			success: getConfigData,
		})
	} catch (error) {
		console.log(error)
		// return { status: false, msg: '保存文件失败' }
	}
}

/**
 * @description 恢复文件
 * @param row
 */
export const recoverFile = async (row: any) => {
	try {
		await useConfirm({
			title: `恢复历史文件`,
			content: `是否恢复历史文件 ${formatTime(row)}`,
		})
		const res: any = await recoverProxyConfig({ filename: `/www/server/panel/vhost/nginx/${siteInfo.value.name}.conf`, history: row, site_name: siteInfo.value.name })
		Message.request({ status: res.status, msg: res.status ? '恢复成功' : '恢复失败' })
		if (res.status) getConfigData()
		return res.status
	} catch (error) {
		console.log(error)
	}
}

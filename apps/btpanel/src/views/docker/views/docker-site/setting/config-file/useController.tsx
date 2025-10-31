import { getProxyConfigFile, saveProxyConfigFile } from '@/api/docker'
import { useHandleError, useMessage } from '@/hooks/tools'
import { useDockerSiteStore } from '@docker/views/docker-site/useStore'

const Message = useMessage()
const { siteInfo } = useDockerSiteStore()

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
/**
 * @description 获取配置文件列表
 * @param path
 */
export const getConfigData = async () => {
	try {
		textLoading.value = true
		const { data: res } = await getProxyConfigFile({
			site_name: siteInfo.value.name,
		})
		if (res.status) {
			if (tabActive.value === 'master') {
				staticContent.value = res.data.site_conf
			} else {
				staticContent.value = res.data[fileType.value]
				customHelp.value = fileType.value === 'server_block' ? serverList : httpList
			}
		} else {
			Message.error(res.msg)
		}
		return { data: staticContent.value }
	} catch (error) {
		console.log(error)
		return { data: '' }
	} finally {
		textLoading.value = false
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

/**
 * @description 保存内容
 */
export const saveDataEvent = async () => {
	// 主配置文件不可编辑
	if (tabActive.value === 'master') {
		return { status: false, msg: '主配置文件不允许修改，如需自定义配置请到上方自定义配置文件中操作' }
	}
	let loading = Message.load('正在保存内容，请稍候...')
	try {
		const res = await saveProxyConfigFile({
			site_name: siteInfo.value.name,
			conf_type: fileType.value,
			body: staticContent.value,
		})
		Message.msg({
			dangerouslyUseHTMLString: true,
			message: res.msg,
			type: res.status ? 'success' : 'error',
			duration: res.status ? 2000 : 0,
			showClose: !res.status,
		}) // 提示错误信息
		return res
	} catch (error) {
		useHandleError(error)
		return { status: false, msg: '保存文件失败' }
	} finally {
		loading.close()
	}
}

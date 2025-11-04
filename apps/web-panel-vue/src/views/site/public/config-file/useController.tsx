import { Message, useConfirm } from '@/hooks/tools'
import { useGlobalStore } from '@/store/global'
import { formatTime, isArray } from '@/utils'
import { SITE_STORE, useSiteStore } from '../../useStore'
import { SITE_CONFIG_FILE_STORE } from './useStore'

const { activeType, siteInfo, isBindExtranet, siteType } = useSiteStore()
const { getFileEvent, saveFileEvent } = SITE_STORE()

const { viewFileHistoryEvent, recoverFileEvent, getComposerPathEvent } = SITE_CONFIG_FILE_STORE()

const { plugin } = useGlobalStore()

export const defaultActive = ref<string>('config') // 菜单默认展开项
export const tabComponent = ref<any>([
	{
		label: '配置文件',
		name: 'config',
		render: () => {},
	},
	{
		label: 'Composer配置文件',
		name: 'composer',
		render: () => {},
	},
])

// 配置文件内容
export const content = ref('')

// 历史记录
export const historyData = ref() // 历史记录列表
export const historyContent = ref('') // 历史记录内容

// 配置文件路径
export const path = computed(() => {
	const type = activeType.value === 'nodejs' ? 'node' : activeType.value
	const isName = activeType.value !== 'php' && activeType.value !== 'proxy' && activeType.value !== 'proxy' ? `${type}_` : ''
	const configPath = `/www/server/panel/vhost/${plugin.value.webserver}/${isName}${siteInfo.value.name}.conf`
	return defaultActive.value === 'config' ? configPath.replace(/\/+/g, '/') : composerPath.value
})

// export const isBindExtranet = ref(false); // 是否绑定外网映射
export const composerPath = ref('') // composer路径
export const historyPopup = ref(false) // 历史记录弹窗
export const textLoading = ref(false) // 文本加载中

/**
 * @description 获取配置文件
 * @param path
 */
export const getConfigData = async (params: { path: string }) => {
	try {
		textLoading.value = true
		const { data: res } = await getFileEvent(params)
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
 * @description tab切换事件
 * @param config
 * @param name
 */
export const tabClickEvent = (config: any, name: string) => {
	defaultActive.value = name
	getConfigData({ path: path.value })
}

/**
 * @description 保存配置文件
 * @param params
 * @returns
 */
export const saveConfigDataEvent = async (
	params: {
		data: string
		encoding: string
		path: string
	} = {
		data: content.value,
		encoding: 'utf-8',
		path: path.value,
	}
) => {
	try {
		const res = await saveFileEvent(params)
		if (res.status) getConfigData({ path: params.path })
	} catch (error) {
		console.log(error)
		return { status: false, msg: '保存文件失败' }
	}
}

/**
 * @description 查看历史文件
 */
export const viewHistoryFile = async (row: any) => {
	try {
		const res = await viewFileHistoryEvent({ row, path: path.value })
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
 * @description 恢复文件
 * @param row
 */
export const recoverFile = async (row: any) => {
	try {
		await useConfirm({
			title: `恢复历史文件`,
			content: `是否恢复历史文件 ${formatTime(row)}`,
		})
		const res: any = await recoverFileEvent({ row, path: path.value })
		Message.request({ status: res.status, msg: res.status ? '恢复成功' : '恢复失败' })
		if (res.status) getConfigData({ path: path.value })
		return res.status
	} catch (error) {
		console.log(error)
	}
}

/**
 * @description 设置状态 路径
 */
export const setInfoEvent = () => {
	const { project_type, project_config, name } = siteInfo.value
	isBindExtranet.value = !!project_config?.bind_extranet
	// 特殊页面不显示外网映射遮罩
	const isSpecialData = ['php', 'html', 'proxy'].includes(project_type)
	if (isSpecialData) isBindExtranet.value = true
	if (project_type === 'php') getComposer()
}

/**
 * @description 获取composer路径
 */
export const getComposer = async () => {
	try {
		const res = await getComposerPathEvent(siteInfo.value.path)
		if (res.status) composerPath.value = res.data
		return res
	} catch (error) {
		console.log(error)
		return { status: false, msg: '获取composer路径失败' }
	}
}

/**
 * @description 初始化配置
 */
export const initConfig = async () => {
	setInfoEvent()
	if (isBindExtranet.value) await getConfigData({ path: path.value })
}

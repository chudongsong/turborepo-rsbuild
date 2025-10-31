import { useMessage, useDataHandle } from '@/hooks/tools'
import { getDockerAppList } from '@/api/docker'
import { getPageTotal } from '@utils/index'
import { getDockerAppStore } from './useStore'

const Message = useMessage() // 消息提示

const {
	refs: { deployMenuData },
} = getDockerAppStore()

export const appData = reactive({
	loading: false, // 加载状态
	list: [] as any, // 应用列表
	total: 0, // 总数
})

export const appParams = reactive({
	p: 1, // 页码
	row: 200, // 每页条数
	query: '', // 搜索关键字
	force: 0, // 是否强制刷新
})

/**
 * @description 获取应用列表
 */
export const getAppList = async (
	params: any = {
		query: appParams.query,
		p: appParams.p,
		row: appParams.row,
		force: 0,
	}
) => {
	// 获取上次更新时间戳
	const TIMESTAMP_KEY = 'docker_app_list_timestamp'
	const lastUpdateTime = localStorage.getItem(TIMESTAMP_KEY)
	const currentTime = Date.now()
	const ONE_DAY = 24 * 60 * 60 * 1000 // 一天的毫秒数
	let autoUpdate = false // 是否自动更新

	// 检查是否需要强制更新
	if (!lastUpdateTime || currentTime - parseInt(lastUpdateTime) > ONE_DAY) {
		// params.force = 1;
		autoUpdate = true
	}

	useDataHandle({
		request: getDockerAppList({
			...params,
			app_type: deployMenuData.value.app_type,
			force: params.force || (autoUpdate ? 1 : 0),
		}),
		loading: toRef(appData, 'loading'),
		success: (res: any) => {
			if (res.status) {
				// 如果是强制更新，则更新时间戳
				if (params.force === 1 || autoUpdate) {
					localStorage.setItem(TIMESTAMP_KEY, currentTime.toString())
					!autoUpdate && Message.success('刷新成功')
				}
				appData.list = res.data.data.map((app: any, index: number) => {
					return { ...app, index: `${app.appname || Math.random().toString(36).substring(2, 15)}_${index}` }
				})
				appData.total = getPageTotal(res.data.page)
				deployMenuData.value.maximum_cpu = res.data.maximum_cpu
				deployMenuData.value.maximum_memory = res.data.maximum_memory + ' MB'
			} else {
				Message.error(res.msg)
			}
		},
	})
}

export const unmountedHandle = () => {
	appData.list = []
	appData.total = 0
	appParams.p = 1
	appParams.query = ''
}

import { useMessage, useDataHandle } from '@/hooks/tools'
import { getInstalledApps } from '@/api/docker'
import { getPageTotal } from '@utils/index'
import { getDockerAppStore } from '@docker/views/app-store/useStore'
import { appData, getAppList, appParams } from '@docker/views/app-store/useController'
// import { useImagesCache } from '@docker/useMethods' // 弹窗方法

const Message = useMessage() // 消息提示

// export const { getCachedImage: getAppImages } = useImagesCache() // 获取软件图片

const {
	refs: { deployMenuData },
} = getDockerAppStore()

const scrollLoading = ref(false) // 滚动加载状态
export const noMore = ref(false) // 没有更多数据
export let refreshTimer: any = null // 刷新定时器
/**
 * @description 滚动加载
 * @returns {void} void
 */
export const scrollLoad = async (): Promise<void> => {
	if (scrollLoading.value) return
	scrollLoading.value = true
	noMore.value = true
	if (appData.list.length < appData.total) {
		appParams.p++
		if (deployMenuData.value.app_type === 'installed') {
			await onClickInstalled('all')
		} else {
			await getAppList(appParams)
		}
	}
	scrollLoading.value = false
}
/**
 * @description 已安装
 */
export const onClickInstalled = async (app_type?: string, notLoading?: boolean) => {
	try {
		if (appParams.p === 1) {
			appData.total = 0
			appData.list = []
		}
		if (!notLoading) appData.loading = true
		deployMenuData.value.app_type = 'installed'
		await useDataHandle({
			request: getInstalledApps({
				app_type: app_type || 'all',
				p: appParams.p,
				row: 20,
				query: appParams.query || '',
			}),
			success: (res: any) => {
				if (res.status) {
					const list =
						res.data.data.map((app: any, index: number) => {
							return { ...app, index }
						}) || []
					appData.list = [...appData.list, ...list]
					if (res.data.page) {
						appData.total = getPageTotal(res.data.page)
					} else {
						appData.total = 0
					}
				} else {
					Message.error(res.msg)
				}
			},
		})
	} catch (error) {
		console.log(error)
	} finally {
		appData.loading = false
	}
}

/**
 * @description 检查是否有正在安装的应用
 */
export const checkInstalling = () => {
	const haveInstall = appData.list.some((item: any) => {
		return item.status === 'initializing'
	})
	if (haveInstall) {
		refreshTimer = setTimeout(() => {
			onClickInstalled('all', true)
			checkInstalling()
		}, 30000)
	}
}

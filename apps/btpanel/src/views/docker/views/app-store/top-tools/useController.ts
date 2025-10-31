import { useMessage, useDataHandle, useDialog } from '@/hooks/tools'
import { getDockerType, getInstalledApps, getDockerApphubConfig } from '@/api/docker'
import { getPageTotal } from '@utils/index'
import { getDockerAppStore } from '@docker/views/app-store/useStore'
import { appData, getAppList, appParams } from '@docker/views/app-store/useController'
import { useGlobalStore } from '@store/global'
import { clearImageCacheDB } from '@docker/useMethods'
import { useDockerAppStoreLocal } from '../app-import/useStore'

const { apphubGitConfig, isSaveGitConfig } = useDockerAppStoreLocal()

const Message = useMessage() // 消息提示

const {
	refs: { deployMenuData },
} = getDockerAppStore()
const { mainWidth } = useGlobalStore()

export const typeList = shallowRef<any>([])
export const installedType = shallowRef('')

/**
 * @description 判定当前能显示多少个分类
 */
export const typeNum = () => Math.floor((mainWidth.value - 420) / 140)
export const splitArr = ref<any>()

/**
 * @description 手动更新列表
 * @param {number} val 是否强制刷新
 */
export const refreshList = async (val?: boolean) => {
	appParams.p = 1
	getTypeList()
	if (deployMenuData.value.app_type === 'installed') {
		await onClickInstalled('all')
		val && Message.success('刷新成功')
		return
	}
	appParams.force = val ? 1 : 0
	if (val) {
		// 清除图片缓存
		await clearImageCacheDB()
	}
	await getAppList(appParams)
}

/**
 * @description 获取应用分类
 */
export const getTypeList = async () => {
	return await useDataHandle({
		request: getDockerType(),
		data: [Array, typeList],
		success: (data: any) => {
			splitArr.value = data.slice(typeNum(), data.length)
		},
	})
}

/**
 * @description 点击分类
 */
export const handleClickType = async (type: string) => {
	// appData.loading = true
	installedType.value = splitArr.value?.find((item: any) => item.type === type)?.desc || ''
	deployMenuData.value.app_type = type
	appParams.query = ''
	appParams.p = 1
	appParams.force = 0
	await getAppList(appParams)
	// appData.loading = false
}

/**
 * @description 已安装
 */
const onClickInstalled = async (app_type: string) => {
	appData.loading = true
	installedType.value = typeList.value?.find((item: any) => item.type === app_type)?.desc || ''
	deployMenuData.value.app_type = 'installed'
	useDataHandle({
		request: getInstalledApps({
			app_type,
			p: 1,
			row: 20,
			query: appParams.query || '',
		}),
		loading: toRef(appData, 'loading'),
		success: (res: any) => {
			if (res.status) {
				appData.list =
					res.data.data.map((app: any, index: number) => {
						return { ...app, index }
					}) || []
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
}

export const handleClickInstalled = () => {
	if (deployMenuData.value.app_type === 'installed') onClickInstalled('all')
	deployMenuData.value.app_type = 'installed'
}

export const unmountedHandle = () => {
	typeList.value = []
	installedType.value = ''
	splitArr.value = []
}

export const importAppHandle = async (item?: any) => {
	const loading = Message.load('正在获取配置信息...')
	try {
		const res = await getDockerApphubConfig()
		const git_config = res.data.git_config || {}
		const { git_url = '', git_branch = '', user_config = {} } = git_config
		apphubGitConfig.value = {
			git_url,
			git_branch,
			name: user_config.name || '',
			password: user_config.password || '',
		}
		if (res.status) isSaveGitConfig.value = true
		useDialog({
			title: `导入应用`,
			area: 70,
			btn: ['导入', '取消'],
			component: () => import('../app-import/index.vue'),
		})
	} catch (error: any) {
		console.error(error)
	} finally {
		loading?.close()
	}
}

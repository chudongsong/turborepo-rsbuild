import type { App } from 'vue'
import { storeToRefs } from 'pinia'
import { useDialog } from '@/hooks/tools'

import { INSTALL_STORE } from './store'

/**
 * @description 编译安装
 * @returns {App}
 */
export const compileInstallDialog = (pluginName: string, button: string): Promise<boolean> => {
	return new Promise((resolve, error) => {
		useDialog({
			title: '编译安装',
			area: 45,
			btn: [`提交并${button}`, '取消'],
			component: () => import('./popup/compile-install.vue'),
			onConfirm: () => resolve(true),
			onCancel: () => resolve(false),
		})
	})
}

/**
 * @description 依赖安装
 * @param {Object} pluginInfo 插件信息
 * @returns {Promise<App>}
 */
export const dependInstallDialog = (pluginInfo: AnyObject): Promise<App> =>
	useDialog({
		title: `【${pluginInfo.name}】安装环境缺失`,
		area: 34,
		btn: ['安装', '取消'],
		component: () => import('./popup/depend-install.vue'),
		compData: pluginInfo.dependnet,
	})

/**
 * @description 下载速度
 * @param {Object} pluginInfo 插件信息
 * @returns {Promise<App>}
 */
export const downloadSpeedDialog = ({ pluginTitle, pluginName, fullVersion }: AnyObject): Promise<App> => {
	const { downLoadPopup } = storeToRefs(INSTALL_STORE())
	return (downLoadPopup.value = useDialog({
		area: 45,
		component: () => import('./popup/download-speed.vue'),
		compData: { pluginTitle, pluginName, fullVersion },
	}))
}

/**
 * @description 历史版本
 * @returns {App}
 */
export const historyVersionDialog = (pluginInfo: any): Promise<any> =>
	useDialog({
		title: `${pluginInfo.title}- 更新日志`,
		area: 52,
		component: () => import('./popup/history-version.vue'),
		compData: { name: pluginInfo.name, title: pluginInfo.title },
	})

/**
 * @description 安装速度
 * @returns {App}
 */
export const speedInstallDialog = (speedConfig: AnyObject): Promise<any> => {
	const { compData } = storeToRefs(INSTALL_STORE())
	compData.value = { speedConfig }
	return useDialog({
		title: speedConfig.title || '正在执行安装脚本，请稍候...',
		area: [50, 26.4],
		component: () => import('./popup/speed-install.vue'),
		compData: speedConfig,
	})
}

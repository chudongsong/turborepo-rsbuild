import { initEnvironment } from '@/api/mail'
import { useConfirm, useDataHandle } from '@/hooks/tools'

export const menu = ref('common')

/**
 * @description 环境初始化
 */
export const initEnvironmentEvent = () => {
	useConfirm({
		isHtml: true,
		title: '初始化邮局配置文件',
		content: `<span class="text-red-500">此操作会初始化邮局配置文件，如果邮局已正常运行请勿重复初始化</span>`,
		onConfirm: () => {
			// 环境初始化逻辑
			useDataHandle({
				request: initEnvironment(),
				loading: '正在环境初始化中...',
				message: true,
			})
		},
	})
}

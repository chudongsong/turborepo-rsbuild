import { cleanLogsApi } from '@/api/vhost'
import { useConfirm, useDataHandle } from '@/hooks/tools'

/**
 * @description 清空日志
 */
export const deleteLogEvent = async (init: AnyFunction) => {
	useConfirm({
		title: '清空日志',
		content: '是否清空日志，是否继续？',
		onConfirm: async () => {
			await useDataHandle({
				request: cleanLogsApi(),
				message: true,
				success: init,
			})
		},
	})
}

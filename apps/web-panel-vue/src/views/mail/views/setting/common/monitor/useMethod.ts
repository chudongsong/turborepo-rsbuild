import { useConfirm } from '@/hooks/tools/confirm'
import { openServiceMonitor, closeServiceMonitor, getServiceMonitor } from '@/api/mail'
import { useMessage } from '@/hooks/tools'
import MAIL_SETTING_MONITOR from '@/views/mail/views/setting/common/monitor/store'
import { storeToRefs } from 'pinia'

const { status } = storeToRefs(MAIL_SETTING_MONITOR())
const { setLoading } = MAIL_SETTING_MONITOR()

const Message = useMessage()

export const onUpdateStatus = async (val: string | number | boolean) => {
	useConfirm({
		title: val ? '启用服务状态监控' : '关闭服务状态监控',
		content: val ? '检查邮局服务的状态，并在停止时自动重新启动' : '关闭后，系统将不再监控邮局服务状态',
		onConfirm: async () => {
			try {
				const { data } = await (val ? openServiceMonitor() : closeServiceMonitor())
				Message.request(data)
				getStatus()
			} catch (error) {
				status.value = !val
				Message.error('操作失败')
			}
		},
		onCancel: () => {
			status.value = !val
		},
	})
}

export const getStatus = async () => {
	try {
		setLoading(true)
		const { data } = await getServiceMonitor()
		status.value = data.status ? true : false
	} catch (err) {
		status.value = false
	} finally {
		setLoading(false)
	}
}

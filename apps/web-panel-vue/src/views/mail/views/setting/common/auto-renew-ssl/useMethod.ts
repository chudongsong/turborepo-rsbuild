import { closeAutoSSLTask, getAutoSSLTaskStatus, openAutoSSLTask } from '@/api/mail'
import { useConfirm, useDataHandle } from '@/hooks/tools'

export const status = ref(false)
export const loading = ref(false)

export const onUpdateStatus = (val: string | number | boolean) => {
	useConfirm({
		title: `${val ? '开启' : '关闭'}自动续期SSL证书`,
		content: `${val ? '开启后，系统将自动续期SSL证书' : '关闭后，系统将不再自动续期SSL证书'}`,
		onConfirm: async () => {
			useDataHandle({
				loading: `正在${val ? '开启' : '关闭'}自动续期SSL证书`,
				message: true,
				request: val ? openAutoSSLTask() : closeAutoSSLTask(),
				success: () => {
					getStatus()
				},
			})
		},
		onCancel: () => {
			status.value = !val
		},
	})
}

export const getStatus = async () => {
	loading.value = true
	try {
		const { data } = await getAutoSSLTaskStatus()
		status.value = data.status
		loading.value = false
	} catch (err) {
		status.value = false
	}
}

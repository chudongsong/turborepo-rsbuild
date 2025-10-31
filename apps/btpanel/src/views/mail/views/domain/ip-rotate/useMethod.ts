import { setIpRotateApi } from '@/api/mail'
import { useDataHandle } from '@/hooks/tools'
import { getList } from '../method'

export const formData = ref({
	bind: '',
	status: true,
	tags: [],
	cycle: 10,
})

export const isLoading = ref(false)

export const setIpRotate = async (row: any) => {
	const res = (await useDataHandle({
		request: setIpRotateApi({
			bind: row.bind,
			tags: row.tags.join(','),
			cycle: row.cycle,
			status: row.status ? 1 : 0,
		}),
		loading: '设置中...',
		message: true,
	})) as any
	if (res.status) {
		getList()
	}
	return res.status
}

export const resetIpRotateData = () => {
	formData.value.tags = []
	formData.value.cycle = 10
	formData.value.status = true
	formData.value.bind = ''
}

export const initFormData = (row: any) => {
	if (row.domain) {
		formData.value.bind = row.domain
	}
	if (row.ip_tag) {
		formData.value.tags = row.ip_tag.map((item: any) => item.tag)
	}
	if (row.ip_rotate) {
		formData.value.cycle = row.ip_rotate.cycle
		formData.value.status = row.ip_rotate.status
	}
}

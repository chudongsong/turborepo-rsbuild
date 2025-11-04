import { isArray } from '@/utils'
import { getMailTypeList } from '@/api/mail'

export const mailTypeList = ref<any[]>([])

export const getTypeList = async () => {
	const { data } = await getMailTypeList({})
	mailTypeList.value = isArray<any>(data) ? data : []
}

export const resetMailType = () => {
	mailTypeList.value = []
}

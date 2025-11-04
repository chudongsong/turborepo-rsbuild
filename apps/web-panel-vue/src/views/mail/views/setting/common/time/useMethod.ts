import { isObject } from '@/utils'
import { Message } from '@/hooks/tools/message'
import { getSaveDays, setSaveDay } from '@/api/mail'
import MAIL_SETTING_TIME from '@/views/mail/views/setting/common/time/store'
import { storeToRefs } from 'pinia'

const { type, days } = storeToRefs(MAIL_SETTING_TIME())

export const onSave = async () => {
	if (!days.value && days.value !== 0 && type.value === 1) {
		Message.error('请输入保存时间')
		return
	}
	const { data } = await setSaveDay({ save_day: type.value === 0 ? 0 : days.value })
	Message.request(data)
	getData()
}

export const getData = async () => {
	const { data } = await getSaveDays()
	if (isObject(data)) {
		if (data.data === 0 || data.data === null) {
			type.value = 0
			days.value = null
		} else {
			type.value = 1
			days.value = data.data
		}
	}
}

export const handleInput = (value: string) => {
	// 移除非数字字符
	const newValue = value.replace(/[^\d]/g, '')
	// 确保是正整数且不以0开头
	if (newValue === '' || newValue === '0') {
		days.value = ''
	} else {
		days.value = newValue
	}
}

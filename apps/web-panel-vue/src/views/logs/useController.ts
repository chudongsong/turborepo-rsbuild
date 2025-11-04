import { Message } from '@/hooks/tools'
import { getCrontabLogs } from './views/panel-log/useController'
import { LOG_PANEL_STORE } from './views/panel-log/useStore'
import { renderSoftLog } from './views/soft-log/useController'
import { LOG_SSH_STORE } from './views/ssh-log/useStore'
import { LOG_SITE_STORE } from './views/web-log/useStore'
import { useLogStore } from './useStore'
import { npsSurveyV2Dialog } from '@/public'

const { selectedItem } = useLogStore()

/**
 * @description 日期转换
 */
export const dateSwitch = (dateValue: string): number[] => {
	let time_search: number[] = []
	// 获取今天 0 点的时间戳
	const now = new Date()
	const todayZero = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime() / 1000
	const today = Math.floor(new Date().getTime() / 1000) // 今天的时间戳
	switch (dateValue) {
		case '7':
			// time_search赋值为7天前的时间戳与今天的时间戳
			time_search = [todayZero - 7 * 24 * 60 * 60, today]
			break
		case '30':
			time_search = [todayZero - 30 * 24 * 60 * 60, today]
			break
		case '180':
			time_search = [todayZero - 180 * 24 * 60 * 60, today]
			break
	}
	return time_search
}

/**
 * @description 导出日志
 * @param type
 * @param params
 */
export const outLogEvent = async (type: String, params: any) => {
	switch (type) {
		case 'ssh':
			LOG_SSH_STORE().outLogs(params)
			break
		case 'login':
			LOG_PANEL_STORE().outLoginLogEvent(params)
			break
		case 'crontab':
			LOG_PANEL_STORE().outShellLogEvent(params)
			break
		case 'website':
			const time = dateSwitch(params.day)
			LOG_SITE_STORE().outWebLogEvent(time, params.type)
			break
		default:
			break
	}
}

/**
 * @description 对应不同的日志类型，处理不同的tab点击事件
 * @param data  当前点击的tab数据
 * @param logsType 日志类型
 */
export const handleTabClick = (data: any, logsType: string) => {
	switch (logsType) {
		case 'soft':
			renderSoftLog(data)
			break
		case 'crontab':
			getCrontabLogs(data)
			break
		case 'audit':
			// const auditLogStore = LOG_AUDIT_STORE()
			// const { isRefreshList } = storeToRefs(auditLogStore)
			// isRefreshList.value = true
			break
	}
}

/**
 * @description 刷新日志
 */
export const refreshValue = (menuOptions: any, logsType: string) => {
	const tabProps = logsType === 'crontab' ? 'id' : 'name'
	const data = menuOptions.find((item: any) => String(item[tabProps]) === selectedItem.value)
	handleTabClick(data, logsType)
	Message.success('刷新成功')
}

export const desiredNpsDialog = (data?: any) => {
	return npsSurveyV2Dialog({
		type: 22,
		name: '日志',
		id: 999,
		...data,
	})
}

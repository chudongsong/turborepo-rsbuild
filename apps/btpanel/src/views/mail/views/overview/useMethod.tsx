import { userSurplus } from '@/api/mail'
import { Message, useDataHandle } from '@/hooks/tools'
import { npsSurveyV2Dialog } from '@/public'

export const todayData = ref<any>({
	period: {
		total: '--',
		used: '--',
		surplus: '--',
	},
	free: {
		total: '--',
		used: '--',
		surplus: '--',
	},
}) // 今日数据

/**
 * @description 获取数据
 * @param isForce 是否强制刷新
 * @param isTips 是否提示
 */
export const getUserSurplus = (isForce: boolean = false, isTips: boolean = false) => {
	useDataHandle({
		request: userSurplus(isForce ? { fresh: 1 } : {}),
		success: (res: any) => {
			Object.keys(todayData.value).forEach(key => {
				todayData.value[key] = res.data.hasOwnProperty(key) ? res.data[key] : '--'
			})
			if (isTips) Message.success('刷新成功')
		},
	})
}

/**
 * @description 打开使用说明
 */
export const openUseExplain = () => {
	window.open('https://www.bt.cn/bbs/thread-141971-1-1.html', '_blank', 'noopener,noreferrer')
}

/**
 * @description 打开需求反馈
 */
export const openNps = () => {
	npsSurveyV2Dialog({
		name: '宝塔邮局',
		type: 36,
		id: 63,
	})
}

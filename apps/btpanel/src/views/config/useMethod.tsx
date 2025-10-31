import { useDialog } from '@/hooks/tools'
import { getConfigStore } from './useStore'
import { isArray } from '@/utils'
import { getTaskTemplate } from '@/api/global'
import type { RiskConfig } from '@config/types.d'

const {
	refs: { panelConfig },
} = getConfigStore()

export const getTemplate = async (): Promise<any> => {
	const template: any = []
	const { data: res } = await getTaskTemplate()
	if (isArray(res.data) && res.data.length) {
		res.data.forEach((item: any) => {
			template.push({
				...item.template,
				module: item.send_type_list,
				title: item.title,
				type: item.source,
				tid: item.id,
				name: item.load_cls.name,
				advancedShow: item.advanced_default,
				used: item.used,
				tags: item.tags,
				can_create: item.can_create ?? true,
				is_pro: item.is_pro ?? false,
				description: item.description,
			})
		})
	}
	return template
}

export const openRiskTipsView = (config: RiskConfig) => {
	useDialog({
		title: '风险操作',
		component: () => import('@config/public/risktips/index.vue'),
		area: 50,
		showFooter: true,
		compData: config,
	})
}

/**
 * @description 告警设置数据格式化
 */
export const alarmSettingDataFormat = (data: any[]): any[] => {
	if (!isArray(data)) return []
	const order = [
		{
			name: 'wx_account',
			title: '微信公众号',
			ps: '宝塔微信公众号，用于接收面板消息推送',
			help: 'https://www.bt.cn/bbs/thread-108309-1-1.html',
		},
		{
			name: 'mail',
			title: '邮箱',
			ps: '宝塔邮箱消息通道，用于接收面板消息推送',
			help: 'https://www.bt.cn/bbs/thread-108097-1-1.html',
		},
		{
			name: 'dingding',
			title: '钉钉',
			ps: '宝塔钉钉消息通道，用于接收面板消息推送',
			help: 'https://www.bt.cn/bbs/thread-108081-1-1.html',
		},
		{
			name: 'feishu',
			title: '飞书',
			ps: '宝塔飞书消息通道，用于接收面板消息推送',
			help: 'https://www.bt.cn/bbs/thread-108274-1-1.html',
		},
		{
			name: 'weixin',
			title: '企业微信',
			ps: '宝塔企业微信消息通道，用于接收面板消息推送',
			help: 'https://www.bt.cn/bbs/thread-108116-1-1.html',
		},
		{
			name: 'sms',
			title: '短信通知',
			ps: '宝塔短信通知，用于接收面板消息推送',
			help: 'https://www.bt.cn/bbs/thread-108758-1-1.html',
		},
		{
			name: 'webhook',
			title: '自定义消息通道',
			ps: '宝塔自定义API信息通道，用于接收面板消息推送',
			help: 'https://www.bt.cn/bbs/thread-143326-1-1.html',
		},
	]
	// 获取相应类型的数据
	const result = order.map(type => {
		return {
			name: type.name,
			type: type.name,
			title: type.title,
			ps: type.ps,
			help: type.help,
			list: data.filter((item: any) => item.sender_type === type.name),
		}
	})
	return result
}

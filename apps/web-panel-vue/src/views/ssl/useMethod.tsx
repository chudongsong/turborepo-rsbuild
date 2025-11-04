import { useDialog } from '@/hooks/tools'

/**
 * @description 批量设置分类
 * @returns {Promise<App>}
 */
export const setClassDialog = (itemList: any, type: string) =>
	useDialog({
		isAsync: true,
		title: `批量设置${type === 'certificate' ? '证书分组' : '域名分类'}`,
		area: 42,
		component: () => import('@ssl/public/batch-group-settings/index.vue'),
		compData: {
			type,
			itemList,
		},
		showFooter: true,
	})

/**
 * @description 结果详情
 * @returns {Promise<VueConstructor>}
 */
export const resultDialog = async (data: any) => {
	await useDialog({
		title: '批量操作结果',
		area: 46,
		component: () => import('@components/extension/bt-result/index.vue'),
		compData: {
			resultTitle: data.resultTitle,
			resultData: data.resultData,
			resultColumn: data.resultColumn,
		},
	})
}

/**
 * @description 设置告警
 */
export const alarmDialog = (data: any) =>
	useDialog({
		isAsync: true,
		title: `${data.title ? '证书' : '域名'}到期提醒配置`,
		area: 50,
		compData: data,
		component: () => import('@ssl/public/expiration-alert/index.vue'),
		showFooter: true,
		confirmText: '保存配置',
		onCancel: data.cancel,
	})

// DNS状态配置弹窗 ids: 批量配置
export const dnsStatusDialog = (row: any, rowList?: any) =>
	useDialog({
		isAsync: true,
		title: `${rowList && rowList.length ? '批量' : ''}配置DNS接口`,
		area: 45,
		component: () => import('@domain/views/domain-manger/configure-DNS-interface/index.vue'),
		compData: {
			row,
			rowList,
		},
		showFooter: true,
	})

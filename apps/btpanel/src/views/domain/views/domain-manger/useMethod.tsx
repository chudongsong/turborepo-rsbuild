import { TableColumnProps } from '@/components/data/bt-table/types'
import { useCheckbox, useOperate } from '@hooks/tools/table/column'
import { getSslStore } from '@ssl/useStore'
import { ElSwitch } from 'element-plus'
import { useMessage } from '@/hooks/tools'
import { useDialog } from '@/hooks/tools'
import { alarmDialog, dnsStatusDialog } from '@ssl/useMethod'

const MessageMethod = useMessage()

const {
	refs: { typeList, isRefreshDomainList },
} = getSslStore()

// 修复 typeList 类型
const typeListRef = typeList as Ref<any[]>

// 域名列表
export const useDomainTableColumns = ({ closeAlarm, delDomain }: any) => {
	return shallowRef<TableColumnProps[]>([
		useCheckbox(),
		{
			label: '域名',
			prop: 'domain',
			width: 250,
		},
		{
			label: '分组',
			width: 180,
			isCustom: true,
			render: (row: any) => {
				const item = typeListRef.value.find((item: any) => item.id == row.type_id)
				return item ? item.name : '未分组'
			},
		},
		{
			label: '解析数量',
			prop: 'sbd_count',
			isCustom: true,
		},
		{
			label: 'DNS接口',
			width: 200,
			isCustom: true,
			render: (row: any) => {
				return (
					<div class={'flex items-center'}>
						{row.dns?.dns_name ? (
							<span>{row.dns.dns_name}</span>
						) : (
							<span class={'bt-link cursor-pointer'} onClick={() => dnsStatusDialog(row)}>
								未配置
							</span>
						)}
						<div class={'el-divider el-divider--vertical'}></div>
						<span class={'bt-link cursor-pointer'} onClick={() => dnsStatusDialog(row)}>
							点击配置
						</span>
					</div>
				)
			},
		},
		{
			label: '到期时间',
			isCustom: true,
			render: (row: any) => {
				// 计算到期时间是否已经过期，过期显示红色
				// 获取今日00:00时间戳
				const todayStart = new Date().setHours(0, 0, 0, 0)
				const isExpired = row.endtime !== 0 && new Date(row.endtime).getTime() / 1000 < todayStart / 1000

				// 当剩余时间距离今日小于7天时，显示橙色
				const isOrange = row.endtime !== 0 && new Date(Number(row.endtime)).getTime() - new Date().getTime() < 7 * 24 * 60 * 60 * 1000
				return (
					<span
						class={'cursor-pointer ' + (isExpired ? 'bt-danger' : isOrange ? 'bt-warn' : 'bt-link')}
						onClick={() => {
							setDateEndDialog(row)
						}}>
						{isExpired ? '已过期' : row.endtime === 0 ? '未设置' : row.endtime}
					</span>
				)
			},
		},
		{
			prop: 'report_id',
			label: '到期告警',
			render: (row: any) => {
				// 计算到期时间是否已经过期，过期显示红色
				const todayStart = new Date().setHours(0, 0, 0, 0)
				const isExpired = row.endtime !== 0 && new Date(row.endtime).getTime() / 1000 < todayStart / 1000
				let status = row.report_id == '' ? false : true
				return (
					<ElSwitch
						size="small"
						v-model={status}
						disabled={(row.endtime === 0 || isExpired) && !status}
						onChange={(val: any) => {
							if (val) {
								row.report_id = '1'
								alarmDialog({
									...row,
									cancel: () => {
										nextTick(() => {
											row.report_id = ''
										})
									},
								})
							} else {
								closeAlarm(row)
							}
						}}></ElSwitch>
				)
			},
		},
		useOperate([
			{
				onClick: (row: any) => {
					if (!row.dns_id) {
						MessageMethod.error('请先配置DNS')
						dnsStatusDialog(row)
					} else {
						domainDnsDialog(row)
					}
				},
				title: '解析',
			},
			{
				onClick: (row: any) => {
					if (row.dns?.dns_name) {
						subDomainDialog(row)
					} else {
						MessageMethod.error('请先配置DNS')
						dnsStatusDialog(row)
					}
				},
				title: '解析记录管理',
				width: 120,
			},
			{
				onClick: (row: any) => {
					delDomain(row)
				},
				title: '删除',
			},
		]),
	])
}

// 全局DNS配置弹窗
export const dnsSettingDialog = () =>
	useDialog({
		isAsync: true,
		title: `DNS接口设置`,
		area: 70,
		component: () => import('./global-DNS/index.vue'),
	})

/**
 * @description 设置到期时间弹窗 批量设置
 * @returns {Promise<VueConstructor>}
 */
export const setDateEndDialog = (row: any, rowList?: any) =>
	useDialog({
		title: `${rowList && rowList.length ? '批量设置' : `设置【${row.domain}】`}到期时间`,
		area: 46,
		component: () => import('./set-expiration-time/index.vue'),
		compData: {
			row,
			rowList,
		},
		showFooter: true,
	})

// 域名解析弹窗
export const domainDnsDialog = (row: any) =>
	useDialog({
		isAsync: true,
		title: `【${row.domain}】快速解析`,
		area: 60,
		component: () => import('./parsing-domain/index.vue'),
		compData: {
			row,
		},
		showFooter: true,
	})

// 解析记录管理弹窗
export const subDomainDialog = (row: any) =>
	useDialog({
		isAsync: true,
		title: `【${row.domain}】解析记录管理`,
		area: 110,
		component: () => import('./parsing-record-management/index.vue'),
		compData: {
			row,
		},
	})

// 创建网站弹窗
export const createSiteDialog = (row: any) => {
	console.log(row, 'row')
	useDialog({
		title: `创建网站 - 【${row.domain}】`,
		area: 80,
		component: () => import('../domain-register/site-add/index.vue'),
		btn: ['创建', '取消'],
		showFooter: true,
		compData: {
			domainId: row.id,
			domainName: row.domain,
			type: 'local',
		},
	})
}

// 处理修改解析IP
export const handleModifyIp = (ipSearchValue: string) => {
	useDialog({
		title: '修改解析IP',
		area: 50,
		btn: ['修改', '取消'],
		compData: {
			currentIp: ipSearchValue,
		},
		component: () => import('@domain/views/domain-register/domain-ip-edit/index.vue'),
		onConfirm: () => {
			isRefreshDomainList.value = true
		}
	})
}

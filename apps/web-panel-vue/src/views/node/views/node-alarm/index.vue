<template>
	<div class="node-clb-http module-ui">
		<BtTableGroup>
			<template #header-left>
				<div class="flex items-center">
					<BtBtnGroup :options="tableBtnGroup" />
				</div>
			</template>
			<template #header-right>
				<div class="flex items-center">
					<BtSearch class="mr-[10px]" placeholder="请输入节点地址或备注" :class="`!w-[210px]`" />
					<BtColumn />
				</div>
			</template>
			<template #content>
				<BtTable :min-height="mainHeight" />
			</template>
			<template #footer-left>
				<BtBatch />
			</template>
			<template #footer-right>
				<!-- <BtPage /> -->
			</template>
		</BtTableGroup>
	</div>
</template>

<script setup lang="tsx">
import { useGlobalStore } from '@/store/global'
import { useDialog } from '@/hooks/tools'
import { checkObjKey, getPageTotal, isUndefined } from '@/utils'
import { ElTooltip } from 'element-plus'
import { useAllTable, useBatch, useRefreshList } from '@/hooks/tools'
import { useCheckbox, useOperate, useStatus } from '@/hooks/tools/table/column'


import { batchClbHttpOptions, delClbAlarm, editAlarmEvent, onChangeStatus } from './useController'

import { useNodeAlarmStore } from './useStore'
const { nodeAlarmRefresh } = useNodeAlarmStore()

import { getAlarmList } from '@/api/node'

const { mainHeight, push, getSenderAlarmListInfo } = useGlobalStore()

const tableBtnGroup: any = [
	{
		content: '添加告警',
		dropdownClass: 'bg-white',
		splitButton: true,
		active: true,
		event: () => editAlarmEvent()
	},
]

const useTableBatch = useBatch(batchClbHttpOptions)

const map = new Map([
	['wx_account', '微信公众号'],
	['feishu', '飞书'],
	['mail', '邮箱'],
	['sms', '短信通知'],
	['dingding', '钉钉'],
	['weixin', '企业微信'],
	['webhook', '自定义消息通道'],
])

let first = true


const { BtTable, BtRefresh, BtSearch, BtColumn, BtBatch, BtErrorMask, refresh, } = useAllTable({
	request: async data => {
		if (first) {
			await getSenderAlarmListInfo()
			first = false
		}
		const { data: resData } = await getAlarmList({ keyword: data.search, template_ids: '["220", "221", "222", "223"]' })
		return {
			data: resData.data?.map((item: any) => {
				// 获取告警设置类型账号的id数组
				const { sender } = item
				return {
					...item,
					alarmAccounts: sender.map((id: any) => {
						const account: any = push.value.config.find((accounts: any) => accounts.id === id)
						if (!account) return null
						if (account.sender_type === 'sms') {
							return { id, type: account.sender_type, title: '短信' }
						}
						return {
							id,
							type: account.sender_type,
							title: map.get(account.sender_type) || '',
							account: account.data.title,
						}
					}),
				}
			}),
			total: 0,
			other: {},
		}
	},
	columns: [
		useCheckbox({ type: 'page', key: 'id' }),
		{
			label: '名称',
			prop: 'title',
		},
		useStatus({
			minWidth: 100,
			event: onChangeStatus,
			data: ['停用', '正常'],
		}),
		{
			label: '告警方式',
			width: 260,
			render: (row: any) => {
				const accounts = (row.alarmAccounts || []).filter((item: any) => item !== null);
				const tooltipContent = accounts
					.map((item: any) => item?.type === 'sms' ? '短信通知' : `${item?.account || ''}(${item?.title || ''})`)
					.join(',');
				const displayContent = accounts
					.map((item: any) => item?.type === 'sms' ? '短信通知' : `${item?.account}(${item.title})`)
					.join(',');

				return (
					<ElTooltip content={tooltipContent} placement="top" open-delay={500}>
						<span>{displayContent}</span>
					</ElTooltip>
				);
			},
		},
		{
			label: '告警条件',
			prop: 'view_msg',
			render: (row: any) => {
				return <span innerHTML={row.view_msg}></span>
				// return <div>状态码不在[{row.successCode}] 内 <div class="color-[#999]">{row.failTimes} 次后停止推送</div></div>
			}
		},
		useOperate([
			{ onClick: editAlarmEvent, title: '修改' },
			{ onClick: delClbAlarm, title: '删除' },
		]),
	],
	extension: [
		useTableBatch,
		useRefreshList(nodeAlarmRefresh),
	],
})

</script>

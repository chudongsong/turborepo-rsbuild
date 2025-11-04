<template>
	<BtTableGroup class="p-[2rem]">
		<template #header-left>
			<BtButton type="primary" @click="setAlarmModelEvent()">添加</BtButton>
		</template>
		<template #content>
			<BtTable :max-height="350" />
		</template>
	</BtTableGroup>
</template>

<script lang="tsx" setup>
import type { RequestProps } from '@/hooks/tools/message/types'

import { setBindStatus, setDefaultSender, testBindAlarm, unBindCommonAccount, unBindWxAccount } from '@/api/global'
import { useConfirm, useDataHandle, useDialog, useMessage, useTable } from '@/hooks/tools'
import { isString } from '@/utils'

import { useOperate } from '@hooks/tools/table/column'
import { useGlobalStore } from '@/store/global'
import { getConfigStore } from '@/views/config/useStore'
import BtDivider from '@/components/other/bt-divider'

import Mail from './config-view/mail.vue'
import WebHook from './config-view/web-hook.vue'
import WxAccount from './config-view/wx-account.vue'
import Common from './config-view/common.vue'

import type { AlarmRowProps } from './types.d'

const {
	refs: { isRefreshList },
} = getConfigStore()

interface Props {
	compData: {
		type: string
		title: string
		callback: AnyFunction
	}
}

const props = withDefaults(defineProps<Props>(), {
	compData: () => ({
		type: '',
		title: '',
		callback: () => {},
	}),
})
const { compData } = toRefs(props)
const { getSenderAlarmListInfo, push } = useGlobalStore()

/**
 * @description 获取告警配置
 * @param {boolean} refresh 是否刷新
 */
const getSenderAlarm = async (refresh = false) => {
	try {
		await getSenderAlarmListInfo(refresh)
	} catch (error) {
		console.log(error)
	}
	return push.value.config
}
/**
 * @description 表格数据处理
 */
const tableDataHandling = async () => {
	const data = await getSenderAlarm()
	const findData = data.filter((item: AnyObject) => item.sender_type === compData.value.type) || []
	return { data: findData, total: findData.length, other: data }
}

/**
 * @description 打开告警配置
 * @param {string} type 类型
 */
const openAlarmModel = (type: string) => {
	switch (type) {
		case 'mail':
			return Mail
		case 'webhook':
			return WebHook
		case 'wx_account':
			return WxAccount
		default:
			return Common
	}
}

/**
 * @description 设置告警模型
 * @param {boolean} isEdit 是否编辑
 * @param {AlarmRowProps} row 行数据
 */
const setAlarmModelEvent = async (row?: AlarmRowProps) => {
	const AlarmModel = openAlarmModel(compData.value.type)
	await useDialog({
		title: `${props.compData.title}配置`,
		area: props.compData.type === 'webhook' ? 60 : 50,
		compData: {
			row,
			...compData.value, // 告警信息
			callback: () => {
				refresh()
				isRefreshList.value = true
			},
		},
		showFooter: props.compData.type !== 'wx_account',
		component: AlarmModel,
	})
}

/**
 * @description 设置默认告警事件
 * @param {AlarmRowProps} row 行数据
 */
const setDefaultAlarmEvent = async (row: AlarmRowProps) => {
	try {
		await useConfirm({
			title: `设置默认配置`,
			content: `设置【${row.data.title}】为默认配置后，将会覆盖原有默认配置，是否继续操作？`,
		})
		await useDataHandle({
			loading: '正在设置，请稍后...',
			message: true,
			request: setDefaultSender({ sender_id: row.id, sender_type: row.sender_type }),
			success: (rdata: RequestProps) => {
				if (rdata.status) refresh()
			},
		})
	} catch (error) {
		console.log(error)
	}
}

/**
 * @description 设置状态告警事件
 * @param {AlarmRowProps} row 行数据
 * @param {string} label 标签
 */
const setStatusAlarmEvent = async (row: AlarmRowProps, label: string) => {
	try {
		await useConfirm({
			title: `${row.used ? '禁用' : '启用'}${label}【${row.data.title}】`,
			content: `您真的要${row.used ? '禁用' : '启用'}${label}【${row.data.title}】吗？`,
		})
		await useDataHandle({
			loading: '正在设置，请稍后...',
			message: true,
			request: setBindStatus({ sender_id: row.id }),
			success: (rdata: RequestProps) => {
				if (rdata.status) refresh()
			},
		})
	} catch (error) {
		console.log(error)
	}
}

/**
 * @description 设置告警模块测试
 * @param {AlarmRowProps} row 行数据
 */
const setAlarmTestEvent = async (row: AlarmRowProps) => {
	try {
		await useDataHandle({
			loading: '正在测试，请稍后...',
			request: testBindAlarm({ sender_id: row.id }),
			success: (res: any) => {
				if (isString(res.data.data) && !res.status) {
					useMessage().error(`${res.msg  }【${  res.data.data  }】`)
				} else {
					useMessage().request(res)
				}
			},
		})
	} catch (error) {
		console.log(error)
	}
}

/**
 * @description 解绑告警事件
 * @param {AlarmRowProps} row 行数据
 * @param {string} label 标签
 */
const unbindAlarmEvent = async (row: AlarmRowProps, label: string) => {
	try {
		await useConfirm({
			title: `解绑【${row.data.title}】${label}`,
			content: `您真的要解绑${label}【${row.data.title}】吗？`,
		})
		// 解绑参数
		const params: { sender_id: string } = { sender_id: row.id }
		const isWx = row.sender_type === 'wx_account' // 是否是微信
		await useDataHandle({
			loading: '正在解绑，请稍后...',
			message: true,
			request: isWx ? unBindWxAccount(params) : unBindCommonAccount(params),
			success: (rdata: RequestProps) => {
				if (rdata.status) {
					refresh()
					isRefreshList.value = true
				}
			},
		})
	} catch (error) {
		console.log(error)
	}
}

/**
 * @description 创建列
 */
const createColumn = () => {
	// 标题
	const title = [
		{ label: '邮箱', name: 'mail' },
		{ label: '公众号', name: 'wx_account' },
		{ label: '钉钉机器人', name: 'dingding' },
		{ label: '飞书机器人', name: 'feishu' },
		{ label: '企业微信机器人', name: 'weixin' },
		{ label: '自定义Webhook', name: 'webhook' },
	]
	const label = title.find(item => item.name === compData.value.type)?.label || '自定义Webhook'
	return [
		{
			label,
			prop: 'data.title',
			render: (row: AlarmRowProps) => (
				<div>
					{row.data?.title}
					{row.original ? '【默认配置】' : ''}
				</div>
			),
		},
		{
			label: '状态',
			width: 65,
			render: (row: AlarmRowProps) => {
				return (
					<span class={`${row.used ? 'bt-link' : 'bt-link !text-danger'}`} onClick={() => setStatusAlarmEvent(row, label)}>
						{row.used ? '已启用' : '未启用'}
					</span>
				)
			},
		},
		useOperate([
			{ onClick: setDefaultAlarmEvent, isHide: (row: AlarmRowProps) => row.original, title: '设置默认', width: 60 },
			{
				onClick: setAlarmModelEvent,
				isHide: (row: AlarmRowProps) => row.sender_type === 'wx_account',
				title: '编辑',
			},
			{
				title: '测试',
				render(row: AlarmRowProps) {
					return (
						<div class="item-center inline-flex">
							<span
								class="bt-link"
								onClick={async () => {
									if (row.load) return
									row.load = true
									await setAlarmTestEvent(row)
									row.load = false
								}}>
								{row.load ? '测试中' : '测试'}
							</span>
							<BtDivider class="mt-[4px]" />
						</div>
					)
				},
			},
			{ onClick: (row: AlarmRowProps) => unbindAlarmEvent(row, label), title: '解绑' },
		]),
	]
}

// 表格
const { BtTable, refresh } = useTable({
	request: tableDataHandling,
	columns: createColumn(),
})

defineExpose({ onCancel: props.compData.callback })
</script>

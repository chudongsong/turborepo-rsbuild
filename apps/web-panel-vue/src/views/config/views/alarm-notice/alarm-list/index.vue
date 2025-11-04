<template>
	<div style="overflow-y: hidden">
		<bt-table-group>
			<template #header-left>
				<el-button type="primary" @click="openAlarmForm(false)">添加任务</el-button>
			</template>
			<template #header-right>
				<bt-radio
					class="alarm-custom-radio mr-[1rem]"
					type="button"
					size="default"
					v-model="tableParam.status"
					:options="[
						{ label: '全部', value: '' },
						{ label: '运行中', value: true },
						{ label: '已停止', value: false },
					]"
					@change="getList"
				></bt-radio>
				<div>
					<bt-input-search v-model="tableParam.keyword" @search="getList" placeholder="请输入搜索关键词" class="!w-24rem" />
				</div>
			</template>
			<template #content>
				<bt-table ref="alarmListRef" v-bt-loading="tableLoad" :data="tableData" :column="tableColumn" :max-height="mainHeight - 300" description="告警列表为空" v-bt-loading:title="'正在加载告警列表，请稍后...'"> </bt-table>
			</template>
			<template #footer-left>
				<bt-table-batch :table-ref="alarmListRef" :options="TableBatchOptions" />
			</template>
		</bt-table-group>
	</div>
</template>

<script lang="tsx" setup>
import type { AlarmPushReq, AlarmPush } from '@config/types'
import type { TableBatchOptionsProps, TableBatchEventProps } from '@components/extension/bt-table-batch/types'
import type { TableColumnProps } from '@components/data/bt-table/types'

import { useGlobalStore } from '@store/global'

import { useDataHandle } from '@hooks/tools'
import { useBatchStatus, useCheckbox, useOperate, useStatus } from '@hooks/tools/table/column'
import { setTaskStatus, delTaskStatus } from '@/api/config'
import { useConfirm } from '@hooks/tools'
import { useDialog } from '@hooks/tools'

import { getAlarmTaskList } from '@/api/global'
import { getTemplate } from '../../../useMethod'
import { ElTooltip } from 'element-plus'
import { isBoolean } from '@utils/index'

const { mainHeight, push, getSenderAlarmListInfo } = useGlobalStore()

const alarmListRef = ref<any>()
const tableLoad = ref(false) // 表格loading
const tableData = ref<AlarmPush[]>([]) // 表格数据

const tableParam = reactive<any>({
	p: 1,
	rows: 10,
	status: '',
	keyword: '',
}) // 表格参数

const map = new Map([
	['wx_account', '微信公众号'],
	['feishu', '飞书'],
	['mail', '邮箱'],
	['sms', '短信通知'],
	['dingding', '钉钉'],
	['weixin', '企业微信'],
	['webhook', '自定义消息通道'],
])

/**
 * @description 打开告警表单
 */
const openAlarmForm = (row: any) => {
	const isEdit = !isBoolean(row)
	useDialog({
		title: `${isEdit ? '编辑' : '添加'}告警任务`,
		component: () => import('./alarm-form/index.vue'),
		area: 80,
		showFooter: true,
		compData: { isEdit, row, onRefresh: getList },
	})
}

/**
 * @description 打开告警记录
 */
const openAlarmRecord = (row: any) => {
	useDialog({
		title: `【${row.title}】告警记录`,
		component: () => import('./record.vue'),
		area: 80,
		compData: row,
	})
}

/**
 * @description 获取告警列表
 */
const getList = async () => {
	await useDataHandle({
		loading: tableLoad,
		request: getAlarmTaskList({ ...tableParam }),
		success: ({ data: res }: any) => {
			generateData(res.data)
		},
	})
}

/**
 * @description 生成表格数据
 * @param data
 */
const generateData = (data: AlarmPushReq) => {
	tableData.value = data?.map((item: any) => {
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
	})
}

/**
 * @description 切换状态
 */
const onChangeStatus = async (row: AlarmPush) => {
	await useConfirm({
		title: `${row.status ? '禁用' : '启用'}【${row.title}】任务`,
		content: `您真的要${row.status ? '禁用' : '启用'}【${row.title}】这个任务吗？`,
	})
	await useDataHandle({
		loading: '正在修改告警任务状态，请稍候...',
		request: setTaskStatus({ task_id: row.id, status: Number(!row.status) }),
		message: true,
		success: getList,
	})
}

/**
 * @description 删除告警
 * @param row
 */
const onDeleteEvent = async (row: any) => {
	await useConfirm({
		icon: 'warning-filled',
		title: '删除告警任务',
		content: '删除后将不再告警此条任务，是否继续？',
	})

	await useDataHandle({
		loading: '正在删除告警任务，请稍候...',
		request: delTaskStatus({ task_id: row.id }),
		message: true,
		success: getList,
	})
}

const useBatchEventHandle: TableBatchEventProps = async (batchConfirm, nextAll, selectList, options: TableBatchOptionsProps): Promise<void> => {
	const requestHandle = async (item: any, index: number) => {
		const { id: task_id, status } = item
		const requestList = new Map<string, AnyFunction>([
			['delete', delTaskStatus],
			['start', setTaskStatus],
			['stop', setTaskStatus],
		])
		const fn = requestList.get(value)
		switch (value) {
			case 'start':
				if (fn) return await fn({ task_id, status: 1 })
				break
			case 'stop':
				if (fn) return await fn({ task_id, status: 0 })
				break
			case 'delete':
				if (fn) return await fn({ task_id })
				break
		}
	}
	const { label, value } = options
	await batchConfirm({
		title: `批量${label}告警`,
		content: `即将批量${label}告警，是否继续操作?`,
		column: [{ label: '告警名称', prop: 'title' }, useBatchStatus()] as TableColumnProps[], // 弹窗配置
		onConfirm: async () => {
			await nextAll(requestHandle)
			getList()
			return false
		},
	})
}

const tableColumn = [
	useCheckbox(),
	{ prop: 'title', label: '标题', minWidth: 140, width: 300 },
	useStatus({
		minWidth: 100,
		event: onChangeStatus,
		data: ['停用', '正常'],
	}),
	{
		label: '告警方式',
		width: 260,
		render: (row: any) => {
			return h(
				ElTooltip,
				{
					content: row.alarmAccounts
						.filter(item => item !== null)
						.map((item: any) => (item?.type === 'sms' ? '短信通知' : `${item?.account || ''}(${item?.title || ''})`))
						.join(','),
					placement: 'top',
					openDelay: 500,
				},
				[
					h('span', [
						row.alarmAccounts
							.filter(item => item !== null)
							.map((item: any) => (item?.type === 'sms' ? '短信通知' : `${item?.account}(${item.title})`))
							.join(','),
					]),
				]
			)
		},
	},
	{
		label: '告警条件',
		minWidth: 180,
		render: (row: any) => <span innerHTML={row.view_msg}></span>,
	},
	useOperate([
		{ title: '告警记录', width: 70, onClick: openAlarmRecord },
		{ title: '编辑', onClick: (row: any) => openAlarmForm(row) },
		{ title: '删除', onClick: onDeleteEvent },
	]),
]

const TableBatchOptions = [
	{ label: '启动', value: 'start', event: useBatchEventHandle },
	{ label: '停止', value: 'stop', event: useBatchEventHandle },
	{ label: '删除', value: 'delete', event: useBatchEventHandle },
] as TableBatchOptionsProps[]

const init = async () => {
	await getSenderAlarmListInfo(true)
	await getList()
}

onMounted(init)

defineExpose({ init })
</script>
<style lang="css" scoped>
:deep(.alarm-custom-radio .el-radio-button__inner) {
	padding: 8px 15px !important;
}
</style>

<template>
	<div  class="min-h-[30rem]">
		<bt-install-mask v-if="!firewallInfo.init_status" width="38rem">
			<template #content>
				<InitFirewall />
			</template>
		</bt-install-mask>
		<bt-table-group>
			<template #header-left>
				<el-button type="primary" @click="openAddForwardView()"> 添加端口转发 </el-button>
				<RuleSetting type="forward" :refreshFn="getPortTranData"></RuleSetting>
			</template>
			<template #header-right>
				<bt-input-search class="!w-[32rem]" v-model="searchValue" @search="getPortTranData()" placeholder="请输入端口/来源" />
			</template>
			<template #content>
				<bt-table ref="portTransmitRef" :column="tableColumn" :data="tableData" v-bt-loading="loading" :description="'端口转发列表为空'" v-bt-loading:title="'正在加载端口转发列表，请稍后...'"></bt-table>
			</template>
			<template #footer-left>
				<bt-table-batch :table-ref="portTransmitRef" :options="TableBatchOptions" />
			</template>
			<template #footer-right>
				<bt-table-page :total="completedTotal" v-model:page="tableParam.p" v-model:row="tableParam.row" @change="getPortTranData()" name="forward" />
			</template>
		</bt-table-group>
	</div>
</template>
<script lang="tsx" setup>
import type { TableBatchDialogProps, TableBatchNextAllProps } from '@/components/extension/bt-table-batch/types'

import { getPortForward, setForwardRules } from '@/api/firewall'
import { useCheckbox } from '@/hooks/tools/table/column'
import { renderIconTip, useBatchEvent, useFirewallOperate } from '@firewall//useMethod'
import { useDataHandle, useDataPage } from '@hooks/tools'
import { useConfirm } from '@hooks/tools'
import { useDialog } from '@hooks/tools/dialog'

import RuleSetting from '@firewall/public/rule-setting/index.vue'
import { getFirewallStore } from '@/views/firewall/useStore'
import InitFirewall from '@firewall/views/system-firewall/init-firewall/index.vue'

const {
	refs: { systemTabActive, firewallInfo },
} = getFirewallStore()

const portTransmitRef = ref() // 表格ref
const tableData = ref<any>([]) //列表数据
const searchValue = ref('') // 搜索
const completedTotal = ref(0) // 总条数
const loading = ref(false) // 加载状态

// 表格接口请求
const tableParam = reactive({
	p: 1,
	row: 20,
})

/**
 * @description 打开添加IP规则弹窗
 */
const openAddForwardView = (isEdit?: boolean, row?: any) => {
	useDialog({
		title: isEdit ? '修改端口转发规则' : '添加端口转发规则',
		area: 44,
		component: () => import('./add-port-transmit.vue'),
		showFooter: true,
		compData: { ...row, isEdit, refreshFn: getPortTranData },
	})
}

/**
 * @description 切换列表页面
 */
const getPortTranData = async () => {
	if (systemTabActive.value !== 'forward') return
	await useDataHandle({
		loading,
		request: getPortForward({ query: searchValue.value }),
		data: {
			data: [Array, tableData],
			page: useDataPage(completedTotal),
		},
	})
}

/**
 * @description 处理行数据
 */
const handleRowParams = (row: any, operation: string) => {
	const params = {
		operation,
		protocol: row.Protocol.toLowerCase(),
		S_Address: row.S_Address,
		S_Port: row.S_Port,
		T_Address: row.T_Address,
		T_Port: row.T_Port,
	}
	return params
}

/**
 * @description 删除ip规则
 * @param {any} data ip规则行数据
 */
const deleteEvent = async (data?: any) => {
	await useConfirm({
		icon: 'warning-filled',
		title: '删除端口转发规则【源端口：' + data.S_Port + ' -> 目标端口：' + data.T_Port + '】',
		content: '删除选中规则后，该源端口将停止转发至目标端口，是否继续操作？',
	})
	await useDataHandle({
		loading: '正在删除IP规则，请稍后...',
		request: setForwardRules(handleRowParams(data, 'remove')),
		message: true,
		success: getPortTranData,
	})
}

const tableColumn = [
	useCheckbox(),
	{ label: '协议', prop: 'Protocol' },
	{ label: '源端口', prop: 'S_Port' },
	{
		label: '目标IP',
		render: (row: any) => (row.T_Address ? row.T_Address : '127.0.0.1'),
	},
	{ label: '目标端口', prop: 'T_Port' },
	{
		label: '时间',
		prop: 'addtime',
		renderHeader: () => renderIconTip('时间', '-- : 表示面板数据库中未记录创建时间，规则从系统中直接读取，忽略即可'),
	},
	{ label: '备注', prop: 'brief' },
	useFirewallOperate({
		editEvent: (row: any) => {
			openAddForwardView(true, row)
		},
		deleteEvent,
	}),
]

const TableBatchOptions = [
	{
		label: '删除',
		value: 'delete',
		event: async (batchConfirm: TableBatchDialogProps, nextAll: TableBatchNextAllProps) => {
			const requestHandle = async (item: any, index: number) => {
				return await setForwardRules(handleRowParams(item, 'remove'))
			}
			await useBatchEvent(batchConfirm, nextAll, requestHandle, { label: '端口', prop: 'T_Address' }, getPortTranData)
		},
	},
]

onMounted(() => getPortTranData())
</script>

<template>
	<bt-table-group>
			<template #content>
				<bt-table ref="lockListRef" :column="tableColumn" :data="tableData" max-height="700"></bt-table>
			</template>
			<template #footer-left>
				<bt-table-batch :table-ref="lockListRef" :options="TableBatchOptions" />
			</template>
		</bt-table-group>
</template>
<script lang="tsx" setup>
import type { TableBatchOptionsProps, TableBatchEventProps } from '@components/extension/bt-table-batch/types'
import type { TableColumnProps } from '@components/data/bt-table/types'
import { unlockIp,getBlockedIpList } from '@/api/firewall'
import { useConfirm, useDataHandle,useMessage } from '@/hooks/tools'
import { useOperate } from '@hooks/tools/table/column'
import { useCheckbox, useBatchStatus } from '@hooks/tools/table/column'
import { getFirewallStore } from '@firewall/useStore'

const {
	refs: { networkActive },
} = getFirewallStore()
const lockListRef = ref()

/**
 * @description 解封
 */
const unlock = async (row: any) => {
	await useConfirm({
		title: '解封IP',
		content: `解封后将允许【${row.ip}】进行访问，是否继续操作？`,
	})
	await useDataHandle({
		loading: '正在解封，请稍后...',
		request: unlockIp({ ip: row.ip, timeout: 86400 }),
		success: () => {
			useMessage().success('解封成功')
			init()
		},
	})
}
const tableColumn = [
	useCheckbox({key:'ip'}),
	{ label: 'IP', prop: 'ip',width:200 },
	{
		label: '封锁来源', render: (row: any) => {
		const type = row.source || 'Nginx防火墙'
		return <div title={type} >{type}</div>
		}
	},
	{
		label: '封禁原因', render: (row: any) => {
			const reason = row.reason || 'IP扫描过于频繁'
			// 长度超过20字符显示...
			if (reason.length > 20) {
				return <div title={reason} >{reason.slice(0, 20)}...</div>
			}
			return <div title={reason} >{reason}</div>
		}
	},
	useOperate([
		{ onClick: unlock, title: '解封' },
	]), // 操作
]
const tableData = ref([])
const useBatchEventHandle: TableBatchEventProps = async (batchConfirm, nextAll, selectList, options: TableBatchOptionsProps): Promise<void> => {
	const requestHandle = async (item: any, index: number) => {
		const { ip } = item
		const requestList = new Map<string, AnyFunction>([
			['unlock', unlockIp],
		])
		const fn = requestList.get(value)
		switch (value) {
			case 'unlock':
				if (fn) return await fn({ ip, timeout: 86400 })
				break
		}
	}
	const { label, value } = options
	await batchConfirm({
		title: `批量${label}`,
		content: `即将批量${label}选中的IP，是否继续操作?`,
		column: [{ label: '批量解封', prop: 'ip' }, useBatchStatus()] as TableColumnProps[], // 弹窗配置
		onConfirm: async () => {
			await nextAll(requestHandle)
			init()
			return false
		},
	})
}
const TableBatchOptions = [
	{ label: '解封', value: 'unlock', event: useBatchEventHandle },
] as TableBatchOptionsProps[]

const init = async () => {
	const { data } = await getBlockedIpList()
	tableData.value = data.map((item: any) => ({ ip: item,reason:'', source:'' }))
}

watch(networkActive, (val) => {
	if (val === 'blockde') {
		init()
	}
}, { immediate: true })
</script>
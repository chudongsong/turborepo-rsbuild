<template>
	<bt-table-group :class="{ 'p-[2rem]': isPopup }">
		<template #content>
			<BtTable :max-height="isPopup ? 500 : mainHeight - 240" :description="'检测历史列表为空'" />
		</template>
		<template #footer-right>
			<BtPage />
		</template>
		<template #popup></template>
	</bt-table-group>
</template>
<script lang="tsx" setup>
import type { HistoryTableDataProps, RiskTableDataProps } from '@/types/site'

import { getRisk, getSingleSiteRisk } from '@/api/site'
import { checkVariable, formatTime, getDuration, getPageTotal } from '@/utils'
import { useDialog } from '@hooks/tools'
import { useDynamicTable } from '@hooks/tools/table'
import { useGlobalStore } from '@store/global'

interface Props {
	compData: {
		isPopup?: boolean
		name: string
	}
}

const props = withDefaults(defineProps<Props>(), {
	compData: () => ({
		isPopup: false,
		name: '',
	}),
})

const { mainHeight } = useGlobalStore()

const isPopup = ref(props.compData.isPopup) // 是否弹窗
const { name } = props.compData

/**
 * @description 表格数据处理函数
 */
const tableDataHandling = async (params: any) => {
	const request = isPopup.value ? getSingleSiteRisk({ site_name: props.compData.name, ...params }) : getRisk({ ...params })

	const { data: response } = await request
	return {
		data: response.data || [],
		total: (response as any).page ? getPageTotal((response as any).page) : 0,
	}
}

/**
 * @description 查看报告
 * @param row 行数据
 */
const openHistoryReport = (row: HistoryTableDataProps) => {
	window.open('/project/content/report/html?id=' + row.testing_id, '_blank', 'noopener,noreferrer')
}

/**
 * @description 创建表格列配置
 */
const createColumn = () => [
	{ label: '网站列表', prop: 'site_name', width: 120 },
	{ label: '扫描URL总数', prop: 'scans', width: 100 },
	{
		label: '扫描耗时',
		prop: 'time',
		render: (row: any) => {
			return [row.end_time <= 1 || row.end_time - row.start_time <= 0 ? <span>0秒</span> : <span>{getDuration(row.end_time - row.start_time)}</span>]
		},
	},
	{
		label: '风险次数',
		prop: 'risks',
		render: (row: any) => {
			return [
				row.risks == 0 ? (
					<span>无风险</span>
				) : (
					<span class="bt-link !text-danger" onClick={() => openRiskDetails(row)}>
						{row.risks}
					</span>
				),
			]
		},
	},
	{
		label: '状态',
		prop: 'status',
		render: (row: any) => {
			return [(row.is_status === 0 && row.end_time === 0) || row.end_time === 1 ? <span class="text-red">扫描未完成</span> : row.is_status === 1 && row.end_time === 0 ? <span class="text-warning">扫描中</span> : <span>扫描完成</span>]
		},
	},
	{
		label: '扫描时间',
		prop: 'start_time',
		width: 200,
		render: (row: any) => {
			const time = checkVariable(row.start_time, 'number', 0) as unknown as number
			return <span>{formatTime(time)}</span>
		},
	},
	{
		label: '操作',
		align: 'right',
		render: (row: any) => {
			return [
				(row.is_status === 0 && row.end_time === 0) || row.end_time === 1 || (row.is_status === 1 && row.end_time === 0) ? (
					<span class="text-disabled cursor-not-allowed">扫描未完成</span>
				) : (
					<span class="bt-link" onClick={() => openHistoryReport(row)}>
						查看报告
					</span>
				),
			]
		},
	},
]

/**
 * @description 打开风险详情
 * @param row
 */
const openRiskDetails = (row: RiskTableDataProps) => {
	useDialog({
		title: '风险详情',
		area: [70, 55],
		component: () => import('./risk-detail.vue'),
		compData: row,
	})
}

// 使用动态表格
const tableConfig = useDynamicTable({
	request: tableDataHandling,
	columns: createColumn(),
})

const { BtTable, refresh } = tableConfig
const BtPage = (tableConfig as any).BtPage
</script>

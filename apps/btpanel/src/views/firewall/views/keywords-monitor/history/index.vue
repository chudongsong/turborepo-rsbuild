<template>
	<bt-table-group :class="{ 'p-[2rem]': isPopup }">
		<template #content>
			<bt-table ref="table" :column="tableColumn" :data="tableData" :max-height="isPopup ? 500 : null" v-bt-loading="tableLoad" :description="'检测历史列表为空'" v-bt-loading:title="'正在加载检测历史列表，请稍后...'"></bt-table>
		</template>
		<template #footer-right>
			<bt-table-page :total="completedTotal" v-model:page="tableParam.p" v-model:row="tableParam.limit" @change="getHistoryList" layout="prev, pager, next, total, jumper" />
		</template>
		<template #popup></template>
	</bt-table-group>
</template>
<script lang="tsx" setup>
import { getRisk, getSingleSiteRisk } from '@/api/firewall'
import { HistoryTableDataProps } from '@/types/firewall'
import { openRiskDetails } from '@firewall/useMethod'
import { useDataHandle, useDataPage } from '@hooks/tools'
import { useGlobalStore } from '@store/global'
import { checkVariable, formatTime, getDuration } from '@utils/index'

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

const tableLoad = shallowRef(false) // 加载状态
const tableData = ref<HistoryTableDataProps[]>([]) //列表数据
const completedTotal = ref(0) // 总条数

const isPopup = ref(props.compData.isPopup) // 是否弹窗
const { name } = props.compData

const tableParam = shallowReactive({
	p: 1,
	limit: 20,
})

/**
 * @description 查看报告
 * @param row 行数据
 */
const openHistoryReport = (row: HistoryTableDataProps) => {
	window.open('/project/content/report/html?id=' + row.testing_id, '_blank', 'noopener,noreferrer')
}

const tableColumn = [
	{ label: '网站列表', prop: 'site_name', showOverflowTooltip: true },
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
		render: (row: any) => {
			return [(row.is_status === 0 && row.end_time === 0) || row.end_time === 1 ? <span class="text-red">扫描未完成</span> : row.is_status === 1 && row.end_time === 0 ? <span class="text-warning">扫描中</span> : <span>扫描完成</span>]
		},
	},
	{
		label: '扫描时间',
		width: 150,
		render: (row: any) => {
			const time = checkVariable(row.start_time, 'number', 0)
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
 * @description 切换列表页面
 * @param {number} p 当前页码
 */
const getHistoryList = async (p: number = 1) => {
	await useDataHandle({
		loading: tableLoad,
		request: isPopup.value ? getSingleSiteRisk({ site_name: props.compData.name, ...tableParam }) : getRisk({ ...tableParam }),
		data: {
			data: [Array, tableData],
			page: useDataPage(completedTotal),
		},
	})
}

// 页面加载完成
onMounted(getHistoryList)
</script>

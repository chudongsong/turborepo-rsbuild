<template>
	<div class="sn-home" v-bt-loading="loading">
		<div class="sn-home-switch">
			<div class="flex items-center">
				<div class="mr-4 text-small">扫描感知</div>
				<el-switch v-model="scanPerception" :width="36" @change="changeStatus"></el-switch>
			</div>
			<div>
				<div class="flex items-center">
					<date-range v-model:type="time.type" v-model:value="time.data" @update:value="onUpdateTime"></date-range>
					<el-divider direction="vertical"></el-divider>
					<el-button @click="init">刷新</el-button>
					<el-button @click="exportData">导出</el-button>
					<el-button @click="advancedConfig">高级配置</el-button>
				</div>
			</div>
		</div>
		<div class="sn-home-overview sn-home-overview-green">
			<div class="text-secondary text-base">扫描概览</div>
			<div class="mt-[2rem]">
				<div class="sn-home-overview-item" v-for="(item, index) in riskLevelsOverview" :key="index">
					<div class="sn-home-overview-item-title">{{ item.title }}</div>
					<div class="sn-home-overview-item-num" :style="item.style">
						{{ item.value }}
					</div>
				</div>
			</div>
		</div>
		<bt-table-group>
			<template #content>
				<bt-table ref="scanListRef" :column="tableColumn" :data="tableData" max-height="400"></bt-table>
			</template>
			<template #footer-left>
				<bt-table-batch :table-ref="scanListRef" :options="TableBatchOptions" />
			</template>
		</bt-table-group>
	</div>
</template>
<script lang="tsx" setup>
import type { TableBatchOptionsProps, TableBatchEventProps } from '@components/extension/bt-table-batch/types'
import type { TableColumnProps } from '@components/data/bt-table/types'
import dateRange from './date.vue'
import { useConfirm, useDataHandle, useMessage, useDialog } from '@/hooks/tools'
import { useCheckbox, useBatchStatus } from '@hooks/tools/table/column'
import { getScanPerceptionOverview, toggleScanPerception, exportScanPerceptionIpList, blockIp } from '@/api/firewall'
import { useOperate } from '@hooks/tools/table/column'
import { formatTime, isString } from '@/utils'

const loading = ref(false)
const scanPerception = ref(false)
const tableData = ref([]) // 表格数据
const scanListRef = ref()

const riskLevelsOverview = ref([
	{ title: '今日扫描次数', value: 0, style: 'color: var(--el-color-text-primary)' },
	{ title: '今日扫描IP数', value: 0, style: 'color: var(--el-color-text-primary)' },
	{ title: '总扫描次数', value: 0, style: 'color: var(--el-color-text-primary)' },
])
const time = ref({
	type: 'today',
	data: getTimeData(),
})
const globalConfig = ref()

/**
 * @description 打开详情
 */
const openScanDetail = (row: any) => {
	useDialog({
		title: `${row.scan_ip} 扫描详情`,
		area: 50,
		compData: { ip: row.scan_ip },
		showFooter: false,
		component: () => import('./datails.vue'),
	})
}

/**
 * @description 封锁
 */
const showBlockConfirm = async (row: any) => {
	await useConfirm({
		title: '封禁IP',
		content: `是否封禁【${row.scan_ip}】24小时？`,
	})
	await useDataHandle({
		loading: '正在执行，请稍后...',
		request: blockIp({ ip: row.scan_ip, timeout: 86400 }),
		success: (res: any) => {
			useMessage().request(res)
		},
	})
}
const tableColumn = [
	useCheckbox({ key: 'scan_ip' }),
	{ label: '扫描IP', prop: 'scan_ip' },
	{ label: '扫描类型', prop: 'scan_type' },
	{
		label: '今日扫描次数',
		render: (row: any) => {
			return row.scan_count_today.toLocaleString() || 0
		},
	},
	{
		label: '总扫描次数',
		render: (row: any) => {
			return row.total_scan_count.toLocaleString() || 0
		},
	},
	{
		label: '被扫描的端口',
		render: (row: any) => {
			return <div innerHTML={row.scanned_ports} title={row.scanned_ports} class={`max-w-[25rem] truncate`}></div>
		},
	},
	{
		label: '扫描开始时间',
		prop: 'scan_start_time',
	},
	{
		label: '扫描持续时间',
		render: (row: any) => {
			return formatTimeConvert(row.scan_duration)
		},
	},
	useOperate([
		{ onClick: openScanDetail, title: '详情' },
		{ onClick: showBlockConfirm, title: '封锁' },
	]), // 操作
]

function getStartAndEndDate(date: Date) {
	const start = new Date(date)
	start.setHours(0, 0, 0, 0) // 设置为当天 00:00:00.000

	const end = new Date(date)
	end.setHours(23, 59, 59, 999) // 设置为当天 23:59:59.999

	return { start, end }
}

// 获取时间
function getTimeData(): [number, number] {
	const { start, end } = getStartAndEndDate(new Date())
	return [start.getTime(), end.getTime()]
}
const onUpdateTime = () => {
	getOverview()
}
const changeStatus = async () => {
	try {
		await useDataHandle({
			loading: '正在设置扫描感知开关,请稍后...',
			request: toggleScanPerception({ switch_type: 'scan_sensing', status: scanPerception.value }),
			success: (res: any) => {
				if (isString(res.data.data) && !res.status) {
					useMessage().error(res.msg + '【' + res.data.data + '】')
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
 * @description 导出
 */
const exportData = async () => {
	await useConfirm({
		title: '导出IP列表',
		content: '确定要导出当前扫描IP列表吗？',
	})
	await useDataHandle({
		loading: '正在执行，请稍后...',
		request: exportScanPerceptionIpList(),
		success: (res: any) => {
			if (res.data.status) {
				window.open('/download?filename=' + res.data.url, '_blank', 'noopener,noreferrer')
			} else {
				useMessage().error(res.data.msg)
			}
		},
	})
}
/**
 * @description 高级配置
 */
const advancedConfig = async () => {
	await useDialog({
		title: '高级配置',
		area: 45,
		compData: { config: globalConfig.value },
		showFooter: false,
		component: () => import('./advanced.vue'),
	})
}
const useBatchEventHandle: TableBatchEventProps = async (batchConfirm, nextAll, selectList, options: TableBatchOptionsProps): Promise<void> => {
	const requestHandle = async (item: any, index: number) => {
		const { scan_ip } = item
		const requestList = new Map<string, AnyFunction>([['lock', blockIp]])
		const fn = requestList.get(value)
		switch (value) {
			case 'lock':
				if (fn) return await fn({ ip: scan_ip, timeout: 86400 })
				break
		}
	}
	const { label, value } = options
	await batchConfirm({
		title: `批量${label}`,
		content: `即将批量${label}选中的IP，是否继续操作?`,
		column: [{ label: '批量封锁', prop: 'scan_ip' }, useBatchStatus()] as TableColumnProps[], // 弹窗配置
		onConfirm: async () => {
			await nextAll(requestHandle)
			getOverview()
			return false
		},
	})
}
const TableBatchOptions = [{ label: '封锁', value: 'lock', event: useBatchEventHandle }] as TableBatchOptionsProps[]
/**
 * @description 恢复默认时间
 */
const recoverDefaultTime = () => {
	time.value.data = getTimeData()
	tableData.value = []
}
/**
 * @description 获取概览
 */
const getOverview = async () => {
	const { data } = await getScanPerceptionOverview(formatScanTime())
	const ov = data.overview
	riskLevelsOverview.value[0].value = ov.scan_count_today.toLocaleString()
	riskLevelsOverview.value[1].value = ov.ip_count_today.toLocaleString()
	riskLevelsOverview.value[2].value = ov.total_scan_count.toLocaleString()

	// 开关
	scanPerception.value = ov.scan_status
	// 高级配置
	globalConfig.value = ov

	tableData.value = data.scan_info
}
/**
 * @description 格式化扫描时间
 */
const formatScanTime = () => {
	return {
		start_timestamp: formatTime(time.value.data[0], 'yyyy-MM-dd'),
		end_timestamp: formatTime(time.value.data[1], 'yyyy-MM-dd'),
	}
}
/**
 * @description 格式转换 【02:28:15】转换成【148分15秒】。超过999分时显示999+，等于0时显示-
 * @param {string} timeStr 时间字符串
 */
const formatTimeConvert = (timeStr: string) => {
	const time = timeStr.split(':')
	const hours = parseInt(time[0])
	const minutes = parseInt(time[1])
	const seconds = parseInt(time[2])
	if (hours > 999) {
		return '999+'
	} else if (timeStr === '00:00:00') {
		return '-'
	} else {
		return `${hours * 60 + minutes}分${seconds}秒`
	}
}

const init = () => {
	recoverDefaultTime()
	getOverview()
}

onMounted(() => init())
</script>
<style lang="css" scoped>
.sn-home-switch {
	@apply flex justify-between items-center h-[4.2rem] mb-[1rem];
}
.sn-home-note {
	@apply text-warningDark ml-[1.6rem] flex-1 rounded-small bg-[var(--el-color-warning-light-9)] h-[3rem] leading-[3rem] px-[1rem];
}
.sn-home-overview {
	@apply mb-[2rem] p-[1.6rem] border-[0.1rem] border-lighter rounded-base;
}
.sn-home-overview-item {
	@apply inline-block min-w-[16rem] relative text-center;
}
.sn-home-overview-item-title {
	@apply text-tertiary text-medium mb-[1rem];
}
.sn-home-overview-item-num {
	@apply text-subtitleLarge font-bold leading-[3.6rem];
}
.sn-home-overview-item.line-border::after {
	@apply absolute right-0 top-[1rem] h-[4.8rem] border-right-[0.1rem] border-lighter content-[''];
}
.sn-home-overview-red {
	background: linear-gradient(to bottom, rgba(var(--el-color-danger-rgb), 0.1), rgba(var(--el-color-white-rgb), 0.1));
}
.sn-home-overview-yellow {
	background: linear-gradient(to bottom, rgba(var(--el-color-warning-rgb), 0.1), rgba(var(--el-color-white-rgb), 0.1));
}
.sn-home-overview-green {
	background: linear-gradient(to bottom, rgba(var(--el-color-success-rgb), 0.1), rgba(var(--el-color-white-rgb), 0.1));
}
.sn-home-list {
	@apply h-[40rem] overflow-auto border-[0.1rem] border-lighter rounded-base;
}
.sn-home-list-item {
	@apply grid grid-cols-5 justify-between border-b-[0.1rem] border-b-lighter h-[4.2rem] leading-[4.2rem] px-[1rem] text-tertiary;
}
.sn-home-list-item-type {
	@apply px-[1rem] py-[.4rem] rounded-small leading-[2.6rem];
}
.sn-home-list-item-type.green {
	@apply bg-[var(--el-color-primary-light-9)] text-primary;
}
.sn-home-list-item-type.org {
	@apply bg-[var(--el-color-warning-light-9)] text-warning;
}
.sn-home-list-item-type.red {
	@apply bg-[var(--el-color-danger-light-9)] text-danger;
}
</style>

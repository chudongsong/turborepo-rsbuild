<template>
	<div>
		<bt-table-group>
			<template #header-left>
				<el-button type="primary" @click="openAddMonitor()">添加监控</el-button>
				<el-button @click="openOwnThesaurus">自定义词库</el-button>
			</template>
			<template #content>
				<bt-table ref="portTable" :column="tableColumn" :data="tableData" v-bt-loading="loading" :description="'监控列表为空'" v-bt-loading:title="'正在加载监控列表，请稍后...'"></bt-table>
			</template>
			<template #popup></template>
		</bt-table-group>
	</div>
</template>
<script lang="tsx" setup>
import { delMonitorData, getMonitorList, scanMonitorData } from '@/api/firewall'
import { useOperate } from '@/hooks/tools/table/column'
import { methodMap, openRiskDetails } from '@/views/firewall/useMethod'
import { MonitorTableDataProps } from '@firewall/types'
import { useConfirm } from '@hooks/tools'
import { useDataHandle } from '@hooks/tools/data'
import { useDialog } from '@hooks/tools/dialog'
import { getSimplifyTime, isArray } from '@utils/index'

// 页面数据
const loading = ref<boolean>(false) // 加载状态
const tableData = ref<Array<MonitorTableDataProps>>() //列表数据

/**
 * @description 切换列表页面
 * @param {number} p 当前页码
 */
const getMonitorListEvent = async () => {
	await useDataHandle({
		loading,
		request: getMonitorList(),
		data: [Array, tableData],
	})
}

/**
 * @description 打开自定义词库
 */
const openOwnThesaurus = () => {
	useDialog({
		title: '自定义词库',
		area: 44,
		component: () => import('./own-thesaurus.vue'),
	})
}

/**
 * @description 修改监控
 * @param {any} data 行数据
 */
const updataRow = async (data: MonitorTableDataProps) => {}

/**
 * @description 删除监控
 * @param {any} data 行数据
 */
const deleteMonitorData = async (data: MonitorTableDataProps) => {
	await useConfirm({
		icon: 'warning-filled',
		title: '删除监控【' + data.name + '】',
		width: '34rem',
		content: '删除后无法继续监控该网站，是否继续？',
	})
	await useDataHandle({
		loading: '正在删除监控，请稍后...',
		request: delMonitorData({ id: data.id }),
		message: true,
	})
	getMonitorListEvent()
}

/**
 * @description 立即检测
 * @param {any} data 行数据
 */
const getScanEvent = async (data?: any) => {
	const res = await useDataHandle({
		request: scanMonitorData({ id: data.id }),
	})
	useDialog({
		title: '检测详情',
		area: [64, 50],
		btn: ['停止检测'],
		component: () => import('./scan-details.vue'),
		compData: { name: data.name, id: data.id, path_info: res.data?.path_info },
	})
}

/**
 * @description 关键词检测-修复计划任务
 * @returns {Promise<VueConstructor>}
 */
const keywordsRepairCrontab = (row: any) => {
	return useDialog({
		isAsync: true,
		title: `修复计划任务【${row.name}】`,
		area: 64,
		component: () => import('@firewall/views/keywords-monitor/monitor/repair-crontab.vue'),
		compData: { ...row, refreshEvent: getMonitorListEvent },
		showFooter: true,
	})
}

/**
 * @description 打开添加监控
 */
const openAddMonitor = (row?: any) => {
	useDialog({
		title: '添加监控',
		area: 68,
		showFooter: true,
		compData: { ...row, refreshEvent: getMonitorListEvent },
		component: () => import('./add-monitor.vue'),
	})
}

const tableColumn = [
	{ label: '监控名', prop: 'name' },
	{ label: '网站/URL', prop: 'url' },
	{
		label: '监控方式',
		prop: 'method',
		render: (row: any) => methodMap[row.method],
	},
	{
		label: '上一次检测时间',
		minWidth: 110,
		render: (row: any) => {
			if (isArray(row.last_scan_time) && !row.last_scan_time.length) {
				return '未检测'
			}
			if (row.last_scan_time) {
				return getSimplifyTime(row.last_scan_time)
			}
			return '未检测'
		},
	},
	{
		label: '上一次风险',
		minWidth: 90,
		render: (row: any) => {
			return [
				row.last_risk_count > 0 ? (
					<span class="bt-link !text-danger" onClick={() => openRiskDetails(row)}>
						{row.last_risk_count}
					</span>
				) : (
					<span>无风险</span>
				),
			]
		},
	},
	{
		label: '计划任务状态',
		prop: 'crontab_status',
		minWidth: 100,
		render: (row: any) => {
			return [
				row.crontab_status === 1 ? (
					<span>正常</span>
				) : (
					<span style="color:var(--el-color-warning);cursor:pointer" onClick={() => keywordsRepairCrontab(row)}>
						未设置
					</span>
				),
			]
		},
	},
	{
		label: '发送告警',
		prop: 'send_msg',
		render: (row: any) => {
			return (
				<span style={`color:${row.send_msg === 1 ? 'var(--el-color-primary)' : 'var(--el-color-warning)'};cursor:pointer`} onClick={() => openAddMonitor(row)}>
					{row.send_msg === 1 ? '已开启' : '未开启'}
				</span>
			)
		},
	},
	{
		label: '检测频率',
		prop: 'crontab_info',
		render: (row: any) => {
			if (!row.crontab_info) return row.crontab_info
			return row.crontab_info.cycle
		},
	},
	useOperate([
		{ onClick: getScanEvent, title: '立即检测', width: 70 },
		{ onClick: openAddMonitor, title: '编辑' },
		{ onClick: deleteMonitorData, title: '删除' },
	]),
]

onMounted(() => getMonitorListEvent())
</script>

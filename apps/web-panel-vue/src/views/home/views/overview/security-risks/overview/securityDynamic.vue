<template>
	<div>
		<el-tabs v-model="activeName" class="dynamic-tabs">
			<el-tab-pane label="安全动态" name="safeDynamic"> <bt-table ref="malwareTable" :column="tableColumn" :data="table.data" v-bt-loading="table.loading" max-height="185" v-bt-loading:title="'正在获取安全动态列表，请稍后...'"></bt-table></el-tab-pane>
			<!-- <el-tab-pane label="公告" name="second">公告</el-tab-pane> -->
		</el-tabs>
		<bt-dialog :title="`【${dialogData.scan_type}】详情`" v-model="dialogVisible" :area="53">
			<div class="p-[2rem]">
				<el-descriptions :column="2" size="small" border class="table-descriptions">
					<!-- <el-descriptions-item label="事件类型：">{{ dialogData.type }}</el-descriptions-item> -->
					<el-descriptions-item label="风险行为：">{{ dialogData.behavior }}</el-descriptions-item>
					<el-descriptions-item label="风险等级：">{{ riskLevelResult(dialogData.level).text }}</el-descriptions-item>
					<el-descriptions-item label="发现时间：">{{ formatTime(dialogData.time, 'yyyy-MM-dd HH:mm:ss') }}</el-descriptions-item>
					<el-descriptions-item label="扫描类型：">{{ dialogData.scan_type }}</el-descriptions-item>
					<el-descriptions-item label="描述：" :span="2">{{ dialogData.description }}</el-descriptions-item>
					<el-descriptions-item label="解决方案：" :span="2">{{ dialogData.solution }}</el-descriptions-item>
				</el-descriptions>
			</div>
		</bt-dialog>
	</div>
</template>
<script setup lang="tsx">
import { useOperate } from '@/hooks/tools/table/column'
import { getSecurityDynamic } from '@/api/home'
import { formatTime } from '@/utils'

interface RiskEvents {
	type: string
	behavior: string
	level: number
	time: string
	scan_type: string
	description: string
	solution: string
}
const activeName = ref('safeDynamic')

const dialogVisible = ref(false)
const dialogData = ref<RiskEvents>({ type: '', behavior: '', level: 0, time: '', scan_type: '', description: '', solution: '' })

const table = ref({
	total: 0,
	loading: false,
	data: [] as RiskEvents[],
})
const tableColumn = [
	{
		label: '风险行为',
		prop: 'description',
		render: (row: any) => {
			return (
				<span class="truncate !w-[12rem]" title={row.description}>
					{row.description}
				</span>
			)
		},
	},
	{
		label: '风险等级',
		prop: 'level',
		width: 64,
		render: (row: any) => {
			const { text, style } = riskLevelResult(row.level)
			return <span style={style}>[{text}]</span>
		},
	},
	{
		label: '发现时间',
		prop: 'time',
		width: 64,
		render: (row: any) => formatTime(row.time, 'MM-dd'),
	},
	useOperate([
		{
			onClick: (row: any) => {
				dialogVisible.value = true
				dialogData.value = row
			},
			title: '详情',
		},
	]),
]

const riskLevelResult = (num: number) => {
	switch (num) {
		case 2:
			return { text: '中危', style: 'color: var(--el-color-warning-light-3)' }
		case 3:
			return { text: '高危', style: 'color: var(--el-color-danger)' }
		case 4:
			return { text: '紧急', style: 'color: var(--el-color-danger-dark-2)' }
		default:
			return { text: '--', style: 'color: var(--el-color-black)' }
	}
}
// 获取安全动态列表
const getListData = async () => {
	table.value.loading = true
	try {
		const { data } = await getSecurityDynamic()
		table.value.data = data.events
	} finally {
		table.value.loading = false
	}
}
defineExpose({
	getListData,
})
</script>
<style lang="css" scoped>
.dynamic-tabs :deep(.el-tabs__header) {
	margin-bottom: 8px;
}
.dynamic-tabs :deep(.el-empty) {
	padding: 22px 0 !important;
}
</style>

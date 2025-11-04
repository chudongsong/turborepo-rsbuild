<template>
	<div>
		<BtTableGroup>
			<template #header-left>
				<el-button @click="startLogScan" type="primary">日志扫描</el-button>
				<el-button
					type="default"
					:class="{
						'not-status': !Boolean(scanData.status),
					}"
					@click="openPeriodicScan">
					定期扫描
					<i :class="`text-small svgtofont-icon-${!scanData.status ? 'stop text-danger' : 'start text-primary'} `"></i>
				</el-button>
				<el-button @click="delAllLogData">清空扫描日志</el-button>
			</template>
			<template #content>
				<BtTable :max-height="tableHeight" />
			</template>
			<template #footer-right>
				<BtPage />
			</template>
		</BtTableGroup>
		<ul class="mt-8px leading-8 text-small list-disc ml-20px">
			<li>
				日志安全分析：扫描网站(.log)日志中含有攻击类型的请求(类型包含：
				<span class="text-danger">xss,sql,san,php</span>
				)
			</li>
			<li>分析的日志数据包含已拦截的请求</li>
			<li>如日志文件过大，扫描可能等待时间较长，请耐心等待</li>
		</ul>
	</div>
</template>
<script lang="tsx" setup>
import { useDynamicTable, useRefreshList } from '@/hooks/tools'
import { useGlobalStore } from '@store/global'
import { storeToRefs } from 'pinia'
import { columnData, delAllLogData, openLogDetailView, openPeriodicScan, renderLogAnalysis, startLogScan } from './useController'
import { LOG_ANALYSE_STORE } from './useStore'

interface Props {
	type?: string
	name?: string
}

const props = withDefaults(defineProps<Props>(), {
	type: 'logs',
	name: '',
})

const { mainHeight } = useGlobalStore() // 获取全局高度

// 计算表格高度
const tableHeight = computed(() => {
	// type为'site'时表示在网站弹窗中，使用固定高度426
	// type为'logs'时表示在页面中，使用mainHeight - 426
	return props.type === 'site' ? 426 : mainHeight.value - 426
})

const store = LOG_ANALYSE_STORE()
const { isRefreshList, scanData } = storeToRefs(store)

const { BtTable, BtPage, refresh } = useDynamicTable({
	request: data => {
		const { limit: row, ...rest } = data
		return renderLogAnalysis({ ...rest, row }, props)
	},
	columns: [
		{ label: '扫描时间', prop: 'start_time', showOverflowTooltip: true },
		{
			label: '耗时',
			prop: 'time',
			render: (row: any) => row.time?.substring(0, 4) + '秒',
		},
		...columnData.map((item: any) => {
			return {
				label: item[1],
				prop: item[0],
				width: item[0] !== 'ip' && item[0] !== 'php' && item[0] !== 'url' ? 50 : 'auto',
				render: function (row: any) {
					if (row[item[0]]) {
						return (
							<span class={`bt-link ${item[0] === 'ip' || item[0] === 'url' ? '' : '!text-danger'}`} onClick={() => openLogDetailView(row, item[0])}>
								{row[item[0]]}
							</span>
						)
					}
					return <span>{row[item[0]]}</span>
				},
			}
		}),
		{
			label: '合计',
			render: function (row: any) {
				// 所有>0的值的数量(除了start_time和time,ip,url) 相加
				let count: number = 0
				for (let key in row) {
					if (key != 'start_time' && key != 'time' && key != 'ip' && key != 'url' && key != 'is_status') {
						if (row[key] > 0) {
							count += row[key]
						}
					}
				}
				return <span>{count}</span>
			},
		},
	],
	extension: [useRefreshList(isRefreshList)],
})

defineExpose({ init: refresh })
</script>

<style scoped lang="css">
.not-status {
	background: rgba(var(--el-color-danger-rgb), 0.1);
	border: 1px solid rgba(var(--el-color-danger-rgb), 0.1) !important;
	color: var(--el-color-text-secondary) !important;
}

.not-status :deep(.el-button:hover, .el-button:focus) {
	color: var(--el-color-text-primary) !important;
	background-color: rgba(var(--el-color-danger-rgb), 0.4) !important;
	border-color: rgba(var(--el-color-danger-rgb), 0.4) !important;
}
</style>

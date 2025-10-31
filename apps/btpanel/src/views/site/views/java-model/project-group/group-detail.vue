<template>
	<div class="p-[2rem]">
		<bt-table-group>
			<template #header-left>
				<el-button type="primary" @click="addGroup">添加新项目</el-button>
				<el-button type="default" class="ml-1rem" @click="setStartType">启动方式：{{ startSort == 'simultaneous' ? '同时启动' : '依次启动' }}</el-button>
				<el-button v-show="startSort == 'sequence'" type="default" class="ml-[1rem]" @click="sortGroup">修改项目启动顺序</el-button>
			</template>
			<template #header-right>
				<div class="flex items-center">
					<el-button v-if="btnGroupShow.start" type="default" class="ml-[1rem]" @click="groupOperation('start')">启动</el-button>
					<el-button v-if="btnGroupShow.stop" type="default" class="ml-[1rem]" @click="groupOperation('stop')">停止</el-button>
					<span v-if="btnGroupShow.termination" class="ml-[1rem]">
						{{ btnGroupShow.statusText }}
					</span>
					<el-button v-if="btnGroupShow.termination" type="default" class="ml-[1rem]" @click="groupOperation('termination')">终止</el-button>
					<span v-if="btnGroupShow.termination" class="ml-[1rem] text-primary cursor-pointer" @click="openLogs">日志</span>
				</div>
			</template>
			<template #content>
				<bt-table :max-height="300" :column="tableColumns" :data="tableData" v-bt-loading="tableLoading" />
			</template>
			<template #footer-left>
				<!-- <bt-table-batch :data="batchGroup" :config="batchConfig" :batch-fn="batchEvent" /> -->
			</template>
			<template #popup>
				<bt-dialog :title="'启动优先级排序'" class="overflow-hidden" v-model="showSortPopup" :area="65" :show-footer="true" @confirm="saveSortGroup">
					<div class="p-[2rem]">
						<bt-table-group>
							<template #content> <bt-table :max-height="300" class="level-table" row-key="name" :column="sortTableColumns" :data="sortData" v-bt-loading="tableLoading" /> </template
						></bt-table-group>
						<ul class="mt-[8px] leading-8 text-small list-disc ml-[2rem]">
							<li>拖拽排序，项目启动顺序将按照从上到下依次进行启动</li>
						</ul>
					</div>
				</bt-dialog>
			</template>
		</bt-table-group>
		<ul class="mt-[8px] leading-8 text-small list-disc ml-[2rem]">
			<li>启动顺序为依次启动时,项目将按照从上到下依次进行启动</li>
		</ul>
	</div>
</template>

<script setup lang="tsx">
import Sortable from 'sortablejs'
import { getJavaGroupDetail, delGroupProject, groupProjectType, editGroupProject, groupProjectOperation, getGroupLog } from '@api/site'
// import { openAlarmConfigEdit } from '@views/public/BtBachDialog'

import { useConfirm, useDialog, useMessage } from '@/hooks/tools'
import { useOperate } from '@/hooks/tools/table/column'
import { javaGroupData } from './useController'

const props = defineProps<{
	compData: any
}>()

const Message = useMessage() // 消息提示

let requestTime = 0 // 请求时间
let timer: any = null // 轮询定时器
const tableData = ref<any[]>([
	{
		name: 'test',
		status: 'test',
		pid: 'test',
		listen: [],
	},
]) // 表格数据
const sortData = ref<any[]>([]) // 排序数据
const startSort = ref<'simultaneous' | 'sequence' | undefined>('simultaneous') // 启动顺序
const showSortPopup = ref(false) // 是否排序
const tableLoading = ref(true) // 表格loading
const tableColumns = [
	// getCheckboxConfig(),
	{ prop: 'name', label: '项目名称' },
	{
		prop: 'pid',
		label: 'PID',
	},
	{
		prop: 'status',
		label: '项目状态',
		render: (row: any) => {
			let text = '--'
			let color = 'var(--el-color-primary)'
			switch (row.project_status) {
				case 'succeeded':
					text = '运行中'
					break
				case 'failed':
					text = '未运行或运行异常'
					color = '#ef0808'
					break
				case 'not_run':
					text = '未运行'
					color = '#ef0808'
					break
				default:
					text = '--'
					color = '#555'
					break
			}
			return <span style={`color: ${color};`}>{text}</span>
		},
	},
	{
		prop: 'listen',
		label: '端口',
		render(row: any) {
			return <span>{row.listen?.join(',') || '--'}</span>
		},
	},
	useOperate([
		{
			onClick: (row: any) => {
				useDialog({
					isAsync: true,
					title: `项目【${props.compData.group_name}】检查策略`,
					area: 50,
					btn: '确定',
					component: () => import('@site/views/java-model/project-group/project-check.vue'),
					compData: { ...row, group_id: props.compData.group_id, refreshEvent: getList },
				})
			},
			title: '检测策略',
		},
		{
			onClick: async (row: any, index: number) => {
				try {
					await useConfirm({
						title: `移除项目【${row.name}】`,
						width: '35rem',
						icon: 'warning',
						content: `您真的要将项目【${row.name}】从本项目组移除吗？`,
					})
					const res = await delGroupProject({
						group_id: props.compData.group_id,
						project_id: row.id,
					})
					Message.request(res)
					if (res.status) {
						getList()
						props.compData.refreshEvent && props.compData.refreshEvent()
					}
				} catch (error) {}
			},
			title: '从项目组中移除',
			width: 140,
		},
	]),
] // 响应式数据
const sortTableColumns = [
	{
		label: '',
		width: 50,
		render: (row: any) => {
			return <i class="svgtofont-icon-drag cursor-move mover iconfont align-middle" title="拖拽排序"></i>
		},
	},
	{ prop: 'name', label: '项目名称' },
	{
		prop: 'pid',
		label: 'PID',
	},
	{
		prop: 'port',
		label: '端口',
	},
	// getOperateConfig(
	// 	[
	// 		{
	// 			render: (row: any) => {
	// 				return h('i', {
	// 					class: 'icon-drag cursor-move mover iconfont align-middle',
	// 					props: { title: '拖拽排序' },
	// 				})
	// 			},
	// 		},
	// 	],
	// 	{ fixed: false }
	// ),
] // 响应式数据
const btnGroupShow = reactive({
	start: false,
	stop: false,
	termination: false,
	statusText: '',
}) // 按钮组显示隐藏

/**
 * @description: 添加新项目
 */
const addGroup = async () => {
	useDialog({
		title: `【${props.compData.group_name}】添加项目`,
		area: 50,
		showFooter: true,
		component: () => import('@site/views/java-model/project-group/group-add-projects.vue'),
		compData: {
			group_id: props.compData.group_id,
			refreshEvent: () => {
				getList()
				props.compData.refreshEvent && props.compData.refreshEvent()
			},
			projectList: tableData.value,
		},
	})
}
/**
 * @description: 行拖拽
 * @return {void}
 */
const rowDrop = () => {
	const tbody = document.querySelector('.level-table .el-table__body-wrapper tbody') as HTMLElement
	Sortable.create(tbody, {
		animation: 500,
		onEnd: async (e: any) => {
			// 拖拽结束, 重新排序
			const currentRow = sortData.value.splice(e.oldIndex, 1)[0]
			sortData.value.splice(e.newIndex, 0, currentRow)
		},
	})
}
/**
 * @description: 判断是否展示操作
 * @param {string} status 可用操作
 */
const showOperate = (status: string, data?: any) => {
	const info = data || props.compData
	return info.operation_info.includes(status)
}
/**
 * @description 项目组操作
 * @param {string} type 操作类型
 */
const groupOperation = async (type: 'start' | 'stop' | 'termination') => {
	try {
		const res = await groupProjectOperation(
			{
				group_id: props.compData.group_id,
			},
			type
		)
		Message.request(res)
		getList()
	} catch (error) {}
}
/**
 * @description: 修改项目启动顺序
 */
const sortGroup = async () => {
	if (!tableData.value.length) {
		Message.error('暂无项目数据')
		return
	}
	sortData.value = []
	sortData.value = tableData.value.map((project: any) => {
		return {
			id: project.id,
			name: project.name,
			check_info: project.check_info,
			level: project.level,
		}
	})
	showSortPopup.value = true
	if (showSortPopup.value) {
		nextTick(() => {
			rowDrop()
		})
	}
}

/**
 * @description: 保存项目启动顺序
 */
const saveSortGroup = async () => {
	try {
		sortData.value.forEach((item: any, index: number) => {
			item.level = index + 1 // 重新排序
		})
		const res = await editGroupProject({
			group_id: props.compData.group_id,
			project_datas: JSON.stringify(sortData.value),
		})
		Message.request(res)
		if (res.status) {
			showSortPopup.value = false
			getList()
		}
	} catch (error) {}
}

/**
 * @description: 设置启动顺序
 */
const setStartType = async () => {
	try {
		const res = await groupProjectType({
			group_id: props.compData.group_id,
			sort_type: startSort.value === 'simultaneous' ? 'sequence' : 'simultaneous',
		})
		Message.request(res)
		if (res.status) {
			startSort.value = startSort.value === 'simultaneous' ? 'sequence' : 'simultaneous'
		}
	} catch (error) {}
}
/**
 * @description: 打开项目组日志
 */
const openLogs = async () => {
	useDialog({
		isAsync: true,
		title: `项目组【${props.compData.group_name}】日志`,
		area: 84,
		component: () => import('@site/views/java-model/project-group/group-logs.vue'),
		compData: props.compData,
		cancel: () => {
			getList()
		},
	})
}

/**
 * @description: 获取项目组执行状态
 */
const pollingGroup = async () => {
	try {
		const res = await getGroupLog({
			group_id: props.compData.group_id,
			last_write_time: requestTime,
		})
		if (res.status) {
			javaGroupData.value = res.data
			// 判断是否执行完毕
			if (!res.data.running) {
				timer && clearTimeout(timer)
				timer = null
				requestTime = 0
				getList()
				return
			}
			// 判断执行日志是否变化，变化时刷新表格
			if (res.data.last_write_time != requestTime) {
				const ress = await getJavaGroupDetail({ group_id: props.compData.group_id })
				if (ress.status) {
					setValue(ress.data)
				}
			}
			// 2秒轮询
			timer = setTimeout(() => {
				pollingGroup()
			}, 2000)
			requestTime = res.data.last_write_time
		} else {
			// 出错停止轮询
			timer && clearTimeout(timer)
			timer = null
			requestTime = 0
			getList()
		}
	} catch (error) {}
}

/**
 * @description: 获取列表
 */
const getList = async () => {
	try {
		tableLoading.value = true
		const res = await getJavaGroupDetail({ group_id: props.compData.group_id })
		if (res.status) {
			setValue(res.data)
			if (res.data.now_operation !== '' && res.data.now_operation && !timer) {
				// 状态为操作中，开始轮询
				pollingGroup()
			} else {
				// 停止轮询
				timer && clearTimeout(timer)
				timer = null
				requestTime = 0
			}
		} else {
			Message.error(res.msg)
		}
	} catch (error) {
	} finally {
		tableLoading.value = false
	}
}

/**
 * @description: 初始化赋值
 * @param {data}  初始化数据
 */
const setValue = (data: any) => {
	tableData.value = data.projects // 表格数据
	startSort.value = data.sort_type // 启动顺序
	btnGroupShow.start = showOperate('start', data)
	btnGroupShow.stop = showOperate('stop', data)
	btnGroupShow.termination = showOperate('termination', data)
	btnGroupShow.statusText = data.now_operation === 'start' ? '状态：启动运行中' : '状态：停止运行中'
}

onMounted(async () => {
	// if (props.compData.projects) {
	// 	setValue(props.compData)
	// } else {
	await getList()
	// }
})

onUnmounted(() => {
	timer && clearTimeout(timer)
	timer = null
	javaGroupData.value = {}
	props.compData.refreshEvent && props.compData.refreshEvent()
})
</script>

<style lang="css" scoped>
.status-text {
	cursor: pointer;
	@apply cursor-pointer;
}
</style>

<template>
	<div class="p-2rem">
		<bt-table-group>
			<template #header-left>
				<el-button type="primary" @click="addGroup">添加分组</el-button>
			</template>
			<template #header-right>
				<!-- <bt-refresh-btn :refresh="getList"></bt-refresh-btn> -->
			</template>
			<template #content>
				<bt-table maxHeight="300" :column="tableColumns" :data="tableData" v-bt-loading="tableLoading" />
			</template>
			<template #footer-left>
				<!-- <bt-table-batch :data="batchGroup" :config="batchConfig" :batch-fn="batchEvent" /> -->
			</template>
			<!-- <ul class="mt-8x leading-8 text-small list-disc ml-20x">
				<li>
					启动项目组会将组内项目全部停止再按顺序启动，可能会影响正在运行的项目，请您谨慎操作！
				</li>
			</ul> -->
		</bt-table-group>
	</div>
</template>

<script setup lang="ts">
import { useDialog, useMessage } from '@/hooks/tools'
import { useOperate } from '@/hooks/tools/table/column'
import { delJavaGroup, getJavaGroupList } from '@api/site'

const Message = useMessage()

const tableData = ref([
	{
		name: 'test',
		status: '启动',
		projects: [],
	},
]) // 表格数据
const tableLoading = ref(false) // 表格loading
const tableColumns = [
	{ prop: 'group_name', label: '组名' },
	{
		prop: 'projects',
		label: '包含项目',
		width: 250,
		render: (row: any) => {
			return row.projects.map((item: any) => item.name).join('，')
		},
	},
	{
		prop: 'status',
		label: '项目状态',
		render: (row: any) => {
			let statusCounts: any = {
				succeeded: 0,
				failed: 0,
				waiting: 0,
				not_run: 0,
			}
			const textArr = []
			switch (row.now_operation) {
				case 'start':
					textArr.push('启动操作运行中')
					break
				case 'stop':
					textArr.push('停止操作运行中')
					break
			}
			if (row.projects && row.projects.length > 0) {
				// 统计项目状态
				row.projects.forEach((item: any) => {
					statusCounts.hasOwnProperty(item.project_status) && statusCounts[item.project_status]++
				})
				if (statusCounts['succeeded'] > 0) {
					textArr.push(`正常运行${statusCounts['succeeded']}个`)
				}
				if (statusCounts['failed'] > 0) {
					textArr.push(`运行异常${statusCounts['failed']}个`)
				}
				if (statusCounts['not_run'] > 0) {
					textArr.push(`未运行${statusCounts['not_run']}个`)
				}
				if (statusCounts['wait'] > 0) {
					textArr.push(`${statusCounts['wait']}个项目启动中`)
				}
			}
			return h('span', textArr.length ? textArr.join('，') : '--')
		},
	},
	useOperate([
		{
			onClick: (row: any) => {
				useDialog({
					isAsync: true,
					title: `项目组【${row.group_name}】管理`,
					area: 84,
					component: () => import('@site/views/java-model/project-group/group-detail.vue'),
					compData: {
						...row,
						refreshEvent: getList,
					},
				})
			},
			title: '管理',
		},
		{
			onClick: async (row: any) => {
				try {
					const res = await delJavaGroup({ group_id: row.group_id })
					Message.request(res)
					getList()
				} catch (error) {}
			},
			title: '删除',
		},
	]),
] // 响应式数据

/**
 * @description: 添加分组
 */
const addGroup = async () => {
	useDialog({
		isAsync: true,
		title: `添加项目组`,
		area: 50,
		btn: '确定',
		component: () => import('@site/views/java-model/project-group/add-group.vue'),
		compData: {
			refreshEvent: getList,
		},
	})
}

/**
 * @description: 获取列表
 */
const getList = async () => {
	try {
		tableLoading.value = true
		const res = await getJavaGroupList()
		if (res.status) {
			tableData.value = res.data
		} else {
			Message.error(res.msg)
		}
	} catch (error) {
	} finally {
		tableLoading.value = false
	}
}

onMounted(async () => {
	await getList()
})
</script>

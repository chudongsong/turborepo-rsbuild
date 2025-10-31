<template>
	<div class="p-[1.2rem]">
		<div class="flex items-baseline">
			<h3 class="text-medium font-medium leading-[3rem]">选择执行节点:</h3>
			<span class="ml-[2rem] text-small leading-[3rem] text-tertiary">
				{{ `已选择${selectedServers.length}个节点` }}
			</span>
			<span class="ml-[2rem] text-small leading-[3rem] text-tertiary">
				{{ `关联SSH后可通过分发管理进行群发命令` }}
				<span class="bt-link ml-[.5rem]" @click="router.push('/node/node-mgt')"> 前往添加节点 </span>
			</span>
		</div>

		<ServerSelector class="w-[107rem]" v-model:value="selectedServers" :options="serverList" @goAddNode="router.push('/node/node-mgt')" @refresh="fetchServerList" />

		<div class="flex items-center mt-[1.2rem]">
			<el-button type="primary" @click="createTask">添加任务</el-button>
			<el-button type="default" class="hover:(!bg-[var(--el-color-danger-light-9)] !text-danger !border-[var(--el-color-danger-light-5)])" plain @click="clearTask">清空任务</el-button>
			<el-checkbox v-model="isAll" class="ml-[1.2rem]">失败后继续执行</el-checkbox>
		</div>
		<div v-show="isShowTaskList" class="drug-task-list mt-[1.2rem] w-[107rem]">
			<TaskCard v-for="(item, index) in taskList" :key="item.id" :task="item" :index="index" @edit="editTask" />
		</div>

		<div class="w-[107rem]">
			<el-button v-show="taskList.length > 0 && isShowTaskList" :type="isExecute ? 'danger' : 'primary'" size="large" class="mt-[1.2rem] !text-base" style="padding: 8px 16px !important" @click="submit">
				{{ isExecute ? '停止' : isCanReset ? '重新执行' : '执行' }}
			</el-button>
			<el-empty v-show="taskList.length === 0 || !isShowTaskList" description="还没有添加任务">
				<el-button type="primary" @click="createTask">添加第一个任务</el-button>
			</el-empty>
		</div>
	</div>
</template>

<script setup lang="tsx">
import { useDistributeController, ServerSelector } from './useController'
import { TaskCard } from '@node/views/script-mass/useController'
import { useRouter } from 'vue-router'

const { selectedServers, serverList, fetchServerList, submit, init, isAll, createTask, rowDrop, taskList, editTask, clearTask, isExecute, isCanReset, isShowTaskList } = useDistributeController()

const router = useRouter()
const scriptSelectRef = useTemplateRef('script')

onMounted(async () => {
	init()
	await fetchServerList()
	// 开启拖拽
	rowDrop()
})

defineExpose({
	init,
})
</script>

<style scoped>
:deep(.my-tabs .el-tabs__item.is-active::after) {
	background-color: var(--el-fill-color-darker);
	height: 2px;
}
:deep(.cmd-tag) {
	background-color: var(--el-fill-color-dark) !important;
	color: var(--el-base-supplement) !important;
	border-color: var(--el-color-border-dark) !important;
}
:deep(.hover-btn) {
	display: none;
}
:deep(.task-card:hover .hover-btn) {
	display: flex;
}
:deep(.task-card.ghost) {
	border-color: var(--el-color-primary);
}
</style>

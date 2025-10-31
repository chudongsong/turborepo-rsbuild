<template>
	<div class="task-queue-wrapper">
		<div v-if="loading" v-bt-loading="loading" v-bt-loading:title="loadingText" class="loading"></div>
		<div v-else>
			<slot></slot>
		</div>
	</div>
</template>

<script lang="ts" setup>
import { taskQueue } from '@utils/task-queue'

const props = withDefaults(
	defineProps<{
		taskName: string
		task: () => Promise<any>
		loadingText?: string
	}>(),
	{
		taskName: '',
		task: () => Promise.resolve(),
		loadingText: '正在加载任务...',
	}
)

const loading = ref(true)

const init = async () => {
	await taskQueue.addTask(props.taskName, props.task)
	console.log('taskQueue', taskQueue)
	loading.value = false
}

onMounted(async () => init())
</script>

<style scoped>
.task-queue-wrapper {
	width: 100%;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
}

.loading {
	text-align: center;
	padding: 20px;
}
</style>

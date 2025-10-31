<template>
	<div class="p-16px realTaskDialog">
		<!-- 下载任务 -->
		<template v-if="isObject(currentTask.log)">
			<div class="title">
				<span class="truncate max-w-[36rem]" :title="currentTask.shell">正在下载:{{ currentTask.shell }}</span>
				<bt-link @click="cancel(currentTask)">取消</bt-link>
			</div>
			<div class="p-[1rem]">
				<bt-progress :strokeWidth="3" :percentage="Number(currentTask.log?.pre || 0)" :showText="false" />
				<div class="mt-[4px] flex justify-between items-center">
					<div class="flex">
						<span class="mr-[25px]">{{ currentTask.log?.used }} / {{ getByteUnit(currentTask.log?.total) }}</span>
						<span>预计还要:{{ currentTask.log?.time }}</span>
					</div>
					<span>{{ currentTask.log?.speed }}/s</span>
				</div>
			</div>
		</template>
		<!-- 解压、压缩任务 -->
		<template v-else>
			<div class="title">
				<span class="truncate max-w-[36rem]">{{ `${currentTask.name}:${currentTask.shell}` }}</span>
				<bt-link @click="cancel(currentTask)">取消</bt-link>
			</div>
			<bt-log :content="currentTask.log" :isHtml="true" class="max-h-[18rem] h-[18rem]"></bt-log>
		</template>
		<!-- 等待执行任务 -->
		<div class="wait" v-if="taskData.length > 1">
			<div class="title">等待执行任务</div>
			<div class="title item w-full !text-disabled items-center" v-for="task in taskData.slice(1)" :key="task.id">
				<span class="truncate">{{ `${task.name}:${task.shell}` }}</span>
				<span class="svgtofont-el-close-bold text-danger cursor-pointer ml-1rem" @click="cancel(task)"></span>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { getByteUnit, isObject } from '@utils/index'
import { storeToRefs } from 'pinia'
import FILES_TASK_STORE from './store'


const props = withDefaults(defineProps<{
	compData?: AnyObject
}>(), {
	compData: () => ({
		callback: () => {},
	}),
})

const emit = defineEmits(['close'])

const store = FILES_TASK_STORE()
const { taskData } = storeToRefs(store)
const { getLog, cancel, $reset } = store

const currentTask = computed(() => {
	// 返回第一个任务
	return (
		taskData.value[0] || {
			log: '',
			name: '',
			shell: '',
		}
	)
})

onMounted(() => {
	getLog()
})

onUnmounted(() => {
	$reset()
	props.compData?.callback?.()
})
</script>

<style lang="css" scoped>
.title {
	@apply h-[3.6rem] flex items-center justify-between px-[1rem] bg-light;
}

.title.item {
	@apply bg-white;
}

.title.item:hover {
	@apply bg-[rgba(var(--el-file-color-light-rgb),.5)] text-primary;
}
</style>

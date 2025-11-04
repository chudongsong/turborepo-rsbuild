<template>
	<div class="p-[2rem] master-redis-create-log">
		<el-steps direction="vertical" space="4rem" :active="activeStep">
			<el-step
				v-for="(step, idx) in steps"
				:key="idx"
				:title="step.name"
				:icon="stepIcons[step.status] ? stepIcons[step.status]() : stepIcons['wait']()"
				:description="stepDescriptions[step.status] ?? ''"
				:status="step.status === 'completed' ? 'success' : step.status === 'running' ? 'process' : step.status === 'failed' ? 'error' : 'wait'" />
		</el-steps>
		<h3 class="text-base mb-[1rem] mt-[1rem] color-[#666]">实时日志</h3>
		<bt-log :content="logs" :isHtml="true" :autoScroll="true" :style="{ height: '14rem' }" />
	</div>
</template>

<script lang="tsx" setup>
import { ElSteps, ElStep } from 'element-plus'
import { getCreationStatus } from '@/api/node'
import { Message } from '@/hooks/tools'
import { useMasterRedisStore } from '../useStore'
const { isRedisRefreshList } = useMasterRedisStore()

interface StepItem {
	name: string
	status: 'wait' | 'completed' | 'running' | 'failed'
	start_time?: string
	completed_time?: string
	updated_time?: string
}

interface Props {
	compData: { task_id: string }
}
const props = withDefaults(defineProps<Props>(), {
	compData: () => ({ task_id: '' }),
})

const logs = ref('')
const stepNames = ['配置主Redis节点', '配置从Redis节点', '验证复制状态', '主从配置完成']
const steps = ref<StepItem[]>(
	stepNames.map(name => ({
		name,
		status: 'wait',
	}))
)

const updateStepsFromApi = (apiSteps: any[]) => {
	steps.value = stepNames.map((name, idx) => {
		const apiStep = apiSteps[idx]
		return {
			name,
			status: apiStep?.status || 'wait',
			start_time: apiStep?.start_time,
			completed_time: apiStep?.completed_time,
			updated_time: apiStep?.updated_time,
		}
	})
}

const activeStep = ref(0)
let pollTimer: ReturnType<typeof setTimeout> | null = null

const stepIcons: Record<string, () => JSX.Element> = {
	wait: () => <span class="svgtofont-el-more-filled text-disabled mr-2px !text-large" />,
	completed: () => <span class="svgtofont-el-circle-check text-primary mr-2px !text-large" />,
	failed: () => <span class="svgtofont-el-circle-close text-dangerDark mr-2px !text-large" />,
	running: () => <span class="svgtofont-el-loading animate-spin text-supplement mr-2px !text-large" />,
}
const stepDescriptions: Record<string, string> = {
	wait: '',
	completed: '完成',
	failed: '失败',
	running: '进行中',
}

const pollStatus = async () => {
	if (!props.compData.task_id) return
	const { data: res } = await getCreationStatus({ task_id: props.compData.task_id })
	console.log(res, 'getCreationStatus res')
	if (!res.status) {
		Message.error(res.msg)
		return
	}
	const data = res.data
	logs.value = data.logs || ''
	updateStepsFromApi(data.steps || [])
	const runningIdx = steps.value.findIndex(s => s.status === 'running')
	const completedIdx = steps.value.map(s => s.status).lastIndexOf('completed')
	activeStep.value = runningIdx !== -1 ? runningIdx : completedIdx !== -1 ? completedIdx : 0
	// 判断是否结束
	const failed = steps.value.some(s => s.status === 'failed')
	if (data.status === 'completed' || data.status === 'failed' || failed) {
		if (pollTimer) {
			clearTimeout(pollTimer)
			isRedisRefreshList.value = true
			pollTimer = null
		}
		return
	}
	pollTimer = setTimeout(pollStatus, 2000)
}

onMounted(() => {
	pollStatus()
})
onUnmounted(() => {
	logs.value = ''
	if (pollTimer) {
		clearTimeout(pollTimer)
		pollTimer = null
	}
})
</script>

<style lang="scss" scoped>
.master-redis-create-log :deep(.el-step__line) {
	border-color: var(--el-color-border-darker);
	background-color: var(--el-fill-color-darker);
	left: 10px;
}
.master-redis-create-log :deep(.el-step__title.is-process) {
	color: var(--el-color-text-tertiary);
	font-weight: 500;
}
.master-redis-create-log :deep(.el-step__head.is-process) {
	.svgtofont-el-loading {
		color: var(--el-color-text-tertiary) !important;
	}
	.el-step__icon-inner {
		display: flex;
	}
}
.master-redis-create-log :deep(.el-step__main) {
	display: flex;
	justify-content: space-between;
	.el-step__title {
		font-size: var(--el-font-size-base);
	}
	.el-step__description.is-process {
		color: var(--el-color-text-tertiary);
	}
	.el-step__description {
		padding-top: 6px;
		padding-right: 0;
		font-size: var(--el-font-size-base);
	}
}
.master-redis-create-log :deep(.el-progress__text) {
	text-align: right;
}
.manual-import-card {
	background: var(--el-fill-color-light);
	border-radius: var(--el-border-radius-medium);
	padding: 1.2rem;
	margin-bottom: 1rem;
	font-size: var(--el-font-size-base);
	color: var(--el-color-text-secondary);
	display: flex;
	flex-direction: column;
	align-items: flex-start;
	.import-tip {
		color: var(--el-color-text-secondary);
		margin: 5px 0 10px;
		font-size: var(--el-font-size-small);
	}
	.manual-import-actions {
		display: flex;
		align-items: center;
		margin-top: 8px;
	}
	.file-name {
		margin-bottom: 4px;
	}
}
</style>

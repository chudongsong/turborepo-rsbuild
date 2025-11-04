<template>
	<div class="p-[2rem] master-step-container">
		<el-steps direction="vertical" space="4rem" :active="activeStep">
			<el-step v-for="(step, idx) in steps" :key="idx" :title="step.msg" :icon="stepIcons[step.status] ? stepIcons[step.status]() : stepIcons['wait']()" :description="stepDescriptions[step.status] ?? ''" :status="step.status === 'done' ? 'success' : step.status === 'running' ? 'process' : 'wait'" />
		</el-steps>
		<div v-if="currentStep === 2 && syncType === 'manual'" class="manual-import-card">
			<div class="file-name">文件名：{{ getMysqlSlaveHistoryInfo.name }}</div>
			<div class="file-size">大小：{{ getMysqlSlaveHistoryInfo.size }}</div>
			<div class="import-tip">提示：请下载上面主库备份文件，在从库数据库页面-选择任意一个需要同步的数据库，进行导入数据</div>
			<div class="manual-import-actions">
				<el-button @click="handleDownload">点击下载</el-button>
				<el-button type="primary" @click="handleManualImport">数据已导入，开始从库配置</el-button>
			</div>
		</div>
		<h3 class="text-base mb-[1rem] mt-[1rem] color-[#666]">实时日志</h3>
		<bt-log :content="logs" :isHtml="true" :autoScroll="true" :style="{ height: '14rem' }" />
		<bt-help :options="[{ content: '同步任务为后台进行，此页面可以关闭，在从库列表中可以重新打开' }]" class="mt-[1rem]"></bt-help>
	</div>
</template>

<script setup lang="tsx">
import { ElSteps, ElStep } from 'element-plus'
import { getSyncStatus, syncMysqlSlaveConfig } from '@/api/node'
import { useMasterMysqlStore } from '../mysql/useStore'
import { Message } from '@/hooks/tools'
import { getByteUnit } from '@/utils'
const { isRefreshList } = useMasterMysqlStore()

interface StepItem {
	status: 'wait' | 'done' | 'running'
	msg: string
}
interface Props {
	compData: { slave_ip: string }
}
const props = withDefaults(defineProps<Props>(), {
	compData: () => ({ slave_ip: '' }),
})

const logs = ref('')
const steps = ref<StepItem[]>([])
const activeStep = ref(0)
let pollTimer: ReturnType<typeof setTimeout> | null = null
const syncType = ref('')
const currentStep = ref(0)
const getMysqlSlaveHistoryInfo = ref<any>({})
const isPolling = ref(true)

const stepIcons: Record<StepItem['status'], () => JSX.Element> = {
	wait: () => <span class="svgtofont-el-more-filled text-disabled mr-2px !text-large" />,
	done: () => <span class="svgtofont-el-circle-check text-primary mr-2px !text-large" />,
	running: () => <span class="svgtofont-el-loading animate-spin text-supplement mr-2px !text-large" />,
}
const stepDescriptions: Record<StepItem['status'], string> = {
	wait: '',
	done: '完成',
	running: '进行中',
}

const pollStatus = async () => {
	if (!isPolling.value) return
	const { data: resData } = await getSyncStatus({ slave_ip: props.compData.slave_ip })
	if (!resData.status) Message.error(resData.msg)
	const { data } = resData
	const { data: res } = data
	logs.value = res.logs
	steps.value = (res.steps || []) as StepItem[]
	activeStep.value = steps.value.findIndex(s => s.status === 'running' || s.status === 'wait')
	if (activeStep.value === -1) activeStep.value = steps.value.length - 1

	// 保存当前step和sync_type
	currentStep.value = res.step
	syncType.value = data.sync_type
	if (syncType.value === 'manual' && currentStep.value === 2) {
		isPolling.value = false
		getMysqlSlaveHistoryInfo.value = {
			name: res.master_data_sql,
			size: getByteUnit(Number(res.sql_file_size)) || '--',
		}
	}
	// 判断是否需要停止轮询
	const step = res.step
	const lastStep = steps.value[steps.value.length - 1]
	if (step === 5 && lastStep && lastStep.status === 'done') {
		if (pollTimer) {
			clearTimeout(pollTimer)
			pollTimer = null
			isRefreshList.value = true
		}
		return
	}

	if (steps.value.some(s => s.status !== 'done')) {
		pollTimer = setTimeout(pollStatus, 2000)
	}
}

const handleManualImport = async () => {
	const loading = Message.load('开始同步...')
	try {
		const { data } = await syncMysqlSlaveConfig({ slave_ip: props.compData.slave_ip })
		if (data.status) {
			isPolling.value = true
			isRefreshList.value = true
			pollStatus() // 重新开始轮询
		} else {
			Message.error(data.msg || '同步失败')
		}
	} catch (error) {
		Message.error('同步失败')
	} finally {
		loading.close()
	}
}

const handleDownload = () => {
	window.open('/download?filename=' + getMysqlSlaveHistoryInfo.value.name)
}

onMounted(() => {
	isPolling.value = true
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
.master-step-container :deep(.el-step__line) {
	// display: none;
	border-color: var(--el-base-primary);
	background-color: var(--el-base-primary);
	left: 10px;
}
.master-step-container :deep(.el-step__title.is-process) {
	color: var(--el-color-text-tertiary);
	font-weight: 500;
}
.master-step-container :deep(.el-step__head.is-process) {
	.svgtofont-el-loading {
		color: var(--el-color-text-tertiary) !important;
	}
	.el-step__icon-inner {
		display: flex;
	}
}
.master-step-container :deep(.el-step__main) {
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
		padding-right: 5%;
		font-size: var(--el-font-size-base);
	}
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

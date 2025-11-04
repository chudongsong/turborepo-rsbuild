<template>
	<div class="file-transfer-progress">
		<div class="transfer-content">
			<!-- 传输路径信息 -->
			<div class="transfer-paths">
				<div class="path-item">
					<div class="path-label">源节点:</div>
					<div class="path-value">{{ props.compData.value.source_node?.name || '未指定' }}</div>
				</div>
				<!-- <div class="path-item">
					<div class="path-label">源路径:</div>
					<div class="path-value" :title="props.compData.sourcePath">
						{{ props.compData.sourcePath || '未指定' }}
					</div>
				</div> -->
				<div class="path-item">
					<div class="path-label">目标节点:</div>
					<div class="path-value">{{ props.compData.value.target_node?.name || '未指定' }}</div>
				</div>
				<div class="path-item">
					<div class="path-label">目标路径:</div>
					<div class="path-value" :title="props.compData.value.target_path">
						{{ props.compData.value.target_path || '未指定' }}
					</div>
				</div>
			</div>

			<!-- 进度条 -->
			<div class="progress-section">
				<div class="progress-info">
					<span class="progress-text">传输进度</span>
					<span class="progress-percentage">{{ progressPercentage }}%</span>
				</div>
				<el-progress :percentage="progressPercentage" :status="progressStatus" :stroke-width="8" :show-text="false" color="var(--el-color-primary)" />
			</div>

			<div v-if="currentFile" class="text-tertiary text-small mt-[1rem]">正在传输：{{ currentFile }}</div>

			<!-- 传输统计 -->
			<div class="transfer-stats">
				<div class="stat-left">
					<div class="stat-item total">
						<div class="stat-label">总计</div>
						<div class="stat-value">{{ props.compData.value.file_count }}</div>
					</div>
				</div>
				<div class="stat-right">
					<div class="stat-item success">
						<span class="text-success mr-[0.5rem] svgtofont-el-circle-check"></span>
						<div class="stat-label text-success">已完成</div>
						<div class="stat-value">{{ props.compData.value.file_complete }}</div>
					</div>
					<div class="stat-item error">
						<span class="text-dangerDark mr-[0.5rem] svgtofont-el-circle-close"></span>
						<div class="stat-label text-dangerDark">失败</div>
						<div class="stat-value">{{ props.compData.value.file_error }}</div>
					</div>
					<div class="stat-item remaining">
						<span class="text-secondary mr-[0.5rem] svgtofont-icon-login-time"></span>
						<div class="stat-label text-secondary">剩余</div>
						<div class="stat-value">{{ remainingFiles }}</div>
					</div>
				</div>
			</div>

			<!-- 传输速率和时间预估 -->
			<div class="transfer-details" v-if="isTransferring">
				<div class="detail-item">
					<!-- <bt-icon icon="el-timer" class="mr-1" /> -->
					<span>预计剩余时间: {{ estimatedTime }}</span>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
interface Props {
	compData: Ref<{
		// sourcePath: string
		target_path: string
		target_node: {
			name: string
		}
		source_node: {
			name: string
		}
		file_count: number
		file_complete: number
		file_error: number
		fileList: any[]
		progress: number
	}>
}

const props = withDefaults(defineProps<Props>(), {
	compData: () => ({
		// sourcePath: '',
		target_path: '',
		target_node: {
			name: '',
		},
		source_node: {
			name: '',
		},
		file_count: 0,
		file_complete: 0,
		file_error: 0,
		progress: 0,
		fileList: [],
	}),
})

// 计算进度百分比
const progressPercentage = computed(() => {
	const progress = props.compData.value.progress || 0
	if (typeof progress !== 'number' || isNaN(progress)) return 0

	// 保留最多2位非0的小数
	if (progress === 0) return 0

	// 找到第一个非零小数位
	const progressStr = progress.toString()
	const decimalIndex = progressStr.indexOf('.')

	// 如果没有小数点或是整数，直接返回
	if (decimalIndex === -1 || progress % 1 === 0) return progress

	// 找到小数部分中第一个非零数字的位置
	const decimalPart = progressStr.substring(decimalIndex + 1)
	let firstNonZeroIndex = 0
	while (firstNonZeroIndex < decimalPart.length && decimalPart[firstNonZeroIndex] === '0') {
		firstNonZeroIndex++
	}

	// 计算需要保留的小数位数：第一个非零数字位置 + 2位有效数字
	const precision = firstNonZeroIndex + 2

	// 使用toFixed并转回数字类型
	return parseFloat(progress.toFixed(precision))
})

// 计算剩余文件数
const remainingFiles = computed(() => {
	return Math.max(0, props.compData.value.file_count - props.compData.value.file_complete - props.compData.value.file_error)
})

// 计算当前传输的文件
const currentFile = computed(() => {
	for (let i = 0; i < props.compData.value.fileList?.length; i++) {
		if (props.compData.value.fileList[i].status === 'pending') {
			return props.compData.value.fileList[i].target_path
		}
	}
	return ''
})

// 传输状态
const transferStatus = computed(() => {
	if (props.compData.value.file_count === 0) return 'waiting'
	if (remainingFiles.value === 0) return 'completed'
	if (props.compData.value.file_error > 0 && remainingFiles.value === 0) return 'error'
	return 'transferring'
})

// 是否正在传输
const isTransferring = computed(() => transferStatus.value === 'transferring')

// 进度条状态
const progressStatus = computed(() => {
	switch (transferStatus.value) {
		case 'completed':
			return props.compData.value.file_error > 0 ? 'warning' : 'success'
		case 'error':
			return 'exception'
		case 'transferring':
			return undefined
		default:
			return undefined
	}
})

// 预计剩余时间（简单估算）
const estimatedTime = computed(() => {
	if (!isTransferring.value || props.compData.value.file_complete === 0) return '计算中...'

	// 简单的时间估算逻辑
	const avgTimePerFile = 2 // 假设每个文件平均2秒
	const remainingSeconds = remainingFiles.value * avgTimePerFile

	if (remainingSeconds < 60) {
		return `${remainingSeconds}秒`
	}
	if (remainingSeconds < 3600) {
		return `${Math.round(remainingSeconds / 60)}分钟`
	}
	return `${Math.round(remainingSeconds / 3600)}小时`
})
</script>

<style lang="scss" scoped>
.file-transfer-progress {
	background: var(--el-color-white);
	border-radius: var(--el-border-radius-large);
	box-shadow: 0 2px 8px rgba(var(--el-color-black-rgb), 0.1);
	overflow: hidden;
}

.transfer-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 16px 20px;
	background: linear-gradient(135deg, var(--el-fill-color) 0%, var(--el-color-primary-light-8) 100%);
	border-bottom: 1px solid var(--el-color-border-dark-tertiaryer);
}

.transfer-title {
	display: flex;
	align-items: center;
	font-size: var(--el-font-size-medium);
	color: var(--el-color-text-primary);
	font-weight: 500;
}

.transfer-status {
	padding: 4px 12px;
	border-radius: var(--el-border-radius-round);
	font-size: var(--el-font-size-small);
	font-weight: 500;

	&.status-waiting {
		background: var(--el-color-danger-light-9);
		color: var(--el-color-text-secondary);
	}

	&.status-transferring {
		background: var(--el-color-primary-light-8);
		color: var(--el-color-success-dark-2);
		border: 1px solid var(--el-color-primary);
	}

	&.status-success {
		background: var(--el-color-primary-light-8);
		color: var(--el-color-success-dark-2);
		border: 1px solid var(--el-color-primary);
	}

	&.status-warning {
		background: var(--el-color-warning-light-8);
		color: var(--el-color-warning);
	}

	&.status-error {
		background: var(--el-color-danger-light-8);
		color: var(--el-color-danger);
	}
}

.transfer-content {
	padding: 20px;
}

.transfer-paths {
	margin-bottom: 20px;
}

.path-item {
	display: flex;
	margin-bottom: 8px;

	&:last-child {
		margin-bottom: 0;
	}
}

.path-label {
	width: 80px;
	flex-shrink: 0;
	color: var(--el-color-text-secondary);
	font-size: var(--el-font-size-base);
	font-weight: 500;
}

.path-value {
	flex: 1;
	color: var(--el-color-text-primary);
	font-size: var(--el-font-size-base);
	word-break: break-all;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.progress-section {
	margin-bottom: 20px;
}

.progress-info {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 8px;
}

.progress-text {
	font-size: var(--el-font-size-base);
	color: var(--el-color-text-primary);
	font-weight: 500;
}

.progress-percentage {
	font-size: var(--el-font-size-base);
	font-weight: 600;
	color: var(--el-color-primary);
}

.transfer-details {
	padding: 12px;
	background: var(--el-fill-color);
	border-radius: var(--el-border-radius-medium);
	// border-left: 4px solid var(--el-color-primary);
}

.detail-item {
	display: flex;
	align-items: center;
	font-size: var(--el-font-size-base);
	color: var(--el-color-success-dark-2);
	font-weight: 500;
}

.transfer-stats {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 20px;
	padding: 16px;
	background: var(--el-fill-color-light);
	border-radius: var(--el-border-radius-large);
	border: 1px solid var(--el-color-border-dark-tertiaryer);
}

.stat-left {
	flex: 0 0 auto;
}

.stat-right {
	display: flex;
	gap: 24px;
	flex: 1;
	justify-content: flex-end;
}

.stat-item {
	display: flex;
	align-items: center;
}

.stat-label {
	font-size: var(--el-font-size-small);
	font-weight: 500;
	margin-right: 0.5rem;
}

.stat-value {
	font-size: var(--el-font-size-large);
	font-weight: 600;
	color: var(--el-color-text-primary);
}

.stat-item.total .stat-value {
	color: var(--el-color-text-secondary);
}

.stat-item.success .stat-value {
	color: var(--el-color-success);
}

.stat-item.error .stat-value {
	color: var(--el-color-danger);
}

.stat-item.remaining .stat-value {
	color: var(--el-color-text-secondary);
}

// 响应式设计
@media (max-width: 640px) {
	.transfer-header {
		flex-direction: column;
		gap: 8px;
		align-items: flex-start;
	}

	.transfer-stats {
		flex-direction: column;
		gap: 16px;
		align-items: stretch;
	}

	.stat-left {
		align-self: center;
	}

	.stat-right {
		justify-content: center;
		gap: 16px;
	}

	.path-item {
		flex-direction: column;
		gap: 4px;
	}

	.path-label {
		width: auto;
		font-weight: 500;
	}
}
</style>

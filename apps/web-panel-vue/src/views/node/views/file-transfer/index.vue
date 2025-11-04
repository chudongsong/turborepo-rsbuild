<template>
	<div class="file-transfer">
		<div class="transfer-container">
			<!-- 左侧文件列表 -->
			<div class="transfer-panel left-panel">
				<FilesListCard ref="leftPanelRef" :panel-type="'source'" />
			</div>

			<!-- 右侧文件列表 -->
			<div class="transfer-panel right-panel">
				<FilesListCard ref="rightPanelRef" :panel-type="'target'" />
			</div>
		</div>
	</div>
</template>

<script setup lang="tsx">
import FilesListCard from './files-list-card.vue'
import { useMessage } from '@/hooks/tools'
import { useNodeListFormat, createTransferTask, getFileTransferLog } from './useController'
import { useNodeStore } from '@/views/node/useStore'

const { getAllNodeList,currentNodes } = useNodeStore()

const msg = useMessage()

const nodeList = ref<any[]>([]) // 节点列表
provide('nodeList', nodeList)

// 引用
const leftPanelRef = useTemplateRef('leftPanelRef')
const rightPanelRef = useTemplateRef('rightPanelRef')

/**
 * @description 获取节点列表
 */
const refreshNodeList = async () => {
	const data = await getAllNodeList()
	nodeList.value = useNodeListFormat(data.data)
	const sourceNode = Number(localStorage.getItem('fileTransfer_source_nodeId'))
	const targetNode = Number(localStorage.getItem('fileTransfer_target_nodeId'))
	let source = null
	let target = null
	let localNodeId = null
	for (let i = 0; i < nodeList.value.length; i++) {
		if (nodeList.value[i].isLocal) {
			localNodeId = nodeList.value[i].id
			currentNodes.value.localNodeId = localNodeId
		} else if (!target) {
			target = nodeList.value[i].id
		}
		if (nodeList.value[i].id === sourceNode) {
			source = nodeList.value[i].id
		}
		if (nodeList.value[i].id === targetNode) {
			target = nodeList.value[i].id
		}
	}
	if (!source) {
		source = localNodeId
	}
	currentNodes.value.source = source
	currentNodes.value.target = target
}

/**
 * @description 创建文件传输任务
 */
const createTask = async (sendType: 'source' | 'target', sourcePathList: any[], callback: () => void) => {
	const sourceNodeId = currentNodes.value[sendType]
	const targetNodeId = currentNodes.value[sendType === 'source' ? 'target' : 'source']
	let sourceNode = null
	let targetNode = null
	for (let i = 0; i < nodeList.value.length; i++) {
		if (nodeList.value[i].id === sourceNodeId) {
			sourceNode = nodeList.value[i]
		}
		if (nodeList.value[i].id === targetNodeId) {
			targetNode = nodeList.value[i]
		}
		if (sourceNode && targetNode) break
	}
	if (!targetNode) {
		msg.error('请选择目标节点')
		callback()
		return
	}
	createTransferTask({
		sourceNode,
		targetNode,
		sourcePathList: toRef(sourcePathList),
		targetPath: currentNodes.value[sendType === 'source' ? 'targetPath' : 'sourcePath'],
		callback,
		complete: () => {
			sendType === 'source' ? rightPanelRef.value?.refresh() : leftPanelRef.value?.refresh()
		},
	})
}

provide('refreshNodeList', refreshNodeList)
provide('createTask', createTask)

onMounted(() => {
	refreshNodeList()
	getFileTransferLog(() => {}, true)
})
</script>

<style lang="scss" scoped>
.file-transfer {
	height: 100%;
}

.transfer-container {
	display: flex;
	height: 100%;
	gap: 20px;
	align-items: stretch;
}

.transfer-panel {
	flex: 1;
	min-width: 0; // 防止flex子项溢出
}

.transfer-controls {
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	min-width: 120px;
}

.transfer-buttons {
	display: flex;
	flex-direction: column;
	gap: 12px;
	margin-bottom: 20px;
}

.transfer-btn {
	width: 48px;
	height: 48px;
	border-radius: var(--el-border-radius-circle);
	display: flex;
	align-items: center;
	justify-content: center;
	box-shadow: 0 2px 8px rgba(var(--el-color-black-rgb), 0.1);
	transition: all 0.3s ease;

	&:hover:not(:disabled) {
		transform: scale(1.1);
		box-shadow: 0 4px 12px rgba(var(--el-color-black-rgb), 0.15);
	}

	&:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
}

.transfer-right {
	background: linear-gradient(135deg, #409eff, #67c23a);
	border: none;

	&:hover:not(:disabled) {
		background: linear-gradient(135deg, #337ecc, #529b2e);
	}
}

.transfer-left {
	background: linear-gradient(135deg, #67c23a, #409eff);
	border: none;

	&:hover:not(:disabled) {
		background: linear-gradient(135deg, #529b2e, #337ecc);
	}
}

.transfer-status {
	width: 100%;
	max-width: 200px;
}

.transfer-progress {
	text-align: center;
}

.transfer-info {
	margin-top: 8px;

	.text-sm {
		font-size: var(--el-font-size-small);
	}

	.text-gray-600 {
		color: var(--el-color-text-secondary);
	}
}

// 响应式设计
@media (max-width: 1200px) {
	.transfer-container {
		gap: 15px;
	}

	.transfer-controls {
		min-width: 100px;
		padding: 15px 8px;
	}

	.transfer-btn {
		width: 40px;
		height: 40px;
	}
}

@media (max-width: 768px) {
	.transfer-container {
		flex-direction: column;
		gap: 20px;
	}

	.transfer-controls {
		flex-direction: row;
		justify-content: center;
		min-width: auto;
		padding: 15px;
	}

	.transfer-buttons {
		flex-direction: row;
		margin-bottom: 0;
		margin-right: 20px;
	}
}
</style>

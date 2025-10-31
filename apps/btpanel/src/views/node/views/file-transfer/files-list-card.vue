<template>
	<div class="rounded-base module-ui shadow-[0 1px 3px 1px rgba(var(--el-color-black-rgb), 0.05)]" @dragenter.prevent @dragover.prevent="handleDragOff($event, currentPath, currentNodes[props.panelType], refresh)">
		<div class="flex items-center mb-[1.6rem]">
			<el-select class="!w-[16rem] mr-[1.6rem]" v-model="currentNodes[props.panelType]" filterable :filter-method="filterNode" @change="handleNodeChange">
				<el-option class="!h-[5rem]" v-for="item in showNodeList" :key="item.value" :label="item.label" :value="item.value" :disabled="getDisabled(item.value)">
					<div class="flex flex-col !h-[5rem] pt-[1rem]">
						<span class="mb-0 leading-[1.2rem] !vertical-middle">{{ item.label }}</span>
						<span class="text-tertiary text-small">{{ item.server_ip }}</span>
					</div>
				</el-option>
			</el-select>
			<FilesPath :initialPath="currentPath" @pathChange="handlePathChange" @refresh="refresh" />
		</div>
		<bt-table-group>
			<!-- 头部左侧：下拉选择 -->
			<template #header-left>
				<el-button type="primary" :disabled="!nodeParams.path" @click="handleUpload(currentPath, currentNodes[props.panelType], refresh)"> 上传文件 </el-button>
				<el-button type="default" :disabled="!nodeParams.path" @click="handleCreateFolder(currentPath, currentNodes[props.panelType], refresh)"> 新建文件夹 </el-button>
			</template>

			<!-- 头部右侧：搜索和按钮 -->
			<template #header-right>
				<div class="flex items-center gap-3">
					<BtSearch :disabled="!nodeParams.path" placeholder="请输入文件名称" />
					<!-- <el-button @click="handleRefresh">
          <bt-icon icon="el-refresh" />
        </el-button> -->
				</div>
			</template>

			<!-- 表格内容 -->
			<template #content>
				<BtTable :style="`height:${mainHeight - 290}px`" @selection-change="handleSelectionChange" />
			</template>

			<!-- 底部左侧：批量操作 -->
			<template #footer-left>
				<div class="flex items-center gap-3">
					<el-tooltip content="请先选择文件" placement="top" :disabled="selectList.length > 0">
						<el-button type="primary" :disabled="selectList.length === 0" @click="handleSendToOther('all')">发送到{{ props.panelType === 'source' ? '右侧' : '左侧' }}</el-button>
					</el-tooltip>
					<span class="text-tertiary">当前选中{{ selectList.length }}个文件</span>
				</div>
			</template>

			<!-- 底部右侧：分页 -->
			<template #footer-right>
				<BtPage layout="prev, pager, next" />
			</template>
		</bt-table-group>
	</div>
</template>

<script setup lang="tsx">
import '@styles/font/file-icon.css'
import { useAllTable, useTableSelect, useBatch } from '@/hooks/tools/table'
import { getByteUnit } from '@utils/index'
import { useOperate, useCheckbox } from '@/hooks/tools/table/column'
import { useMessage, useDialog } from '@/hooks/tools'
import { useGlobalStore } from '@/store/global'
import { getFileList, onClickCalc, deleteFile as handleDelete, handleDragOff, handleUpload, nodeFilePath, handleCreateFolder } from './useController'

import BtTableGroup from '@/components/extension/bt-table-group'
import FilesPath from './files-path.vue'
import { useNodeStore } from '@/views/node/useStore'

import type { TableColumnProps } from '@/components/data/bt-table/types'

const props = defineProps({
	panelType: {
		type: String as PropType<'source' | 'target'>,
		required: true,
	},
})

const msg = useMessage()
const { mainHeight } = useGlobalStore()
const { currentNodes } = useNodeStore()

const selectList = ref<any[]>([])

// 节点选项
const nodeList = inject<Ref<{ value: string; label: string; server_ip: string }[]>>('nodeList', ref([]))

// 创建文件传输任务
const createTask = inject<(type: 'source' | 'target', sourcePathList: string[], callback: () => void) => void>('createTask', (type: 'source' | 'target', sourcePathList: string[], callback: () => void) => {})

const showNodeList = ref<any[]>([]) // 显示节点列表

const currentPath = ref(nodeFilePath(currentNodes.value[props.panelType])) // 当前路径

provide('currentPath', currentPath)

const nodeParams = ref({
	p: 1,
	showRow: 200,
	path: toRef(currentPath),
	search: '',
})

const getDisabled = (nodeId: string) => {
	switch (props.panelType) {
		case 'source':
			return nodeId === currentNodes.value.target
		case 'target':
			return nodeId === currentNodes.value.source
	}
}

const filterNode = (query: string) => {
	if (!query) {
		showNodeList.value = nodeList.value
		return
	}
	showNodeList.value = nodeList.value.filter(item => item.label.includes(query) || item.server_ip.includes(query))
}

watch(nodeList, newVal => {
	showNodeList.value = newVal
})
watch(
	() => currentNodes.value[props.panelType],
	() => {
		// 保存当前节点ID
		saveCurrentNodeToLocal()
		tableParam.value.limit = 100
		setCurrentPath(nodeFilePath(currentNodes.value[props.panelType]))
		refresh()
	}
)

// 记录当前节点ID到本地存储
const saveCurrentNodeToLocal = () => {
	const nodeId = currentNodes.value[props.panelType]
	if (nodeId) {
		localStorage.setItem(`fileTransfer_${props.panelType}_nodeId`, nodeId)
	}
}
// 表格列配置
const columns: TableColumnProps[] = [
	useCheckbox({ key: 'vid' }),
	{
		label: '文件名称',
		prop: 'name',
		minWidth: 200,
		showOverflowTooltip: true,
		render: row => (
			<div class="flex items-center files-list">
				<i class={`icon-bg ${['zip', 'rar', '7z', 'gz', 'tar.gz', 'tgz', 'war'].includes(row.ext) ? 'compress' : row.ext}-icon`}></i>
				<span onClick={() => handleOpen(row)} class={`cursor-pointer hover:text-primary truncate ml-[4px] fileName ${row.isReName ? 'hidden' : ''}`} title={row.fileName + row.isLink}>
					{row.fileName + row.isLink}
				</span>
			</div>
		),
	},
	{
		label: '文件大小',
		prop: 'size',
		width: 120,
		render: row => {
			switch (row.ext) {
				case 'folder':
					return <DirSizeCalculator row={row} />
				default:
					return getByteUnit(row.size)
			}
		},
	},
	useOperate([
		{
			title: props.panelType === 'source' ? '发送到右侧' : '发送到左侧',
			width: 100,
			onClick: (row: any) => handleSendToOther(row),
		},
		// {
		//   title: '下载',
		//   onClick: (row:any) => handleDownload(row)
		// },
		{
			title: '删除',
			onClick: (row: any) => handleDelete(row, refresh),
		},
	]),
]

// 使用表格钩子
const {
	BtTable,
	BtSearch,
	BtPage,
	BtColumn,
	refresh,
	ref: tableRef,
	param: tableParam,
} = useAllTable({
	request: async ({ p, limit, search }) => {
		const res = await getFileList({
			nodeId: currentNodes.value[props.panelType],
			path: nodeParams.value.path,
			p,
			showRow: limit,
			search,
		})
		// 存储当前路径
		nodeFilePath(currentNodes.value[props.panelType], res.path)
		setCurrentPath(res.path)
		tableRef.value.clearAllSelect() // 清空选中
		return res
	},
	columns,
	extension: [
		// useTableSelect({
		//   options: fileTypeOptions,
		//   value: 'node1',
		//   key: 'type'
		// }),
	],
})

/**
 * @description 路径改变
 * @param { string } path 路径
 */
const handlePathChange = async (path: string) => {
	setCurrentPath(path)
	refresh()
}

//设置当前路径
const setCurrentPath = (path: string) => {
	currentPath.value = path
	switch (props.panelType) {
		case 'source':
			currentNodes.value.sourcePath = path
			break
		case 'target':
			currentNodes.value.targetPath = path
			break
	}
}

// 下载文件
const handleDownload = (row: any) => {
	if (currentNodes.value.localNodeId === currentNodes.value[props.panelType]) {
		window.open(`/download?filename=${row.path}`, '_blank')
		return
	}
	window.open(`/mod/node/file_transfer/file_download?filename=${row.path}&node_id=${row.nodeId}`, '_blank')
}

const handleOpen = (row: any) => {
	// 处理文件夹打开
	if (row.isFile) return
	currentPath.value = `${row.path}`
	refresh()
}

// 发送到其他节点
const handleSendToOther = async (row: any) => {
	try {
		const files = row === 'all' ? selectList.value : [row]
		createTask(props.panelType, files, () => {
			tableRef.value.clearAllSelect()
		})
	} catch (error) {
		// 错误处理
		tableRef.value.clearAllSelect()
	}
}

/**
 * @description: 获取选中数据
 * @param {FtpTableDataProps[]} val 选中row数据
 * @return {void}
 */
const handleSelectionChange = (val: any): void => {
	selectList.value = val
}

const DirSizeCalculator = defineComponent({
	props: {
		row: {
			type: Object,
			required: true,
		},
	},
	setup(props) {
		return () => (
			<a class="flex items-center" title="点击计算大小" onClick={() => onClickCalc(props.row)}>
				{props.row.loading && <span class="svgtofont-el-loading animate-spin mr-2px"></span>}
				{props.row.loading && <span class="">计算中</span>}
				{!props.row.loading && <div class="text-primary cursor-pointer">{props.row.dirSize === undefined ? '计算' : props.row.dirSize}</div>}
			</a>
		)
	},
})

defineExpose({
	refresh,
})
</script>

<style scoped></style>

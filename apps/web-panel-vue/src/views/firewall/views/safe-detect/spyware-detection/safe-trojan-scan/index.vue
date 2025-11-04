<template>
	<div class="p-[2rem]">
		<div class="title-box flex items-center justify-between">
			<div class="flex items-center">
				<!-- 图标-扫描中 -->
				<div class="scan-icon relative h-[8rem] w-[8rem]" v-if="scanLoad == 'loading'">
					<div class="animate-spin absolute top-0 border-primary border-b-2 rounded-full h-full w-full"></div>
					<bt-icon icon="scanning-scan" :size="60" color="var(--el-color-primary)" class="absolute top-0 left-0 right-0 bottom-0 m-[auto] h-[8rem] w-[6rem]"></bt-icon>
				</div>
				<!-- 图标-扫描完成 -->
				<bt-icon icon="scanning-success" :size="60" color="var(--el-color-primary)" v-if="scanLoad == 'success'"></bt-icon>
				<bt-icon icon="scanning-danger" :size="60" color="var(--el-color-danger)" v-if="scanLoad == 'danger'"></bt-icon>
				<div class="scan-title flex flex-col items-start ml-[2rem]">
					<span class="font-bold text-large text-default">
						查杀{{ scanningData.scanningText }} ，已扫描文件 {{ scanningData.scanningCount }} /{{ scanningData.scanCount }}
						个；发现木马文件
						<span class="text-danger">{{ tableData.length }}</span>
						个
					</span>
					<span class="text-small text-secondary mt-[1.2rem]">
						{{ scanningData.scanInfo.length > 70 ? '...' + scanningData.scanInfo.substring(scanningData.scanInfo.length - 70) : scanningData.scanInfo }}
					</span>
				</div>
			</div>

			<div class="flex items-center ml-[1.2rem]">
				<el-button type="default" @click="cancelScan" v-if="scanLoad === 'loading'"> 取消 </el-button>
				<el-button type="primary" @click="scanData()" v-if="scanLoad != 'loading'"> 重新查杀 </el-button>
			</div>
		</div>
		<el-divider></el-divider>
		<bt-table-group>
			<template #content>
				<bt-table ref="safeTable" :column="tableColumns" :data="tableData" />
			</template>
			<template #footer-left>
				<bt-table-batch :table-ref="safeTable" :options="tableBatchData" />
			</template>
			<template #popup>
				<bt-dialog title="在线编辑" showFooter v-model="editorPopup" :area="70" @confirm="saveFile">
					<div class="p-[2rem]">
						<bt-editor v-model="editorValue" class="!h-[40rem]"></bt-editor>
					</div>
				</bt-dialog>
			</template>
		</bt-table-group>
	</div>
</template>

<script setup lang="ts">
import { deleteFile, getFileBody, saveFileBody, sendBaota } from '@/api/global'
import type { TableBatchDialogProps, TableBatchEventProps, TableBatchNextAllProps, TableBatchOptionsProps } from '@/components/extension/bt-table-batch/types'
import { useBatchStatus, useCheckbox, useOperate } from '@/hooks/tools/table/column'
import { useDataHandle } from '@hooks/tools'
import { useMessage } from '@hooks/tools'
import { useConfirm } from '@hooks/tools'
import { Socket, useSocket } from '@hooks/tools/socket'

interface Props {
	compData?: any
}
const props = withDefaults(defineProps<Props>(), {
	compData: () => {},
})

const Message = useMessage() // 消息提示
// const { proxy: vm }: any = getCurrentInstance() // 获取vue实例对象
const scanLoad = ref('loading') // 扫描状态
const editorPopup = ref(false) // 编辑器弹窗
const editorValue = ref('') // 编辑器内容
let rowData: any = {} // 行数据

let socketInfo: Socket | null = null

const scanningData = reactive({
	scanInfo: '',
	scanCount: 0,
	scanningCount: 0,
	scanningText: '进行中',
}) // 扫描数据

const safeTable = ref() // 获取表格实例
const tableData = ref<any>([]) // 响应式数据

// 批量操作方法
const useBatchEventHandle: TableBatchEventProps = async (batchConfirm: TableBatchDialogProps, nextAll: TableBatchNextAllProps, selectedList: AnyObject[], options: TableBatchOptionsProps): Promise<void> => {
	const { label, value } = options
	const requestHandle = async (item: AnyObject, index: number) => {
		const { path } = item
		switch (value) {
			case 'delete':
				const res = await deleteFile({ path, type: 'File' })
				if (res.status) {
					tableData.value = tableData.value.filter((items: any) => items.path !== path)
				}
				return res
				break
		}
	}
	await batchConfirm({
		title: `批量${label}文件`,
		content: `批量${label}已选的文件，是否继续操作！`,
		column: [
			{
				label: '文件名',
				prop: 'name',
			},
			useBatchStatus(),
		], // 弹窗配置
		onConfirm: async () => {
			// 递归操作所有选中的数据，如果不需要递归则不需要该方法，执行单接口请求
			await nextAll(requestHandle)
			// 执行完毕的代码，刷新列表
			// 返回false则不关闭弹窗
			return false
		},
	})
}
// 批量操作列表
const tableBatchData: TableBatchOptionsProps[] = [
	{
		label: '删除',
		value: 'delete',
		event: useBatchEventHandle,
	},
]

/**
 * @description 创建websocket
 */
const createWebSocket = () => {
	socketInfo = useSocket({
		route: '/ws_panel',
		onMessage: onWSReceive,
	})
}

/**
 * @description 消息接收检测和输出
 * @param {MessageEvent} e 对象
 */
const onWSReceive = (ws: WebSocket, e: MessageEvent) => {
	// 首次接收消息，发送给后端，进行同步适配
	if (e.data === 'token error') {
		Message.error('token error')
		socketInfo?.close()
		return
	}
	const msg = JSON.parse(e.data)
	scanningData.scanInfo = msg.info
	if (msg.is_count) {
		scanningData.scanCount = msg.count
		scanningData.scanningCount = msg.is_count
	}
	if (msg.path) {
		tableData.value.push({
			path: msg.path,
			// 获取path最后一个斜杠后的文件名
			name: msg.path.substring(msg.path.lastIndexOf('/') + 1),
		})
	}
	if (msg.result) {
		scanLoad.value = 'success'
		scanningData.scanningText = '已完成'
		scanningData.scanInfo = '扫描已完成'
		scanningData.scanningCount = scanningData.scanCount
		if (msg.result.length > 0) {
			scanLoad.value = 'danger'
		}
		socketInfo?.close()
	}
}

/**
 * @description 扫描数据
 */
const scanData = async () => {
	tableData.value = []

	createWebSocket()
	scanLoad.value = 'loading'
	scanningData.scanningText = '进行中'
	socketInfo?.send({
		def_name: 'ws_webshell_check',
		mod_name: 'files',
		path: props.compData.row.path,
		ws_callback: '1',
	})
}

/**
 * @description 取消扫描
 */
const cancelScan = async () => {
	await useConfirm({
		title: '提示',
		content: '查杀正在进行中，确定要停止扫描吗？',
		icon: 'question-filled',
	})
	scanningData.scanningText = '已取消'
	scanLoad.value = 'success'
	socketInfo?.close()
}

/**
 *@description 保存文件
 */
const saveFile = async () => {
	useDataHandle({
		request: saveFileBody({
			path: rowData.path,
			data: editorValue.value,
			encoding: 'utf-8',
		}),
		message: true,
	})
}

/**
 *@description 删除文件
 */
const deleteEvent = async (row: any, isMult: boolean = false) => {
	try {
		await useConfirm({
			title: '提示',
			content: '确定删除文件【' + row.path + '】?删除后文件将移至回收站，是否继续操作?',
			icon: 'question-filled',
			type: 'calc',
		})
		useDataHandle({
			request: deleteFile({ path: row.path, type: 'File' }),
			message: true,
			success: (res: any) => {
				if (res.status) {
					tableData.value = tableData.value.filter((items: any) => items.path !== row.path)
				}
			},
		})
	} catch (error) {
		console.log(error)
	}
}

// 安全检测-木马扫描
const useSafeScanColumn = ({ openFileEvent, falseAlarmEvent, deleteEvent }: any) => {
	return [
		useCheckbox(),
		{
			label: '文件名',
			prop: 'name',
			width: 160,
		},
		{
			label: '文件路径',
			prop: 'path',
		},
		useOperate([
			{ onClick: falseAlarmEvent, title: '误报' },
			{
				onClick: openFileEvent,
				title: '打开文件',
				width: 70,
			},
			{ onClick: deleteEvent, title: '删除' },
		]), // 操作
	]
}

const tableColumns = useSafeScanColumn({
	// 扫描文件
	openFileEvent: async (row: any) => {
		useDataHandle({
			request: getFileBody({ path: row.path }),
			success: (res: any) => {
				editorValue.value = res.data.data
				editorPopup.value = true
				rowData = row
			},
		})
	},
	// 误报反馈
	falseAlarmEvent: async (row: any) => {
		try {
			await useConfirm({
				title: '提示',
				content: '是否确定提交误报反馈',
				icon: 'question-filled',
				type: 'calc',
			})
			useDataHandle({
				request: sendBaota({ filename: row.path }),
				message: true,
				success: () => {
					tableData.value = tableData.value.filter((item: any) => item.path !== row.path)
				},
			})
		} catch (error) {
			console.log(error)
		}
	},
	deleteEvent,
}) // 响应式数据

onMounted(() => {
	scanData()
})
</script>

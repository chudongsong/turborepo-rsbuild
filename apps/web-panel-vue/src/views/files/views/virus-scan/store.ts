import { defineStore } from 'pinia'
import { useSocket as createSocket, Socket } from '@hooks/tools'
import { deleteFile, getFileBody } from '@api/files'
import { Message, useConfirm, useDataHandle, useMessage } from '@hooks/tools'
import { useBatchStatus, useCheckbox, useOperate } from '@hooks/tools/table/column'
import { saveFileBody, sendBaota } from '@/api/global'
import type { TableColumnProps } from '@/components/data/bt-table/types'
import type { TableBatchOptionsProps } from '@/components/extension/bt-table-batch/types'

const FILES_VIRUS_SCAN_STORE = defineStore('FILES-VIRUS-SCAN-STORE', () => {
	const path = ref<string>('') // 组件数据

	const scanLoad = ref('loading') // 扫描状态
	const editorPopup = ref(false) // 编辑器弹窗
	const editorValue = ref('') // 编辑器内容

	let useSocket: Socket | null = null

	const scanTableRef = ref<any>() // 表格实例
	const scanningData = reactive({
		scanInfo: '',
		scanCount: 0,
		scanningCount: 0,
		scanningText: '进行中',
		shellCount: 0, // 木马文件数量
	}) // 扫描数据

	const tableData = ref<any>([]) // 响应式数据
	const fileSavePath = ref('') // 保存文件路径

	const tableBatchOptions = (): TableBatchOptionsProps[] => {
		return [
			{
				label: '删除',
				value: 'delete',
				event: async (batchConfirm, nextAll, selectedList, options, clearSelection) => {
					const requestHandle = async (item: any) => await deleteFile({ path: item.path, type: 'File' })
					await batchConfirm({
						title: '批量删除',
						content: '批量删除选中文件，删除后文件将移至回收站，是否继续操作？',
						column: [{ prop: 'path', label: '文件路径' }, useBatchStatus()] as TableColumnProps[], // 弹窗配置
						onConfirm: async () => {
							await nextAll(requestHandle) // 递归操作所有选中的数据
							// 删除成功后，剔除列表中该数据
							tableData.value = tableData.value.filter((item: any) => !selectedList.value.some((it: any) => it.path === item.path))
							// 返回false则不关闭弹窗
							return false
						},
					})
				},
			},
		]
	}

	const useSafeScanColumn = () => {
		return shallowRef<TableColumnProps[]>([
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
		])
	}

	/**
	 * @description 创建websocket
	 */
	const createWebSocket = () => {
		useSocket = createSocket({
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
			useSocket?.close()
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
			scanningData.shellCount = msg.result.length
			if (msg.result.length > 0) {
				scanLoad.value = 'danger'
			}
			Message.success('扫描完成！')
			useSocket?.close()
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
		scanningData.scanInfo = '正在扫描中...'
		useSocket?.send({ 'x-http-token': window.vite_public_request_token })
		useSocket?.send({
			def_name: 'ws_webshell_check',
			mod_name: 'files',
			path: path.value,
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
		})
		scanningData.scanningText = '已取消'
		scanLoad.value = 'success'
		useSocket?.close()
	}

	/**
	 *@description 保存文件
	 */
	const saveFile = async () => {
		await useDataHandle({
			loading: '正在保存文件，请稍后...',
			request: saveFileBody({
				path: fileSavePath.value,
				data: editorValue.value,
				encoding: 'utf-8',
			}),
			message: true,
		})
	}

	/**
	 *@description 删除文件
	 */
	const deleteEvent = async (row: any) => {
		await useConfirm({
			title: '提示',
			content: '确定删除文件【' + row.path + '】，删除后文件将移至回收站，是否继续操作？',
			icon: 'warning',
			type: 'calc',
		})
		useDataHandle({
			loading: '正在删除文件，请稍后...',
			request: deleteFile({ path: row.path, type: 'File' }),
			message: true,
			success: (res: any) => {
				if (res.status) {
					// 删除成功后，剔除列表中该数据
					tableData.value = tableData.value.filter((item: any) => item.path !== row.path)
				}
			},
		})
	}

	/**
	 *@description 误报反馈
	 */
	const falseAlarmEvent = async (row: any) => {
		await useConfirm({
			title: '提示',
			content: '是否确定提交误报反馈',
			type: 'calc',
		})
		useDataHandle({
			loading: '正在提交误报反馈，请稍后...',
			request: sendBaota({ filename: row.path }),
			message: true,
			success: (res: any) => {
				// 成功后，剔除列表中该数据
				if (res.stauts) tableData.value = tableData.value.filter((item: any) => item.path !== row.path)
			},
		})
	}

	/**
	 *@description 打开文件
	 */
	const openFileEvent = async (row: any) => {
		fileSavePath.value = row.path
		await useDataHandle({
			loading: '正在获取文件内容，请稍后...',
			request: getFileBody({ path: row.path }),
			success: (res: any) => {
				editorValue.value = res.data.data
				editorPopup.value = true
			},
		})
	}

	const tableColumns = useSafeScanColumn() // 响应式数据
	const batchOptions = tableBatchOptions()

	const $reset = () => {
		tableData.value = []
		scanLoad.value = 'loading'
		editorPopup.value = false
		editorValue.value = ''
		fileSavePath.value = ''
		Object.assign(scanningData, {
			scanInfo: '',
			scanCount: 0,
			scanningCount: 0,
			scanningText: '进行中',
			shellCount: 0, // 木马文件数量
		})
	}

	return {
		path,
		scanLoad,
		scanningData,
		tableColumns,
		tableData,
		scanTableRef,
		batchOptions,
		editorPopup,
		editorValue,
		saveFile,
		cancelScan,
		scanData,
		$reset,
	}
})

export default FILES_VIRUS_SCAN_STORE

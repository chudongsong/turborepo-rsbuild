import { getNodeFileList, getNodeFileSize, createFileTransferTask, deleteNodeFile, createNodeFile } from '@/api/node'
import { useNodeStore } from '@/views/node/useStore'
import { Socket, useSocket } from '@/hooks/tools/socket'
import { FormInput, FormSelect, FormCustom, FormItemCustom } from '@form/form-item'
import { useMessage, useDataHandle, useConfirm, useDialog, useForm } from '@/hooks/tools'
import { useAllTable } from '@/hooks/tools/table'
import { useOperate, useCheckbox } from '@/hooks/tools/table/column'
import { reconstructionFile } from '@files/useMethods'
import { getPageTotal, isDev } from '@/utils'

const Message = useMessage()

/**
 * @description 节点列表格式化
 * @param { any[] } data 节点列表
 * @returns { any[] } 格式化后的节点列表
 */
export const useNodeListFormat = (data: any[]) => {
	// 过滤掉通过ssh添加的节点
	return data.map(item => {
		return {
			...item,
			isLocal: item.is_local,
			label: item.remarks,
			value: item.id,
		}
	})
}

/**
 * @description 获取文件列表
 * @param { string } nodeId 节点id
 * @param { string } path 路径
 * @param { number } p 页码
 * @param { number } showRow 每页条数
 * @param { string } search 搜索
 * @returns { Promise }
 */
export const getFileList = async ({ nodeId, path, p, showRow, search }: { nodeId: string; path: string; p: number; showRow: number; search: string; limit: number }) => {
	if (!nodeId) {
		return { data: [] }
	}

	try {
		const response = await useDataHandle({
			request: getNodeFileList({
				p,
				showRow,
				node_id: nodeId,
				path,
				search,
			}),
		})

		// 使用类型断言处理响应数据
		const { data } = response as { data: any }
		const { path: currentPath, dir, files, bt_sync, tamper_data } = data
		const { dirs: tDirs, files: tFiles, msg: pMsg } = tamper_data || { dirs: [], files: [], msg: '' }

		// 预分配数组大小以提高性能
		const result = new Array(dir.length + files.length)
		let index = 0

		// 处理目录
		for (let i = 0; i < dir.length; i++) {
			result[index++] = {
				...reconstructionFile('dir', dir[i], pMsg ? '' : tDirs[i], currentPath, bt_sync),
				vid: `dir${index}`,
				nodeId,
				loading: toRef(false),
			}
		}

		// 处理文件
		for (let i = 0; i < files.length; i++) {
			result[index++] = {
				...reconstructionFile('file', files[i], pMsg ? '' : tFiles[i], currentPath),
				vid: `file${index}`,
				nodeId,
			}
		}

		return { data: result, total: getPageTotal(data.page), path: currentPath }
	} catch (err) {
		console.log(err)
		return { data: [], path: path }
	}
}

/**
 * @description 点击计算大小
 * @param { any } row 文件
 */
export const onClickCalc = async (row: any) => {
	if (row.loading || row.dirSize) return
	try {
		row.loading = true
		const { data } = await useDataHandle({
			request: getNodeFileSize({
				node_id: row.nodeId,
				path: row.path,
			}),
		})
		row.dirSize = data.size
		row.loading = false
	} catch (error) {
		row.loading = false
	}
}

/**
 * @description 删除文件
 * @param { any } row 文件
 */
export const deleteFile = async (row: any, refresh: () => void) => {
	await useConfirm({
		title: '删除文件',
		content: `确定要删除文件 "${row.fileName}" 吗？`,
	})
	await useDataHandle({
		message: true,
		loading: '删除中...',
		request: deleteNodeFile({
			node_id: row.nodeId,
			path: row.path,
			is_dir: !row.isFile ? 1 : 0,
		}),
	})
	refresh()
}

export const fileUploadDialog = ref<any>(null)

const showTips = useThrottleFn(() => {
	Message.error('不能直接上传文件到系统根目录!')
}, 2000)
export const handleDragOff = (e: DragEvent, path: string, nodeId: number, refresh: () => void) => {
	e.preventDefault()
	if (path === '/') {
		showTips()
		return
	}
	if (e?.dataTransfer?.items) {
		const isFileOrDirectory = Array.from(e?.dataTransfer?.items).some(item => item.kind === 'file')
		if (isFileOrDirectory) {
			console.log('拖拽文件2', e.dataTransfer.files)
			if (!fileUploadDialog.value) handleUpload(path, nodeId, refresh) // 打开文件上传窗口
		}
	}
}

// 事件处理函数
export const handleUpload = (path: string, nodeId: number, refresh: () => void) => {
	// 处理文件上传
	if (path === '/') {
		Message.error('不能直接上传文件到系统根目录!')
		return
	}
	fileUploadDialog.value = useDialog({
		title: `上传文件到【${path}】`,
		area: '72',
		component: () => import('./node-upload/node-upload.vue'),
		compData: {
			path,
			nodeId,
			refresh,
		},
		onCancel: () => {
			refresh()
			fileUploadDialog.value = null
		},
	})
}

/**
 * @description 获取或设置节点的文件路径
 * @param {number} nodeId 节点ID
 * @param {string} [path] 如果提供路径，则设置该节点的路径；如果不提供，则获取该节点的路径
 * @returns {string} 获取模式下返回节点的路径
 */
export const nodeFilePath = (nodeId: number, path?: string): string => {
	const storageKey = `node_file_path_${nodeId}`

	// 设置模式
	if (path !== undefined) {
		localStorage.setItem(storageKey, path)
		return path
	}

	// 获取模式
	const savedPath = localStorage.getItem(storageKey)
	return savedPath || '/'
}

/**
 * @description 判断是否为1panel
 * @returns {boolean} 是否为1panel
 */
export const isOnePanel = ({ lpver }: { lpver: string }) => {
	return !!lpver
}
let socketInfo: Socket | null = null

/**
 * @description 创建文件分发
 * @param { object } data.sourceNode 源节点数据
 * @param { object } data.targetNode 目标节点数据
 * @param { string[] } data.sourcePathList 文件路径列表
 * @param { string } data.targetPath 目标路径
 * @returns { Promise }
 */
export const createTransferTask = async (data: { sourceNode: any; targetNode: any; sourcePathList: Ref<any[]>; targetPath: string; callback: () => void; complete: () => void }) => {
	try {
		// 先判断是否为1panel
		if (isOnePanel(data.sourceNode) && isOnePanel(data.targetNode)) {
			Message.error('当前两节点均为1panel节点，无法创建文件分发任务')
			data.callback()
			return
		}
		// 再判断目标节点是否处于根目录
		if (data.targetPath === '/') {
			Message.error('目标节点处于根目录，无法创建文件分发任务')
			data.callback()
			return
		}
		// 二次确认
		const mode = await fileTransferConfirm(data)
		// 创建文件分发任务
		const res = await useDataHandle({
			message: true,
			loading: '创建传输任务...',
			request: createFileTransferTask({
				source_node_id: data.sourceNode.id,
				target_node_id: data.targetNode.id,
				source_path_list: JSON.stringify(
					data.sourcePathList.value.map(item => {
						return {
							path: item.path,
							is_dir: !item.isFile,
							size: item.size,
						}
					})
				),
				target_path: data.targetPath,
				default_mode: mode,
			}),
		})
		data.callback()
		// 获取文件传输日志
		res.status && getFileTransferLog(data.complete)
	} catch (error) {
		data.callback()
	}
}

/**
 * @description 获取文件传输日志
 * @param { string } data.node_id 节点id
 * @param { string } data.path 文件路径
 * @returns { Promise }
 */
export const getFileTransferLog = async (refresh: () => void, isInit: boolean = false) => {
	const logContent = ref({
		source_path: '',
		target_path: '',
		target_node: '',
		source_node: '',
		file_count: 0,
		file_complete: 0,
		file_error: 0,
		fileList: [],
	})
	let popupInstance: any = null
	/**
	 * @description 创建websocket
	 */
	const createWebSocket = () => {
		socketInfo?.close()

		socketInfo = useSocket({
			route: '/ws_modsoc',
			onMessage: (ws: WebSocket, e: MessageEvent) => {
				const data = JSON.parse(e.data)
				if (data.type === 'end') {
					socketInfo?.close()
					popupInstance && popupInstance.unmount()
					if (!isInit) {
						logContent.value = {
							...data.task,
							fileList: data.file_status_list,
						}
						createTransferResultPopup()
						Message.success('文件传输完成')
						refresh()
					}
					return // 文件传输结束
				}
				if (data.type === 'error') {
					Message.error(data.msg)
				}
				if (!popupInstance) {
					popupInstance = true // 占位
					createPopup()
				}
				if (data.task) {
					logContent.value = {
						...data.task,
						fileList: data.file_status_list,
					}
				}
			},
			onDisconnected: () => {
				refresh()
			},
		})
		if (isDev) {
			socketInfo?.send({})
		}
		socketInfo?.send({
			mod_name: 'node',
			sub_mod_name: 'file_transfer',
			def_name: 'transfer_status',
			callback: 'xxxxxxo',
			data: {},
		})
	}

	// 创建日志弹窗
	const createPopup = async () => {
		popupInstance = await useDialog({
			title: `文件传输日志`,
			area: 75,
			component: () => import('./bt-file-transfer-progress/index.vue'),
			compData: logContent,
			onCancel: () => {
				socketInfo?.close()
				popupInstance = null
			},
			btns: false,
		})
	}

	/**
	 * @description 创建文件传输结果弹窗
	 */
	const createTransferResultPopup = async () => {
		let success = 0
		let fail = 0
		// 统计成功和失败的数量，同时准备排序
		const failedItems: any[] = []
		const successItems: any[] = []

		if (!logContent.value.fileList) return // 没有文件列表，不显示结果弹窗

		logContent.value.fileList.forEach((item: any) => {
			if (item.status === 'complete') {
				success++
				successItems.push(item)
			} else {
				fail++
				failedItems.push(item)
			}
		})

		useDialog({
			title: `文件传输结果`,
			area: 45,
			component: () => import('./bt-file-transfer-progress/transfer-result.vue'),
			compData: {
				success,
				fail,
				sendList: ref([...failedItems, ...successItems]),
			},
		})
	}

	createWebSocket()
}

/**
 * @description 文件传输二次弹窗
 * @returns { Promise }
 */
export const fileTransferConfirm = async (data: { sourceNode: any; targetNode: any; sourcePathList: Ref<any[]>; targetPath: string; callback: () => void }): Promise<string> => {
	return new Promise((resolve, reject) => {
		useDialog({
			title: '文件传输',
			area: 45,
			component: () => import('./transfer-confirm.vue'),
			btn: true,
			compData: {
				...data,
				complete: (mode: string) => {
					resolve(mode)
				},
			},
			onCancel: () => {
				reject(false)
			},
		})
	})
}

/**
 * @description 新建文件夹
 * @param { string } path 路径
 * @param { number } nodeId 节点id
 * @param { () => void } refresh 刷新函数
 */
export const handleCreateFolder = async (path: string, nodeId: number, refresh: () => void) => {
	const createFolder = async (param: any) => {
		try {
			await useDataHandle({
				message: true,
				loading: '创建中...',
				request: createNodeFile({
					node_id: nodeId.toString(),
					path: `${path}/${param.value.name}`.replace(/\/\//g, '/'),
				}),
			})
			return true
		} catch (error) {
			console.error('提交失败:', error)
			return false
		} finally {
			refresh()
		}
	}
	let dialogInstance: any = null
	const { BtForm, submit } = useForm({
		data: () => ({
			name: '',
		}),
		options: (formData: any) => {
			return computed(() => [
				FormInput('名称', 'name', {
					attrs: {
						class: '!w-[23rem]',
						placeholder: '请输入文件夹名称',
						onkeydown: async (e: KeyboardEvent) => {
							if (e.key === 'Enter') {
								e.preventDefault()
								e.stopPropagation()
								const res = await submit()
								if (res) {
									dialogInstance?.unmount()
								}
							}
						},
					},
					rules: [
						{ required: true, message: '请输入文件夹名称' },
						{
							validator: (rule: any, value: any, callback: any) => {
								const containSpecial = RegExp(/[\*\|\:\\\"\/\<\>\?]+/)
								if (containSpecial.test(value)) {
									callback(new Error('文件夹名称不能包含特殊字符'))
									return
								}
								callback()
							},
							trigger: ['blur', 'change'],
						},
					],
				}),
			])
		},
		submit: async (param: any, validate: any, ref: Ref<any>) => {
			try {
				await validate()
				return await createFolder(param)
			} catch (error) {
				console.error('提交失败:', error)
				return false
			}
		},
	})
	dialogInstance = await useDialog({
		title: `新建文件夹【${path}】`,
		area: 45,
		component: () => (
			<div class="p-[2rem]">
				<BtForm />
			</div>
		),
		btn: true,
		onConfirm: submit,
	})
}

import { getClbAllNode, getScriptList, createExecutorTask, nodeGetDir, nextFlowTip, stopFlowTask } from '@/api/node'
import { useDataHandle, Message, useForm, useDialog, useConfirm, useAllTable } from '@/hooks/tools'
import { FormItemCustom, FormInput, FormSelect, FormRadioButton, FormGroup, FormCustom } from '@form/form-item'
import Sortable from 'sortablejs'
import { useSocket, Socket } from '@hooks/tools/socket'
import { fileSelectionDialog } from '@/public'
import { useNodeScriptMassStore } from '@node/views/script-mass/useStore'
import { openAddScriptView } from '@node/views/script-mass/script-table/useController'
import { getClassList } from '@/views/node/useController'
import { useNodeStore } from '@/views/node/useStore'

import { ElButton, ElCheckbox, ElCheckboxGroup, ElRadioGroup, ElRadioButton, ElInput, ElSelect, ElOption, ElOptionGroup, ElDescriptions, ElDescriptionsItem, ElTag, ElTooltip } from 'element-plus'
import BtEditor from '@/components/extension/bt-editor'
import BtInputIcon from '@/components/form/bt-input-icon'
import BtInput from '@/components/form/bt-input'
import { getRandomPwd, isDev } from '@/utils'

// 服务器选择器
export const useServerSelectController = (props: { value: number[]; options: any[] }) => {
	const selectedServers = useModel(props, 'value')
	const sourceOptions = useModel(props, 'options')
	const filteredServers = ref(props.options)
	const selectedGroup = ref<string[] | null>([])
	const { nodeCategory } = useNodeStore()
	const nodeGroup = computed(() => {
		return nodeCategory.value.filter(item => item.value !== '0' && item.value !== 'all')
	})
	onMounted(() => {
		getClassList()
	})

	watch(sourceOptions, () => {
		applyFilters()
	})

	/**
	 * @description 应用过滤器
	 * @param searchText 搜索文本
	 */
	const applyFilters = (searchText = '') => {
		let filtered = sourceOptions.value.filter(s => !s.is_local)

		// 按分组筛选
		if (selectedGroup.value && selectedGroup.value.length > 0) {
			filtered = filtered.filter(s => (selectedGroup.value as string[]).includes(s.category_id.toString()))
		}

		// 按搜索文本筛选
		if (searchText) {
			filtered = filtered.filter(s => s.remarks.toLowerCase().includes(searchText.toLowerCase()) || s.address?.includes(searchText))
		}

		filteredServers.value = filtered
	}

	/**
	 * @description 处理分组变化
	 * @param groupId 分组ID
	 */
	const handleGroupChange = (groupId: string[] | null) => {
		selectedGroup.value = groupId
		applyFilters()
	}

	/**
	 * @description 过滤服务器
	 * @param value 值
	 */
	const filterServer = (value: string) => {
		applyFilters(value)
	}

	/**
	 * @description 处理服务器切换
	 * @param serverId 服务器ID
	 */
	const handleServerToggle = (serverId: number) => {
		if (selectedServers.value.includes(serverId)) {
			selectedServers.value = selectedServers.value.filter(id => id !== serverId)
		} else {
			selectedServers.value = [...selectedServers.value, serverId]
		}
	}

	/**
	 * @description 选择所有服务器
	 */
	const selectAllServers = () => {
		selectedServers.value = filteredServers.value.map(s => s.id)
	}

	/**
	 * @description 反转选择
	 */
	const invertSelection = () => {
		const filteredIds = filteredServers.value.map(s => s.id)
		const toSelect = filteredIds.filter(id => !selectedServers.value.includes(id))
		const toKeep = selectedServers.value.filter(id => !filteredIds.includes(id))
		selectedServers.value = [...toKeep, ...toSelect]
	}

	/**
	 * @description 清除选择
	 */
	const clearSelection = () => {
		selectedServers.value = []
	}

	return {
		selectedServers,
		filteredServers,
		filterServer,
		handleServerToggle,
		selectAllServers,
		invertSelection,
		clearSelection,
		serverGroups: nodeGroup,
		selectedGroup,
		handleGroupChange,
	}
}
// 服务器选择器
export const ServerSelector = defineComponent({
	name: 'ServerSelector',
	props: {
		value: {
			type: Array as PropType<number[]>,
			default: () => [],
		},
		options: {
			type: Array as PropType<any[]>,
			default: () => [],
		},
	},
	emits: ['goAddNode', 'refresh'],
	setup(props, { emit }) {
		const { selectedServers, filteredServers, filterServer, selectAllServers, invertSelection, clearSelection, serverGroups, selectedGroup, handleGroupChange } = useServerSelectController(props)
		let searchText = ''
		return () => (
			<div class="p-[1.2rem] border border-dark rounded-large space-y-3">
				<div class="flex flex-col sm:flex-row gap-2">
					<ElSelect class="!w-[20rem]" placeholder="分组筛选" clearable multiple collapse-tags max-collapse-tags={1} v-model={selectedGroup.value} onChange={handleGroupChange}>
						{serverGroups.value.map(item => (
							<ElOption key={item.value} value={item.value} label={item.label} />
						))}
					</ElSelect>
					<div class="relative w-full max-w-[36rem]">
						<ElInput type="text" placeholder="搜索节点" v-model={searchText} clearable onInput={filterServer} onClear={() => filterServer('')} />
					</div>
					<div class="flex gap-2">
						<ElButton type="default" onClick={selectAllServers}>
							全选
						</ElButton>
						<ElButton type="default" onClick={invertSelection}>
							反选
						</ElButton>
						<ElButton type="default" onClick={clearSelection}>
							清空
						</ElButton>
					</div>
				</div>

				{/* Server list */}
				<div class="max-h-[20rem] overflow-y-auto">
					{filteredServers.value.length > 0 ? (
						<ElCheckboxGroup v-model={selectedServers.value}>
							<div class="grid grid-cols-4 gap-[1.4rem]">
								{filteredServers.value.map(server => {
									const groupName = serverGroups.value.find(g => g.value === server.category_id)?.label || '未分组'
									const isSelected = selectedServers.value.includes(server.id)
									const serverIp = (server as any).server_ip || server.ip
									const isDisabled = !server.has_ssh

									return (
										<ElTooltip placement="top" effect="dark" content="点击关联SSH" disabled={!isDisabled}>
											<div
												key={server.id}
												class={`flex items-center p-3 border rounded-base transition-all cursor-pointer max-w-[24rem] duration-200 hover:shadow-md ${isSelected ? 'border-primary' : !isDisabled ? 'border-light hover:border-dark' : ''} ${isDisabled ? 'opacity-50' : ''}`}
												onClick={() => {
													if (isDisabled) {
														useDialog({
															title: '添加root账号信息',
															area: 50,
															compData: {
																node_id: server.id,
																server_ip: server.server_ip,
																ssh_conf: {},
																callback: () => {
																	emit('refresh')
																},
															},
															btn: ['保存'],
															component: () => import('@/views/node/views/node-mgt/set-node/ssh/ssh-edit.vue'),
														})
														return
													}
													if (isSelected) {
														selectedServers.value = selectedServers.value.filter(id => id !== server.id)
													} else {
														selectedServers.value = [...selectedServers.value, server.id]
													}
												}}>
												{/* 左侧 Checkbox */}
												<ElCheckbox class="mr-3 pointer-events-none" value={server.id} checked={isSelected} disabled={isDisabled} />

												{/* 中间内容 */}
												<div class="flex-1 min-w-0">
													{/* 服务器名称和状态 */}
													<div class="flex items-center gap-2 mb-[.5rem]">
														<span class="text-base h-[2rem] flex items-center truncate" title={server.remarks}>
															{server.remarks}
														</span>
														<span class={`w-3 h-3 rounded-full ${server.error_num === 0 ? 'bg-success' : 'bg-danger'}`}></span>
													</div>

													{/* IP地址 */}
													<div class="text-small font-mono text-darkTertiary">{serverIp}</div>
												</div>

												{/* 右侧分组信息 */}
												<div class="text-small text-right min-w-0">
													<div class="font-medium truncate" title={groupName}>
														{groupName}
													</div>
												</div>
											</div>
										</ElTooltip>
									)
								})}
							</div>
						</ElCheckboxGroup>
					) : (
						<div class="col-span-full p-4 text-center text-secondary text-small">
							暂无数据,
							<span class="bt-link" onClick={() => emit('goAddNode')}>
								前往添加节点
							</span>
						</div>
					)}
				</div>
			</div>
		)
	},
})

/**
 * @description 选择内容
 */
export const ContentInput = defineComponent({
	name: 'ContentInput',
	props: {
		modelValue: {
			type: String,
			default: '',
		},
		type: {
			type: String,
			default: 'shell',
		},
	},
	setup(props) {
		const type = useVModel(props, 'type')
		const content = useVModel(props, 'modelValue')
		return () => (
			<div>
				<ElRadioGroup v-model={type.value} class="mb-[1rem]">
					<ElRadioButton label="Shell" value="shell" />
					<ElRadioButton label="Python" value="python" />
				</ElRadioGroup>
				<BtEditor class="!h-[36rem] !w-[70rem] " v-model={content.value} />
			</div>
		)
	},
})

/**
 * @description 选择脚本库
 */
export const ContentSelect = defineComponent({
	name: 'ContentSelect',
	props: {
		modelValue: {
			type: Number || undefined,
			default: undefined,
		},
		scriptType: {
			type: String,
			default: 'shell',
		},
		content: {
			type: String,
			default: '',
		},
	},
	setup(props, { expose }) {
		const script = useVModel(props, 'modelValue')
		const scriptType = useVModel(props, 'scriptType')
		const content = useVModel(props, 'content')
		const optionsShell = ref<Array<{ label: string; value: number; content: string }>>([])
		const optionsPython = ref<Array<{ label: string; value: number; content: string }>>([])
		let sourceOptions: any[] = []
		const getScriptData = () => {
			optionsShell.value = []
			optionsPython.value = []
			useDataHandle({
				request: getScriptList({ p: '1', limit: '200' }),
				success: (res: any) => {
					if (res.status) {
						sourceOptions = res.data.data
						res.data.data.forEach((item: any) => {
							if (item.script_type === 'shell') {
								optionsShell.value.push({
									label: item.name,
									value: item.id,
									content: item.content,
								})
							} else if (item.script_type === 'python') {
								optionsPython.value.push({
									label: item.name,
									value: item.id,
									content: item.content,
								})
							}
						})
					}
				},
			})
		}

		getScriptData()

		expose({
			getScriptData,
		})

		return () => (
			<div class="flex items-center gap-[1.2rem]">
				<ElSelect
					class="!w-[50rem]"
					placeholder="请选择脚本"
					filterable
					v-model={script.value}
					onChange={e => {
						const script = sourceOptions.find(item => item.id === e)
						if (script) {
							content.value = script.content || ''
						}
					}}>
					{scriptType.value === 'shell'
						? optionsShell.value.map(option => (
								<ElTooltip popper-class="!max-w-[35rem]" placement="right">
									{{
										default: () => (
											<ElOption key={option.value} value={option.value} label={option.label}>
												<span class="truncate max-w-[20rem]">{option.label}</span>
											</ElOption>
										),
										content: () => <pre class="whitespace-pre-wrap">{option.content.length > 120 ? option.content.substring(0, 120) + '...' : option.content}</pre>,
									}}
								</ElTooltip>
						  ))
						: optionsPython.value.map(option => (
								<ElTooltip popper-class="!max-w-[35rem]" placement="right">
									{{
										default: () => (
											<ElOption key={option.value} value={option.value} label={option.label}>
												<span class="truncate max-w-[20rem]">{option.label}</span>
											</ElOption>
										),
										content: () => <pre class="whitespace-pre-wrap">{option.content.length > 120 ? option.content.substring(0, 120) + '...' : option.content}</pre>,
									}}
								</ElTooltip>
						  ))}
				</ElSelect>
				<span class="bt-link" onClick={() => openAddScriptView(false, undefined, getScriptData)}>
					创建脚本
				</span>
			</div>
		)
	},
})

/**
 * @description 任务表单
 */
export const openTaskForm = async (fetchServerList: AnyFunction, row?: any) => {
	const taskOptions = [
		{ label: '执行命令', value: 'cmd' },
		{ label: '发送文件', value: 'file' },
	]
	const scriptTypeOptions = [
		{ label: '脚本库', value: 'bySelect' },
		{ label: '自定义命令', value: 'byCustom' },
	]
	const scriptOptions = [
		{ label: 'Shell', value: 'shell' },
		{ label: 'Python', value: 'python' },
	]
	const editorRef = ref()
	const isEdit = ref(!!row)
	const nodeList = ref<any[]>([])
	const {
		BtForm,
		ref: fromRef,
		submit,
		clearValidate,
	} = useForm({
		data: () => ({
			name: row?.name || '',
			taskType: row?.task_type === 'file' ? 'file' : 'cmd',

			script_content: (row?.script_id ? '' : row?.script_content) || '',
			cmd_type: isEdit.value ? (row?.script_id ? 'bySelect' : 'byCustom') : 'bySelect',
			script_type: (row?.script_id ? 'shell' : row?.script_type) || 'shell',
			script_id: row?.script_id || undefined,

			source_node: row?.src_node_id || undefined,
			pathArray:
				row?.path_list?.map((item: any) => ({
					key: item.key || getRandomPwd(16),
					sourcePath: item.path,
					isDir: item.is_dir,
					targetPath: item.dst_path,
				})) ||
				([
					{
						key: getRandomPwd(16),
						sourcePath: '',
						isDir: false,
						targetPath: '',
					},
				] as Array<{
					key: string
					sourcePath: string
					isDir: boolean
					targetPath: string
				}>),
		}),
		options: (formDataRef: Ref<any>) => {
			const scriptType = computed(() => {
				if (formDataRef.value.script_type === 'shell') {
					return 'ace/mode/sh'
				}
				return 'ace/mode/python'
			})
			const setEditorMode = () => {
				clearValidate()
				const editor = editorRef.value?.getEditor()
				if (editor) {
					editor.session.setMode(scriptType.value)
				}
			}
			return computed(() => [
				FormInput('任务名称', 'name', {
					attrs: {
						placeholder: '请输入任务名称',
						class: '!w-[30rem]',
					},
					rules: [{ required: true, message: '请输入任务名称' }],
				}),
				FormRadioButton('任务类型', 'taskType', taskOptions, {
					attrs: {
						disabled: isEdit.value,
					},
				}),
				...(formDataRef.value.taskType === 'cmd'
					? [
							FormRadioButton('来源', 'cmd_type', scriptTypeOptions, {
								attrs: {
									onChange: setEditorMode,
								},
							}),
							FormRadioButton('命令类型', 'script_type', scriptOptions, {
								attrs: {
									onChange: () => {
										if (formDataRef.value.cmd_type === 'bySelect') {
											formDataRef.value.script_id = undefined
											return
										}
										const editor = editorRef.value?.getEditor()
										if (editor) {
											editor.session.setMode(scriptType.value)
										}
									},
								},
							}),
							...(formDataRef.value.cmd_type === 'byCustom'
								? [
										FormItemCustom(
											'命令内容',
											() => {
												return <BtEditor class="!h-[36rem] !w-[84rem]" ref={editorRef} v-model={formDataRef.value.script_content} editorOption={{ mode: scriptType.value }} />
											},
											'script_content',
											{
												rules: [{ required: true, message: '请输入命令内容' }],
											}
										),
								  ]
								: [
										FormItemCustom(
											'选择脚本',
											() => {
												return <ContentSelect v-model={formDataRef.value.script_id} v-model:scriptType={formDataRef.value.script_type} v-model:content={formDataRef.value.script_content} />
											},
											'script_id',
											{
												rules: [{ required: true, message: '请选择脚本' }],
											}
										),
								  ]),
					  ]
					: [
							FormSelect(
								'源节点',
								'source_node',
								nodeList.value.map((item: any) => ({ label: `${item.remarks}(${item.server_ip})`, value: item.id })),
								{ attrs: { class: '!w-[30rem]' }, rules: [{ required: true, message: '请选择源节点' }] }
							),
							FormItemCustom(
								'文件内容',
								() => {
									return (
										<div>
											{...formDataRef.value.pathArray.map((item: any) => (
												<div class="flex items-center mb-[1rem] gap-[1.2rem]">
													<BtInputIcon
														v-model={item.sourcePath}
														icon="el-folder-opened"
														placeholder="请选择源文件路径"
														readonly
														width="32rem"
														onIconClick={async () => {
															if (!formDataRef.value.source_node) {
																fromRef.value?.validateField('source_node')
																return
															}
															fileSelectionDialog({
																type: 'all',
																path: item.sourcePath || '/www/wwwroot',
																change: (path: string, type: string) => {
																	item.sourcePath = path
																	item.isDir = type === 'dir'
																},
																disabledCreate: true,
																customRequest: true,
																customRequestApi: (params: { path: string; disk: boolean; search: string }) => {
																	return nodeGetDir({ ...params, node_id: formDataRef.value.source_node })
																},
															})
														}}
													/>
													<span>传输到已选目标节点的:</span>
													<BtInput v-model={item.targetPath} placeholder="请输入目标文件路径" width="32rem" />
													<span
														class="text-danger cursor-pointer"
														onClick={() => {
															formDataRef.value.pathArray = formDataRef.value.pathArray.filter((items: any) => item.key !== items.key)
														}}>
														删除
													</span>
												</div>
											))}
											<ElButton
												type="default"
												onClick={() => {
													formDataRef.value.pathArray.push({
														key: getRandomPwd(16),
														sourcePath: '',
														isDir: false,
														targetPath: formDataRef.value.pathArray.length > 0 ? formDataRef.value.pathArray[formDataRef.value.pathArray.length - 1].targetPath : '',
													})
												}}>
												添加传输文件
											</ElButton>
										</div>
									)
								},
								'filePath',
								{
									rules: [
										{
											required: true,
											trigger: ['blur', 'change'],
											validator: (rule: any, value: any, callback: any) => {
												pathSubmit(formDataRef.value.pathArray, callback)
											},
										},
									],
								}
							),
					  ]),
			])
		},
		submit: async (data: Ref<any>, validate: () => any) => {
			await validate()
			const sourceIp = nodeList.value.find((item: any) => item.id === data.value.source_node)?.server_ip || ''
			formatAddTask(data, isEdit.value, sourceIp, row?.id)
			return true
		},
	})

	useDialog({
		title: `${isEdit.value ? '编辑' : '添加'}任务`,
		area: 100,
		showFooter: true,
		component: () => (
			<div class="p-[1.2rem]">
				<BtForm />
			</div>
		),
		onConfirm: submit,
	})
	const res: any = await fetchServerList('file_src')
	nodeList.value = res
}

/**
 * @description 格式化添加任务
 * @param data 数据
 */
const formatAddTask = (data: Ref<any>, isEdit: boolean, sourceIp: string, id?: number) => {
	const { taskList, currentTaskId } = useNodeScriptMassStore()
	currentTaskId.value = 0
	const params: any = {
		id: getRandomPwd(16),
		task_type: data.value.taskType === 'cmd' ? 'command' : 'file',
		name: data.value.name,
	}
	switch (data.value.taskType) {
		case 'cmd':
			if (data.value.cmd_type === 'byCustom') {
				params.script_content = data.value.script_content
				params.script_type = data.value.script_type
			} else {
				params.script_id = data.value.script_id
				params.script_content = data.value.script_content
			}
			break
		case 'file':
			params.src_node_id = data.value.source_node
			params.src_node_ip = sourceIp
			params.path_list = data.value.pathArray.map((item: any) => {
				return {
					path: item.sourcePath,
					dst_path: item.targetPath,
					is_dir: item.isDir,
				}
			})
			break
	}
	if (isEdit) {
		// 编辑任务
		for (let i = 0; i < taskList.value.length; i++) {
			if (taskList.value[i].id === id) {
				taskList.value[i] = {
					...taskList.value[i],
					...params,
				}
				break
			}
		}
	} else {
		// 添加任务
		taskList.value.push(params)
	}
}
// 文件路径提交处理
export const pathSubmit = async (pathList: any[], callback?: AnyFunction) => {
	if (pathList.length == 0) {
		!callback && Message.error(`请添加传输文件`)
		callback && callback(new Error(`请添加传输文件`))
		return false
	}
	const paths: any = {}
	for (let index = 0; index < pathList.length; index++) {
		const item = pathList[index]
		switch (true) {
			case item.sourcePath == '':
				!callback && Message.error(`文件内容第${index + 1}行` + '源文件路径不能为空')
				callback && callback(new Error(`文件内容第${index + 1}行` + '源文件路径不能为空'))
				return false
			case item.targetPath == '':
				!callback && Message.error(`文件内容第${index + 1}行` + '目标文件路径不能为空')
				callback && callback(new Error(`文件内容第${index + 1}行` + '目标文件路径不能为空'))
				return false
		}
		paths[`${item.sourcePath}`] = item.targetPath
	}
	callback && callback()
	return paths
}

/**
 * @description ws请求
 */
export const useDistributeWs = () => {
	const socketInfo = ref<Socket>()
	/**
	 * @description 创建socket
	 */
	const createWebSocket = (param: any, onWSReceive: AnyFunction) => {
		socketInfo.value?.close()
		socketInfo.value = useSocket({
			route: '/ws_modsoc',
			onMessage: onWSReceive,
		})
		isDev && socketInfo.value?.send(param)
		socketInfo.value?.send(param)
	}
	return {
		createWebSocket,
		closeWebSocket: () => {
			socketInfo.value?.close()
		},
	}
}
/**
 * @description 分布脚本
 */
export const useDistributeController = () => {
	const { contentType, isExecute, taskList, isCanReset, currentTaskId } = useNodeScriptMassStore()
	const { createWebSocket, closeWebSocket } = useDistributeWs()
	const serverList = ref([])
	const selectedServers = ref([])
	const isAll = ref(false) // 失败后继续执行
	const isShowTaskList = ref(false)
	/**
	 * @description 打开任务表单
	 */
	const createTask = async () => {
		if (isExecute.value && !isCanReset.value) {
			return Message.error('当前存在正在执行中的任务，请先停止并清空任务')
		}
		if (currentTaskId.value) {
			await useConfirm({
				title: '提示',
				content: '是否清空当前任务列表并新建任务？',
			})
			taskList.value = []
			currentTaskId.value = 0
			isCanReset.value = false
			isExecute.value = false
		}
		openTaskForm(fetchServerList)
	}
	/**
	 * @description 编辑任务表单
	 */
	const editTask = (task: any) => {
		openTaskForm(fetchServerList, task)
	}
	/**
	 * @description 清空任务
	 */
	const clearTask = async (confirm: boolean = true) => {
		if (isExecute.value) {
			return Message.error('当前任务正在执行，无法清空，请先停止任务')
		}
		if (confirm) {
			await useConfirm({
				title: '清空任务',
				content: '确定清空当前任务吗？',
			})
		}
		// const res: any = await useDataHandle({
		// 	request: nextFlowTip(),
		// 	loading: '正在清空任务...',
		// 	message: true,
		// })
		// if (res.status) {
		reset()
		taskList.value = []
		// }
	}
	/**
	 * @description 任务详情处理
	 */
	const taskDetailHandle = async (msg: any, isInit: boolean = false) => {
		isShowTaskList.value = true
		if (msg.data?.steps) {
			currentTaskId.value = msg.data.id
			// 替换主体内容
			taskList.value = taskList.value.map((item: any, index: number) => {
				return {
					...item,
					...msg.data.steps[index],
				}
			})
		} else if (msg.data?.task_id) {
			// 更新单个任务状态
			const { complete, error, count } = msg.data
			const status = count == error + complete ? (error > 0 ? 'error' : 'success') : undefined
			taskList.value[msg.data.flow_idx].status = status
			msg.data.data.forEach((item: any) => {
				if (!taskList.value[msg.data.flow_idx].result) {
					taskList.value[msg.data.flow_idx].result = []
				}
				taskList.value[msg.data.flow_idx].result[item.log_idx] = item
			})
			// for (let i = 0; i < taskList.value.length; i++) {
			// 	if (taskList.value[i].id === msg.data.task_id) {
			// 		taskList.value[i].status = status
			// 		taskList.value[i].result = msg.data.data
			// 		if (taskList.value[i].result) {
			// 			// const task = taskList.value[i].result.find((item: any) => item.id === msg.data.task_id)
			// 		} else {
			// 			taskList.value[i].result = msg.data.data
			// 		}
			// 		break
			// 	}
			// }
		} else if (msg.type === 'error') {
			// 任务失败
			Message.error(msg.msg)
			if (currentTaskId.value) {
				isCanReset.value = true
			}
			isExecute.value = false
			closeWebSocket()
		} else {
			// 任务结束
			for (let i = 0; i < taskList.value.length; i++) {
				if (taskList.value[i].status == 'error') {
					isCanReset.value = true
					break
				}
			}
			!isInit && Message.success('任务执行完成')
			nextTick(() => {
				isExecute.value = false
			})
			closeWebSocket()
		}
	}
	/**
	 * @description 获取服务器
	 */
	const fetchServerList = async (type: 'all' | 'file_src' = 'all') => {
		const res: any = await useDataHandle({
			request: getClbAllNode({ node_type: type }),
		})
		if (!res.status) {
			Message.error(res.msg)
			return []
		}
		if (type === 'file_src') {
			return res.data.data
		}
		serverList.value = res.data.data
	}
	/**
	 * @description 执行/停止/重新执行
	 */
	const submit = async () => {
		if (isExecute.value) {
			// 停止任务
			useDataHandle({
				request: stopFlowTask({ flow_id: currentTaskId.value }),
				loading: '正在停止任务...',
				message: true,
				success: (res: any) => {
					if (res.status) {
						isExecute.value = false
						isCanReset.value = true
					}
				},
			})
			return
		}
		// if (isCanReset.value) {
		// 	return Message.error('请先清空当前任务')
		// }
		if (!selectedServers.value.length && !isCanReset.value) {
			return Message.error('请选择执行节点')
		}
		let params: any = {
			mod_name: 'node',
			sub_mod_name: 'executor',
			def_name: isCanReset.value ? 'retry_flow' : 'run_flow_task',
			callback: isCanReset.value ? 'retry_flow' : 'run_flow_task',
			data: {
				...(isCanReset.value
					? {
							flow_id: currentTaskId.value,
					  }
					: {
							node_ids: selectedServers.value,
							flow_data: taskList.value,
							run_when_error: isAll.value,
					  }),
			},
		}
		isExecute.value = true
		isCanReset.value = false
		let loading = Message.load('开始创建任务...')
		createWebSocket(params, (ws: WebSocket, e: MessageEvent) => {
			const msg = JSON.parse(e.data)
			taskDetailHandle(msg)
			nextTick(() => {
				loading.close()
			})
		})
		// selectedServers.value = []
	}

	/**
	 * @description: tab拖拽
	 * @return {void}
	 */
	const rowDrop = () => {
		const taskListRef = document.querySelector('.drug-task-list')
		Sortable.create(taskListRef as HTMLElement, {
			animation: 500,
			handle: '.svgtofont-icon-drag',
			chosenClass: 'ghost',
			onEnd: async (e: any) => {
				const currentRow = taskList.value.splice(e.oldIndex, 1)[0]
				taskList.value.splice(e.newIndex, 0, currentRow)
			},
		})
	}

	/**
	 * @description 初始化
	 */
	const init = () => {
		let params: any = {
			mod_name: 'node',
			sub_mod_name: 'executor',
			def_name: 'flow_task_status',
			callback: 'flow_task_status',
			data: {},
		}
		createWebSocket(params, (ws: WebSocket, e: MessageEvent) => {
			const msg = JSON.parse(e.data)
			if (msg.type !== 'end') {
				isShowTaskList.value = true
			} else {
				// 上次任务执行完毕
				// if (msg.last_flow && msg.last_flow?.id === currentTaskId.value && msg.last_flow?.status === 'complete') {
				// 	taskList.value = []
				// 	reset()
				// }
				if (msg.last_flow && msg.last_flow?.id === currentTaskId.value && taskList.value.length > 0) {
					// if (msg.last_flow && msg.last_flow?.status === 'error' && taskList.value.length > 0) {
					msg.data = msg.last_flow
				}
			}
			taskDetailHandle(msg, true)
		})
	}

	/**
	 * @description 重置
	 */
	const reset = () => {
		selectedServers.value = []
		isCanReset.value = false
		isExecute.value = false
		currentTaskId.value = 0
	}

	return {
		contentType,
		serverList,
		selectedServers,
		fetchServerList,
		submit,
		init,
		isAll,
		createTask,
		rowDrop,
		taskList,
		isShowTaskList,
		editTask,
		clearTask,
		isCanReset,
		isExecute,
	}
}

import { useDialog, useAllTable, useDataHandle, useConfirm } from '@/hooks/tools'
import { useOperate } from '@/hooks/tools/table/column'
import { getCommandTaskInfo, getTransferFileTaskInfo } from '@/api/node'
import { Transition } from 'vue'

import BtEditor from '@/components/extension/bt-editor'
import { ElButton, ElDescriptions, ElDescriptionsItem, ElTag, ElTooltip } from 'element-plus'
import { useNodeScriptMassStore } from '@node/views/script-mass/useStore'
import { getRandomPwd } from '@/utils'
import { openLogDialog } from '@node/views/script-mass/mass-table/useController'
import { isDark } from '@/utils/theme-config'

/**
 * @description 编辑器
 */
const Editor = defineComponent({
	name: 'Editor',
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
		const content = useVModel(props, 'modelValue')
		const editorOption = {
			mode:`ace/mode/${props.type === 'python' ? 'python' : 'sh'}`,
			theme: !isDark.value ? 'ace/theme/chrome' : 'ace/theme/clouds_midnight', //主题
			wrap: true, // 是否自动换行
			showInvisibles: false, // 是否显示空格
			showFoldWidgets: false, // 是否显示代码折叠线
			useSoftTabs: true, // 是否使用空格代替tab
			tabSize: 2, // tab宽度
			showPrintMargin: false, // 是否显示打印边距
			readOnly: true, // 是否只读
			fontSize: '12px', // 字体大小
		}
		return () => (
			<div>
				<BtEditor class="!h-[36rem] !w-[70rem]" v-model={content.value} editorOption={editorOption} />
			</div>
		)
	},
})

/**
 * @description 编辑器
 */
export const openDetailCmd = (cmd: string, type: string) => {
	useDialog({
		title: '命令详情',
		area: 75,
		component: () => (
			<div class="p-[1.2rem]">
				<Editor v-model={cmd} type={type} />
			</div>
		),
	})
}

/**
 * @description 折叠组件
 */
export const Collapse = defineComponent({
	name: 'Collapse',
	props: {
		modelValue: {
			type: Boolean,
			default: false,
		},
	},
	setup(props, { slots }) {
		const isOpen = useVModel(props, 'modelValue')
		const contentRef = ref<Element | null>(null)

		// 动画钩子
		const beforeEnter = (el: any) => {
			el.style.height = '0'
		}
		const enter = (el: any) => {
			el.style.height = el.scrollHeight + 'px'
		}
		const afterEnter = (el: any) => {
			el.style.height = 'auto'
		}

		const beforeLeave = (el: any) => {
			el.style.height = el.scrollHeight + 'px'
		}
		const leave = (el: any) => {
			// 触发强制回流，保证动画起点正确
			void el.offsetHeight
			el.style.height = '0'
		}
		const afterLeave = (el: any) => {
			el.style.height = '0'
		}

		return () => (
			<div>
				<Transition onBeforeEnter={beforeEnter} onEnter={enter} onAfterEnter={afterEnter} onBeforeLeave={beforeLeave} onLeave={leave} onAfterLeave={afterLeave}>
					{isOpen.value && (
						<div
							ref={contentRef}
							class="collapse-content mt-[1.2rem]"
							style={{
								overflow: 'hidden',
								transition: 'height 0.3s ease',
							}}>
							{slots.default?.()}
						</div>
					)}
				</Transition>
			</div>
		)
	},
})

/**
 * @description 结果展示
 */
export const useResultShow = (task: any) => {
	const task_type = task.task_type
	/**
	 * Element Plus 表格 扩展组件
	 */
	const getExpandStatus = (status: any) => {
		const obj = {
			color: 'var(--el-color-text-secondary)',
			content: '等待执行',
		}
		switch (status) {
			case 0:
				obj.color = 'var(--el-color-text-secondary)'
				obj.content = '等待中'
				break
			case 1:
				obj.color = 'var(--el-color-text-secondary)'
				obj.content = '进行中'
				break
			case 2:
				obj.color = 'var(--el-color-success)'
				obj.content = '执行成功'
				break
			case 3:
				obj.color = 'var(--el-color-danger)'
				obj.content = '执行失败'
				break
			case 4:
				obj.color = 'var(--el-color-warning)'
				obj.content = task_type === 'command' ? '异常' : '跳过'
				break
		}
		return <span style={{ color: obj.color }}>{obj.content}</span>
	}
	/**
	 * 将数组中相同 dst_node_idx 的对象合并到一起
	 * @param arr - 原始数组，元素必须包含 dst_node_idx 属性
	 * @returns 一个新的数组，每个元素的格式为：
	 *          { name: number | string, data: Array<Record<string, any>> }
	 */
	function groupByName<T extends { dst_node_idx: string | number; [key: string]: any }>(arr: T[]): { dst_node_idx: T['dst_node_idx']; data: Omit<T, 'dst_node_idx'>[] }[] {
		// 使用 Map 来按 dst_node_idx 分组，保证性能 O(n)
		const map = new Map<T['dst_node_idx'], Omit<T, 'dst_node_idx'>[]>()

		for (const item of arr) {
			const { dst_node_idx, ...rest } = item
			if (!map.has(dst_node_idx)) {
				map.set(dst_node_idx, [])
			}
			// 将除了 name 之外的属性存入 data
			map.get(dst_node_idx)!.push(rest)
		}

		// 转换成你需要的目标结构
		return Array.from(map, ([dst_node_idx, data]) => ({ dst_node_idx, data }))
	}
	const { BtTable } = useAllTable({
		request: async () => {
			// 获取原始数据
			let rawData = task.result
			if (!rawData) {
				const res: any = await useDataHandle({
					request: task.task_type === 'command' ? getCommandTaskInfo({ task_id: task.id }) : getTransferFileTaskInfo({ task_id: task.id }),
				})
				if (!res.status) return { data: [], total: 0 }
				rawData = res.data.data.data
			}

			// 统一数据处理逻辑
			const processData = (data: any) => {
				if (task.task_type === 'command') {
					const sortedData = data?.sort((a: any, b: any) => a.dst_node_idx - b.dst_node_idx) || []
					return { data: sortedData, total: sortedData.length }
				} else {
					const groupedData = groupByName(data) || []
					return { data: groupedData, total: groupedData.length }
				}
			}

			return processData(rawData)
		},
		columns: [
			...(task.task_type === 'command'
				? []
				: [
						{
							type: 'expand',
							render: (row: any) => {
								return (
									<div class="px-[1.2rem]">
										{row.data.map((item: any) => {
											const BtTableExpand = getExpandStatus(item.status)
											return (
												<div class="flex items-center justify-between border-b py-[.8rem]">
													<div class="w-[600px] truncate" title={item.dst_file}>
														{item.dst_file}
													</div>
													<div>{BtTableExpand}</div>
												</div>
											)
										})}
									</div>
								)
							},
						},
				  ]),
			{
				label: '节点地址',
				prop: 'ssh_host',
				width: task.task_type === 'command' ? 195 : 670,
				render: (row: any) => {
					return task.task_type === 'command' ? row.ssh_host : task.dst_nodes[row.dst_node_idx].name
				},
			},
			// ...(task.task_type === 'command'
			// 	? []
			// 	: [
			// 			{
			// 				label: '文件地址',
			// 				prop: 'dst_file',
			// 				showOverflowTooltip: true,
			// 			},
			// 	  ]),
			...(task.task_type === 'command'
				? [
						{
							label: '状态',
							width: 80,
							render: (row: any) => {
								const obj = {
									color: 'var(--el-color-text-secondary)',
									content: '等待执行',
								}
								switch (row.status) {
									case 0:
										obj.color = 'var(--el-color-text-secondary)'
										obj.content = '等待中'
										break
									case 1:
										obj.color = 'var(--el-color-text-secondary)'
										obj.content = '进行中'
										break
									case 2:
										obj.color = 'var(--el-color-success)'
										obj.content = '执行成功'
										break
									case 3:
										obj.color = 'var(--el-color-danger)'
										obj.content = '执行失败'
										break
									case 4:
										obj.color = 'var(--el-color-warning)'
										obj.content = task_type === 'command' ? '异常' : '跳过'
										break
								}
								return <span style={{ color: obj.color }}>{obj.content}</span>
							},
						},
						useOperate([
							{
								title: '查看详情',
								width: 80,
								onClick: (row: any) => {
									openLogDialog(row.log_name, row.message, () => {})
								},
							},
						]),
				  ]
				: []),
		],
	})

	useDialog({
		title: '任务详情',
		area: task.task_type === 'command' ? 40 : 75,
		component: () => (
			<div class="p-[1.2rem]">
				<BtTable max-height={300} />
			</div>
		),
	})
}

/**
 * @description 任务卡片组件
 */
export const TaskCard = defineComponent({
	name: 'TaskCard',
	props: {
		task: {
			type: Object as PropType<any>,
			default: () => ({}),
		},
		index: {
			type: Number,
			default: 0,
		},
		type: {
			type: String,
			default: 'execute',
		},
	},
	emits: ['edit'],
	setup(props, { emit }) {
		const { isExecute, taskList, isCanReset } = useNodeScriptMassStore()
		const isOpen = ref(true)
		const showFullCommand = ref(false)
		const isShowType = ref(props.type === 'show')
		const tagStyle = {
			backgroundColor: 'var(--el-fill-color-dark) !important',
			color: 'var(--el-base-supplement) !important',
			borderColor: 'var(--el-color-border-dark) !important',
		}
		const checkTaskStatus = (status: string | undefined) => {
			// if (isShowType.value) {
			switch (props.task.status) {
				case 0:
					return {
						type: 'info',
						content: '等待中',
					}
				case 1:
					return {
						type: 'info',
						content: '进行中',
					}
				case 2:
					return {
						type: 'success',
						content: '执行成功',
					}
				case 3:
					return {
						type: 'danger',
						content: '执行失败',
					}
				case 4:
					return props.task.task_type === 'command'
						? {
								type: 'danger',
								content: '异常',
						  }
						: {
								type: 'danger',
								content: '执行失败',
						  }
			}
			// }
			if (isExecute.value && status === undefined) {
				return {
					type: 'info',
					content: '执行中',
				}
			}
			switch (status) {
				case 'success':
					return {
						type: 'success',
						content: '执行成功',
					}
				case 'error':
					return {
						type: 'danger',
						content: '执行失败',
					}
			}
			return {
				type: 'info',
				content: '等待执行',
			}
		}
		const getSourceNode = (task: any) => {
			if (task.src_node) {
				return `${task.src_node.name}(${task.src_node.address ? task.src_node.address : '127.0.0.1'})`
			}
			return `${task.src_node_id}(${task.src_node_ip})`
		}
		return () => (
			<div class="border border-light rounded-large p-[1.2rem] mb-[1.6rem] box-shadow-[0_0.1rem_0.3rem_rgba(0,0,0,0.1)] task-card">
				<div class="flex items-center justify-between py-[.8rem] h-[3rem] cursor-pointer" onClick={() => (isOpen.value = !isOpen.value)}>
					<div class="flex items-center">
						{!props.task.status && !isExecute.value && !isShowType.value && <i class="svgtofont-icon-drag cursor-move mover align-middle mr-[.8rem]"></i>}
						<div class="text-medium font-bold max-w-[40rem] truncate">
							{props.task.name}
							{/* {props.index + 1}.{props.task.name} */}
						</div>
						<div class="flex items-center gap-[.8rem] ml-[1.2rem]">
							<ElTag type="warning" style={props.task.task_type === 'command' ? tagStyle : {}}>
								{props.task.task_type === 'command' ? '命令任务' : '文件任务'}
							</ElTag>
							<ElTag type={checkTaskStatus(props.task.status).type}>{checkTaskStatus(props.task.status).content}</ElTag>
						</div>
						{!props.task.status && !isExecute.value && !isShowType.value && (
							<div class="flex items-center gap-[1.2rem] hover-btn">
								<ElTooltip content="编辑任务" placement="top">
									<ElButton
										type="default"
										class="!ml-[.8rem]"
										style={{ padding: '6px 12px !important' }}
										size="small"
										circle
										onClick={e => {
											e.stopPropagation()
											// 编辑任务
											emit('edit', props.task)
										}}>
										<i class="svgtofont-el-edit"></i>
									</ElButton>
								</ElTooltip>
								<ElTooltip content="复制任务" placement="top">
									<ElButton
										type="default"
										class="!ml-0"
										style={{ padding: '6px 12px !important' }}
										size="small"
										circle
										onClick={e => {
											e.stopPropagation()
											// 复制任务
											taskList.value.splice(props.index + 1, 0, {
												...props.task,
												id: getRandomPwd(16),
											})
										}}>
										<i class="svgtofont-el-document-copy"></i>
									</ElButton>
								</ElTooltip>
								<ElTooltip content="删除任务" placement="top">
									<ElButton
										type="danger"
										class="!ml-0"
										style={{ padding: '6px 12px !important' }}
										size="small"
										circle
										onClick={async e => {
											e.stopPropagation()
											await useConfirm({
												title: '删除任务',
												content: '确定删除该任务吗？',
											})
											taskList.value = taskList.value.filter((item: any) => item.id !== props.task.id)
										}}>
										<i class="svgtofont-el-delete text-white"></i>
									</ElButton>
								</ElTooltip>
							</div>
						)}
					</div>
					<div class="text-small">
						<span class={isOpen.value ? 'svgtofont-el-arrow-up' : 'svgtofont-el-arrow-down'}></span>
					</div>
				</div>
				<Collapse v-model={isOpen.value}>
					<ElDescriptions column={1} border>
						{props.task.task_type === 'command' ? (
							<>
								<ElDescriptionsItem label="类型" label-class-name="!w-[12rem]">
									{!props.task.script_id ? '自定义命令' : '脚本库'}
								</ElDescriptionsItem>
								{!props.task.script_id && (
									<ElDescriptionsItem label="命令类型" label-class-name="!w-[12rem]">
										{props.task.script_type}
									</ElDescriptionsItem>
								)}
								<ElDescriptionsItem label="命令内容" label-class-name="!w-[12rem]">
									<div>
										<pre class="!text-small !whitespace-pre-wrap">{showFullCommand.value ? props.task.script_content : props.task.script_content.length > 120 ? props.task.script_content.substring(0, 120) + '...' : props.task.script_content}</pre>
										{props.task.script_content.length > 120 && (
											<span
												class="bt-link mt-[.8rem] text-small"
												onClick={() => {
													if (props.task.script_content.length > 1000) {
														openDetailCmd(props.task.script_content, props.task.script_type)
													} else {
														showFullCommand.value = !showFullCommand.value
													}
												}}>
												{showFullCommand.value ? '收起' : '查看完整命令'}
											</span>
										)}
									</div>
								</ElDescriptionsItem>
							</>
						) : (
							<>
								<ElDescriptionsItem label="源节点" label-class-name="!w-[12rem]">
									{getSourceNode(props.task)}
								</ElDescriptionsItem>
								{props.task.path_list.map((item: any) => (
									<ElDescriptionsItem label="传输路径" label-class-name="!w-[12rem]">
										<div class="w-full flex items-center justify-between">
											<div class="w-[41%] max-w-[34rem] truncate" title={item.path}>
												源:&nbsp;{item.path}
											</div>
											<div class="">&gt;&gt;已选择执行节点的:</div>
											<div class="w-[41%] max-w-[34rem] truncate" title={item.dst_path}>
												{item.dst_path}
											</div>
										</div>
									</ElDescriptionsItem>
								))}
							</>
						)}
						{!isExecute.value && props.task.status ? (
							<ElDescriptionsItem label="执行结果" label-class-name="!w-[12rem]">
								<span class="bt-link" onClick={() => useResultShow(props.task)}>
									点击查看
								</span>
							</ElDescriptionsItem>
						) : isShowType.value ? (
							<ElDescriptionsItem label="执行结果" label-class-name="!w-[12rem]">
								<span class="bt-link" onClick={() => useResultShow(props.task)}>
									点击查看
								</span>
							</ElDescriptionsItem>
						) : null}
					</ElDescriptions>
				</Collapse>
			</div>
		)
	},
})

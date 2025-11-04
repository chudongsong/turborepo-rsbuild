import { Message, useDataHandle, useAllTable, useDialog } from '@/hooks/tools'
import { getFileBody } from '@/api/global'
import { getFlowTaskList, retryExecutorTask, getTransferFileTaskInfo, getCommandTaskInfo } from '@/api/node'
import { getLines } from '@/api/global'
import { useOperate } from '@/hooks/tools/table/column'
import { getPageTotal } from '@/utils'
import { Collapse, TaskCard } from '@node/views/script-mass/useController'

import BtLog from '@/components/extension/bt-log/index.vue'

/**
 * @description 获取任务列表
 */
export const getTaskData = async (tableParam: any) => {
	const res: any = await useDataHandle({
		request: getFlowTaskList(tableParam),
	})
	return {
		data: res.data.data,
		total: getPageTotal(res.data.page),
	}
}
const ResultDialog = defineComponent({
	props: {
		task: {
			type: Object,
			default: () => {},
		},
	},
	setup(props) {
		const isOpen = ref(true)
		return () => (
			<div class="p-[1.2rem]">
				{/* 节点展示区 */}
				<div class="p-[1.2rem] border border-dark rounded-large mb-[1.2rem]">
					<div class="flex items-center justify-between py-[.8rem] h-[3rem] cursor-pointer" onClick={() => (isOpen.value = !isOpen.value)}>
						<div class="text-medium font-bold">执行节点</div>
						{/* <div class="text-[1.2rem]">
							<span class="bt-link">{isOpen.value ? '收起' : '展开'}</span>
						</div> */}
					</div>
					<Collapse v-model={isOpen.value}>
						<div class="grid grid-cols-4 gap-[1.4rem] max-h-[30rem] overflow-y-auto">
							{props.task.server_list.map((server: any) => (
								<div key={server.id} class={`flex items-center p-3 border border-dark rounded-base transition-all  max-w-[24rem] duration-200 hover:shadow-md`}>
									{/* 中间内容 */}
									<div class="flex-1 min-w-0">
										{/* 服务器名称和状态 */}
										<div class="flex items-center gap-2 mb-[.5rem]">
											<span class="text-base h-[2rem] flex items-center truncate" title={server.name}>
												{server.name}
											</span>
										</div>

										{/* IP地址 */}
										<div class="text-small font-mono text-tertiary">{server.server_ip}</div>
									</div>
								</div>
							))}
						</div>
					</Collapse>
				</div>
				{/* 任务展示区 */}
				<div class="p-[1.2rem] border border-dark rounded-large">
					<div class="flex items-center justify-between py-[.8rem] h-[3rem] mb-[1.2rem]">
						<div class="text-medium font-bold">任务列表</div>
					</div>
					{props.task.steps.map((step: any) => (
						<TaskCard key={step.id} task={step} type="show" />
					))}
				</div>
			</div>
		)
	},
})
/**
 * @description 打开执行结果弹窗
 */
export const openResultDialog = (task: any) => {
	useDialog({
		title: '执行记录',
		area: 110,
		component: () => <ResultDialog task={task} />,
	})
}
// let timerX: any = null
const LogDialog = defineComponent({
	props: {
		logName: {
			type: String,
			default: '',
		},
		content: {
			type: String,
			default: '',
		},
	},
	setup(props: { logName: string; content?: string }) {
		const logContent = ref<string>(props.content || '获取中...')
		const getLog = async () => {
			// timerX = setInterval(async () => {
			// 展示日志 每秒轮询
			const { data: rdata } = await getFileBody({ path: '/www/server/panel/logs/executor_log/' + props.logName })
			logContent.value = rdata.data
			// if (rdata.msg.indexOf('任务失败') > -1 || rdata.msg.indexOf('执行结束') > -1 || !rdata.status) {
			// 	// showLogDialog.value = false
			// 	if (!rdata.status) {
			// 		Message.request(rdata)
			// 	}
			// 	clearInterval(timerX)
			// }
			// }, 500)
		}
		if (!props.content) {
			getLog()
		}

		// onUnmounted(() => {
		// clearInterval(timerX)
		// })

		return () => (
			<div class="flex-wrap">
				<BtLog class="h-[40rem] !rounded-none" content={logContent.value} />
			</div>
		)
	},
})
/**
 * @description 获取任务详情
 */
export const openLogDialog = async (log_name: string, log?: string, refresh?: () => void) => {
	useDialog({
		title: '执行记录',
		component: () => <LogDialog logName={log_name} content={log} />,
		area: 55,
		onCancel: refresh,
	})
}

/**
 * @description 重新执行
 */
export const reRun = async (log_id: number, task_id: number, refresh: () => void) => {
	await useDataHandle({
		request: retryExecutorTask({ task_id, log_id }),
		// message: true,
		success: (res: any) => {
			res.status && refresh()
		},
	})
}

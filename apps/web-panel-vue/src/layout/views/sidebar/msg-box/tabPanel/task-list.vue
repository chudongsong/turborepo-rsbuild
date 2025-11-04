<template>
	<div v-bt-loading="taskLogsloading" class="w-full h-full flex flex-col justify-center content-center">
		<div v-if="!realTimeTask" class="h-full">
			<div class="flex align-middle justify-center h-full">
				<el-empty class="flex">
					<template #image>
						<i class="!text-tertiary svgtofont-empty !text-[7rem]" />
					</template>
					<template #description>
						<span class="text-medium text-secondary">当前没有任务执行</span>
					</template>
				</el-empty>
			</div>
		</div>
		<div v-else class="taskList pr-[10px] mb-[10px]">
			<div v-if="taskRealTimeList.length > 0" class="taskTips flex justify-between">
				<span> 提示：若任务长时间未执行，请尝试点击【重启面板】来重置任务队列 </span>
				<bt-link @click="restartSeverDialog">重启面板</bt-link>
			</div>
			<el-divider class="!my-1rem"></el-divider>
			<div v-for="(item, index) in taskRealTimeList" :key="index" class="taskItem">
				<template v-if="item.type === 'execshell'">
					<div class="taskItemHeader">
						<span class="taskItemName">{{ item.name }}</span>
						<span>
							<span :class="{ leaveOut: item.status === '-1' }">
								{{ item.status === '0' ? '等待' : '正在安装' }}
							</span>
							<bt-divider></bt-divider>
							<span class="bt-link" @click="deleteCurrentTask(item.id)"> 删除 </span>
						</span>
					</div>
					<pre v-if="item.status === '-1' && item.type === 'execshell'" id="taskRealTimeLogs" v-scroll-bottom class="taskRealTimeLog">{{ taskLogs }}</pre>
				</template>
			</div>
		</div>
		<!-- <div v-if="taskRealTimeList.length > 0 && realTimeTask" class="taskTips">提示：若任务长时间未执行，请尝试在首页点【重启面板】来重置任务队列</div> -->
	</div>
</template>

<script setup lang="ts">
import { useGlobalStore } from '@/store/global'
import { isNumber, isObject, isString, scrollBottom } from '@/utils'
import { getTaskSpeed, removeTaskFile } from '@api/global'
import { restartSeverDialog } from '@/public/index'

import { useConfirm } from '@confirm/index'
import { useMessage } from '@message/index'
import { useSocket } from '@socket/index'

const { panel } = useGlobalStore() // 全局store

const message = useMessage()

const taskLogsloading = ref(true) //
const realTimeTask = ref(true) // 是否有任务在执行
const taskRealTimeList = ref<any[]>([]) // 任务实时列表
const taskLogs = ref('')
const taskActualSocket = ref(false) // 任务实时Socket
const msgBoxSockShell: any = ref(inject('msgBoxSockShell', null)) // 任务实时Socket
const taskActualNum: any[] = [] // 任务实时Socket
let tackTimeout: any = null // 任务实时时间定时器

/**
 * @description 获取任务实时列表
 * @returns {Promise<void>}
 */
const getTasksRealTimeList = async (): Promise<void> => {
	try {
		taskLogsloading.value = true
		const { data }: any = await getTaskSpeed()
		if (isObject(data) && typeof data.task !== 'undefined') {
			const { task, msg } = data
			// 更新任务数量
			panel.value.msgBoxTaskCount = task.length
			if (task.length > 0) {
				realTimeTask.value = true
				taskRealTimeList.value = task
				const { type, status } = task[0]
				// 判断是否是软件安装任务
				if (type === 'execshell') {
					// 任务是否开始执行
					if (status === '-1') {
						// 软件安装详情ws连接
						softwareInstallDetails()
						// 清空任务实时Socket日志
						taskLogs.value = ''
						taskLogs.value = msg
						nextTick(() => scrollBottom('#taskRealTimeLogs'))
						// 任务实时Socket是否保持连接
						taskActualSocket.value = true
					} else {
						// 任务未开始，则每隔2秒请求一次任务实时列表，继续监听。
						setTimeout(() => {
							getTasksRealTimeList()
						}, 2000)
						taskActualSocket.value = true
					}
				} else {
					taskActualSocket.value = false
				}
			}
		} else {
			panel.value.msgBoxTaskCount = 0
			realTimeTask.value = false
		}
	} catch (err) {
		console.log(err)
	} finally {
		taskLogsloading.value = false
	}
}

/**
 * @description 软件安装详情ws连接
 */
const softwareInstallDetails = async () => {
	// alert(globalStore.sockShell)
	if (msgBoxSockShell.value) return
	// 创建ws连接，该监听默认发送csrf_token,如果需要其他参数，可以在onopen中发送
	msgBoxSockShell.value = useSocket({
		route: '/sock_shell',
		onMessage: async (ws: WebSocket, ev: MessageEvent) => {
			const { data } = ev
			// 监听到当前任务信息中包含指定的关键字，则重新获取任务列表，
			// 并将任务挂起3秒，3秒后如果没有其他任务相应，则关闭ws连接
			if (data.indexOf('|-Successify --- 命令已执行! ---') > -1) {
				await getTasksRealTimeList() // 获取任务实时列表
				await softwareEvent() // 软件界面触发事件
				setTimeout(async () => {
					await getTasksRealTimeList()
					if (taskActualSocket.value) return
					msgBoxSockShell.value?.close()
					msgBoxSockShell.value = null
					taskLogs.value = ''
				}, 2000)
			} else if (isString(data)) {
				// 将数据存入数组，当内容过多时(50条)，删除数组第一条数据，保持最新50条数据
				taskActualNum.push(data)
				if (taskActualNum?.length > 50) taskActualNum.shift()
				if (isNumber(tackTimeout)) return
				// 1.5秒后将数组内容赋值给taskLogs，实现1.5s实时更新，避免频繁输出插入，导致页面卡顿
				tackTimeout = setTimeout(() => {
					taskLogs.value = taskActualNum.join('')
					tackTimeout = null
				}, 500)
			}
		},
	})
	// 发送获取任务执行的信息
	msgBoxSockShell.value.send('tail -n 100 -f /tmp/panelExec.log')
}

/**
 * @description 删除当前任务
 * @param {number} id 任务id
 * @returns {Promise<void>}
 */
const deleteCurrentTask = async (id: number): Promise<void> => {
	let load: any = null
	try {
		await useConfirm({
			icon: 'warning-filled',
			title: '删除任务',
			content: `删除当前选中任务，删除后将取消任务执行，是否继续操作？`,
		})
		load = message.load('正在删除任务，请稍后...')
		const rdata = await removeTaskFile({ id })
		message.request(rdata)
		if (rdata.status) getTasksRealTimeList()
		// 关闭当前链接
		msgBoxSockShell.value?.close()
	} catch (error) {
		console.log(error)
	} finally {
		load.close()
	}
}

/**
 * @description 软件界面触发事件
 */
const softwareEvent = async () => {
	const { useSoftStore } = await import('@/views/soft/store')
	const { refreshRouteData } = useSoftStore()
	refreshRouteData('1')
}

defineExpose({ init: getTasksRealTimeList })

onMounted(getTasksRealTimeList)
</script>

<style lang="css" scoped>
.taskList {
	@apply w-full h-[500px] overflow-auto;
}

.taskItem {
	@apply border-b border-light;
}

.taskRealTimeLog {
	@apply h-[200px] overflow-auto leading-[22px]  text-base p-[10px] rounded-base cursor-default whitespace-pre-wrap;
	font-family: arial;
	color: var(--el-color-white);
	background: #111;
}

.taskItemHeader {
	@apply flex h-[44px] leading-[44px] justify-between;
}

.taskItemName {
	@apply relative pl-[15px];
}

.taskItemName::after {
	@apply content-[''] block h-[8px] w-[8px] rounded-base bg-primary absolute top-[50%] left-0 -mt-[4px];
}
.el-empty :deep(.el-empty__image) {
	@apply flex items-center justify-center;
}
</style>

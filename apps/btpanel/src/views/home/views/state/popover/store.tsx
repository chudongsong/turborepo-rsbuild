import { getSystemConfigProjectList, setNewAlarmTask, setTaskStatus } from '@/api/global'
import { killProcess } from '@/api/home'
import type { TableColumnProps } from '@components/data/bt-table/types'
import { useGlobalStore } from '@/store/global'
import { useConfirm, useDataHandle, useDialog } from '@hooks/tools'
import { openPluginView, productPaymentDialog } from '@/public/index'
import { isUndefined, setCookie } from '@utils/index'
import HOME_STORE from '@/views/home/store'
import type { AlarmDataProps, Form, HomeResCpuData, HomeResMemoryData } from '@/views/home/types'
import { defineStore, storeToRefs } from 'pinia'
import HOME_STATE_STORE from '../store'
import { router } from '@/router'

const HOME_STATE_POPOVER_STORE = defineStore('HOME-STATE-POPOVER-STORE', () => {
	const homeStore = HOME_STORE()
	const { specificResource, diskQuota } = storeToRefs(homeStore)

	const { payment, push, getAlarmData } = useGlobalStore()
	const { authType } = toRefs(payment.value)

	const homeStateStore = HOME_STATE_STORE()
	const { setPsForm } = storeToRefs(homeStateStore)

	const virtualRef = ref()
	const popover = ref()
	const popoverContent = ref()
	let resizeObserver: any = null
	const config = [
		{ desc: `运行堵塞`, val: 90, color: '#dd2f00' },
		{ desc: `运行缓慢`, val: 80, color: '#ff9900' },
		{ desc: `运行正常`, val: 70, color: 'var(--el-color-primary)' },
		{ desc: `运行流畅`, val: 30, color: 'var(--el-color-primary)' },
	]

	/**
	 * @description 画布进度条颜色
	 * @param number
	 */
	const chartColorActive = (number: number, alert: any) => {
		let activeInfo: any = {}
		for (let i = 0; i < config.length; i++) {
			const item = config[i]
			if (number >= item.val) {
				activeInfo = { ...item }
				break
			} else if (number < 30) {
				activeInfo = { ...config[config.length - 1] }
				break
			}
		}
		if (alert) {
			activeInfo.color = '#dd2f00'
		}
		activeInfo.val = number
		return activeInfo
	}

	/**
	 * @description 点击跳转目录
	 * @param {string} title
	 */
	const dirEvent = (title: string, path: string) => {
		if (path === 'None') {
			//  打开磁盘挂载插件
			openPluginView({ name: 'sysdisk' })
			return
		}
		setCookie('Path', title)
		router.push({ path: '/files' })
	}

	const init = () => {
		resizeObserver = new ResizeObserver(() => {
			if (popover.value) {
				popover.value.updatePopper()
			}
		})
		if (popoverContent.value) {
			resizeObserver.observe(popoverContent.value)
		}
	}

	const $reset = () => {
		if (resizeObserver && popoverContent.value) {
			resizeObserver.unobserve(popoverContent.value)
		}
	}

	const foldExpand = ref('show') // 默认展开
	const foldActive = ref('two') // 默认展开第二个，第一个锁定
	const tableData = reactive<any>({
		loading: true,
		list: [],
	})

	/**
	 * @description 删除进程
	 * @param {HomeResMemoryData | HomeResCpuData} row 行数据
	 */
	const killEvent = async (row: HomeResMemoryData | HomeResCpuData, isLoadOrCpu: boolean) => {
		if (row.important !== 1) {
			const title = isLoadOrCpu ? '结束进程' : `释放内存`
			await useConfirm({
				type: 'calc',
				title,
				content: `结束${row.proc_name}进程会导致${row.explain.split('的进程')[0]}无法正常运行，是否结束?`,
			})
			await useDataHandle({
				loading: `正在${title}，请稍后...`,
				request: killProcess({ pid: row.pid }),
				message: true,
			})
		}
	}

	/**
	 * @description 立即购买
	 */
	const openProduct = () => {
		productPaymentDialog({
			sourceId: 141,
		})
	}

	/**
	 * @description 表格列
	 * @param {string} label 表格列名称
	 * @param {string} prop 表格列属性
	 */
	const useHomeTableColumn = (isLoadOrCpu: boolean, label: string, prop: string) => {
		return ref<TableColumnProps[]>([
			{
				label: '进程名称',
				minWidth: 80,
				render: (row: any) => {
					const title = `备注：${row.explain}\n启动路径： ${row.exe_path}\n运行目录：${row.cwd_path}\n线程数量：${row.num_threads}`
					return <span title={title}>{row.proc_name}</span>
				},
			},
			{
				label,
				prop,
				minWidth: 70,
			},
			{
				label: '操作', // 操作
				align: 'right',
				fixed: 'right',
				width: 50,
				render: (row: HomeResCpuData | HomeResMemoryData) => {
					return (
						<span
							class="cursor-pointer text-primary"
							onClick={() => {
								killEvent(row, isLoadOrCpu)
							}}>
							{row.important === 1 ? '' : prop === 'cpu_percent' ? '结束' : '释放'}
						</span>
					)
				},
			},
		])
	}

	/**
	 * @description 进程告警
	 */
	const openProcessAlarmDialog = () => {
		useDialog({
			title: '进程告警',
			area: ['100', '50'],
			component: () => import('@home/views/state/process-alarm/process-alarm-manage.vue'),
		})
	}

	const devTaskList = ref<any[]>(push.value?.alarmPopupData || []) // 告警列表
	const pushObj: any = {
		load: {
			title: '负载',
			id: '22',
		},
		cpu: {
			title: 'cpu',
			id: '21',
		},
		mem: {
			title: '内存',
			id: '23',
		},
		disk: {
			title: '磁盘',
			id: '20',
		},
	}
	const rowData = ref<any>({}) // 告警弹窗数据
	const alarmPopup = ref<any>() // 告警弹窗
	/**
	 * @description 设置告警弹窗
	 */
	const setAlarmDialog = async (compData: any) => {
		rowData.value = {
			...compData,
			id: compData.id || pushObj[compData.type?.split('-')[0]].id,
		}
		const alarmPopup = useDialog({
			title: '告警设置',
			component: () => import('./alarm-config.vue'),
			area: 60,
			btn: '保存',
			onConfirm: onConfirm,
			onCancel: () => {
				getAlarmData()
			},
		})
	}

	/**
	 * @description 打开告警弹窗
	 * @param type
	 */
	const openAlarmPopup = async (type: boolean, compData: any) => {
		if (compData.id === 0) {
			setAlarmDialog(compData)
		} else {
			try {
				const tips = type ? '开启' : '关闭'
				!type &&
					(await useConfirm({
						title: `${tips}告警`,
						content: `${tips}告警后，将${type ? '' : '不再'}接收到该项的告警信息，是否继续操作？`,
					}))
				const currentTask = getCurrentTask(compData.type) // 获取当前告警信息
				await useDataHandle({
					loading: `正在${tips}告警，请稍后...`,
					request: setTaskStatus({
						task_id: currentTask.id,
						status: type ? 1 : 0,
					}),
					message: true,
					success: getAlarmData,
				})
			} catch (error) {
				compData.flag = !type
				getAlarmData()
			}
		}
	}

	/**
	 * @description 渲染告警状态，所有首页状态告警都在这里传值
	 */
	const createPushStatus = (type: string) => {
		let cycle, text, count
		switch (type) {
			case 'load':
				text = '平均负载超过'
				break
			case 'mem':
				text = '内存超过'
				break
			case 'cpu':
				text = '平均CPU超过'
				break
		}
		const data = setStatePushInfo(type)
		cycle = data.cycle
		count = data.count
		if (!text) text = data.text
		if (isUndefined(cycle) || isUndefined(text)) return ``
		return `${type?.includes('disk') ? '' : `${cycle}分钟内`}${text}${count}触发`
	}

	/**
	 * @description 获取当前告警状态信息
	 */
	const getCurrentTask = (type: string) => {
		const currentObj = pushObj[type.split('-')[0]]
		// 获取当前告警 如果是disk则需要判断project
		if (Array.isArray(devTaskList.value)) {
			return devTaskList.value?.find((task: any) => {
				return type?.includes('disk') ? task.template_id === currentObj.id && task.task_data.project === type.split('-')[1] : task.template_id === currentObj.id
			})
		}
		return false
	}

	/**
	 * @description 设置告警弹窗确认
	 */
	const setStatePushInfo = (type: string) => {
		let cycle, text, count
		const currentTask = getCurrentTask(type) // 获取当前告警信息
		if (currentTask) {
			// 存在告警
			const items = currentTask.task_data
			cycle = items.cycle
			count = `${items.count}%`
			if (type.includes('disk') && items.project === type.split('-')[1]) {
				text = items.cycle === 2 ? `该磁盘用量超过` : `该磁盘余量不足`
				count = items.cycle === 2 ? `${items.count}%` : `${items.count}GB`
			}
		}
		return { cycle, text, count }
	}

	const giveFormDisabled = ref(false)
	const giveFormRef = ref()
	const msgForm = reactive<Form>({
		num: 0,
		usageRate: 0,
		give: [],
		option: {},
		type: '',
		selectOptions: [],
		typeDetection: '2',
		next_data: [],
	})

	const maxCapacityAndUsageRate = ref(100) // 最大容量和使用率
	const nextOptions = ref<any>([]) // 负载选项
	const options = ref<any>([])

	/**
	 * @description 设置磁盘告警阈值
	 */
	const switchTypeDetection = () => {
		const { type, data, id } = rowData.value
		if (msgForm.typeDetection !== data.cycle) {
			if (msgForm.typeDetection === '2') {
				msgForm.usageRate = 80
			} else {
				diskQuota.value.forEach((item: { diskName: string; diskQuota: number }) => {
					if (item.diskName === type.split('-')[1]) {
						maxCapacityAndUsageRate.value = item.diskQuota
						msgForm.usageRate = parseInt((item.diskQuota * 0.2).toString())
					}
				})
			}
		}
	}

	const getNextOptions = async () => {
		try {
			const res = await getSystemConfigProjectList() // 获取告警方式
			nextOptions.value = res.data.map((item: any) => ({ label: item.title, value: item.value }))
		} catch (error) {
			console.log(error)
		}
	}

	/**
	 * @description 设置告警默认配置，根据请求得到持久化数据
	 */
	const alarmInfo = async () => {
		// 获取告警后执行数据
		getNextOptions()

		// 获取告警配置
		const { type, data, id } = rowData.value
		if (data) {
			msgForm.usageRate = data.count
			msgForm.num = data.push_count
			msgForm.next_data = data.next_data || []
			if (type.indexOf('disk') !== -1) msgForm.typeDetection = data.cycle.toString()
			msgForm.give = data.module
		} else {
			msgForm.usageRate = 80
			msgForm.num = 3
			if (type.indexOf('disk') !== -1) {
				msgForm.typeDetection = '2'
			}
		}
	}

	/**
	 * @description 保存告警配置
	 * @param refName
	 */
	const onConfirm = async () => {
		await giveFormRef.value.validate()
		const { type, data, id } = rowData.value
		let oldData = data ? data : {}
		let task_data: any = {
			...oldData,
			type: type.includes('disk') ? type.split('-')[0] : type,
			count: parseInt(`${msgForm.usageRate}`),
			cycle: type.includes('disk') ? parseInt(msgForm.typeDetection) : 5,
			project: type.split('-')[1] ? type.split('-')[1] : '',
			next_data: msgForm.next_data,
		}
		let time_rule = {
			send_interval: 0,
			time_range: [0, 86399],
		}
		let number_rule = {
			day_num: parseInt(`${msgForm.num}`),
			total: 0,
		}
		let params = {
			task_data, // 任务数据
			time_rule, // 时间规则
			number_rule, // 发送次数规则
			sender: msgForm.give, // 告警方式
		}

		await useDataHandle({
			loading: '正在保存告警配置，请稍后...',
			request: setNewAlarmTask({ task_data: JSON.stringify(params), template_id: id }),
			message: true,
			success: async (res: any) => {
				await getAlarmData()
				createPushStatus(type)
			},
		})
	}

	const useMountColumn = () => {
		return ref<TableColumnProps[]>([
			{
				label: '磁盘路径',
				prop: 'filesystem',
				render: (row: any) => {
					return (
						<div class="flex items-center">
							<span class="svgtofont-file-hdd mr-4px !text-medium align-text-bottom"></span>
							<span>{row.filesystem}</span>
						</div>
					)
				},
			},
			{
				label: '总大小',
				prop: 'size',
			},
		])
	}

	const mountColumn = useMountColumn()

	/**
	 * @description: 设置磁盘别名
	 * @param data - 磁盘信息
	 */
	const setPsDialog = async (data: any) => {
		setPsForm.value.name = data.ps
		setPsForm.value.path = data.path
		useDialog({
			title: '设置磁盘【' + data.path + '】别名',
			area: 45,
			component: () => import('@home/views/state/edit-disk-ps/index.vue'),
			btn: true,
			onConfirm: homeStateStore.onConfirmPs,
		})
	}

	/**
	 * 解析带单位的大小字符串为字节数
	 * @param sizeStr - 带单位的大小字符串，如 '35.10GB' 或 '102MB'
	 * @returns 以字节为单位的大小
	 */
	const parseSize = (sizeStr: string): number => {
		if (sizeStr === '0') return 0
		const units = ['B', 'KB', 'MB', 'G', 'GB', 'T', 'TB']
		const regex = /^(\d+(?:\.\d+)?)(?: )?([a-zA-Z]+)$/
		const match = sizeStr.match(regex)
		if (!match) {
			throw new Error(`Invalid size format: ${sizeStr}`)
		}
		const size = parseFloat(match[1])
		const unit = match[2].toUpperCase()
		const unitIndex = units.indexOf(unit)
		if (unitIndex === -1) {
			throw new Error(`Invalid unit: ${unit}`)
		}
		return size * Math.pow(1024, unitIndex)
	}

	/**
	 * @description: 计算可分配空间
	 * @param totalSize - 磁盘总大小（带单位）
	 * @param usedSize - 已用大小（带单位）
	 * @returns 可分配空间大小及其单位
	 */
	const computedSpace = (total: string, used: string): string => {
		const units = ['B', 'KB', 'MB', 'GB', 'TB']
		let totalSize = parseSize(total)
		let usedSize = parseSize(used)
		let availableSize = totalSize - usedSize
		let unitIndex = 0
		while (availableSize >= 1024 && unitIndex < units.length - 1) {
			availableSize /= 1024
			unitIndex++
		}

		// 保留两位小数
		availableSize = Math.round(availableSize * 100) / 100

		return `${availableSize} ${units[unitIndex]}`
	}

	/**
	 * @description: 扫描垃圾文件 打开扫描界面
	 */
	const scanRubbishFile = async (title: string) => {
		openPluginView({
			pluginName: 'disk_analysis',
			source: 120,
			type: 'ltd',
		})
		setCookie('diskPath', title)
		setCookie('taskStatus', 'true')
	}

	return {
		virtualRef,
		popover,
		popoverContent,
		chartColorActive,
		dirEvent,
		init,
		$reset,

		authType,
		specificResource,
		tableData,
		foldExpand,
		foldActive,
		useHomeTableColumn,
		openProcessAlarmDialog,
		openProduct,

		push,
		devTaskList,
		openAlarmPopup,
		setAlarmDialog,
		createPushStatus,
		getCurrentTask,
		onConfirm,

		giveFormDisabled,
		giveFormRef,
		msgForm,

		maxCapacityAndUsageRate,
		nextOptions,
		options,
		alarmInfo,
		rowData,

		mountColumn,
		computedSpace,
		setPsDialog,
		scanRubbishFile,

		switchTypeDetection,
	}
})

export default HOME_STATE_POPOVER_STORE

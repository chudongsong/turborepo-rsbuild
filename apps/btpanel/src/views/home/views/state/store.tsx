import { defineStore } from 'pinia'
import type { StateInfo, AlarmPush } from '@home/types'
import HOME_STORE from '@home/store'
import { useGlobalStore } from '@/store/global'
import { AxiosCanceler } from '@hooks/tools/axios/model/axios-cancel'
import { homeData } from '@home/useMethod'
import { getByteUnit, isString } from '@utils/index'
import { useConfirm, useDataHandle, useDialog } from '@hooks/tools'
import { useOperate, useStatus } from '@hooks/tools/table/column'
import { cleanMemory, setDiskRname } from '@api/home'
import { delTaskStatus, getAlarmTaskList, getPluginInfo, setTaskStatus } from '@/api/global'

const HOME_STATE_STORE = defineStore('HOME-STATE-STORE', () => {
	const homeStore = HOME_STORE()

	const { payment, push } = useGlobalStore()
	const { authType } = toRefs(payment.value)

	const stateMainWidth = ref(0)
	const gutter = ref(12) // 每个模块左右边距总和
	const isBreakLines = ref(false) // 是否换行
	const isShowAllDisk = ref(false) // 是否显示所有磁盘
	const colSpan = useSessionStorage('colSpan', 6) // 状态列数
	const diskColSpan = useSessionStorage('diskColSpan', 6) // 磁盘列数
	const stateHeight = useSessionStorage('stateHeight', '22rem')
	const displayMode = useSessionStorage('displayMode', 'single') // 显示模式, single: 单行, stacked: 堆叠, tile: 磁盘块

	const cpuCoreDesc = ref<Array<{ name: string; value: any }>>([]) // CPU核心状态描述
	const hoverType = ref('loadPopover') // 悬浮类型
	const isClearMemory = ref(false) // 清理内存的状态
	const showMemoryDesc = ref(true) // 是否显示内存信息
	const memoryTimer = ref<any>(null) // 内存清理定时器
	let isFetching = false // 是否正在请求
	const disk = ref<any>([]) // 磁盘信息
	const load = ref<any>({ one: 0, max: 0, five: 0, fifteen: 0 }) // 负载信息
	const cpu = ref<any>({
		// CPU信息
		occupy: '',
		framework: '',
		coresOccupy: [0, 0, 0],
		cpuNumber: 0,
		logicCores: 0,
		cores: 0,
		process: [0, 0],
	})

	const memory = ref<any>({
		memRealUsed: 0, // 已使用内存
		memTotal: 0, // 总内存
		memFree: 0, // 空闲内存
		memShared: 0, // 共享内存
		memAvailable: 0, // 可用内存
		memBuffers: 0, // 缓冲区
		memCached: 0, // 缓存
		memNewRealUsedList: [], // 新的总内存列表
		memNewTotalList: [], // 新的已使用内存列表
	})

	const loadInfoList = ref<any>([]) // 负载信息列表

	const tagsType = reactive<any>({
		memory: 'success',
		cpu: 'success',
		load: 'success',
	})

	const statePopoverTimr = ref<any>(null) // 状态弹窗定时器
	const processAlarmShow = ref(false) // 进程告警弹窗

	const loadPopover = ref<any>(null) // 负载弹窗
	const cpuPopover = ref<any>(null) // CPU弹窗
	const memoryPopover = ref<any>(null) // 内存弹窗

	const axiosCanceler = new AxiosCanceler()

	// 负载状态
	const loadInfo = reactive<StateInfo>({
		type: 'load',
		title: '负载',
		range: 0,
	})

	// cpu状态
	const cpuInfo = reactive<StateInfo>({
		type: 'cpu',
		title: 'CPU',
		range: 0,
		desc: '获取中',
	})

	// 内存状态
	const memoryInfo = reactive<StateInfo>({
		type: 'mem',
		title: '内存',
		range: 0,
		desc: '0 / 0(MB)',
		disabled: false,
	})

	/**
	 * @description 生成cpu核心参数
	 */
	const createCpuCoreNum = () => {
		const { cpuNumber, logicCores, cores: core } = cpu.value
		cpuInfo.desc = cpuNumber && logicCores && core ? `${core}核心` : `获取中`
	}

	/**
	 * @description cpu详情
	 */
	homeData.useSetCallback('cpuTimes', (data: any) => {
		loadInfoList.value = [
			[
				{ title: '用户级别的 CPU 时间百分比', name: 'user', value: data.user },
				{
					title: '运行带有 "nice" 优先级的进程时使用的 CPU 时间百分比',
					name: 'nice',
					value: data.nice,
				},
			],
			[
				{ title: '系统级别的 CPU 时间百分比', name: 'system', value: data.system },
				{ title: '空闲状态的 CPU 时间百分比', name: 'idle', value: data.idle },
			],
			[
				{ title: '等待 I/O 操作完成的 CPU 时间百分比', name: 'iowait', value: data.iowait },
				{ title: '处理硬件中断的 CPU 时间百分比', name: 'irq', value: data.irq },
			],
			[
				{ title: '处理软件中断的 CPU 时间百分比', name: 'softirq', value: data.softirq },
				{
					title: '当前 CPU 被其他虚拟机偷取的CPU时间百分比',
					name: 'steal',
					value: data.steal,
				},
			],
			[
				{ title: '运行虚拟机时使用的 CPU 时间百分比', name: 'guest', value: data.guest },
				{
					title: '运行带有 "nice" 优先级的虚拟机时使用的CPU时间百分比',
					name: 'guest_nice',
					value: data.guest_nice,
				},
			],
		]
	})

	/**
	 * @description 负载信息
	 */
	homeData.useSetCallback('load', (data: any) => {
		load.value = data
		createLoadInfo() // 生成负载加载参数
	})

	/**
	 * @description 磁盘信息
	 */
	homeData.useSetCallback('disk', (data: any) => {
		disk.value = data // 获取磁盘信息
	})

	/**
	 * @description 生成负载加载参数
	 * @param {StateInfo} data 负载数据
	 * @returns void
	 */
	const createLoadInfo = () => {
		const { one, max } = load.value
		const param = parseInt(Math.round((one / max) * 100).toFixed(0))
		const loadVal = param > 100 ? 100 : param
		loadInfo.range = loadVal < 0 ? 0 : loadVal
		if (loadVal >= 90) {
			tagsType.load = 'danger'
		} else if (loadVal >= 80) {
			tagsType.load = 'warning'
		} else {
			tagsType.load = 'success'
		}
	}

	/**
	 * @description 负载信息
	 */
	homeData.useSetCallback('cpu', (data: any) => {
		cpu.value = data
		createCpuInfo() // 生成CPU参数
		createCpuCoreNum() // 生成cpu核心参数
		createCpuCoreParam() // 生成cpu核心参数
	})

	/**
	 * @description 生成CPU参数
	 * @param {StateInfo} cpu CPU数据
	 * @returns void
	 */
	const createCpuInfo = () => {
		const { occupy } = cpu.value
		cpuInfo.range = parseInt(occupy) || 0
		if (cpuInfo.range > 80) {
			tagsType.cpu = 'warning'
		} else if (cpuInfo.range > 90) {
			tagsType.cpu = 'danger'
		} else {
			tagsType.cpu = 'success'
		}
	}

	/**
	 * @description 生成cpu核心参数
	 */
	const createCpuCoreParam = () => {
		let array = [],
			a = 0,
			name = '核心 ',
			value = ''
		for (let i = 0; i < cpu.value.coresOccupy.length; i++) {
			if (a < 2) {
				a++
				if (i === cpu.value.coresOccupy.length - 1) {
					name += `${i + 1} `
					value += `${parseFloat(cpu.value.coresOccupy[i]).toFixed(1)}% `
					array.push({
						name,
						value,
					})
					break
				}
				name += `${i + 1} / `
				value += `${parseFloat(cpu.value.coresOccupy[i]).toFixed(1)}% / `
				if (cpu.value.coresOccupy.length % 2 === 1) {
					if (i === cpu.value.coresOccupy.length - 1) {
						array.push({
							name,
							value,
						})
					}
				}
			} else {
				a = 0
				name += `${i + 1}`
				value += `${parseFloat(cpu.value.coresOccupy[i]).toFixed(1)}%`
				array.push({
					name,
					value,
				})
				name = '核心 '
				value = ''
			}
		}
		cpuCoreDesc.value = array
	}

	/**
	 * @description 内存信息
	 */
	homeData.useSetCallback('memory', (data: any) => {
		memory.value = data
		createMemoryInfo() // 生成内存参数
	})

	/**
	 * @description 生成内存参数
	 * @returns void
	 */
	const createMemoryInfo = () => {
		const { memRealUsed, memTotal, memNewRealUsedList, memNewTotalList } = memory.value
		if (isClearMemory.value) return
		const range = parseInt((Math.round((memRealUsed / memTotal) * 1000) / 10).toFixed(0))
		if (range >= 80) {
			tagsType.memory = 'warning'
		} else if (range >= 90) {
			tagsType.memory = 'danger'
		} else {
			tagsType.memory = 'success'
		}
		memoryInfo.type = 'mem'
		memoryInfo.range = range
		memoryInfo.desc = {
			used: memNewRealUsedList?.[0],
			used_unit: memNewRealUsedList?.[1],
			total: memNewTotalList?.[0],
			total_unit: memNewTotalList?.[1],
		}
	}

	/**
	 * @description 清理内存时间戳，动画效果
	 * @param data
	 */
	const clearMemoryTimer = (data: any) => {
		if (memoryTimer.value) clearInterval(memoryTimer.value)
		const memory = data.memRealUsed - data.memRealUsed
		const unit = isString(memory) ? memory : getByteUnit(memory)
		memoryInfo.range = 1
		memoryInfo.rangeText = `已释放\n ${unit}`
		setTimeout(() => {
			isClearMemory.value = false
			memoryInfo.rangeText = ''
			memoryInfo.disabled = false
			showMemoryDesc.value = true
		}, 1500)
	}

	/**
	 * @description 设置内存时间戳
	 */
	const setMemoryTime = () => {
		let count = ''
		isClearMemory.value = true
		showMemoryDesc.value = false
		memoryInfo.disabled = true
		memoryTimer.value = setInterval(() => {
			let { range } = memoryInfo
			count = count === '...' ? '.' : `${count}.`
			memoryInfo.rangeText = `释放中${count}`
			if (range > 0) range -= range * 0.2
			range = Number(range.toFixed(2))
			if (range < 0) range = 0
			memoryInfo.range = range
		}, 400)
	}

	/**
	 * @description 清理内存定时器
	 */
	const clearMemory = async () => {
		try {
			setMemoryTime()
			const { data } = await cleanMemory()
			clearMemoryTimer(data)
		} catch (err) {
			console.log(err)
		}
	}

	/**
	 * @description 清理内存确认
	 */
	const onClearMemory = async () => {
		try {
			await useConfirm({
				type: 'calc',
				title: '释放内存',
				content: '若您的站点处于有大量访问的状态，释放内存可能带来无法预测的后果，您确定现在就释放内存吗？',
			})
			clearMemory()
		} catch (err) {}
	}

	/**
	 * @description 移入状态区域悬浮，显示负载和相关信息
	 * @returns void
	 */
	const moveStatePopover = async (ref: any, refName: string) => {
		hoverType.value = refName
		if (authType.value !== 'ltd') return //非企业版不请求
		const fetchData = async () => {
			if (!isFetching) {
				isFetching = true
				await homeStore.getHomeProcessInfo()
				isFetching = false
			}
		}
		statePopoverTimr.value = setInterval(fetchData, 5000)
		axiosCanceler.removePending({
			method: 'post',
			url: '/monitor/process_management/specific_resource_load_type',
		})
		await fetchData()
	}

	/**
	 * @description 隐藏弹出框离开后清除定时器
	 * @returns void
	 */
	const removeStatePopover = () => {
		clearInterval(statePopoverTimr.value)
	}

	/**
	 * @description 获取进程告警
	 */
	const getProcessAlarm = async () => {
		const { data } = await getPluginInfo({ sName: 'task_manager' })
		if (data.setup) {
			processAlarmShow.value = true
		} else {
			processAlarmShow.value = false
		}
	}

	const setPsFormRef = ref()
	const setPsForm = reactive<any>({
		name: '',
		path: '',
	})

	/**
	 * @description: 确认修改备注
	 * @param close - 关闭弹窗
	 */
	const onConfirmPs = (close: any) => {
		useDataHandle({
			loading: '正在修改备注，请稍后...',
			request: setDiskRname(setPsForm),
			message: true,
			success: (res: any) => {
				if (res.status) close()
			},
		})
	}

	const processTableData = reactive({
		loading: true,
		list: [],
		total: 0,
	})
	const edit = (row: AlarmPush) => {
		openProcessAlarm(true, row)
	}

	/**
	 * @description 删除告警任务
	 */
	const deleteRow = async (row: any) => {
		console.log(row)
		await useConfirm({
			title: '删除告警任务',
			isHtml: true,
			icon: 'warning-filled',
			iconColor: 'warning',
			content: '删除后将不再告警此条任务，是否继续？',
		})
		await useDataHandle({
			loading: '正在删除告警任务，请稍后...',
			request: delTaskStatus({ task_id: row.id }),
			message: true,
			success: initAlarm,
		})
	}

	/**
	 * @description 修改告警状态
	 */
	const changeStatusEvent = async (row: any) => {
		const isStatus = row.status
		const title = row.title
		await useConfirm({
			title: (!isStatus ? '启用' : '停用') + '告警任务【' + title + '】',
			content: `${!isStatus ? '启用' : '停用'}选中的告警任务后，该告警任务将${!isStatus ? '开启' : '停止'}告警，是否继续操作？`,
			icon: 'warning-filled',
		})
		await useDataHandle({
			loading: '正在设置告警状态，请稍后...',
			request: setTaskStatus({
				// name: row.module_type,
				task_id: row.id,
				status: isStatus ? 0 : 1,
			}),
			message: true,
		})
		await initAlarm()
	}

	const map = new Map([
		['wx_account', '微信公众号'],
		['feishu', '飞书'],
		['mail', '邮箱'],
		['sms', '短信通知'],
		['dingding', '钉钉'],
		['weixin', '企业微信'],
	])

	/**
	 * @description 获取告警方式
	 * @param { AlarmPush } row 行数据
	 * @returns { string }
	 */
	const getModule = (row: AlarmPush): string => {
		return row.module
			.split(',')
			.map(item => map.get(item))
			.join(',')
	}

	// 类型模型
	const typeModel: any = [
		{ title: '钉钉', type: 'dingding' },
		{ title: '飞书', type: 'feishu' },
		{ title: '邮箱', type: 'mail' },
		{ title: '企业微信', type: 'weixin' },
		{ title: '微信公众号', type: 'wx_account' },
		{ title: '短信通知', type: 'sms' },
		{ title: '自定义消息通道', type: 'webhook' },
	]

	const useProcessAlarmTableColumn = () => {
		return ref([
			{
				label: '标题',
				prop: 'title',
			},
			useStatus({
				event: changeStatusEvent,
				width: 80,
				data: ['已停用', '已启用'],
			}),
			{
				label: '告警方式',
				width: 140,
				showOverflowTooltip: true,
				render: (row: any) => {
					let str: any = []
					row.sender.forEach((item: any) => {
						const findIt = push.value.config.find((it: any) => it.id === item) as any
						if (findIt?.sender_type) {
							const findType = typeModel.find((it: any) => it.type === findIt.sender_type)
							if (findType?.title) str.push(findIt.sender_type === 'sms' ? findType.title : findIt.data.title ? findIt.data.title + `(${findType.title})` : findType.title)
						}
					})
					return <span class="truncate">{str.join('、')}</span>
				},
			},
			{
				label: '告警条件',
				render: (row: any) => {
					const match = row.view_msg.match(/<span>(.*?)<\/span>/)
					const content = match ? match[1] : ''
					return content
				},
			},
			useOperate([
				{
					title: '编辑',
					onClick: edit,
				},
				{
					title: '删除',
					onClick: deleteRow,
				},
			]),
		])
	}

	const processAlarmTableColumn = useProcessAlarmTableColumn()

	/**
	 * @description 进程告警
	 */
	const openProcessAlarm = (isEdit: boolean, row?: AlarmPush) => {
		useDialog({
			title: '进程告警',
			area: [80],
			btn: ['保存', '取消'],
			component: () => import('@config/views/alarm-notice/alarm-list/alarm-form/index.vue'),
			compData: {
				isEdit,
				row: row || ({} as AlarmPush),
				diyProcessTemplate: true,
				diyProcessTemplateTid: ['60', '61', '62'],
				onRefresh: initAlarm,
			},
		})
	}

	const initAlarm = async () => {
		const { data: res } = await getAlarmTaskList()
		processTableData.list = res?.data?.filter((item: any) => ['60', '61', '62'].includes(item.template_id)) || []
		if (processTableData.list.length > 0) {
			processTableData.loading = false
		} else {
			openProcessAlarm(false)
			processTableData.loading = false
		}
	}

	const $reset = () => {
		axiosCanceler.reset()
		clearInterval(statePopoverTimr.value)
		clearInterval(memoryTimer.value)
	}

	return {
		stateMainWidth,
		gutter,
		isBreakLines,
		isShowAllDisk,
		colSpan,
		diskColSpan,
		stateHeight,
		displayMode,
		cpuCoreDesc,
		statePopoverTimr,
		loadInfo,
		loadPopover,
		processAlarmShow,
		tagsType,
		load,
		cpu,
		loadInfoList,
		cpuInfo,
		cpuPopover,
		memoryInfo,
		memoryPopover,
		memory,
		disk,
		getProcessAlarm,
		moveStatePopover,
		removeStatePopover,
		onClearMemory,
		$reset,
		// edit-disk-ps
		setPsFormRef,
		setPsForm,
		onConfirmPs,
		// process-alarm
		processAlarmTableColumn,
		processTableData,
		openProcessAlarm,
		initAlarm,
		hoverType,
		isClearMemory,
		showMemoryDesc,
	}
})

export default HOME_STATE_STORE

import { useFtpStore } from '@/views/ftp/useStore'
import { FtpTableRowProps } from '@/views/ftp/types'
import { useGlobalStore } from '@/store/global'
import { productPaymentDialog } from '@/public'
import { useConfirm, useDataHandle, useDialog, useHandleError, useMessage } from '@/hooks/tools'
import { useFtpAddStore } from '@/views/ftp/views/add-ftp/useStore'
import SOFT_STATUS_STOP_ALERT from '../public/status-stop-alert/store'
import SOFT_SERVICE_STATUS_STORE from '../public/service-status/store'
import { ResponseResult } from '@/types'
import { portVerify } from '@/utils'
import { editFtpPort, getFileBody, saveFileBody } from '@/api/global'
import { setFtpLogs } from '@/api/soft'

const Message = useMessage()

const { payment, getGlobalInfo } = useGlobalStore()
const { ftpPort, rowData } = useFtpStore()
const { isEdit } = useFtpAddStore()

const serviceStatusStore = SOFT_SERVICE_STATUS_STORE()
const statusStopStore = SOFT_STATUS_STOP_ALERT()
export const activeName = ref('service') // 当前激活的tab
const compData = ref<any>({}) // 组件数据
export const isRefreshList = ref(false) // 是否刷新列表

/**
 * @description 获取数据
 */
const getData = async () => {
	try {
		await getGlobalInfo()
	} catch (error) {
		useHandleError(error)
	}
}

// 端口配置 ----------
export const portFormRef = ref<any>() // 端口配置表单
export const portForm = reactive({
	// 端口配置
	port: ftpPort.value,
})

export const rules = reactive({
	// 端口配置规则
	port: [portVerify()],
})

/**
 * @description 提交表单
 */
export const onPortConfirm = async () => {
	await portFormRef.value.validate() // 校验表单
	const data: ResponseResult = await useDataHandle({
		loading: '正在修改FTP端口，请稍后...',
		request: editFtpPort({ port: portForm.port }),
		data: { status: Boolean },
		message: true,
	})
}

// 配置文件 ----------
export const textLoading = ref<boolean>(false) // 文本加载
export const staticContent = ref<string>('') // 静态内容
export const helpList = [
	{
		content: '此处为pure-ftpd主配置文件，若您不了解配置规则，请勿随意修改',
	},
] // 帮助列表

/**
 * @description 保存配置文件
 */
export const saveFileEvent = async () => {
	await useDataHandle({
		loading: '正在保存配置，请稍后...',
		request: saveFileBody({
			path: '/www/server/pure-ftpd/etc/pure-ftpd.conf',
			data: staticContent.value,
			encoding: 'utf-8',
		}),
		message: true,
	})
}

/**
 * @description 获取配置文件
 */
const getConfigEvent = async () => {
	await useDataHandle({
		loading: textLoading,
		request: getFileBody({ path: '/www/server/pure-ftpd/etc/pure-ftpd.conf' }),
		data: {
			data: [String, staticContent],
		},
	})
}

// 版本切换 ----------
const currentVersion = ref<string>('') // 当前版本
const versionList = ref<any>([]) // 版本列表

/**
 * @description 切换版本
 */
const cutVersionEvent = async () => {
	if (currentVersion.value === compData.value.version) {
		Message.error('当前版本与选择版本相同，无需切换')
		return
	}
}

// 日志管理 ----------
export const logsStatus = ref<boolean>(false) // 日志信息

/**
 * @description 开启/关闭日志管理
 * @param val
 */
export const handleChangeSwitch = async (val: boolean) => {
	await useConfirm({
		title: `${val ? '开启' : '关闭'}pure-ftpd日志管理`,
		content: `${val ? '开启' : '关闭'}pure-ftpd日志管理后，将${val ? '' : '无法'}记录所有FTP用户的登录、操作记录，是否继续操作？`,
	})
	await useDataHandle({
		loading: `正在${val ? '开启' : '关闭'}，请稍后...`,
		request: setFtpLogs({ exec_name: val ? 'start' : 'stop' }),
		message: true,
		success: getFtpLogsEvent,
	})
}

/**
 * @description 获取ftp日志
 */
const getFtpLogsEvent = async () => {
	await useDataHandle({
		loading: '正在获取日志状态，请稍后...',
		request: setFtpLogs({ exec_name: 'getlog' }),
		success: (res: any) => {
			logsStatus.value = res.msg === 'start' ? true : false
		},
	})
}

export const handleTabClick = async (tab: string) => {
	activeName.value = tab
	switch (tab) {
		case 'manger':
			isRefreshList.value = true
			break
		case 'service':
		case 'portConfig':
			init()
			break
		case 'config':
			getConfigEvent()
			break
		case 'logs':
			getFtpLogsEvent()
			break
		default:
			break
	}
}

/**
 * @description 初始化
 */
export const init = (data?: any) => {
	// activeName.value = 'service'
	if (data.id) compData.value = data

	const obj = {
		...compData.value,
		name: 'pure-ftpd',
	}
	// 加载服务状态
	serviceStatusStore.init(obj)

	// 初始化状态停止告警
	statusStopStore.init(obj)

	currentVersion.value = compData.value.version
	versionList.value = compData.value.versions
	getData()
}

/**
 * @description 添加 修改FTP用户
 * @param {FtpTableRowProps} row 数据
 */
export const editFtpEvent = (row?: FtpTableRowProps) => {
	rowData.value = row
	isEdit.value = !!row
	return useDialog({
		title: `${row ? `修改FTP用户【${row.name}】` : '添加FTP用户'}`,
		area: 50,
		btn: '保存',
		compData: row ? row : {},
		component: () => import('@ftp/views/add-ftp/index.vue'),
	})
}

/**
 * @description 打开快速链接
 */
export const openQuickConnectEvent = (row: FtpTableRowProps) => {
	rowData.value = row
	useDialog({
		title: '快速连接',
		area: 48,
		compData: row,
		component: () => import('@ftp/views/quick-connect/index.vue'),
	})
}

/**
 * @description 打开密码有效期
 */
export const openPawValidityEvent = (row: FtpTableRowProps) => {
	useDialog({
		title: '设置密码有效期',
		area: 46,
		btn: true,
		compData: row,
		component: () => import('@ftp/views/pwd-validity-period/index.vue'),
	})
}

/**
 * @description 设置FTP配额
 * @param {FtpTableRowProps} row 当前行信息
 * @returns {void} void
 */
export const setQuotaEvent = (row: FtpTableRowProps): void => {
	if (payment.value.authType !== 'ltd') {
		// 弹出支付界面
		productPaymentDialog({
			sourceId: 52,
		})
		return
	}
	openCapacityEvent(row)
}

/**
 * @description 打开容量事件
 */
export const openCapacityEvent = (row: FtpTableRowProps) => {
	rowData.value = row
	useDialog({
		title: `【${row.name}】FTP配额容量`,
		area: 50,
		btn: true,
		compData: row,
		component: () => import('@ftp/views/capacity/index.vue'),
	})
}

/**
 * @description 修改FTP权限配置
 * @param {FtpTableRowProps} row 数据
 */
export const openAccessEvent = (row: FtpTableRowProps) => {
	rowData.value = row
	useDialog({
		title: `修改FTP权限配置-[${row.name}]`,
		area: 72,
		btn: '保存',
		compData: row,
		component: () => import('@ftp/views/access/index.vue'),
	})
}

/**
 * @description 查看日志信息
 */
export const openLogEvent = async (row: FtpTableRowProps) => {
	rowData.value = row
	useDialog({
		title: '查看FTP日志【' + row.name + '】',
		area: [70, 58],
		compData: row,
		component: () => import('@ftp/views/logs/index.vue'),
	})
}

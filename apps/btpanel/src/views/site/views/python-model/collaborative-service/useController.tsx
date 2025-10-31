import { addService, delService, getServiceLog, getServicesInfo, handleService, modifyService } from '@/api/site'
import { useConfirm, useDataHandle, useMessage } from '@/hooks/tools'
import { useSiteStore } from '@/views/site/useStore'

const Message = useMessage()
const { siteInfo } = useSiteStore()

export const servicesList = ref<any>([])
export const addServicesPopup = ref<boolean>(false)
export const servicesFormRef = ref<any>()
export const servicesDisable = ref<boolean>(false)
export const servicesForm = reactive({
	name: '',
	command: '',
	sid: '',
	level: 11,
	log_type: 'append',
	isEdit: false,
})
export const isAdv = ref<boolean>(false)
export const loading = ref<boolean>(false)
export const typeOptions = ref([
	{ label: '追加记录', value: 'append' },
	{ label: '启动时清空', value: 'cover' },
])

export const showLogPopup = ref<boolean>(false)
export const logInfo = reactive({
	logContent: '',
	logLoading: false,
	title: '',
	sid: '',
})

export const servicesRules = reactive({
	name: [{ required: true, message: '请输入服务名称', trigger: 'blur' }],
	command: [{ required: true, message: '请输入启动命令', trigger: 'blur' }],
	level: [{ required: true, message: '请输入优先级', trigger: 'blur' }],
})

export const helpList = ref([
	{
		content: '协同服务用于管理那些与web服务同时运行的，用于处理一些事务的服务，如：任务队列、定时队列等，例如：celery等。',
	},
	{
		content: '当前工作方式为启动项目时检测这些服务，若未启动则执行启动，若已启动则不进行操作；停止项目时执行所有服务的停止操作',
	},
])

/**
 * @description 修改日志管理类型
 */
export const handleType = (val: string) => {
	servicesForm.log_type = val
}

/**
 * @description 打开添加服务弹窗
 */
export const openService = () => {
	resetForm()
	addServicesPopup.value = true
}

/**
 * @description 编辑服务
 * @param item 服务信息
 */
export const editServices = (item: any) => {
	servicesForm.name = item.name
	servicesForm.command = item.command
	servicesForm.sid = item.sid
	servicesForm.level = item.level
	servicesForm.log_type = item.log_type
	servicesForm.isEdit = true
	addServicesPopup.value = true
}

export const refreshLog = async (isRefresh: boolean) => {
	try {
		!isRefresh && (logInfo.logLoading = true)
		const { data: res } = await getServiceLog({
			project_name: siteInfo.value.name,
			sid: logInfo.sid,
		})
		logInfo.logContent = res.data
		logInfo.logLoading = false
		if (isRefresh) Message.success('刷新成功')
	} catch (error) {}
}

export const openLog = (item: any) => {
	logInfo.sid = item.sid
	logInfo.title = item.sid === 'main' ? '项目主服务' : item.name
	showLogPopup.value = true
	refreshLog(false)
}

/**
 * @description 删除服务
 * @param item 服务信息
 */
export const deleteService = async (item: any) => {
	await useConfirm({
		icon: 'warning-filled',
		title: `删除服务【${item.name}】`,
		content: `删除服务【${item.name}】后，将无法管理该服务，是否继续？`,
	})
	const res: AnyObject = await useDataHandle({
		loading: '正在删除服务，请稍后...',
		request: delService({
			project_name: siteInfo.value.name,
			sid: item.sid,
		}),
		message: true,
	})
	if (res.status) getServices()
}

/**
 * @description 服务事件处理
 * @param option 事件类型
 */
export const handleServiceEvent = async (option: string, iten: any) => {
	const res: AnyObject = await useDataHandle({
		loading: '正在修改服务状态，请稍后...',
		request: handleService({
			project_name: siteInfo.value.name,
			sid: iten.sid,
			option,
		}),
		message: true,
	})
	if (res.status) getServices()
}

/**
 * @description 取消添加服务
 */
export const onCancel = () => {
	addServicesPopup.value = false
	resetForm()
}

/**
 * @description 提交服务
 */
export const onConfirm = async () => {
	await servicesFormRef.value.validate()
	let params: any = {
		project_name: siteInfo.value.name,
		service_conf: JSON.stringify({
			name: servicesForm.name,
			command: servicesForm.command,
			level: servicesForm.level,
			log_type: servicesForm.log_type,
		}),
	}
	if (servicesForm.isEdit) {
		params.sid = servicesForm.sid
	}
	const requestFun = servicesForm.isEdit ? modifyService : addService
	const res: AnyObject = await useDataHandle({
		loading: servicesDisable,
		request: requestFun(params),
		message: true,
	})
	if (res.status) {
		addServicesPopup.value = false
		resetForm()
		getServices()
	}
}

/**
 * @description 重置表单
 */
const resetForm = () => {
	servicesForm.name = ''
	servicesForm.command = ''
	servicesForm.sid = ''
	servicesForm.level = 11
	servicesForm.log_type = 'append'
	servicesForm.isEdit = false
}

/**
 * @description 获取服务列表
 */
export const getServices = async (load: boolean = false) => {
	load && (loading.value = true)
	const res = await useDataHandle({
		request: getServicesInfo({ project_name: siteInfo.value.name }),
		data: {
			data: [Array, servicesList],
		},
	})
	load && (loading.value = false)
}

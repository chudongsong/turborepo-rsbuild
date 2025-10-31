import { TableColumnProps } from '@/components/data/bt-table/types'
import { formatTime, getByteUnit } from '@/utils'
import { useSiteStore } from '../../useStore'
import { SITE_LOAD_STATE_STORE } from './useStore'
const { getLoadDataEvent } = SITE_LOAD_STATE_STORE()

const { siteInfo, siteType } = useSiteStore()

export const pid = ref('') // PID
export const run = ref(siteType.value === 'java' ? (siteInfo.value?.pid !== null ? true : false) : siteInfo.value?.run) // 是否运行

export const tableLoading = ref<boolean>(false)
const allData = ref<any>() // 所有项目信息
export const tableData = ref<any>() // 打开的文件列表
export const netData = ref<AnyObject[]>() // 网络列表
export const pidList = ref<any>() // 项目信息下拉
const loadData = ref<any>() // 项目信息

export const describeData = [
	{ label: '名称', value: 'name' },
	{ label: '状态', value: 'status' },
	{ label: '用户', value: 'user' },
	{ label: '启动时间', value: 'create_time', isTime: true },
	{ label: 'PID', value: 'pid' },
	{ label: 'PPID', value: 'ppid' },
	{ label: '线程', value: 'threads' },
	{ label: 'Socket', value: 'connects' },
	{ label: 'CPU', value: 'cpu_percent' },
	{ label: '内存', value: 'memory_used', isSize: true },
	{ label: 'io读', value: 'io_read_bytes', isSize: true },
	{ label: 'io写', value: 'io_write_bytes', isSize: true },
	{ label: '命令', value: 'exe' },
] // 描述数据

export const useTableColumn = () => {
	return ref<TableColumnProps[]>([
		{ label: '文件', prop: 'path' },
		{ label: 'mode', prop: 'mode', width: 50 },
		{ label: 'position', prop: 'position', width: 100 },
		{ label: 'flags', prop: 'flags', width: 80 },
		{ label: 'fd', prop: 'fd', width: 60 },
	])
}

export const useNetTableColumn = () => {
	return ref<TableColumnProps[]>([
		{
			label: '客户端地址',
			prop: 'client_addr',
			render: (row: AnyObject) => {
				return row.client_addr || '--'
			},
		},
		{ label: '客户端端口', prop: 'client_rport' },
		{ label: '协议', prop: 'family' },
		{ label: 'FD', prop: 'fd' },
		{ label: '本地地址', prop: 'local_addr' },
		{ label: '本地端口', prop: 'local_port' },
		{ label: '状态', prop: 'status' },
	])
}

export const tableColumns = useTableColumn()
export const netColumns = useNetTableColumn()

/**
 * @description 描述
 * @param item
 */
export const computedDes = (item: any) => {
	if (!loadData.value) return ''
	return item.isTime ? formatTime(loadData.value[item.value]) : item.isSize ? getByteUnit(loadData.value[item.value]) : loadData.value[item.value]
}

/**
 * @description 切换pid
 * @param item
 */
export const handleChangeEvent = async (val: string) => {
	// 切换负载状态显示
	tableLoading.value = true
	tableData.value = allData.value[val].open_files
	netData.value = allData.value[val].connections
	loadData.value = allData.value[val]
	tableLoading.value = false
}

/**
 * @description 获取负载状态
 * @returns
 */
export const getLoadData = async () => {
	try {
		tableLoading.value = true
		let param: any = { project_name: siteInfo.value.name }
		const type = siteType.value
		if (type === 'go') param.has_load_info = 1
		if (siteType.value === 'nodejs') {
			param.project_type = siteInfo.value.project_config.project_type || 'nodejs'
		}
		const paramsType: AnyObject = {
			java: param,
			default: { data: JSON.stringify(param) },
		}
		const { data } = await getLoadDataEvent(paramsType[type] || paramsType.default)
		await handleLoadInfo(data)
		tableLoading.value = false
	} catch (error) {
		console.log(error)
		return { status: false, msg: '获取负载状态失败' }
	}
}

/**
 * @description 处理数据
 * @param res
 */
export const handleLoadInfo = (res: any) => {
	try {
		const data = res?.load_info || res?.data
		if (Object.keys(data).length) {
			pidList.value = Object.keys(data).map(item => {
				return item
			})
			pid.value = pidList.value[0]
			tableData.value = data[pid.value].open_files
			netData.value = data[pid.value].connections
			loadData.value = data[pid.value]
			allData.value = data
		}
		if (siteType.value !== 'java') run.value = res.run
	} catch (error) {
		console.log(error)
	}
}

/**
 * @description 初始化加载
 */
export const initLoad = async () => {
	getLoadData()
}

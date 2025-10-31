import { backupDownload, getCrontabBackupTableData } from '@/api/crontab'
import CRONTAB_TASK_STORE from '../useStore'
import { useDataHandle, useDataPage, useMessage } from '@/hooks/tools'
import { getByteUnit } from '@/utils'
import { useOperate } from '@/hooks/tools/table/column'

const Message = useMessage()

const crontanTaskStore = CRONTAB_TASK_STORE()
const { rowData } = storeToRefs(crontanTaskStore)

export const backLoad = ref<boolean>(false) // 备份列表加载状态
export const backData = ref<any[]>([]) // 备份列表数据
export const backTotal = ref(0) // 总条数
export const backParam = reactive<any>({
	cron_id: rowData.value?.id || 0,
	p: 1,
	rows: 10,
}) //

const useBackColumns = () => {
	return shallowRef([
		{ label: '文件名称', prop: 'name', showOverflowTooltip: true },
		{ label: '备份时间', prop: 'addtime' },
		{ label: '备份到', prop: 'filename', showOverflowTooltip: true },
		{ label: '文件大小', render: (row: any) => getByteUnit(row.size) },
		useOperate([{ onClick: downloadEvent, title: '下载' }]),
	])
}

/**
 * @description 下载
 * @param row
 */
const downloadEvent = async (row: any) => {
	try {
		const res: any = await backupDownload({ cron_id: row.cron_id, filename: row.filename })
		// 下载操作
		if (res.status) {
			if (res.data.is_loacl) {
				window.open('/download?filename=' + encodeURIComponent(res.data.path), '_blank', 'noopener,noreferrer')
			} else {
				window.open(res.data.path, '_blank', 'noopener,noreferrer')
			}
		} else {
			Message.error(res.msg)
		}
	} catch (error) {
		console.log(error)
	}
}

export const backColumns = useBackColumns()

/**
 * @description 获取备份列表
 */
export const getBackFileList = async () => {
	try {
		await useDataHandle({
			loading: backLoad,
			request: getCrontabBackupTableData({ ...backParam, cron_id: rowData.value.id }),
			data: { data: [Array, backData], page: useDataPage(backTotal) },
		})
	} catch (error) {
		console.log(error)
	}
}

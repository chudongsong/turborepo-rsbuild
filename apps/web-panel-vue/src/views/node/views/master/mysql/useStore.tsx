import { addProxyProject, batchDelNginx, delProxyProject, getProxyConfigFile, proxyTcpAction } from '@/api/site'
import type { TableBatchOptionsProps, TableBatchDialogProps, TableBatchNextAllProps, TableBatchEventProps } from '@/components/extension/bt-table-batch/types.d'
import { useDataHandle, useHandleError } from '@/hooks/tools'
import { deleteMysqlSlave, getMysqlSlaveHistory, deleteMysqlSlaveHistory, setMysqlSlave } from '@/api/node'
import { useBatchStatus } from '@hooks/tools/table/column'

const MASTER_MYSQL_STORE = defineStore('MASTER-MYSQL-STORE', () => {
	const isRefreshList = ref(false)
	const mysqlRowData = ref<any[]>([])
	// 删除从库
	const deleteMysqlSlaveEvent = async (row: any) => {
		try {
			let params: any = {
				slave_ip: row.slave_ip,
			}
			const res: AnyObject = await useDataHandle({
				loading: '正在删除从库，请稍候...',
				request: deleteMysqlSlave(params),
				message: true,
			})
			return { status: res.status, msg: res.msg }
		} catch (error) {
			console.log(error)
			return { status: false, msg: '删除从库失败' }
		}
	}

	/**
	 * @description 批量删除从库
	 */
	const multDeleteMysqlSlaveEvent = async (batchConfirm: TableBatchDialogProps, nextAll: TableBatchNextAllProps, selectedList: AnyObject[], options: TableBatchOptionsProps) => {
		const { label, value } = options
		const requestHandle = async (item: AnyObject, index: number) => {
			switch (value) {
				case 'delete':
					return await deleteMysqlSlave({ slave_ip: item.slave_ip })
					break
			}
		}
		await batchConfirm({
			title: `批量${label}从库`,
			content: `批量${label}已选的从库，是否继续操作！`,
			column: [
				{
					label: '从库地址',
					prop: 'slave_ip',
				},
				useBatchStatus(),
			], // 弹窗配置
			onConfirm: async () => {
				// 递归操作所有选中的数据，如果不需要递归则不需要该方法，执行单接口请求
				await nextAll(requestHandle)
				// 执行完毕的代码，刷新列表
				isRefreshList.value = true
				// 返回false则不关闭弹窗
				return false
			},
		})
	}

	/**
	 * @description 获取历史备份文件
	 */
	const getMysqlSlaveHistoryEvent = async () => {
		try {
			const res = await getMysqlSlaveHistory()
			return res
		} catch (error) {
			useHandleError(error)
		}
	}

	/**
	 * @description 删除历史备份文件
	 */
	const deleteMysqlSlaveHistoryEvent = async (params: any) => {
		try {
			const res = await deleteMysqlSlaveHistory(params)
			return res
		} catch (error) {
			useHandleError(error)
		}
	}

	/**
	 * @description 启动或停止从库同步
	 */
	const setMysqlSlaveEvent = async (params: any, type: 'start' | 'stop') => {
		try {
			const res = await setMysqlSlave({
				slave_ip: params.slave_ip,
				status: type,
			})
			return res
		} catch (error) {
			useHandleError(error)
		}
	}

	return { deleteMysqlSlaveEvent, multDeleteMysqlSlaveEvent, setMysqlSlaveEvent, getMysqlSlaveHistoryEvent, deleteMysqlSlaveHistoryEvent, isRefreshList, mysqlRowData }
})

const useMasterMysqlStore = () => {
	return { ...MASTER_MYSQL_STORE(), ...storeToRefs(MASTER_MYSQL_STORE()) }
}

export { useMasterMysqlStore, MASTER_MYSQL_STORE }

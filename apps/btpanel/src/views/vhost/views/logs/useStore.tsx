import { getLogsApi, GetLogsParams } from '@/api/vhost'
import { TableResponseProps } from '@/hooks/tools/table/types'
import { formatTime } from '@/utils'
import { defineStore } from 'pinia'

export const LOGS_STORE = defineStore('VHOST-LOGS-STORE', () => {
	const columns = ref([
		{ label: '类型', prop: 'log_type', minWidth: 40 },
		{ label: '类别', prop: 'log_level', minWidth: 40 },
		{
			label: '状态',
			prop: 'status',
			minWidth: 50,
			render: (row: { log_status: number }) => {
				return <span class={row.log_status === 1 ? 'text-primary' : 'text-error'}>{row.log_status === 1 ? '成功' : '失败'}</span>
			},
		},
		{
			label: '内容',
			prop: 'log_body',
			render: (row: { log_body: string; username: string }) => {
				return (
					<div class="flex">
						{row.username ? <div class="text-tertiary">{'用户名: [' + row.username + ']-->'}</div> : ''}
						<div>{row.log_body}</div>
					</div>
				)
			},
		},
		{
			label: '执行时间',
			prop: 'log_time',
			align: 'right',
			minWidth: 60,
			render: (row: { log_time: string }) => {
				return formatTime(row.log_time)
			},
		},
	])
	/**
	 * @description 获取列表数据
	 */
	const getLogsList = async (param: { p: number; search: string; limit: number }): Promise<TableResponseProps> => {
		const { data } = await getLogsApi({
			p: param.p,
			search: param.search,
			rows: param.limit,
		})
		return { data: data.list || [], total: data.page?.count || 0 }
	}

	return { columns, getLogsList }
})

/**
 * @description 设置store
 * @returns
 */
export const useLogsStore = () => {
	const store = LOGS_STORE()
	const logsStore = storeToRefs(store)
	return { ...store, ...logsStore }
}

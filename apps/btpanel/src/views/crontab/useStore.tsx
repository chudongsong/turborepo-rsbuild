import { useDataHandle, useDataPage } from '@/hooks/tools'
import { formatTime } from '@/utils'
import { defineStore } from 'pinia'

const CRONTAB_STORE = defineStore('CRONTAB-STORE', () => {
	// 执行日志
	const logCompData = ref<any>({}) // 执行日志组件数据
	const tableLoading = ref(false) // 表格loading
	const tableData = ref([]) // 表格数据
	const tableParam = reactive<any>({
		p: 1,
		rows: 10,
	}) // 表格参数
	const total = ref(0) // 总条数

	//

	/**
	 * @description 获取日志列表
	 */
	const getLogList = async () => {
		await useDataHandle({
			loading: tableLoading,
			request: logCompData.value.request({ ...logCompData.value.data, ...tableParam }),
			data: { data: [Array, tableData], page: useDataPage(total) },
		})
	}

	const useLogTableColumn = () => {
		return [
			{ label: '执行时间', width: 148, render: (row: any) => formatTime(row.start_time) },
			{
				label: '耗时',
				render: (row: any) => {
					let diff = row.end_time - row.start_time
					return `${diff < 1 ? '小于1' : diff}秒`
				},
			},
			{
				label: '执行结果',
				render: (row: any) => {
					return <span style={`color: ${row.status ? 'var(--el-color-primary)' : '#ef0808'};`}>{row.status ? '成功' : '失败'}</span>
				},
			},
			{
				label: '返回内容',
				width: 400,
				render: (row: any) => {
					let txt = row.status ? row.result_succ : row.result_err
					return (
						<pre
							class="max-h-[14rem] overflow-y-hidden overflow-x-hidden w-full"
							onMouseenter={(e: any) => {
								let target = e.target
								target.style.overflowX = 'auto'
								target.style.overflowY = 'auto'
							}}
							onMouseleave={(e: any) => {
								let target = e.target
								target.style.overflowX = 'hidden'
								target.style.overflowY = 'hidden'
							}}>
							{txt}
						</pre>
					)
				},
			},
		]
	}

	const tableColumns = useLogTableColumn()

	return {
		logCompData,
		total,
		tableParam,
		tableLoading,
		tableColumns,
		tableData,
		getLogList,
	}
})

export default CRONTAB_STORE

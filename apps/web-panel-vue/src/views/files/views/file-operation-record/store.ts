import type { TableColumnProps } from '@/components/data/bt-table/types'
import { defineStore } from 'pinia'
import { getFileHistoryRecord } from '@api/files'
import { useDataHandle, useDataPage } from '@hooks/tools'

const FILES_OPERATION_RECORD_STORE = defineStore('FILES-OPERATION-RECORD-STORE', () => {
	const isLoading = ref<boolean>(false) // 加载状态
	const tableData = ref<any>([]) // 表格数据
	// 表格
	const recordTableData = reactive<any>({
		loading: false, // 加载状态
		content: '', // 搜索内容
		total: 0, // 总数
		limit: 20, // 每页条数
		p: 1, // 当前页
		help: [
			// 帮助列表
			{
				content: '清空当前日志可前往"日志->操作日志"中清空',
			},
		],
	})
	// 表格列
	const tableColumn = ref<TableColumnProps[]>([
		{
			label: '操作时间',
			prop: 'addtime',
			width: 160,
		},
		{
			label: '操作日志',
			prop: 'log',
		},
	])

	/**
	 * @description 获取数据
	 */
	const getData = async () => {
		await useDataHandle({
			loading: isLoading,
			request: getFileHistoryRecord({
				content: recordTableData.content || '',
				p: recordTableData.p,
			}),
			data: {
				data: [Array, tableData],
				page: useDataPage(recordTableData),
			},
		})
	}
	/**
	 * @description 搜索
	 * @param search
	 */
	const searchSubmit = (search: string) => {
		recordTableData.content = search
		getData()
	}

	const $reset = () => {
		isLoading.value = false
		Object.assign(recordTableData, {
			loading: false, // 加载状态
			content: '', // 搜索内容
			total: 0, // 总数
			limit: 20, // 每页条数
			p: 1, // 当前页
		})
		tableData.value = []
	}

	return {
		isLoading,
		tableColumn,
		tableData,
		recordTableData,
		searchSubmit,
		getData,
		$reset,
	}
})

export default FILES_OPERATION_RECORD_STORE

import { closeShareFile, getShareList } from '@/api/files'
import { TableColumnProps } from '@/components/data/bt-table/types'
import { useConfirm, useDataHandle, useDataPage } from '@hooks/tools'
import { useOperate } from '@hooks/tools/table/column'
import { defineStore } from 'pinia'
import { ShareDetailView } from '@files/useMethods'
import FILES_STORE from '@files/store'

const FILES_SHARE_LIST_STORE = defineStore('FILES-SHARE-LIST-STORE', () => {
	const compData = ref<any>({})
	const { refreshFilesList } = FILES_STORE()

	const isLoading = ref<boolean>(false) // 加载状态
	const tableData = ref<any>([]) // 表格数据
	// 表格数据
	const shareTableData = reactive<any>({
		total: 0,
		p: 1,
		limit: 12,
		file_name: '',
	})

	/**
	 * @description 获取分享列表
	 */
	const getShareData = async () => {
		useDataHandle({
			loading: isLoading,
			request: getShareList({
				p: shareTableData.p,
				filename: shareTableData.file_name || '',
				// row: shareTableData.limit,
			}),
			data: {
				data: [Array, tableData],
				page: useDataPage(shareTableData),
			},
		})
	}

	/**
	 * @description 搜索
	 * @param search
	 */
	const searchSubmit = (search: string) => {
		shareTableData.file_name = search
		getShareData()
	}

	/**
	 * @description 分享详情
	 * @param {any} row
	 */
	const shareDetail = (row: any) => {
		ShareDetailView(row, true)
	}

	/**
	 * @description 删除分享
	 * @param {any} row
	 */
	const deleteShare = async (row: any) => {
		await useConfirm({
			title: `取消分享`,
			content: `是否取消分享该文件【${row.ps}】，是否继续？`,
		})
		useDataHandle({
			loading: '正在取消文件分享，请稍后...',
			request: closeShareFile({ id: row.id }),
			message: true,
			success: (res: any) => {
				if (res.status) {
					getShareData()
					refreshFilesList()
				}
			},
		})
	}

	// 表格列
	const tableColumn = ref<TableColumnProps[]>([
		{
			label: '分享名称',
			prop: 'ps',
		},
		{
			label: '文件地址',
			prop: 'filename',
		},
		{
			label: '过期时间',
			prop: 'expire',
		},
		useOperate([
			{ onClick: shareDetail, title: '详情' },
			{ onClick: deleteShare, title: '关闭' },
		]),
	])

	const $reset = () => {
		isLoading.value = false
		tableData.value = []
		Object.assign(shareTableData, {
			total: 0,
			p: 1,
			limit: 12,
			file_name: '',
		})
	}

	return {
		compData,
		isLoading,
		tableData,
		shareTableData,
		tableColumn,
		getShareData,
		searchSubmit,
		$reset,
	}
})

export default FILES_SHARE_LIST_STORE

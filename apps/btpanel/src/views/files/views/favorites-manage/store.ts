import { defineStore, storeToRefs } from 'pinia'
import FILES_STORE from '@files/store'
import { delFileFavorites } from '@api/files'
import { openFile, pathJumpEvent, getFavoriteList } from '@files/useMethods'
import { useConfirm, useDataHandle } from '@hooks/tools'
import { useOperate } from '@/hooks/tools/table/column'
import { TableColumnProps } from '@/components/data/bt-table/types'

const FILES_FAVORITES_MANAGE_STORE = defineStore('FILES-FAVORITES-MANAGE-STORE', () => {
	const filesStore = FILES_STORE()
	const { favoriteList } = storeToRefs(filesStore)
	const { refreshFilesList } = filesStore

	const instance = ref<any>() // 实例
	const lastFavoriteList = ref(favoriteList.value)

	// 取消收藏
	const onFavoriteCancel = async (row: any) => {
		await useConfirm({
			title: `删除收藏`,
			content: `即将删除收藏路径【${row.name}】`,
		})
		useDataHandle({
			loading: '正在删除收藏路径，请稍后...',
			request: delFileFavorites({
				path: row.path,
			}),
			message: true,
			success: (res: any) => {
				if (res.status) getFavoriteList()
			},
		})
	}

	// 表格
	const favTableData = reactive<any>({
		loading: false, // 加载状态
		data: [], // 表格数据
	})

	// 打开
	const cutDirPath = async (item: any) => {
		if (item.type === 'dir') {
			pathJumpEvent(item.path)
		} else {
			const newItem = {
				...item,
				fileName: item.name,
				ext: item.ext || item.name.split('.').pop(),
			}
			openFile(newItem)
		}
		const popup = await instance.value
		popup?.unmount()
	}

	// 表格列
	const tableColumn = ref<TableColumnProps[]>([
		{
			label: '路径',
			prop: 'path',
		},
		useOperate([
			{ onClick: cutDirPath, title: '打开' },
			{ onClick: onFavoriteCancel, title: '删除' },
		]),
	])

	const onCancel = () => {
		if (lastFavoriteList.value.length === favoriteList.value.length) return
		refreshFilesList()
	}

	const $reset = () => {
		Object.assign(favTableData, {
			loading: false,
			data: [],
		})
	}

	return {
		instance,
		tableColumn,
		favoriteList,
		favTableData,
		onCancel,
		$reset,
	}
})

export default FILES_FAVORITES_MANAGE_STORE

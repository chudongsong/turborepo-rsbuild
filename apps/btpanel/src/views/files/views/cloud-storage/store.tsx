import { defineStore, storeToRefs } from 'pinia'
import FILES_STORE from '@files/store'
import type { TableColumnProps } from '@/components/data/bt-table/types'
import { Message, useDataHandle } from '@hooks/tools'
import { useCheckbox } from '@/hooks/tools/table/column'
import { formatTime, getByteUnit } from '@utils/index'
import { getCloudList, cloudFileAction } from '@api/files'
import { openPluginView } from '@/public'

const FILES_CLOUD_STORAGE_STORE = defineStore('FILES-CLOUD-STORAGE-STORE', () => {
	const filesStore = FILES_STORE()
	const { fileTabActiveData } = storeToRefs(filesStore)
	const { refreshFilesList, getRealTask } = filesStore

	const compData = ref<any>() // 组件数据
	const instance = ref<any>() // 弹窗

	const ossTable = ref<any>()
	const loading = ref(false)
	const tableData = ref([])
	const isTagMode = ref(true) // 是否是标签模式
	const temporaryPath = ref('') // 临时路径
	const showPathList = ref<any[]>([]) // 显示路径列表
	const filePath = ref('') // 当前路径
	const pathList = ref<any[]>([]) // 当前路径列表
	const selectedRows = ref<any[]>([]) // 选中的行
	const tableColumns = ref<TableColumnProps[]>([
		useCheckbox({ key: 'name' }),
		{
			label: '文件名',
			prop: 'name',
			width: '300',
			render: (row: any) => {
				return (
					<span class={[row.type === null ? 'bt-open-dir folder-open-icon' : 'bt-open-dir file-text-icon']}>
						<i class="icon"></i>
						<span
							onClick={(ev: MouseEvent) => {
								row.type === null && filePathJump((filePath.value === '' ? '' : filePath.value + '/') + row.name)
							}}>
							{row.name}
						</span>
					</span>
				)
			},
		},
		{
			label: '大小',
			prop: 'size',
			render: (row: any) => {
				let size = row.size !== null ? getByteUnit(Number(row.size)) : '-'
				if (row.type === null) size = '-'
				return h('span', size)
			},
		},
		{
			label: '更新时间',
			prop: 'time',
			render: (row: any) => {
				return row.type === '' ? '<span>' + formatTime(row.time) + '</span>' : '-'
			},
		},
	])

	/**
	 * @description: 路径框失去焦点
	 * @return {Void} void
	 */
	const temporaryBlur = () => {
		isTagMode.value = true
		temporaryPath.value = ''
	}

	/**
	 * @description: 返回上一级
	 * @return {Void} void
	 */
	const goBack = () => {
		if (pathList.value.length === 1) return
		filePath.value = pathList.value[pathList.value.length - 2]?.path || '/'
		getDirList()
	}

	/**
	 * @description: 路径框指定文件名点击、跳转路径
	 * @param {String} path  跳转路径
	 * @return {Void} void
	 */
	const filePathJump = (path: string) => {
		if (filePath.value === path) return
		filePath.value = path
		getDirList()
	}
	/**
	 * @description: 路径框焦点（非指定文件名时）
	 * @return {Void} void
	 */
	const temporaryFocus = () => {
		isTagMode.value = false
		temporaryPath.value = filePath.value
	}
	/**
	 * @description: 路径框回车
	 * @param {Any} event  回车后的事件
	 * @return {Void} void
	 */
	const temporaryEnter = (event: any) => {
		let path_value = event.target?.value
		path_value = path_value.replace(/\/+/g, '/') // 去除多余的斜杠
		if (path_value !== '/') path_value = path_value.replace(/\/+$/g, '') // 去除最后的斜杠
		if (path_value !== temporaryPath.value) {
			filePath.value = path_value
			getDirList()
		}
		event.target.blur()
	}

	/**
	 * @description: 获取目录信息
	 * @return {Void} void
	 */
	const getDirList = async () => {
		try {
			loading.value = true
			const res = await getCloudList({
				path: filePath.value,
				pname: compData.value.pname,
			})
			loading.value = false
			if (!res.status) {
				close()
				Message.msg({
					message: '请先配置云存储',
					type: 'warning',
				})
				openPluginView({ name: compData.value.pname })
				return
			}
			tableData.value =
				res.data?.list?.sort((a: any, b: any) => {
					if (a.type === null) return -1
					if (b.type === null) return 1
					return 0
				}) || []
			watchTableData(tableData.value)
			if (res.data.hasOwnProperty('path')) fileNavHead(res.data.path)
		} catch (error) {
			console.log(error)
		}
		// await useDataHandle({
		// 	loading,
		// 	request: getCloudList({
		// 		path: filePath.value,
		// 		pname: compData.value.pname,
		// 	}),
		// 	success: (res: any) => {
		// 		console.log(res)
		// 	},
		// })
	}

	/**
	 * @description: 文件导航头部
	 * @param {String} PATH  路径
	 * @return {Void} void
	 */
	const fileNavHead = (PATH: string) => {
		let lastPath = ''
		filePath.value = PATH
		pathList.value = [
			{
				title: '根目录',
				path: '',
				type: 'dir',
			},
		] // 重置
		if (PATH === '') {
			showPathList.value = pathList.value
			return
		}
		// 当最后一个字符是/时，去掉
		if (PATH && PATH[PATH.length - 1] === '/') {
			PATH = PATH.slice(0, -1)
		}
		PATH.split('/').forEach((item: any, index: number) => {
			// lastPath += `${index === 1 ? '' : '/'}${item}`
			lastPath += `/${item}`.replace(/\/\//g, '/')

			pathList.value.push({
				title: item === '' && index == 0 ? '根目录' : item,
				path: lastPath,
				type: 'dir',
			})
		})
		showPathList.value = pathList.value
	}
	// 选中行
	const handleSelectionChange = (val: any) => {
		if (val.length > 1) {
			ossTable.value.getTable().clearSelection()
			ossTable.value.getTable().toggleRowSelection(val.pop())
		} else {
			selectedRows.value = val
		}
	}
	const load = ref(false)
	// 上传、下载
	const onConfirm = async () => {
		const { pname, type } = compData.value
		let param = {}
		if (type == 'down') {
			// 判断是否有选中的文件
			if (selectedRows.value.length === 0) {
				Message.error('请选择勾选需要下载的文件')
				return
			}
			param = {
				name: pname,
				url: selectedRows.value[0].download,
				path: fileTabActiveData.value.param.path,
				filename: selectedRows.value[0].name,
			}
		} else {
			param = {
				name: pname,
				filename: compData.value.rowData.path,
				object_name: filePath.value,
			}
		}
		const res: any = await useDataHandle({
			loading: '正在执行中，请稍后...',
			request: cloudFileAction(param, type),
			message: true,
			success: (res: any) => {
				if (res.status) {
					getRealTask() // 获取实时任务队列
					refreshFilesList()
				}
			},
		})
		return res.status
	}

	/**
	 * @description: 监听表格数据
	 */
	const watchTableData = (val: any) => {
		nextTick(() => {
			const checkboxs = document.querySelectorAll('.oss-table .el-table__body-wrapper .el-checkbox')
			if (compData.value.type === 'down') {
				// 将type为null的行隐藏el-checkbox
				checkboxs.forEach((item: any, index: number) => {
					if (val[index].type === null) {
						item.style.display = 'none'
					} else {
						item.style.display = 'block'
					}
				})
			} else {
				checkboxs.forEach((item: any, index: number) => {
					item.style.display = 'none'
				})
			}
		})
	}

	const close = async () => {
		const popup = await instance.value
		popup?.unmount()
	}

	const $reset = () => {
		isTagMode.value = true
		temporaryPath.value = ''
		filePath.value = ''
		tableData.value = []
		showPathList.value = []
		pathList.value = []
		selectedRows.value = []
	}

	return {
		compData,
		instance,
		ossTable,
		isTagMode,
		temporaryPath,
		showPathList,
		tableColumns,
		tableData,
		loading,
		handleSelectionChange,
		temporaryBlur,
		temporaryFocus,
		temporaryEnter,
		goBack,
		watchTableData,
		getDirList,
		filePathJump,
		onConfirm,
		$reset,
	}
})

export default FILES_CLOUD_STORAGE_STORE

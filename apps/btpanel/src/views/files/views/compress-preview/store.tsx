import { defineStore, storeToRefs } from 'pinia'
import FILES_STORE from '@files/store'
import { getByteUnit } from '@utils/index'
import { fileSelectionDialog } from '@/public/index'
import { getZipFiles, getGzFiles, compressAddGz, compressAddZip, compressEditZip, compressEditGz, deCompressZip, deCompressGz, zipDeleteFiles, gzDeleteFiles } from '@api/files'
import { editFilesDialog, FilesCompressCoverView, determineFileType } from '@files/useMethods'
import { Message, useConfirm, useDataHandle, useMessage } from '@hooks/tools'
import { useOperate, useCheckbox } from '@/hooks/tools/table/column'
import { TableBatchOptionsProps } from '@/components/extension/bt-table-batch/types'

const FILES_COMPRESS_PREVIEW_STORE = defineStore('FILES-COMPRESS-PREVIEW-STORE', () => {
	const filesStore = FILES_STORE()
	const { fileTabActiveData } = storeToRefs(filesStore)
	const { refreshFilesList } = filesStore

	const initPath = ref<string>('') // 初始化路径
	const fileItem = ref<any>() // 文件信息
	const instance = ref<any>() // 实例

	let clearSelectionRef: any

	// 压缩包数据
	const compressData = reactive({
		file: {
			data: {}, // 总数据
			path: '当前压缩包', // 当前路径
		}, // 压缩文件对象
		isDblclick: false, // 是否双击
		addList: [] as string[], // 添加文件列表
	})
	const loading = ref(false) // 加载中
	// 首次加载
	const isFirstLoad = ref(true)
	// 解压弹窗数据
	const deCompressPopupData = reactive({
		visible: false,
		form: {
			filename: '', // 要解压的文件名
			path: '/', // 解压路径
		},
	})

	const batchDeletePopupDisable = ref(false)
	// 批量删除弹窗
	const batchDeletePopup = ref(false)
	// 批量操作数据
	const batch = reactive({
		tableBatchData: [
			// 批量操作列表
			{
				label: '批量解压',
				value: 'decompress',
				isRefBatch: true,
				event: () => {},
			},
			{
				label: '批量删除',
				value: 'delete',
				isRefBatch: true,
				event: () => {},
			},
		],
		// 批量操作配置
		batchConfig: {
			isRecurrence: false,
			describe: {
				title: '',
				th: '',
				message: '',
				propsValue: 'name',
			},
			tableDisplayConfig: {
				label: '状态',
				prop: 'status',
				render: (row: any) => {
					return h('span', {})
				},
			},
		},
		decompressTableColumn: [
			{
				label: '文件名',
				prop: 'filename',
			},
			{
				label: '大小',
				prop: 'file_size',
				width: 70,
				render(row: any) {
					return h('span', {}, row.file_size ? getByteUnit(row.file_size) : '--')
				},
			},
		],
		selectList: [], // 选中的列表
	})

	// 表格ref
	const fileTableRef = ref<any>()

	/**
	 * @description: 添加文件
	 * @return {*}
	 */
	const addFile = async () => {
		fileSelectionDialog({
			type: 'file',
			path: deCompressPopupData.form.path,
			change: async (path: string) => {
				const arr = compressData.file.path.split('/').slice(1).join('/').replace('当前压缩包', '')
				loading.value = true
				compressData.addList = [path]
				const requestFun = fileItem.value.ext === 'zip' ? compressAddZip : compressAddGz
				await useDataHandle({
					loading: '正在添加文件，请稍后...',
					request: requestFun({
						data: JSON.stringify({
							sfile: fileItem.value.path,
							r_path: arr ? `/${arr}` : '', // 参数不明
							f_list: compressData.addList,
						}),
					}),
					message: true,
					success: getList,
				})
				loading.value = false
			},
		})
	}

	/**
	 * @description: 面板屑跳转
	 * @param {number} index  路径索引
	 * @return {*}
	 */
	const goPath = (index: number) => {
		const pathList = compressData.file.path.split('/').filter(item => item !== '')
		let path = ''
		// 拼接路径
		for (let i = 0; i <= index; i++) {
			path += `/${pathList[i]}`
		}
		compressData.file.path = path
		if (path === '/当前压缩包') {
			fileTableRef.value.getTable().toggleAllSelection()
		}
	}

	/**
	 * @description: 表格行单击 选中行
	 * @param {any} row  行数据
	 * @return {*}
	 */
	const cellClick = (row: any, column: any, event: any) => {
		setTimeout(() => {
			if (!compressData.isDblclick) {
				fileTableRef.value.getTable().toggleAllSelection()
			}
		}, 200)
	}

	/**
	 * @description: 表格行双击 打开文件夹
	 * @param {any} row  行数据
	 * @return {*}
	 */
	const cellDblclick = (row: any) => {
		compressData.isDblclick = true
		// 有修改时间就不是文件夹
		if (row.date_time) return
		// 进入文件夹
		compressData.file.path = `${compressData.file.path}/${row.filename}`
		setTimeout(() => {
			compressData.isDblclick = false
		}, 200)
	}

	/**
	 * @description: 解压
	 * @param {any} row 行数据
	 * @return {*}
	 */
	const deCompressEvent = async (row: any, index: number, event: MouseEvent): Promise<void> => {
		event.stopPropagation()
		event.preventDefault()
		Object.assign(deCompressPopupData, {
			visible: true,
			form: {
				filename: row.filename, // 要解压的文件名
				path: fileTabActiveData.value.param.path || '/', // 解压路径
			},
		})
	}

	// 打开路径选择弹窗
	const openPathDialog = () => {
		fileSelectionDialog({
			type: 'dir',
			path: deCompressPopupData.form.path,
			change: (path: string) => {
				deCompressPopupData.form.path = path
			},
		})
	}

	/**
	 * @description: 处理解压路径
	 */
	const processZipPath = (zipPath: string[]): string => {
		zipPath.shift()
		return zipPath.join('/')
	}

	/**
	 * @description: 获取解压文件列表
	 * @return {*}
	 */
	const getZipArr = (tableList: any): string[] => {
		if (batch.selectList.length === 0) {
			const findIndex = tableList.findIndex((item: any) => item.filename === deCompressPopupData.form.filename)
			return [tableList[findIndex].uploadName]
		} else {
			return batch.selectList.map((item: any) => item.uploadName)
		}
	}

	/**
	 * @description: 确定解压
	 */
	const confirmDeCompress = async (tableList: any, breadList: any) => {
		const zipPath = JSON.parse(JSON.stringify(breadList))
		const params = {
			data: JSON.stringify({
				zip_path: processZipPath(zipPath),
				sfile: fileItem.value.path,
				extract_path: deCompressPopupData.form.path + '/',
				filenames: getZipArr(tableList),
			}),
		}

		const requestFun = fileItem.value.ext === 'zip' ? deCompressZip : deCompressGz

		const res: any = await useDataHandle({
			loading: '正在解压文件，请稍后...',
			request: requestFun(params),
		})
		if (res.status) {
			if (res.type) {
				// 覆盖
				FilesCompressCoverView(res.data, params, fileItem.value.ext === 'zip' ? deCompressZip : deCompressGz)
				deCompressPopupData.visible = false
				return
			}
			Message.success('解压成功')
			refreshFilesList()
		} else {
			Message.request(res)
		}
		clearSelectionRef && clearSelectionRef()
		deCompressPopupData.visible = false
	}

	/**
	 * @description: 编辑
	 * @param {any} row 行数据
	 * @return {*}
	 */
	const editEvent = async (row: any, index: number, event: MouseEvent) => {
		event.stopPropagation()
		event.preventDefault()
		if (determineFileType(row.fileName?.split('.').pop()) !== 'text') {
			Message.error('暂不支持该类型文件编辑')
			return
		}
		const pathList = compressData.file.path.split('/').filter(item => item !== '')
		const params = {
			data: JSON.stringify({
				sfile: fileItem.value.path,
				filename: (pathList.length > 1 ? pathList.join('/').replace('当前压缩包/', '') + '/' : '') + row.filename,
			}),
		}
		const requestFun = fileItem.value.ext === 'zip' ? compressEditZip : compressEditGz

		const res: any = await useDataHandle({
			loading: '正在获取文件，请稍后...',
			request: requestFun(params),
		})

		if (res.status) {
			// 打开编辑器
			editFilesDialog(res.data, fileItem.value, row.filename, pathList.length > 1 ? pathList.join('/').replace('当前压缩包', '') : '')
		} else {
			Message.request(res)
		}
	}

	const getArr = (data: AnyObject): string[] => {
		let delArr: string[] = []
		Object.entries(data).forEach(([key, value]: [any, any]) => {
			if (typeof value === 'object') {
				if (value.is_dir) {
					delArr.push(`${value.filename}/`)
				} else {
					if (value.hasOwnProperty('fullpath')) {
						delArr.push(`${value.fullpath}`)
					} else {
						const arr = getArr(value)
						delArr = delArr.concat(arr)
					}
				}
			}
		})
		return delArr
	}

	/**
	 * @description: 数据处理
	 * @return {*}
	 */
	const processBatch = (pathVal: string): string[] => {
		// let delArr: string[] = batch.selectList.map((item: any) => {
		// 	if (item.uploadName.includes('/dddir')) {
		// 		return `${pathVal}/${item.filename}/`
		// 	}
		// 	return pathVal ? `${pathVal}/${item.filename}` : `${item.filename}`
		// })
		// delArr = [...delArr, `${pathVal}/`]
		// return delArr
		let arr: any = []
		batch.selectList.forEach((item: any) => {
			if (item.uploadName.includes('/dddir')) {
				const arr1 = getArr(item)
				arr = arr.concat(arr1)
			} else {
				if (item.is_dir) {
					arr.push(`${item.filename}/`)
				} else {
					arr.push(`${item.fullpath}`)
				}
			}
		})
		return arr
	}

	/**
	 * @description: 删除
	 * @param {any} row 行数据
	 * @return {*}
	 */
	const delEvent = async (row: any, event?: MouseEvent) => {
		const pathList = compressData.file.path.split('/').filter(item => item !== ''),
			pathVal = pathList.join('/').replace('当前压缩包/', '').replace('当前压缩包', ''),
			currentPath = pathList.length > 1 ? pathList.join('/').replace('当前压缩包/', '') + '/' : ''
		batch.selectList.length === 0 &&
			(await useConfirm({
				title: `删除文件【${row.filename}】`,
				content: `您真的要删除文件【${row.filename}】吗？`,
			}))
		let arr: any = [],
			delArr: any = []
		if (row.is_dir !== 0 && batch.selectList.length === 0) {
			arr = getArr(row)
			// Object.entries(row).forEach(([key, value]: [any, any]) => {
			// 	if (!(typeof value === 'string')) {
			// 		arr.push(`${currentPath}${row.filename}/${key}`)
			// 	}
			// })
		}
		if (batch.selectList.length > 0) {
			delArr = processBatch(pathVal)
		} else {
			delArr = [...arr, `${currentPath}${row.filename}${row.is_dir !== 0 ? '/' : ''}`]
		}
		const params = {
			data: JSON.stringify({
				sfile: fileItem.value.path,
				filenames: delArr,
			}),
		}
		const requestFun = fileItem.value.ext === 'zip' ? zipDeleteFiles : gzDeleteFiles

		batchDeletePopupDisable.value = true

		const res: any = await useDataHandle({
			loading: '正在删除文件，请稍后...',
			request: requestFun(params),
			message: true,
			success: (res: any) => {
				batch.selectList = []
				if (res.status) {
					getList()
					batchDeletePopup.value = false
				}
			},
		})
		clearSelectionRef && clearSelectionRef()
		batchDeletePopupDisable.value = false
		return res.status
	}

	// 表格列
	const tableColumn = ref([
		useCheckbox({ key: 'filename' }),
		{
			label: '名称',
			prop: 'filename',
			render: (row: any) => {
				return (
					<div
						class="flex items-center cursor-pointer"
						onClick={(event: MouseEvent) => {
							// 有修改时间就不是文件夹
							if (row.date_time) return
							event.stopPropagation() // 阻止事件冒泡
							cellDblclick(row)
						}}>
						<img class="mr-[.5rem] w-[2.5rem] h-[2.5rem]" src={`/static/images/file_icon/${row.date_time ? 'file' : 'folder_win10'}.png`} />
						<span class="hover:text-primary">{row.filename}</span>
					</div>
				)
			},
		},
		{
			label: '大小',
			prop: 'file_size',
			width: 100,
			render(row: any) {
				return h('span', { class: 'cursor-pointer' }, row.file_size ? getByteUnit(row.file_size) : '--')
			},
		},
		{
			label: '修改时间',
			prop: 'date_time',
			width: 270,
			render(row: any) {
				return h('span', { class: 'cursor-pointer' }, row.date_time ? row.date_time : '--')
			},
		},
		useOperate([
			{
				onClick: editEvent,
				isHide: (row: any) => {
					const ext: string = row.filename.split('.').pop() || 'file'
					return determineFileType(ext) !== 'text' || row.is_dir !== 0
				},
				title: '编辑',
			},
			{ onClick: deCompressEvent, title: '解压' },
			{ onClick: delEvent, title: '删除' },
		]),
	])

	// 获取压缩文件列表
	const getList = async () => {
		const requestFun = fileItem.value.ext === 'zip' ? getZipFiles : getGzFiles
		await useDataHandle({
			loading,
			request: requestFun({
				data: JSON.stringify({
					sfile: fileItem.value.path,
				}),
			}),
			success: async (res: any) => {
				if (!res.status) {
					Message.request(res)
					const popup = await instance.value
					popup?.unmount()
				}
				compressData.file.data = res.data
				// 第一次加载需要全选
				if (isFirstLoad.value) {
					// 全选
					nextTick(() => {
						fileTableRef.value.getTable().toggleAllSelection()
					})
					isFirstLoad.value = false
				}
			},
		})
	}

	const batchOptions = [
		{
			label: '解压',
			value: 'decompress',
			event: async (batchConfirm, nextAll, selectedList, options, clearSelection) => {
				batch.selectList = selectedList.value as any
				Object.assign(deCompressPopupData, {
					visible: true,
					form: {
						filename: '', // 要解压的文件名
						path: '/', // 解压路径
					},
				})
				clearSelectionRef = clearSelection
			},
		},
		{
			label: '删除',
			value: 'delete',
			event: async (batchConfirm, nextAll, selectedList, options, clearSelection) => {
				batch.selectList = selectedList.value as any
				batchDeletePopup.value = true
				clearSelectionRef = clearSelection
			},
		},
	] as TableBatchOptionsProps[]

	const init = () => {
		initPath.value = fileItem.value.path || ''
		getList()
		deCompressPopupData.form.path = fileTabActiveData.value.param.path || '/'
	}

	const $reset = () => {
		isFirstLoad.value = true
		batchDeletePopupDisable.value = false
		batchDeletePopup.value = false
		Object.assign(compressData, {
			file: {
				data: {}, // 总数据
				path: '当前压缩包', // 当前路径
			}, // 压缩文件对象
			isDblclick: false, // 是否双击
			addList: [] as string[], // 添加文件列表
		})
	}

	return {
		instance,
		compressData,
		deCompressPopupData,
		fileItem,
		tableColumn,
		loading,
		fileTableRef,
		batch,
		batchOptions,
		batchDeletePopup,
		delEvent,
		confirmDeCompress,
		openPathDialog,
		cellDblclick,
		goPath,
		addFile,
		init,
		$reset,
	}
})

export default FILES_COMPRESS_PREVIEW_STORE

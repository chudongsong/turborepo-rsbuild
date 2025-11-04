import { defineStore, storeToRefs } from 'pinia'
import FILES_STORE from '@files/store'
import { Message, useConfirm, useDataHandle, useDialog } from '@/hooks/tools'
import { useBatchStatus, useCheckbox, useOperate } from '@/hooks/tools/table/column'
import { batchDeleteRecyclingBin, cleanRecyclingBin, deleteRecyclingBin, dowmloadRecyclingBin, getRecyclingBin, recoverRecyclingBin, setRecyclingBin } from '@/api/files'
import { formatTime, getByteUnit, isDev } from '@/utils/index'
import { openAceEditor, FileImageView, getExtIcon, determineFileType, openResultDialog, fileType } from '@files/useMethods'
import { TableBatchOptionsProps } from '@/components/extension/bt-table-batch/types'
import { TableColumnProps } from '@/components/data/bt-table/types'
import { fileSelectionDialog } from '@//public/index'

const FILES_RECYCLE_BIN_STORE = defineStore('FILES-RECYCLE-BIN-STORE', () => {
	const filesStore = FILES_STORE()
	const { recyclingBinStatus } = storeToRefs(filesStore)
	const { getRealTask } = filesStore

	const activeName = ref('all') // 当前激活的tab

	const loading = ref(false) // 加载状态
	const dbTableRef = ref<any>(null) // 数据库回收站表格ref
	const fileTableRef = ref<any>(null) // 文件回收站表格ref
	const binData = reactive<any>({
		data: {}, // 回收站数据
		status: false, // 回收站状态
		statusDB: false, // 数据库回收站状态
		type: 'all', // 回收站类型
		p: 1, // 当前页
		limit: 10, // 每页条数
		search: '', // 搜索
		time: [], // 时间
	})
	const compData = ref<any>() // 组件数据
	const isAllClear = ref(false) // 是否清空回收站

	/**
	 * @description tab切换
	 * @param {string} val
	 */
	const handleTabChange = async (val: string, val2: any) => {
		activeName.value = val
		tableData.p = 1
		tabToggle = true
		time.value = []
		searchName.value = ''

		binData.type = activeName.value
		binData.time = []
		binData.search = ''
		if (val === 'db') {
			tabActive.value = 'all'
			await refresh({ type: 'db' })
		} else {
			tabActive.value = val
			await refresh({ type: val })
		}
	}

	const watchBinData = () => {
		const isDb = activeName.value === 'db'
		compData.value = {
			list: binData.data?.list || [],
			type: !isDb && binData.type === 'db' ? tabActive.value : binData.type || 'db',
			num: binData.data?.search_num === undefined ? binData.data?.[!isDb ? tabActive.value : activeName.value] : binData.data?.search_num,
			size: binData.data?.all_size || 0,
		}
		statusSwitch.value = isDb ? binData.statusDB : binData.status
		// if (compData.value.type !== 'db' && compData.value.type !== 'all') {
		// 	tableData.p = 1
		// }
	}

	/**
	 * @description 获取数据
	 */
	const getData = async (params?: any, isLoad: boolean = true) => {
		if (params && params.time_search) {
			binData.time = params.time_search
		}
		if (params && params.search) {
			binData.search = params.search
		} else if (params && params.search === '') {
			binData.search = ''
		}
		if (params && params.type) {
			binData.type = params.type
		}
		const param = {
			type: binData.type,
			p: binData.p,
			limit: binData.limit,
			search: binData.search,
			time_search: binData.time,
			...params,
		}
		if (isLoad) loading.value = true
		const res = await getRecyclingBin(param)
		loading.value = false
		binData.data = res.data
		binData.status = res.data.status
		recyclingBinStatus.value = res.data.status
		binData.statusDB = res.data.status_db
		watchBinData()
	}

	const statusSwitch = ref<boolean>(false) // 回收站状态

	const time = ref<any>([]) // 时间范围
	const formatDate = ref('') // 格式化时间范围
	const searchName = ref('') // 搜索文件名
	const showPopup = ref(false) // 是否显示弹窗
	const popupData = reactive({
		resultData: [] as { file: string }[],
		resultColumn: [
			{
				label: '数据库',
				prop: 'file',
			},
		],
		resultTitle: '',
	})
	let tabToggle = false // 是否tab切换
	const player = ref<any>() // 日期选择器ref

	/**
	 * @description 时间选择
	 */
	const watchTime = () => {
		const params: any = {
			time_search: [],
		}
		if (time.value?.length === 2) {
			time.value[0] = new Date(time.value[0]).setHours(0, 0, 0, 0)
			time.value[1] = new Date(time.value[1]).setHours(23, 59, 59, 0)
			params.time_search = JSON.stringify([time.value[0] / 1000, time.value[1] / 1000])
		} else {
			formatDate.value = ''
			params.time_search = JSON.stringify([])
		}
		// if (!tabToggle) {
		// tab切换不需要刷新
		// tabToggle = false
		getData(params, false)
		// }
	}

	const pickerOptions = reactive<any>({
		disabledDate: (time: any) => {
			// 获取当前日期
			const today = new Date()

			// 将时间设置为23:59:59
			today.setHours(23, 59, 59, 999)

			// 获取时间戳
			const timestamp = today.getTime()
			return time.getTime() > timestamp
		},
	})

	// 设置回收站状态
	const setStatus = async (db?: number) => {
		let params: any = {}
		if (db) {
			params.db = 1
		}
		const res = await setRecyclingBin(params)
		Message.request(res.data)
		getData()
	}

	// 打开日期选择器
	const showPlayer = () => {
		player.value.focus()
	}

	// 清空时间
	const clearTime = () => {
		time.value = []
	}
	type resultData = {
		fail_list: string[]
		msg: string
		status: string
	}

	// 清空回收站
	const cleanBin = async () => {
		let loading: any = null
		try {
			await useConfirm({
				title: `清空回收站`,
				type: 'input',
				input: {
					content: '清空回收站',
				},
				isHtml: true,
				content: `<span class="text-[red]">清空回收站后，回收站${activeName.value === 'db' ? '【所有数据库】' : '【所有暂存文件】'}将彻底消失，无法恢复，是否继续操作？</span>`,
			})
			loading = Message.load('正在清空回收站，请稍候...')
			const res = await cleanRecyclingBin({ type: activeName.value === 'db' ? 'db' : 'files' })
			const { fail_list } = res as unknown as resultData
			// 检测到同名数据库
			if (fail_list && fail_list?.length > 0 && activeName.value === 'db') {
				const dbList = fail_list.map((item: any) => {
					return {
						file: item,
					}
				})
				popupData.resultData = dbList
				popupData.resultTitle = res.msg
				isAllClear.value = true
				showPopup.value = true
			} else {
				Message.request(res)
			}
			getRealTask(refresh) // 获取实时任务队列
			refresh()
		} catch (error) {
			console.log(error)
		} finally {
			loading && loading.close()
		}
	}
	// 强制删除确认
	const changeClearCheck = async () => {
		const res = await cleanRecyclingBin({ type: 'db', force: 1 })
		Message.request(res)
		getRealTask() // 获取实时任务队列
		getData()
		showPopup.value = false
	}

	const onCancel = (): void => {
		showPopup.value = false
	}

	// 搜索
	const goSearch = () => {
		getData({
			search: searchName.value,
		})
	}

	const tableRef = ref<any>() // 表格ref
	const tableData = reactive({
		loading: false,
		p: 1,
		limit: 10,
	})

	const useRecyclingBinTableColumn = () => {
		return ref<TableColumnProps[]>([
			useCheckbox({ key: 'rname' }),
			{
				label: `文件名`,
				prop: 'fileName',
				minWidth: 150,
				render: (row: any) => {
					return (
						<span class="flex items-center">
							<span class={['icon-bg', row.is_dir ? 'folder-icon' : Object.keys(fileType).includes(getExtIcon(row.name, 'file')) ? fileType[getExtIcon(row.name, 'file')] + '-icon' : 'file-icon']}></span>
							<span class="truncate w-[26rem]">{row.name}</span>
						</span>
					)
				},
			},
			{
				label: `原位置`,
				prop: 'dname',
				showOverflowTooltip: true,
				render: (row: any) => {
					return <span class="truncate">{row.dname}</span>
				},
			},
			{ label: `大小`, width: 90, render: (row: any) => getByteUnit(row.size) },
			{ label: `删除时间`, width: 145, render: (row: any) => formatTime(row.time) },
			useOperate([
				{ title: '下载', isHide: (row: any) => row.is_dir, onClick: downloadEvent },
				{ title: '查看', isHide: (row: any) => row.is_dir, onClick: showEditor },
				{ title: '恢复', onClick: recoverEvent },
				{ title: '删除', onClick: deleteEvent },
			]),
		])
	}

	/**
	 * @description 批量删除
	 */
	const handleMultiDelete = async (list: any, clearSelection: any) => {
		const txt = compData.value.type === 'db' ? '数据库' : '文件'
		await useConfirm({
			title: `删除${txt}`,
			type: 'input',
			input: {
				content: `删除${txt}`,
			},
			isHtml: true,
			content: `风险操作，删除后，${txt}将彻底消失，无法恢复，是否继续操作？`,
		})
		await useDataHandle({
			loading: '正在批量删除，请稍后...',
			request: batchDeleteRecyclingBin({ path_list: list.map((item: any) => item.rname) }),
			success: (res: any) => {
				let result: any = []
				res.success.forEach((item: any) => {
					result.push({
						name: item,
						msg: '删除成功',
						status: true,
					})
				})
				Object.keys(res.error).forEach((item: any) => {
					result.push({
						name: item,
						msg: res.error[item],
						status: false,
					})
				})
				openResultDialog({
					resultData: result,
					resultTitle: '删除',
				})
				clearSelection()
				refresh()
			},
		})
	}

	//刷新列表
	const refresh = async (params?: any, isLoad: boolean = true) => {
		let type = ''
		if (activeName.value === 'db') {
			tabActive.value = 'all'
			type = 'db'
		} else {
			type = tabActive.value
		}
		await getData(
			{
				p: tableData.p,
				limit: tableData.limit,
				type,
				...params,
			},
			isLoad
		)
	}

	/**
	 * @description 恢复
	 * @param {any} row
	 */
	const recoverEvent = async (row: any) => {
		if (compData.value.type === 'db') {
			await useConfirm({
				title: `恢复数据库${row.name}`,
				content: `您确定要恢复数据库【${row.name}】，是否继续？`,
			})
			await useDataHandle({
				loading: '正在恢复数据库，请稍后...',
				request: recoverRecyclingBin({ path: row.rname }),
				message: true,
				success: (res: any) => {
					if (res.status) refresh()
				},
			})
		} else {
			rowData.value = row
			useDialog({
				title: `恢复文件${row.name}`,
				area: 41,
				btn: '确定',
				component: () => import('@files/public/recycle-bin/recover-files/index.vue'),
				// compData: { row, refresh },
				onConfirm,
			})
		}
	}

	/**
	 * @description 删除
	 * @param {any} row
	 */
	const deleteEvent = async (row: any) => {
		const txt = compData.value.type === 'db' ? '数据库' : '文件'
		await useConfirm({
			title: `删除${txt}${row.name}`,
			type: 'input',
			input: {
				content: `删除${txt}`,
			},
			content: `风险操作，删除后，${txt}将彻底消失，无法恢复，是否继续操作？`,
		})
		await useDataHandle({
			loading: '正在删除，请稍后...',
			request: deleteRecyclingBin({ path: row.rname }),
			success: (res: any) => {
				// 检测到同名数据库
				if (res.tag === 1) {
					popupData.resultData = [{ file: row.rname }]
					popupData.resultTitle = res.msg
					isAllClear.value = false
					showPopup.value = true
				} else {
					Message.request(res)
					refresh()
				}
			},
		})
	}

	// 强制删除确认
	const deleteClearCheck = async () => {
		if (isAllClear.value) {
			changeClearCheck()
			return
		}
		const res = await deleteRecyclingBin({ path: popupData.resultData[0].file, force: 1 })
		Message.request(res)
		showPopup.value = false
		refresh()
	}

	/**
	 * @description: 下载
	 */
	const downloadEvent = async (row: any) => {
		const { data } = await dowmloadRecyclingBin({ name: row.name, rname: row.rname })
		if (data.status) {
			window.open(`/download?filename=${data.msg.path}`)
		} else {
			Message.error(data.msg)
		}
	}

	/**
	 * @description: 查看
	 */
	const showEditor = async (row: any) => {
		const { data } = await dowmloadRecyclingBin({ name: row.name, rname: row.rname })
		if (typeof data.msg === 'string' && data.msg.includes('找不到文件')) {
			Message.error('当前文件不可预览')
			return
		}

		const ext = data.msg.file.nm.split('.').pop()

		if (determineFileType(ext) === 'images') {
			const item: any = { path: data.msg.path }
			// 图片
			FileImageView(item)
		} else {
			openAceEditor(data.msg)
		}
	}

	const tableColumn = useRecyclingBinTableColumn()
	const tableBatchOptions = [
		{
			label: '恢复',
			value: 'recover',
			event: async (batchConfirm, nextAll, selectedList, options, clearSelection) => {
				const requestHandle = async (item: any) =>
					await recoverRecyclingBin({
						path: item.rname,
					})
				await batchConfirm({
					title: '批量恢复',
					content: '批量恢复选中后，被删除将会恢复，是否继续操作？',
					column: [{ prop: 'rname', label: '名称' }, useBatchStatus()] as TableColumnProps[], // 弹窗配置
					onConfirm: async () => {
						await nextAll(requestHandle) // 递归操作所有选中的数据
						refresh() // 执行完毕的代码，刷新列表
						// 返回false则不关闭弹窗
						return false
					},
				})
			},
		},
		{
			label: '删除',
			value: 'delete',
			event: async (batchConfirm, nextAll, selectedList, options, clearSelection) => {
				handleMultiDelete(selectedList.value, clearSelection)
			},
		},
	] as TableBatchOptionsProps[]

	const tabActive = ref('all') // 文件回收站tab激活
	const config = [
		{
			type: 'all',
			label: '全部',
			icon: 'svgtofont-left-soft',
		},
		{
			type: 'dir',
			label: '文件夹',
			icon: 'svgtofont-left-files',
		},
		{
			type: 'file',
			label: '文件',
			icon: 'svgtofont-file-text',
		},
		{
			type: 'image',
			label: '图片',
			icon: 'svgtofont-icon-term',
		},
		{
			type: 'ont_text',
			label: '文档',
			icon: 'svgtofont-el-document',
		},
	]

	/**
	 * 切换tab
	 * @param type tab类型
	 */
	const toggleType = (type: string) => {
		tableData.p = 1
		tabActive.value = type
		refresh({ type }, false)
	}

	const rowData = ref<any>() // 当前行数据
	const cmdForm = reactive({
		type: 'before',
		path: '',
	})
	const isCmdLoading = ref(false)
	const cmdFormRef = ref()
	// 验证规则
	const cmdRules = reactive({
		path: [
			{
				validator: (rule: any, value: any, callback: any) => {
					if (value === '' && cmdForm.type === 'path') {
						callback(new Error('请选择恢复目录'))
					} else {
						callback()
					}
				},
				trigger: ['blur'],
			},
		],
	})

	/**
	 * @description: 触发目录选择
	 */
	const openFile = () => {
		fileSelectionDialog({
			type: 'dir',
			change: (path: string) => {
				cmdForm.path = path
			},
		})
	}

	/**
	 * @description: 清除空格
	 */
	const clearSpace = (name: string) => {
		cmdForm.path = cmdForm.path.replace(/\s+/g, '')
	}

	/**
	 * @description 提交表单
	 */
	const onConfirm = async () => {
		await cmdFormRef.value.validate()
		const res: any = await useDataHandle({
			loading: isCmdLoading,
			request: recoverRecyclingBin({
				path: rowData.value.rname,
				rpath: cmdForm.type === 'path' ? `${cmdForm.path}/${rowData.value.name}` : rowData.value.dname,
			}),
			message: true,
			success: (res: any) => {
				if (res.status) {
					refresh()
				}
			},
		})
		return res.status
	}

	const init = () => {
		binData.type = activeName.value
		handleTabChange(activeName.value)
	}

	const $resetCmdForm = () => {
		isCmdLoading.value = false
		Object.assign(cmdForm, {
			type: 'before',
			path: '',
		})
	}

	const $reset = () => {
		activeName.value = 'all'
		loading.value = false
		Object.assign(binData, {
			data: {},
			status: false,
			statusDB: false,
			type: 'all',
			p: 1,
			limit: 10,
			search: '',
			time: [],
		})
		statusSwitch.value = false
		time.value = []
		formatDate.value = ''
		searchName.value = ''
		showPopup.value = false
		Object.assign(popupData, {
			resultData: [],
			resultColumn: [
				{
					label: '数据库',
					prop: 'file',
				},
			],
			resultTitle: '',
		})
		Object.assign(tableData, {
			loading: false,
			p: 1,
			limit: 10,
		})
		tabActive.value = 'all'
	}

	return {
		activeName,
		loading,
		binData,
		compData,
		watchBinData,
		handleTabChange,

		statusSwitch,
		time,
		popupData,
		showPopup,
		searchName,
		pickerOptions,
		formatDate,
		onCancel,
		showPlayer,
		cleanBin,
		clearTime,
		setStatus,
		goSearch,
		changeClearCheck,
		watchTime,
		dbTableRef,
		tableRef,
		fileTableRef,
		tableData,
		tableColumn,
		tableBatchOptions,
		deleteClearCheck,
		refresh,

		tabActive,
		config,
		toggleType,
		// watchBinDataType,

		rowData,
		isCmdLoading,
		cmdForm,
		cmdFormRef,
		cmdRules,
		openFile,
		clearSpace,

		init,
		$reset,
		$resetCmdForm,
	}
})

export default FILES_RECYCLE_BIN_STORE

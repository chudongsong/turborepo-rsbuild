import { defineStore, storeToRefs } from 'pinia'
import FILES_STORE from '@files/store'
import { fileSelectionDialog } from '@/public/index'
import { getConvertList, getFileStatus, ConvertFile, getConversionLog } from '@api/files'
import { Message, useDataHandle } from '@hooks/tools'
import { useCheckbox, useOperate } from '@/hooks/tools/table/column'
import { openResultDialog } from '@files/useMethods'
import type { TableColumnProps } from '@/components/data/bt-table/types'
import { formatTime, isArray } from '@utils/index'
import BtSelect from '@/components/form/bt-select'
import { ElOption, ElSelect } from 'element-plus'

const FILES_FORMAT_CONVERSION_STORE = defineStore('FILES-FORMAT-CONVERSION-STORE', () => {
	const filesStore = FILES_STORE()
	const { fileTabActiveData } = storeToRefs(filesStore)
	const { refreshFilesList } = filesStore

	const fileItem = ref<any>() // 文件信息
	const instance = ref<any>() // 实例

	const activeName = ref('conver')

	const btnText = ref('执行转换')
	const subLoad = ref(false)

	// 转换数据
	const formatData = reactive({
		fileList: [] as any, // 文件列表
		selectList: [], // 选中的列表
		path: '', // 保存路径
		del: false, // 是否删除源文件
		allKey: '', // 所有数据
	})
	const loading = ref(false)

	/**
	 * @description: 获取选中数据
	 * @param {FtpTableDataProps[]} val 选中row数据
	 * @return {void}
	 */
	const handleSelectionChange = (val: any): void => {
		formatData.selectList = val
	}
	/**
	 * @description: 触发目录选择
	 */
	const openFile = (item: any) => {
		fileSelectionDialog({
			type: 'dir',
			change: path => {
				formatData.path = path
			},
		})
	}

	/**
	 * @description: 添加
	 * @return {*}
	 */
	const addFile = () => {
		fileSelectionDialog({
			type: 'file',
			change: async path => {
				const res = await getFileStatus({ filename: path })
				if (res.status) {
					formatData.fileList.push({
						status: 0,
						ext: res.data.st_type,
						...res.data,
						path,
						fileName: res.data.name,
					})
				} else {
					Message.error(res.msg)
				}
				// fileList.push
			},
		})
	}

	/**
	 * @description: 取消
	 * @param {any} row 行数据
	 * @return {*}
	 */
	const delEvent = (row: any) => {
		formatData.fileList = formatData.fileList.filter((item: any) => item.path !== row.path)
	}

	// 格式选项
	const formatOptions: any = reactive({
		all: [],
		audio: [],
		image: [],
		video: [],
	})

	// 表格列
	const tableColumn = ref([
		useCheckbox({ key: 'fileName' }),
		{ label: '文件名', prop: 'fileName' },
		{ label: '格式类型', prop: 'ext', width: 80 },
		{
			label: '转换为',
			prop: 'status',
			width: 190,
			renderHeader: () => {
				return (
					<div class="items-center inline-flex !w-[190px]">
						<span>转换为</span>
						<ElSelect
							class="!w-[8rem] ml-4px"
							modelValue={formatData.allKey || formatOptions.all[0]?.value}
							onChange={(val: any) => {
								formatData.allKey = val
								formatData.fileList = formatData.fileList.map((item: any) => {
									return { ...item, format: val }
								})
							}}>
							{formatOptions.all.map((item: any) => (
								<ElOption key={item.value} label={item.label} value={item.value} />
							))}
						</ElSelect>
					</div>
				)
			},
			render: (row: any, index: number) => {
				const type = ['audio', 'image', 'video']
				let vnode = null
				type.forEach(item => {
					if (formatOptions[item].map((items: any) => items.value).includes(row.ext)) {
						row.format = row.format || formatOptions[item].at(0)?.value
						vnode = (
							<div>
								<ElSelect
									class="!w-[12rem]"
									style={{ display: row.isCustom ? 'none' : 'block' }}
									modelValue={row.format || formatOptions[item].at(0)?.value}
									onChange={(val: any) => {
										row.format = val
									}}>
									{formatOptions[item].map((option: any) => (
										<ElOption key={option.value} label={option.label} value={option.value} />
									))}
								</ElSelect>
							</div>
						)
					}
				})
				if (!vnode) {
					vnode = h('span', { class: 'text-[red]' }, '不支持转换')
				}
				return vnode
			},
		},
		{
			label: '执行状态',
			prop: 'status',
			width: 90,
			render: (row: any, index: number) => {
				const status = ['待转换', '转换中', '转换成功', '转换失败']
				let vnode = null
				if (formatOptions.all.map((items: any) => items.value).includes(row.ext)) {
					vnode = h('span', {}, status[row.status])
				}
				if (!vnode) {
					vnode = h('span', { class: 'text-[red]' }, '无法转换')
				}
				return vnode
			},
		},
		useOperate([{ onClick: delEvent, title: '取消' }]),
	])

	/**
	 * @description: 执行转换
	 * @return {*}
	 */
	const goConversion = async () => {
		const params: any = []
		formatData.selectList.forEach((item: any) => {
			if (item.status === 0) {
				const newFile = item.name.split('.')
				newFile.pop()
				params.push({
					input_file: item.path,
					output_file: `${formatData.path}/${newFile}.${item.format}`,
				})
			}
		})
		if (!params.length) return Message.error('没有需要转换的文件')
		btnText.value = '转换中'
		subLoad.value = true
		await useDataHandle({
			loading: '正在转换中，请稍后...',
			request: ConvertFile({
				is_save: formatData.del ? 1 : 0,
				pdata: JSON.stringify(params),
			}),
			success: (res: any) => {
				if (isArray(res.data)) {
					res.data.forEach((item: any) => {
						item.msg = item.msg || (item.status ? '转换成功' : '转换失败')
					})
					refreshFilesList()
					close() // 关闭弹窗
					openResultDialog({
						title: '转换结果',
						resultData: res.data,
					})
				} else {
					btnText.value = '执行转换'
					subLoad.value = false
					Message.error(res.msg)
				}
			},
		})
	}

	// 获取转换列表
	const getConvertListData = async () => {
		await useDataHandle({
			loading,
			request: getConvertList(),
			data: {
				all: [Array, data => data.map((item: any) => ({ key: item, label: item }))],
				audio: [Array, data => data.map((item: any) => ({ key: item, label: item }))],
				image: [Array, data => data.map((item: any) => ({ key: item, label: item }))],
				video: [Array, data => data.map((item: any) => ({ key: item, label: item }))],
			},
			success: (res: any) => {
				// 循环res下的每个子项，将子数组中的每个对象的key字段重命名位value
				Object.keys(res).forEach(key => {
					res[key] = res[key].map((item: any) => {
						return { value: item.key, label: item.label }
					})
				})
				formatOptions.all = res.all
				formatOptions.audio = res.audio
				formatOptions.image = res.image
				formatOptions.video = res.video
			},
		})
	}

	// 转换数据
	const tableData = reactive({
		fileList: [], // 文件列表
		p: 1, // 当前页
		limit: 10, // 每页条数
	})

	// 表格列
	const logTableColumn = ref<TableColumnProps[]>([
		{
			label: '操作时间',
			prop: 'time',
			width: 160,
			render: (row: AnyObject) => {
				return h('span', {}, formatTime(row.time))
			},
		},
		{ label: '操作类型', prop: 'type', width: 80 },
		{ label: '操作日志', prop: 'operation' },
		{ label: '操作结果', prop: 'status', width: 160 },
	])

	// 获取数据
	const getData = async () => {
		await useDataHandle({
			request: getConversionLog({
				p: tableData.p,
				limit: tableData.limit,
			}),
			success: (res: any) => {
				if (res.status) {
					const data = res.data.msg.data
					if (typeof data === 'string') tableData.fileList = []
					else tableData.fileList = data
				} else {
					Message.error(res.msg)
				}
			},
		})
	}

	const handleTabEvent = (name: string) => {
		if (name === 'conver') {
			getConvertListData()
		} else {
			getData()
		}
	}

	const close = async () => {
		const popup = await instance.value
		popup?.unmount()
	}

	const init = () => {
		getConvertListData()
		formatData.fileList = Array.isArray(fileItem.value)
			? fileItem.value?.map(file => {
					return { status: 0, ...file, name: file.fileName }
			  })
			: [
					{
						status: 0,
						...fileItem.value,
						name: fileItem.value?.fileName,
					},
			  ]
		formatData.path = fileTabActiveData.value.param.path
	}

	const $reset = () => {
		subLoad.value = false
		loading.value = false
		Object.assign(formatData, {
			fileList: [] as any, // 文件列表
			selectList: [], // 选中的列表
			path: '', // 保存路径
			del: false, // 是否删除源文件
			allKey: '', // 所有数据
		})
		// 重置转换数据
		Object.assign(tableData, {
			fileList: [], // 文件列表
			p: 1, // 当前页
			limit: 10, // 每页条数
		})
		// 重置格式选项
		Object.assign(formatOptions, {
			all: [],
			audio: [],
			image: [],
			video: [],
		})
		btnText.value = '执行转换'
	}

	return {
		instance,
		fileItem,
		activeName,
		tableColumn,
		loading,
		formatData,
		subLoad,
		btnText,
		addFile,
		openFile,
		goConversion,
		handleSelectionChange,
		logTableColumn,
		tableData,
		getData,
		handleTabEvent,
		init,
		$reset,
	}
})

export default FILES_FORMAT_CONVERSION_STORE

import { defineStore, storeToRefs } from 'pinia'
import FILES_STORE from '@files/store'
import { fileSelectionDialog } from '@/public/index'
import { addCompressFile, compressAndDownloadFile, unCompressFile } from '@api/files'
import { getRandomPwd, getByteUnit } from '@/utils/index'
import { Message, useDataHandle, useHandleError } from '@/hooks/tools'
import { useCheckbox } from '@/hooks/tools/table/column'
import { TableColumnProps } from '@/components/data/bt-table/types'

const FILES_COMPRESS_STORE = defineStore('FILES-COMPRESS-STORE', () => {
	const filesStore = FILES_STORE()
	const { fileTabActiveData } = storeToRefs(filesStore)
	const { refreshFilesList, getRealTask } = filesStore

	const fileItem = ref<any>() // 文件信息

	// 表单
	const quickForm = reactive<any>({
		type: 'tar.gz',
		path: '',
		download: false,
	})
	const disable = ref(false)
	const quickFormRef = ref()

	// 压缩类型
	const compressOptions = [
		{ label: 'tar.gz (推荐)', value: 'tar.gz' },
		{ label: 'zip (通用格式)', value: 'zip' },
		{ label: 'rar (WinRAR对中文兼容较好)', value: 'rar' },
		{ label: '7z (压缩率极高的压缩格式)', value: '7z' },
	]

	// 验证规则
	const quickRules = reactive({
		path: [
			{
				validator: (rule: any, value: any, callback: any) => {
					if (value === '') {
						callback(new Error('请选择压缩路径'))
					} else {
						callback()
					}
				},
				trigger: ['blur'],
			},
		],
	})

	/**
	 * @description 切换类型
	 * @param {string} val 类型
	 */
	const toggleType = (val: string) => {
		quickForm.type = val
		// 变化路径后缀
		quickForm.path = fileTabActiveData.value.param.path + '/' + (Array.isArray(fileItem.value) ? fileTabActiveData.value.label : fileItem.value.fileName) + '_' + (getRandomPwd(5) + '.' + quickForm.type)
	}

	/**
	 * @description: 触发目录选择
	 */
	const openFile = () => {
		fileSelectionDialog({
			type: 'dir',
			change: path => {
				quickForm.path = path + '/' + fileItem.value.fileName + '_' + (getRandomPwd(5) + '.' + quickForm.type)
			},
		})
	}

	// 提交
	const onConfirm = async () => {
		const isBatch = Array.isArray(fileItem.value)
		const params = {
			sfile: isBatch ? fileItem.value.map((file: any) => file.fileName) : fileItem.value.fileName, // 文件名
			dfile: quickForm.path, // 原文件完整路径
			z_type: quickForm.type,
			path: fileTabActiveData.value.param.path + '/',
		}
		await quickFormRef.value.validate()

		const requestFun = quickForm.download ? compressAndDownloadFile : addCompressFile

		await useDataHandle({
			loading: '正在压缩文件，请稍后...',
			request: requestFun(params),
			success: (res: any) => {
				if (!res.status) {
					Message.error(res.msg)
					return
				}
				if (quickForm.download) {
					if (res.data.task_id) {
						setTimeout(() => {
							Message.error(`无法下载，${res.data.msg}`)
						}, 1000)
					} else {
						// 下载
						window.open(res.data.msg)
					}
				} else {
					Message.success('压缩成功')
				}
				getRealTask() // 获取实时任务队列
				setTimeout(() => {
					refreshFilesList()
				}, 1000)
			},
		})
	}

	const init = () => {
		Object.assign(quickForm, {
			type: 'tar.gz',
			path: (fileTabActiveData.value.param.path == '/' ? '' : fileTabActiveData.value.param.path) + '/' + (Array.isArray(fileItem.value) ? fileTabActiveData.value.label : fileItem.value.fileName) + '_' + (getRandomPwd(5) + '.tar.gz') || '',
			download: false,
		})
	}

	const instance = ref() // 实例
	const compData = ref<any>() // 压缩数据
	const tableList = ref<any[]>([])
	const TableRef = ref<any>(null)

	const useCompressCoverTableColumn = () => {
		return shallowRef<TableColumnProps[]>([
			useCheckbox({ key: 'file_path' }),
			{
				label: `文件名`,
				prop: 'name',
				minWidth: 150,
			},
			{
				label: `大小`,
				prop: 'size',
				width: 150,
				render: (row: any) => {
					if (row.file_size === row.zip_file_size) {
						return <span class="text-primary">无变化</span>
					} else {
						return (
							<div>
								<div class="text-blue-500">
									解压文件： <span class="text-danger">{getByteUnit(row.zip_file_size)}</span>
								</div>
								<div class="text-blue-500">
									目标文件： <span class="text-danger">{getByteUnit(row.file_size)}</span>
								</div>
							</div>
						)
					}
				},
			},
			{
				label: `修改时间`,
				prop: 'time',
				width: 200,
				render: (row: any) => {
					if (row.file_mtime === row.zip_file_mtime) {
						return <span class="text-primary">无变化</span>
					} else {
						return (
							<div>
								<div class="text-blue-500">
									解压文件： <span class="text-danger">{row.zip_file_mtime}</span>
								</div>
								<div class="text-blue-500">
									目标文件： <span class="text-danger">{row.file_mtime}</span>
								</div>
							</div>
						)
					}
				},
			},
			{
				label: `执行结果`,
				prop: 'action',
				fixed: 'right',
				render: (row: any) => {
					if (!row.status) {
						return <span class="text-blue-500">-</span>
					} else {
						return <span class="text-primary">{row.status}</span>
					}
				},
			},
		])
	}

	// 跳过
	const jump = () => {
		if (TableRef.value.tableSelectList.length === 0) {
			Message.error('请选择文件')
			return
		}
		const filenames = TableRef.value.tableSelectList.map((item: any) => {
			return {
				zip_file_path: item.zip_file_path,
				file_path: item.file_path,
			}
		})
		if (compData.value.callback) {
			const param = compData.value.params
			const path = JSON.parse(param.data).extract_path.split('/')
			path.pop()
			viewDecompress({
				data: JSON.stringify({
					...JSON.parse(param.data),
					extract_path: path.join('/'),
					filenames: filenames,
					type: 0,
				}),
			})
			return
		}
		decompress({
			filenames: JSON.stringify(filenames),
			type1: 0,
		})
	}
	// 覆盖
	const cover = () => {
		if (TableRef.value.tableSelectList.length === 0) {
			Message.error('请选择文件')
			return
		}
		const filenames = TableRef.value.tableSelectList.map((item: any) => {
			return {
				zip_file_path: item.zip_file_path,
				file_path: item.file_path,
			}
		})
		if (compData.value.callback) {
			// viewDecompress({
			// 	filenames: JSON.stringify(filenames),
			// 	type: 1,
			// })
			const param = compData.value.params
			const path = JSON.parse(param.data).extract_path.split('/')
			path.pop()
			viewDecompress({
				data: JSON.stringify({
					...JSON.parse(param.data),
					extract_path: path.join('/'),
					filenames: filenames,
					type: 1,
				}),
			})
			return
		}
		decompress({
			filenames: JSON.stringify(filenames),
			type1: 1,
		})
	}
	// 重命名
	const rename = () => {
		if (TableRef.value.tableSelectList.length === 0) {
			Message.error('请选择文件')
			return
		}
		const filenames = TableRef.value.tableSelectList.map((item: any) => {
			return {
				zip_file_path: item.zip_file_path,
				file_path: item.file_path,
			}
		})
		if (compData.value.callback) {
			const param = compData.value.params
			const path = JSON.parse(param.data).extract_path.split('/')
			path.pop()
			viewDecompress({
				data: JSON.stringify({
					...JSON.parse(param.data),
					extract_path: path.join('/'),
					filenames: filenames,
					type: 2,
				}),
			})
			return
		}
		decompress({
			filenames: JSON.stringify(filenames),
			type1: 2,
		})
	}

	// 普通解压操作
	const decompress = async (params: any) => {
		try {
			const param = compData.value.params
			const res = await unCompressFile({
				...param,
				...params,
			})
			if (res.status) {
				// 找到已选文件
				TableRef.value.tableSelectList.forEach((item: any) => {
					tableList.value.forEach((items: any, index: number) => {
						if (item.zip_file_path === items.zip_file_path) {
							const newItem = {
								...items,
								status: '执行成功',
							}
							tableList.value.splice(index, 1, newItem)
						}
					})
				})
			}
			if (!tableList.value.find((item: any) => item.status === undefined)) {
				close()
				Message.success('解压成功')
				refreshFilesList()
			}
		} catch (error) {}
	}
	// 压缩预览解压操作
	const viewDecompress = async (params: any) => {
		try {
			const param = compData.value.params
			const res = await compData.value.callback({
				...param,
				...params,
			})
			if (res.status) {
				// 找到已选文件
				TableRef.value.tableSelectList.forEach((item: any) => {
					tableList.value.forEach((items: any, index: number) => {
						if (item.zip_file_path === items.zip_file_path) {
							const newItem = {
								...items,
								status: '执行成功',
							}
							tableList.value.splice(index, 1, newItem)
						}
					})
				})
			}
			if (!tableList.value.find((item: any) => item.status === undefined)) {
				close()
				Message.success('解压成功')
				refreshFilesList()
			}
		} catch (error) {
			useHandleError(error)
		}
	}

	const tableColumn = useCompressCoverTableColumn()

	const close = async () => {
		const popup = await instance.value
		popup?.unmount()
	}

	const initCover = () => {
		tableList.value = compData.value.data.data
	}

	const $reset = () => {
		tableList.value = []
	}

	return {
		fileItem,
		quickFormRef,
		quickForm,
		quickRules,
		disable,
		compressOptions,
		openFile,
		toggleType,
		onConfirm,
		init,
		instance,
		compData,
		tableColumn,
		tableList,
		jump,
		cover,
		rename,
		initCover,
		$reset,
		TableRef,
	}
})

export default FILES_COMPRESS_STORE

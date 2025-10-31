import { defineStore, storeToRefs } from 'pinia'
import FILES_STORE from '@files/store'
import { fileSelectionDialog } from '@/public/index'
import { getSplitFile, mergeFile } from '@api/files'
import { getWholePath } from '@files/useMethods'
import { useDataHandle } from '@/hooks/tools'

const FILES_MERGE_STORE = defineStore('FILES-MERGE-STORE', () => {
	const filesStore = FILES_STORE()
	const { fileTabActiveData } = storeToRefs(filesStore)
	const { refreshFilesList } = filesStore

	const fileItem = ref<any>() // 文件信息

	// 表单
	const quickForm = reactive<any>({
		path: fileTabActiveData.value?.param.path || '',
		disable: false,
		file: {},
	})
	const loading = ref(false)

	const quickFormRef = ref()
	// 验证规则
	const quickRules = reactive({
		path: [
			{
				validator: (rule: any, value: any, callback: any) => {
					if (value === '') {
						callback(new Error('请选择存放目录'))
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
			change: path => {
				quickForm.path = path
			},
		})
	}

	const getFile = async () => {
		await useDataHandle({
			loading,
			request: getSplitFile({
				file_path: fileItem.value.path, // 文件完整路径
			}),
			success: res => {
				Object.assign(quickForm, {
					path: fileTabActiveData.value?.param.path || '',
					disable: false,
					file: res.data,
				})
			},
		})
	}

	// 提交
	const onConfirm = async (close?: any) => {
		const params: any = {
			file_path: getWholePath(fileItem.value.fileName), // 文件完整路径
			save_path: quickForm.path, // 存放目录
		}
		await quickFormRef.value.validate()
		await useDataHandle({
			loading,
			request: mergeFile(params),
			message: true,
			success: (res: any) => {
				refreshFilesList()
				if (res.status && close) close()
			},
		})
	}

	return {
		fileItem,
		loading,
		quickFormRef,
		quickForm,
		quickRules,
		openFile,
		getFile,
		onConfirm,
	}
})

export default FILES_MERGE_STORE

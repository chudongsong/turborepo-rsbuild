import { defineStore, storeToRefs } from 'pinia'
import FILES_STORE from '@files/store'
import { fileSelectionDialog } from '@/public/index'
import { splitFile } from '@api/files'
import { getWholePath } from '@files/useMethods'
import { Message, useDataHandle } from '@/hooks/tools'

const FILES_SPLIT_STORE = defineStore('FILES-SPLIT-STORE', () => {
	const filesStore = FILES_STORE()
	const { fileTabActiveData } = storeToRefs(filesStore)
	const { refreshFilesList } = filesStore

	const fileItem = ref<any>() // 文件信息

	// 表单
	const quickForm = reactive<any>({
		type: 'size',
		size: 1024,
		num: 5,
		path: fileTabActiveData.value?.param.path || '',
	})

	const disable = ref<boolean>(false)
	// 帮助信息
	const help = [
		{
			content: '拆分后会在存放目录(默认当前目录)下创建一个xxx_split文件夹,存放配置文件以及拆分文件',
		},
	]
	const quickFormRef = ref()
	// 验证规则
	const quickRules = reactive({
		size: [
			{
				validator: (rule: any, value: any, callback: any) => {
					if (quickForm.type === 'size') {
						if (value === '') {
							callback(new Error('请输入拆分大小'))
						} else if (Number(value) * 1024 * 1024 >= fileItem.value.size / 2) {
							callback(new Error('拆分大小不能大于文件大小一半'))
						} else {
							callback()
						}
					} else {
						callback()
					}
				},
				trigger: ['blur'],
			},
		],
		num: [
			{
				validator: (rule: any, value: any, callback: any) => {
					if (quickForm.type === 'num') {
						if (value === '') {
							callback(new Error('拆分数量不能小于2个'))
						} else if (Number(value) < 2) {
							callback(new Error('拆分数量不能小于2个'))
						} else {
							callback()
						}
					} else {
						callback()
					}
				},
				trigger: ['blur'],
			},
		],
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

	// 提交
	const onConfirm = async (close?: any) => {
		const params: any = {
			file_path: getWholePath(fileItem.value.fileName), // 文件完整路径
			save_path: quickForm.path, // 存放目录
		}
		if (quickForm.type === 'size') {
			params.split_size = Number(quickForm.size)
		} else {
			params.split_num = Number(quickForm.num)
		}
		await quickFormRef.value.validate()
		const res: any = await useDataHandle({
			loading: '正在拆分文件，请稍后...',
			request: splitFile(params),
			message: true,
			success: (res: any) => {
				Message.request({ status: res.status, msg: res.status ? '拆分成功' : '拆分失败' })
				refreshFilesList()
			},
		})
		return res.status
	}

	const init = () => {
		disable.value = false
		Object.assign(quickForm, {
			type: 'size',
			size: 1024,
			num: 5,
			path: fileTabActiveData.value?.param.path || '',
		})
	}

	return {
		fileItem,
		quickFormRef,
		quickForm,
		quickRules,
		disable,
		help,
		openFile,
		onConfirm,
		init,
	}
})

export default FILES_SPLIT_STORE

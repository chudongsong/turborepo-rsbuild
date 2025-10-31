import { defineStore, storeToRefs } from 'pinia'
import FILES_STORE from '@files/store'
import { unCompressFile } from '@api/files'
import { fileSelectionDialog } from '@/public/index'
import { useDataHandle } from '@/hooks/tools'
import FILES_COMPRESS_PREVIEW_STORE from '../../views/compress-preview/store'

const FILES_DECOMPRESSION_STORE = defineStore('FILES-DECOMPRESSION-STORE', () => {
	const filesStore = FILES_STORE()
	const { fileTabActiveData } = storeToRefs(filesStore)
	const { refreshFilesList, getRealTask } = filesStore

	const store = FILES_COMPRESS_PREVIEW_STORE()
	const { instance } = storeToRefs(store)

	const fileItem = ref<any>() // 文件信息

	// 表单
	const quickForm = reactive<any>({
		fileName: '',
		path: fileTabActiveData.value.param.path || '',
		coding: 'UTF-8',
		password: '',
		auth: '755',
	})
	const disable = ref(false)
	const quickFormRef = ref()

	// 编码类型
	const codeOptions = [
		{ label: 'UTF-8', value: 'UTF-8' },
		{ label: 'GBK', value: 'GBK' },
	]

	// 验证规则
	const quickRules = reactive({
		path: [
			{
				validator: (rule: any, value: any, callback: any) => {
					if (value === '') {
						callback(new Error('请选择解压路径'))
					} else {
						callback()
					}
				},
				trigger: ['blur'],
			},
		],
		auth: [
			{
				validator: (rule: any, value: any, callback: any) => {
					if (value === '' || isNaN(Number(value))) {
						callback(new Error('请输入正确的权限'))
					} else if (value.length > 3) {
						callback(new Error('请输入正确的权限'))
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
	const toggleCode = (val: string) => {
		quickForm.coding = val
	}

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
	const onConfirm = async () => {
		const params = {
			sfile: fileItem.value.path, // 原文件完整路径
			dfile: quickForm.path, // 解压到的目录
			type: fileItem.value.ext === 'tar.gz' ? 'tar' : 'zip', // 解压类型,默认zip，gz为tar
			coding: quickForm.coding, // 编码
			password: quickForm.password, // 密码
			power: quickForm.auth, // 权限
		}
		await quickFormRef.value.validate()
		disable.value = true
		const res: any = await useDataHandle({
			loading: '正在解压文件，请稍后...',
			request: unCompressFile(params),
			message: true,
			success: async res => {
				refreshFilesList()
				getRealTask() // 获取实时任务队列
				const popup = await instance.value
				popup?.unmount()
			},
		})
		disable.value = false
		return res.status
	}

	const init = () => {
		Object.assign(quickForm, {
			fileName: fileItem.value.fileName,
			path: fileTabActiveData.value.param.path || '',
			coding: 'UTF-8',
			password: '',
			auth: '755',
		})
	}

	return {
		fileItem,
		quickFormRef,
		quickForm,
		quickRules,
		codeOptions,
		disable,
		openFile,
		toggleCode,
		init,
		onConfirm,
	}
})

export default FILES_DECOMPRESSION_STORE

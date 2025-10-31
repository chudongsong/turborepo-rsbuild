import { defineStore, storeToRefs } from 'pinia'
import FILES_STORE from '@files/store'
import { downloadFile } from '@/api/files'
import { matchUnqualifiedString } from '@files/useMethods'
import { useDataHandle } from '@hooks/tools'
import { checkUrl } from '@utils/index'
import { fileSelectionDialog } from '@/public/index'

const FILES_URL_DOWN_LOAD_STORE = defineStore('FILES-URL-DOWN-LOAD-STORE', () => {
	const filesStore = FILES_STORE()
	const { fileTabActiveData } = storeToRefs(filesStore)
	const { getRealTask } = filesStore

	// 表单
	const quickForm = reactive<any>({
		url: '',
		path: fileTabActiveData.value.param.path,
		filename: '',
	})
	const formDisabled = ref(false) // 表单是否禁用
	const quickFormRef = ref()

	// 验证规则
	const quickRules = reactive({
		url: [
			{
				validator: (rule: any, value: any, callback: any) => {
					if (value === '') {
						callback(new Error('请输入正确的URL地址!'))
					} else if (!checkUrl(value)) {
						callback(new Error('请输入正确的URL地址!'))
					} else {
						callback()
					}
				},
				trigger: ['blur'],
			},
		],
		filename: [
			{
				validator: (rule: any, value: any, callback: any) => {
					if (value === '') {
						callback(new Error('请输入新文件名!'))
					} else if (matchUnqualifiedString(value)) {
						callback(new Error('文件名不能包含 /\\:*?"<>|符号!'))
					} else {
						callback()
					}
				},
				trigger: ['blur', 'change'],
			},
		],
	})

	// 设置文件名
	const setName = (val: string) => {
		const parts = val.split('/')
		quickForm.filename = parts[parts.length - 1]
	}

	/**
	 * @description 确认提交
	 */
	const onConfirm = () => {
		const params: any = { ...quickForm }
		quickFormRef.value.validate(async (valid: any) => {
			if (valid) {
				await useDataHandle({
					loading: formDisabled,
					request: downloadFile(params),
					message: true,
					success: (res: any) => {
						if (res.status) getRealTask() // 获取实时任务队列
					},
				})
			}
		})
	}

	/**
	 * @description: 触发目录选择
	 */
	const onPathChange = () => {
		fileSelectionDialog({
			type: 'dir',
			path: quickForm.path,
			change: path => {
				quickForm.path = path
			},
		})
	}

	const init = () => {
		formDisabled.value = false
		Object.assign(quickForm, {
			url: '',
			path: fileTabActiveData.value.param.path,
			filename: '',
		})
	}

	return {
		quickForm,
		formDisabled,
		quickFormRef,
		quickRules,
		onConfirm,
		onPathChange,
		setName,
		init,
	}
})

export default FILES_URL_DOWN_LOAD_STORE

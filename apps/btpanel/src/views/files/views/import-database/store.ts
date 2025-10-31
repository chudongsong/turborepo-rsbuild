import { defineStore } from 'pinia'
import { getDataInfo } from '@/api/global'
import { inputDatabase } from '@api/files'
import { useConfirm, useDataHandle } from '@hooks/tools'

const FILES_IMPORT_DATABASE_STORE = defineStore('FILES-IMPORT-DATABASE-STORE', () => {
	const fileItem = ref<any>() // 文件信息

	// 表单
	const quickForm = reactive<any>({
		name: '',
	})
	const disable = ref(false)
	const quickFormRef = ref()
	// 验证规则
	const quickRules = reactive({
		name: [
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

	// 压缩类型
	const databaseOptions = ref<any>([])

	/**
	 * @description 切换类型
	 * @param {string} val 类型
	 */
	const toggleName = (val: string) => {
		quickForm.name = val
	}

	/**
	 * @description: 获取数据库列表
	 */
	const getOptions = async () => {
		await useDataHandle({
			request: getDataInfo({ table: 'databases' }),
			success: (res: any) => {
				if (res.status) {
					databaseOptions.value = res.data.data.map((item: any) => ({
						label: item.name,
						value: item.id,
					}))
					if (databaseOptions.value.length > 0) {
						quickForm.name = databaseOptions.value[0].value
					}
				}
			},
		})
	}

	// 提交
	const onConfirm = async () => {
		await useConfirm({
			title: `导入数据库`,
			content: `是否将【${fileItem.value.fileName}】文件，导入【${databaseOptions.value.find((item: any) => item.value == quickForm.name).label}】数据库中，是否继续？`,
		})
		const params = {
			name: databaseOptions.value.find((item: any) => item.value == quickForm.name).label,
			file: fileItem.value.path,
		}
		await quickFormRef.value.validate()
		const res: any = await useDataHandle({
			loading: '正在导入数据库，请稍后...',
			request: inputDatabase(params),
			message: true,
		})
		return res.status
	}

	const $reset = () => {
		Object.assign(quickForm, {
			name: '',
		})
		disable.value = false
		databaseOptions.value = []
	}

	return {
		fileItem,
		quickFormRef,
		quickForm,
		quickRules,
		disable,
		databaseOptions,
		onConfirm,
		toggleName,
		getOptions,
		$reset,
	}
})

export default FILES_IMPORT_DATABASE_STORE

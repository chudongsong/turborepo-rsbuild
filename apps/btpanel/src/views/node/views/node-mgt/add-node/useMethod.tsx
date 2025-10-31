import { useDataHandle } from '@/hooks/tools'
import { nodeSSHSet } from '@/api/node'
import type { ResponseResult } from '@/types'
import { useNodeStore } from '@node/useStore'
import { useNodeAddStore } from './useStore'

const {
	isEdit,
	addNodeRef, // 表单ref
	nodeForm, // 表单数据
} = useNodeAddStore()
const { rowData } = useNodeStore()

/**
 * @description: 初始化数据
 */
export const initData = () => {
	if ((rowData.value?.id || 0) > 0) {
		isEdit.value = true
		nodeForm.value = rowData.value
	} else {
		isEdit.value = false
		nodeForm.value = {
			address: '',
			api_key: '',
			category_id: '0',
			remarks: '',
		}
	}
}

/**
 * @description 视图数据重置模块
 */

export const $reset = () => {
	nodeForm.value = {
		address: '',
		api_key: '',
		category_id: '0',
		remarks: '',
	}
	rowData.value = {}
}

export const renderForm = () => {
	try {
		let verify_type = 'api'
		if (rowData.value?.app_key) {
			verify_type = 'app'
		} else if (rowData.value?.api_key) {
			verify_type = 'api'
		} else if (rowData.value?.ssh_conf) {
			verify_type = 'ssh'
		}
		const sshInfo = {
			ssh_ip: rowData.value?.ssh_conf.host || '',
			ssh_type: rowData.value?.ssh_conf.pkey ? 'key' : 'password',
			ssh_password: rowData.value?.ssh_conf.password || '',
			ssh_key: rowData.value?.ssh_conf.pkey || '',
			ssh_port: rowData.value?.ssh_conf.port || '22',
			// ssh_user: rowData.value?.ssh_conf.username || '',
			ssh_pkey_passwd: rowData.value?.ssh_conf.pkey_passwd || '',
		}
		let form = {
			...(rowData.value?.id ? { id: rowData.value?.id } : {}),
			address: rowData.value?.address || '',
			verify_type,
			api_key: '',
			app_key: '',
			category_id: rowData.value?.category_id?.toString() || '0',
			remarks: rowData.value?.remarks || '',
			...sshInfo,
		}
		return form
	} catch (error) {
		console.log(error)
		return {}
	}
}

/**
 * @description 测试连接hook
 */
export const testConnection = () => {
	// 按钮文本
	const buttonText = ref('测试连接')
	// 按钮类型
	const buttonType = ref<'default' | 'success' | 'danger'>('default')
	// 按钮是否禁用
	const buttonLoading = ref(false)
	// 按钮点击事件
	const buttonClick = async (formData: Ref<any>, validate: () => Promise<boolean>) => {
		const result = await validate()
		if (!result) return
		buttonLoading.value = true
		buttonText.value = '测试中'
		buttonType.value = 'default'
		const res = await nodeSSHSet({
			host: formData.value.ssh_ip,
			port: parseInt(formData.value.ssh_port),
			// username: formData.value.ssh_user,
			test_case: 1,
			...(formData.value.ssh_type == 'password' ? { password: formData.value.ssh_password } : { pkey: formData.value.ssh_key, pkey_passwd: formData.value.ssh_pkey_passwd }),
		})
		buttonLoading.value = false
		if (res.status) {
			buttonText.value = '连接成功'
			buttonType.value = 'success'
		} else {
			buttonText.value = '连接失败'
			buttonType.value = 'danger'
		}
	}
	// 文本改变事件
	const textChange = () => {
		buttonText.value = '测试连接'
		buttonType.value = 'default'
		buttonLoading.value = false
	}
	return { buttonText, buttonType, buttonLoading, buttonClick, textChange }
}

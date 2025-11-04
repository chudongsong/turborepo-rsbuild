import { defineStore } from 'pinia'

const CRONTAB_TASK_STORE = defineStore('CRONTAB-VIEW-STORE', () => {
	const rowData = ref<any>({}) // 行数据
	const typeInit = ref(true) // 类型初始化

	// ============================== shell/python脚本配置 ==============================

	const shellOptions = ref([]) // 执行用户
	const pythonEnvOptions = ref([]) // python环境

	// ============================== shell/python脚本配置 end ==============================

	const $resetForm = () => {
		rowData.value = {}
		typeInit.value = true
	}

	return {
		rowData,
		typeInit,
		$resetForm,
		// ============================== shell/python脚本配置 ==============================
		shellOptions,
		pythonEnvOptions,
	}
})

export default CRONTAB_TASK_STORE

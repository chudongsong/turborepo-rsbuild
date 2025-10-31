import { defineStore, storeToRefs } from 'pinia'

import { FtpRowProps, FtpTableRowProps } from '@/types/ftp'
import { useGlobalStore } from '@/store/global'

// 新建文件当前组件新建store文件夹，按组件模块来设计数据
// 命名标准：(子路由/路由 + 组件名) FTP_ADD_USER
const FTP_ADD_USER_STORE = defineStore('FTP-ADD-USER-STORE', () => {
	const globalStore = useGlobalStore()
	const { panel } = storeToRefs(globalStore)

	const defaultPath = computed(() => panel.value.sitePath) // 默认路径

	const addFtpRef = ref() // 表单ref
	const ftpForm = ref<FtpTableRowProps | FtpRowProps>({
		name: '',
		password: '',
		path: defaultPath.value || '',
	}) // 表单数据
	const isEdit = ref(false) // 是否编辑

	// const commonOptions = ref({
	// 	width: '32rem',
	// 	onEnter: () => addFtpUserEvent,
	// })

	// 表单配置
	// const formOptions = reactive<FormOptionsProps>([
	// 	{
	// 		...{
	// 			props: 'name',
	// 			label: '用户名',
	// 			placeholder: '请输入FTP用户名，不能少于3个字符',
	// 			disabled: () => isEdit.value,
	// 		},
	// 		...commonOptions,
	// 	},
	// 	{
	// 		...{
	// 			props: 'password',
	// 			label: '密码',
	// 			type: 'input:refresh',
	// 			placeholder: '请输入FTP密码，至少6个字符',
	// 		},
	// 		...commonOptions,
	// 	},
	// 	{
	// 		...{
	// 			prop: 'path',
	// 			label: '根目录',
	// 			type: 'input:folder',
	// 			placeholder: '请选择或输入根目录地址，不能为空',
	// 		},
	// 		...commonOptions,
	// 	},
	// ])

	return {
		isEdit,
		addFtpRef, // 表单ref
		ftpForm, // 表单数据
		defaultPath,
	}
})

/**
 * @description FTP全局数据
 * @returns {Ref<Record<string, any>>}
 */
const useFtpAddStore = () => {
	return storeToRefs(FTP_ADD_USER_STORE())
}

export { useFtpAddStore, FTP_ADD_USER_STORE }

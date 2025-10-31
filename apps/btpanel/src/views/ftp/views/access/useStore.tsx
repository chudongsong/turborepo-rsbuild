import { defineStore, storeToRefs } from 'pinia'

interface RuleForm {
	username: string // 用户名
	download_bandwidth: string // 下载带宽
	upload_bandwidth: string // 上传带宽
	max_files: string // 最大文件数量
	max_size: string // 最大文件大小
	ratio: string // 上传和下载比率
	allowed_local_ips: string // 允许的本地IP地址
	denied_local_ips: string // 拒绝的本地IP地址
	allowed_client_ips: string // 允许的客户端IP地址
	denied_client_ips: string // 拒绝的客户端IP地址
	time_restrictions: string[] // 时间限制
	max_sim_sessions: string // 最大并发会话数
}

const FTP_ACCESS_STORE = defineStore('FTP-ACCESS-STORE', () => {
	const advancedConfiguration = ref(false)
	const uNum = ref(0) // 上传比率
	const dNum = ref(0) // 下载比率
	const accessFormFef = ref() // 表单ref
	const skipNull = ref(false) // 是否跳过空值
	const accessForm = ref<RuleForm>({
		username: '',
		download_bandwidth: '',
		upload_bandwidth: '',
		max_files: '',
		max_size: '',
		ratio: '',
		allowed_local_ips: '',
		denied_local_ips: '',
		allowed_client_ips: '',
		denied_client_ips: '',
		time_restrictions: [],
		max_sim_sessions: '',
	}) // 表单数据

	const unitForm = reactive({
		download_bandwidth: 'KB',
		upload_bandwidth: 'KB',
		max_size: 'KB',
	}) // 单位数据

	const unitData = ref(['KB', 'MB', 'GB']) // 单位选择
	const AccessData = ref({}) // 权限数据

	// 下拉图标
	const icon = computed(() => {
		return advancedConfiguration.value ? 'svgtofont-el-arrow-up' : 'svgtofont-el-arrow-down'
	})

	return {
		accessFormFef,
		accessForm,
		uNum,
		dNum,
		icon,
		unitForm,
		advancedConfiguration,
		unitData,
		skipNull,
		AccessData,
	}
})

/**
 * @description FTP全局数据
 * @returns {Ref<Record<string, any>>}
 */
const useFtpAccessStore = () => {
	return storeToRefs(FTP_ACCESS_STORE())
}

export { useFtpAccessStore, FTP_ACCESS_STORE }

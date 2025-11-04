import { useHandleError, useDataHandle, Message, useConfirm } from '@/hooks/tools'
import { getDatabaseTimeOut, setDatabaseTimeOut, getDatabasePasswordConfig, setDatabasePasswordConfig, getDatabaseLoginLimit, setDatabaseLoginLimit } from '@/api/database'

const DATABASE_MYSQL_ADVANCED_REINFORCE_STORE = defineStore('DATABASE-MYSQL-ADVANCED-REINFORCE-STORE', () => {
	const baseFormData = ref({
		default_password_lifetime: '90',
		expire_logs_days: '180',
		interactive_timeout: '300',
		wait_timeout: '300',
	}) // 表单数据
	const passwordFormData = ref({
		validate_password_length: '',
		validate_password_mixed_case_count: '',
		validate_password_number_count: '',
		validate_password_policy: 'STRONG',
		validate_password_special_char_count: '',
		status: false,
		oldStatus: false,
	}) // 表单数据
	const limitFormData = ref({
		connection_control_failed_connections_threshold: '5',
		connection_control_max_connection_delay: '1800000',
		connection_control_min_connection_delay: '2147483647',
		status: false,
		oldStatus: false,
	}) // 表单数据
	/**
	 * @description 获取网站目录
	 */
	const getBaseData = async () => {
		try {
			const res: any = await getDatabaseTimeOut()
			// const res: any = await useDataHandle({
			// 	loading: `正在获取数据，请稍后...`,
			// 	request: getDatabaseTimeOut(),
			// 	data: {
			// 		status: Boolean,
			// 		msg: String,
			// 		default_password_lifetime: String,
			// 		expire_logs_days: String,
			// 		interactive_timeout: String,
			// 		wait_timeout: String,
			// 	},
			// })

			if (!res.status) {
				Message.error(res.msg)
				return
			}
			if (JSON.stringify(res.data) === '{}') {
				Message.error('数据库状态异常')
				return
			}
			baseFormData.value.default_password_lifetime = res.data?.default_password_lifetime
			baseFormData.value.expire_logs_days = res.data?.expire_logs_days
			baseFormData.value.interactive_timeout = res.data?.interactive_timeout
			baseFormData.value.wait_timeout = res.data?.wait_timeout
		} catch (error) {
			useHandleError(error)
		}
	}

	const setBaseData = async (params: typeof baseFormData.value) => {
		try {
			useDataHandle({
				loading: `正在设置，请稍后...`,
				message: true,
				request: setDatabaseTimeOut(params),
			})
		} catch (error) {
			useHandleError(error)
		}
	}

	/**
	 * @description 获取密码复杂度数据
	 */
	const getPasswordData = async () => {
		try {
			const res: any = await useDataHandle({
				loading: `正在获取数据，请稍后...`,
				request: getDatabasePasswordConfig(),
			})
			if (res.status) {
				passwordFormData.value.validate_password_length = res.data.validate_password_length || '10'
				passwordFormData.value.validate_password_mixed_case_count = res.data.validate_password_mixed_case_count || ''
				passwordFormData.value.validate_password_number_count = res.data.validate_password_number_count || ''
				passwordFormData.value.validate_password_policy = res.data.validate_password_policy || 'STRONG'
				passwordFormData.value.validate_password_special_char_count = res.data.validate_password_special_char_count || ''
				passwordFormData.value.status = res.data.status === 'ON' || res.data.status === 'on'
				passwordFormData.value.oldStatus = res.data.status === 'ON' || res.data.status === 'on'
			} else {
				useHandleError(res)
			}
		} catch (error) {
			useHandleError(error)
		}
	}
	const setPasswordData = async (params: any) => {
		try {
			if (!params.status) {
				try {
					await useConfirm({
						title: `关闭密码复杂度验证`,
						content: `关闭后将不会进行密码复杂度验证，是否继续操作！`,
					})
					useDataHandle({
						loading: `正在关闭，请稍后...`,
						message: true,
						request: setDatabasePasswordConfig({ ...params, status: params.status ? 'on' : 'off' }),
						success: (res: { status: boolean }) => {
							if (!res.status) {
								passwordFormData.value.status = true
							}
						},
					})
				} catch (error) {
					passwordFormData.value.status = true
				}
				return
			}
			useDataHandle({
				loading: `正在保存，请稍后...`,
				message: true,
				request: setDatabasePasswordConfig({ ...params, status: params.status ? 'on' : 'off' }),
			})
		} catch (error) {
			useHandleError(error)
		}
	}

	/**
	 * @description 获取登录限制数据
	 */
	const getLimitData = async () => {
		try {
			const res: any = await useDataHandle({
				loading: `正在获取数据，请稍后...`,
				request: getDatabaseLoginLimit(),
			})
			if (res.status) {
				limitFormData.value.connection_control_failed_connections_threshold = res.data.connection_control_failed_connections_threshold || ''
				limitFormData.value.connection_control_max_connection_delay = res.data.connection_control_max_connection_delay || '1800000'
				limitFormData.value.connection_control_min_connection_delay = res.data.connection_control_min_connection_delay || '2147483647'
				limitFormData.value.status = res.data.status === 'ON' || res.data.status === 'on'
				limitFormData.value.oldStatus = res.data.status === 'ON' || res.data.status === 'on'
			} else {
				useHandleError(res)
			}
		} catch (error) {
			useHandleError(error)
		}
	}
	// 设置登录限制数据
	const setLimitData = async (params: any) => {
		try {
			if (!params.status) {
				try {
					await useConfirm({
						title: `关闭登录限制`,
						content: `关闭后将不会进行登录次数限制，是否继续操作！`,
					})
					useDataHandle({
						loading: `正在关闭，请稍后...`,
						message: true,
						request: setDatabaseLoginLimit({ ...params, status: params.status ? 'on' : 'off' }),
						success: (res: { status: boolean }) => {
							if (!res.status) {
								limitFormData.value.status = true
							}
						},
					})
				} catch (error) {
					limitFormData.value.status = true
				}
				return
			}
			useDataHandle({
				loading: `正在保存，请稍后...`,
				message: true,
				request: setDatabaseLoginLimit({ ...params, status: params.status ? 'on' : 'off' }),
			})
		} catch (error) {
			useHandleError(error)
		}
	}
	// 初始化数据
	const resetData = () => {
		baseFormData.value.default_password_lifetime = ''
		baseFormData.value.expire_logs_days = ''
		baseFormData.value.interactive_timeout = ''
		baseFormData.value.wait_timeout = ''
		passwordFormData.value.validate_password_length = ''
		passwordFormData.value.validate_password_mixed_case_count = ''
		passwordFormData.value.validate_password_number_count = ''
		passwordFormData.value.validate_password_policy = 'STRONG'
		passwordFormData.value.validate_password_special_char_count = ''
		passwordFormData.value.status = false
		passwordFormData.value.oldStatus = false
		limitFormData.value.connection_control_failed_connections_threshold = '5'
		limitFormData.value.connection_control_max_connection_delay = '1800000'
		limitFormData.value.connection_control_min_connection_delay = '2147483647'
		limitFormData.value.status = false
		limitFormData.value.oldStatus = false
	}

	return {
		resetData,
		getBaseData,
		baseFormData,
		setBaseData,
		passwordFormData,
		getPasswordData,
		setPasswordData,
		limitFormData,
		getLimitData,
		setLimitData,
	}
})

const useREINFORCEStore = () => {
	return storeToRefs(DATABASE_MYSQL_ADVANCED_REINFORCE_STORE())
}

export { DATABASE_MYSQL_ADVANCED_REINFORCE_STORE, useREINFORCEStore }

import { delSoftLog, getActionLogData, getBtSecurityLog, getDataInfo, getDockerLog, getErrorLogData, getFtpLogs, getSlowLogData, getSoftLogData, getSoftLogMenu, getSoftLogPhp, getSysSafeLog, setFtpLog } from '@api/logs'
import { defineStore } from 'pinia'

import { Message, useDataHandle, useDataPage, useHandleError } from '@/hooks/tools'
import { getPageTotal } from '@/utils'

interface PhpLog {
	version: string
	msg: string
	file: string
	status: boolean
}

// 日志类型-中文
enum LogType {
	TamperProof = '网站防篡改',
	Syssafe = '宝塔系统加固',
	Security = '堡塔防入侵',
	TamperProofRefactored = '网站防篡改程序-重构版',
}

const LOG_SOFT_STORE = defineStore('LOG-SOFT-STORE', () => {
	const menuOptions = ref<any[]>([]) // 菜单数据
	const currentName = ref('') // 当前选中的菜单
	const refreshPlugin = ref() // 刷新插件视图
	const phpData = ref<PhpLog[]>([]) // php数据
	const phpChecked = ref('') // 选中的php版本

	const logsMsg = ref('') // 日志详细数据 - 常规
	const logPath = ref('') // 日志路径

	const ftpType = ref<string>('login') // ftp日志类型
	const searchValue = ref('') // 搜索关键字

	/**
	 * @description 获取日志菜单
	 */
	const getMenuList = async () => {
		try {
			// 处理数据
			const list = (data: string[]) => data.map((item: string) => ({ name: item, id: item }))
			// 请求
			const res = await useDataHandle({
				loading: '正在获取日志菜单，请稍后...',
				request: getSoftLogMenu(),
				data: [Array, list],
				success: data => {
					menuOptions.value = data as any[]
					currentName.value = data[0]?.name
				},
			})
			return { data: res, status: true }
		} catch (error) {
			console.log(error)
			return { status: false, data: [], msg: '获取日志菜单失败' }
		}
	}

	/**
	 * @description 获取日志详细数据-常规（除ftp、docker、堡塔防入侵、宝塔系统加固外）
	 */
	const getSoftLog = async (search: string = '') => {
		try {
			const isPhp = currentName.value === 'Php'
			const request = isPhp ? getSoftLogPhp : getSoftLogData
			const res = await useDataHandle({
				loading: '正在获取日志数据，请稍后...',
				request: request({
					data: JSON.stringify({ name: currentName.value, search }),
				}),
			})
			return { ...res.data }
		} catch (error) {
			console.log(error)
			return { status: false, data: [], msg: '获取日志数据失败' }
		}
	}

	/**
	 * @description 清空日志
	 */
	const delAllLogDataEvent = async () => {
		let params: any = { type: 1, path: logPath.value }
		return await useDataHandle({
			loading: '正在清空日志,请稍候...',
			request: delSoftLog(params),
			message: true,
		})
	}

	/**
	 * @description 获取ftp日志状态
	 */
	const getFtpLogStatus = async () => {
		const loading = Message.load('正在获取FTP日志状态，请稍后...')
		try {
			const { status, msg } = await setFtpLog({ exec_name: 'getlog' })
			return { status, data: msg }
		} catch (error) {
			useHandleError(error)
			return { status: false, data: '获取FTP日志状态失败' }
		} finally {
			loading.close()
		}
	}

	/**
	 * @description 开启ftp日志
	 */
	const startFtpLog = async () => {
		const loading = Message.load('正在开启FTP服务，请稍后...')
		try {
			const { status, msg } = await setFtpLog({ exec_name: 'start' })
			return { status, msg }
		} catch (error) {
			useHandleError(error)
			return { status: false, msg: '开启FTP服务失败' }
		} finally {
			loading.close()
		}
	}

	/**
	 * @description 获取ftp日志
	 */
	const getFtpLogData = async (params: any) => {
		try {
			const res: any = await useDataHandle({
				loading: '正在获取FTP日志,请稍后...',
				request: getFtpLogs(params),
				data: { data: Array, page: String },
			})
			if (!Array.isArray(res?.data)) return { total: 0, data: [], other: {} }
			return { data: res.data, total: getPageTotal(res.page), other: {} }
		} catch (error) {
			useHandleError(error)
			return { total: 0, data: [], other: {} }
		}
	}

	/**
	 * @description 获取ftp操作日志
	 */
	const getFtpActionLog = async (params: any) => {
		try {
			const res: any = await useDataHandle({
				loading: '正在获取FTP操作日志,请稍后...',
				request: getActionLogData(params),
				data: { data: Array, page: String },
			})
			if (!Array.isArray(res?.data)) return { total: 0, data: [], other: {} }
			return { data: res.data, total: getPageTotal(res.page), other: {} }
		} catch (error) {
			console.log(error)
			return { total: 0, data: [], other: {} }
		}
	}

	/**
	 * @description 获取ftp用户名菜单
	 */
	const getFtpMenu = async () => {
		try {
			const { data, status } = await useDataHandle({
				loading: '正在获取FTP用户名,请稍后...',
				request: getDataInfo({
					p: 1,
					limit: 99999,
					search: '',
					table: 'ftps',
				}),
				data: { data: Array },
			})
			return { data, status, msg: '获取用户成功' }
			// ftpParams.user_name = ftpList.value[0]?.name || '';
		} catch (error) {
			console.log(error)
			return { status: false, data: [], msg: '获取用户失败' }
		}
	}

	// 软件日志 - p

	const logTypeContrast = {
		Nginx: ['Nginx', 'logs'],
		Apache: ['Apache', 'logs'],
		[LogType.TamperProof]: 'bt_security',
		[LogType.Syssafe]: 'syssafe',
		[LogType.Security]: 'security',
		[LogType.TamperProofRefactored]: 'bt_security',
	}

	/**
	 * @description 获取日志详细数据-
	 */
	const getPluginLogData = async (params: any) => {
		try {
			let res = null
			if (currentName.value === 'Docker') {
				const { data } = await useDataHandle({
					request: getDockerLog(params),
				})
				res = data
				res.total = getPageTotal(data.page)
			} else if (currentName.value === LogType.Syssafe) {
				res = await renderSysSafeLog(params)
			} else if (currentName.value === LogType.Security) {
				res = await renderSysSecurityLog(params)
			}

			return { data: res.data, total: res.total, other: {} }
		} catch (error) {
			useHandleError(error)
			return { total: 0, data: [], other: {} }
		}
	}

	/**
	 * @description 获取系统加固日志
	 */
	const renderSysSafeLog = async (params: any) => {
		try {
			const { data: res }: any = await useDataHandle({
				loading: '正在获取日志数据，请稍后...',
				request: getSysSafeLog({
					data: JSON.stringify({
						name: 'syssafe',
						search: params.search,
						ROWS: params.ROWS,
					}),
				}),
			})
			return {
				data: res.msg.data,
				total: res.total || getPageTotal(res.msg.page),
				other: {},
			}
		} catch (error) {
			useHandleError(error)
			return { total: 0, data: [], other: {} }
		}
	}

	/**
	 * @description 获取堡塔防入侵日志
	 */
	const renderSysSecurityLog = async (params: any) => {
		try {
			const res: any = await useDataHandle({
				loading: '正在获取日志数据，请稍后...',
				request: getBtSecurityLog({
					data: JSON.stringify({
						name: 'bt_security',
						search: params.search,
						ROWS: params.ROWS,
					}),
				}),
				data: {
					'msg.data': [Array, data => ({ data })],
					'msg.page': useDataPage(),
				},
			})

			return { data: res.data, total: res.total, other: {} }
		} catch (error) {
			console.log(error)
			return { total: 0, data: [], other: {} }
		}
	}

	/**
	 * @description 删除日志
	 */
	const delSoftLogEvent = async (row: any) => {
		try {
			await useDataHandle({
				loading: '正在删除日志,请稍候...',
				request: delSoftLog({ type: 0, id: row.id }),
				message: true,
				success: refreshPlugin.value,
			})
			return { status: true, msg: '删除日志成功' }
		} catch (error) {
			console.log(error)
			return { status: false, data: [], msg: '删除日志失败' }
		}
	}

	// 软件日志 - mysql
	const mysqlActive = ref<string>('mysqlSlow') // 默认选中tab
	const checkList = ref<Array<string>>([]) // 错误日志级别

	/**
	 * @description 获取日志数据
	 * @param {string} search  搜索关键字
	 * @param {boolean} hideLoad 是否隐藏加载状态 - 可选
	 */
	const getMysqlLogsData = async (search?: String) => {
		try {
			const res: any = await getSlowLogData({
				data: JSON.stringify({ limit: '5000', search }),
			})
			return { data: res.data.msg, status: true, msg: '' }
		} catch (error) {
			useHandleError(error)
			return { status: false, data: '', msg: '获取日志数据失败' }
		}
	}

	/**
	 * @description 获取错误日志数据
	 * @param hideLoad 是否隐藏加载状态 - 可选
	 */
	const getErrorMysqlData = async (search?: string, hideLoad?: boolean) => {
		try {
			const res: any = await getErrorLogData({
				screening: checkList.value.length ? checkList.value.join(',') : '',
				keywords: search || '',
			})
			return { data: res.data, status: true, msg: '' }
		} catch (error) {
			useHandleError(error)
			return { status: false, data: '', msg: '获取日志数据失败' }
		}
	}

	/**
	 * @description tab切换
	 * @param tab 当前点击的tab
	 */
	const handleMysqlTabClick = (tab: any) => {
		// 慢日志
		if (tab === 'mysqlSlow' || tab.props?.name === 'mysqlSlow') return getMysqlLogsData()
		// 错误日志
		return getErrorMysqlData()
	}

	/**
	 * @description 清空日志
	 */
	const delMysqlAllLogEvent = async () => {
		try {
			let params: any = {
				type: 2,
				assort: mysqlActive.value === 'mysqlSlow' ? 'slow' : 'error',
			}
			await useDataHandle({
				loading: '正在清空日志,请稍候...',
				request: delSoftLog(params),
				message: true,
			})
			return { status: true, msg: '清空日志成功' }
		} catch (error) {
			console.log(error)
			return { status: false, msg: '清空日志失败' }
		}
	}

	return {
		menuOptions,
		currentName,
		searchValue,
		phpData,
		phpChecked,

		logsMsg,
		logPath,

		getMenuList,
		getSoftLog,

		// ftp
		ftpType,
		getFtpMenu,
		getFtpLogStatus,
		startFtpLog,
		getFtpLogData,
		getFtpActionLog,

		renderSysSecurityLog,
		renderSysSafeLog,
		getPluginLogData,

		// mysql
		mysqlActive,
		checkList,
		getErrorMysqlData,
		getMysqlLogsData,
		handleMysqlTabClick,
		delMysqlAllLogEvent,
		delAllLogDataEvent,
		delSoftLogEvent,
		refreshPlugin,
	}
})

const useSoftStore = () => {
	const store = LOG_SOFT_STORE()
	return storeToRefs(store)
}

export { LOG_SOFT_STORE, useSoftStore }

import { defineStore, storeToRefs } from 'pinia'
import { getCookie, getRandomPwd, isString, checkVariable, checkDomainPort, isNumber, checkDomain } from '@utils/index'
import { fileSelectionDialog, pluginInstallDialog } from '@/public/index'
import { Message, useDialog } from '@/hooks/tools'
import { getPHPVersion, addSite, setupPackage, checkProjectEnv, getJarPath, createAsync, addJavaProject, getInLog, getJavaInfo } from '@/api/soft'
import { SoftTableRowProps } from '@soft/types'
import { getPluginInfo } from '@/api/global'

import SOFT_DEPLOY_STORE from '../store'
import { useGlobalStore } from '@/store/global'
import { AxiosCanceler } from '@/hooks/tools/axios/model/axios-cancel'
import { data } from 'jquery'

const SOFT_DEPLOY_PROJECT_STORE = defineStore('SOFT-DEPLOY-PROJECT-STORE', () => {
	const { panel } = useGlobalStore()

	const { rowData, oneDeploy } = storeToRefs(SOFT_DEPLOY_STORE())
	const row = computed(() => rowData.value as SoftTableRowProps)

	const getType = () => {
		if (row.value?.install_type) return 'php_async'
		if (isNumber(row.value.project_type)) {
			return row.value.project_type === 1 ? 'java' : 'php'
		} else {
			return row.value.project_type || 'php'
		}
	}

	const projectType = computed(() => {
		if (row.value?.install_type) return 'php_async'
		if (isNumber(row.value.project_type)) {
			return row.value.project_type === 1 ? 'java' : 'php'
		} else {
			return row.value.project_type || 'php'
		}
	})
	const loading = ref<boolean>(false) // 加载状态
	const logPopup = ref<boolean>(false) // 日志弹窗
	const logContent = ref<string>('') // 日志内容

	// php版本选项
	const options = ref<any>([])
	const quickFormRef = ref()
	const checkInfo = ref<any>() // 检查信息
	const javaOptions = ref<any>([])

	const speedTimer = ref<any>(null) // 部署进度定时器
	const speedLoading = ref<any>() // 部署进度加载状态
	const isError = ref<boolean>(false) // 是否错误

	// 是否自定义目录
	let isDir = false

	// 随机名称
	const setRandomName = () => {
		//获取当前时间时间戳，截取后6位
		var timestamp = new Date().getTime().toString()
		var dtpw = timestamp.substring(7)
		return dtpw
	}

	// 表单
	const quickForm = reactive<any>({
		webname: '',
		ps: '',
		path: getCookie('sites_path') || '/www/wwwroot',
		datauser: `sql${setRandomName()}`,
		datapassword: `${getRandomPwd(10)}`,
		code: '',
		version: '',
		project_jdk: '',
	})
	const defaultPath = ref<string>('/www/wwwroot') // 默认目录
	let defaultPathValue = '/www/wwwroot/' // 默认路径
	// 验证规则
	const quickRules = {
		webname: [
			{ required: true, message: '请输入域名', trigger: 'blur' },
			{
				validator: (rule: any, value: any, callback: any) => {
					// 使用换行符分割字符串为域名数组
					const domainsArr = value.split('\n').filter((item: any) => item.length)
					const invalidIndex = domainsArr.findIndex((domain: any) => domain.split(':')[0].length < 3)
					domainsArr.map((domain: any, index: number) => {
						let isPort = domain.includes(':')
						if ((isPort && !checkDomainPort(domain)) || (!isPort && !checkDomain(domain))) {
							callback(new Error(`当前域名格式错误，第${index + 1}行，内容:${domain}`))
						}
					})
					// 域名必须大于3个字符串
					if (invalidIndex !== -1) {
						callback(new Error(`第 ${invalidIndex + 1} 个域名长度不符合要求（必须大于3个字符）`))
					} else {
						callback()
					}
				},
				trigger: ['blur', 'change'],
			},
		],
		ps: [
			{
				validator: (rule: any, value: any, callback: any) => {
					const len = value.replace(/[^\x00-\xff]/g, '**').length
					if (len > 20) {
						quickForm.ps = value.substring(0, 20)
						callback(new Error('不要超出20个字符'))
					}
					if (value === '') {
						callback(new Error('请输入备注'))
					} else {
						callback()
					}
				},
				trigger: ['blur'],
			},
		],
		datauser: [
			{
				validator: (rule: any, value: any, callback: any) => callbackError(value, callback, '请输入数据库用户名'),
				trigger: ['blur'],
			},
		],
		datapassword: [
			{
				validator: (rule: any, value: any, callback: any) => callbackError(value, callback, '请输入数据库密码'),
				trigger: ['blur'],
			},
		],
		project_jdk: [
			{
				validator: (rule: any, value: any, callback: any) => callbackError(value, callback, '请选择JDK版本'),
				trigger: ['blur', 'change'],
			},
		],
	}

	/**
	 * @description 验证错误提示
	 * @param value
	 * @param callback
	 * @param msg
	 */
	const callbackError = (value: any, callback: any, msg: string) => {
		if (value === '' && projectType.value === 'java') {
			callback(new Error(msg))
		} else {
			callback()
		}
	}

	// 部署信息
	const deployMsg = reactive({
		title: '',
		databaseName: '',
		user: '',
		password: '',
		domain: '',
	})

	// 名称改变自动填充
	const changeName = (val: string | number) => {
		quickForm.webname = val
		const arr = isString(val) ? val?.split('\n') : [val.toString()]
		// 自定义目录不自动填充
		if (!isDir) quickForm.path = `${defaultPathValue?.replace(/\/\//g, '/')}${arr[0]?.replace(/\W/g, '_')}`
		quickForm.ps = arr[0]
		quickForm.datauser = `${arr[0]?.replace(/\W/g, '_')}`
	}

	// 选择版本
	const selectVersion = (val: string) => {
		quickForm.version = val
	}

	/**
	 * @description: 触发目录选择
	 */
	const onPathChange = () => {
		fileSelectionDialog({
			type: 'dir',
			change: (path: string) => {
				// 自定义选择目录，取消自动填充
				isDir = true
				quickForm.path = path
			},
		})
	}

	/**
	 * @description: 清除空格
	 */
	const clearSpace = (name: string) => {
		quickForm.VOLUME_PATH = quickForm.VOLUME_PATH.replace(/\s+/g, '')
	}

	/**
	 * @description: 获取表单
	 */
	const getForm = async (isRefresh: boolean = false): Promise<void> => {
		// 项目名称
		quickForm.code = row.value.title
		if (projectType.value === 'java') {
			const supportJava = row.value?.java?.split(',') || row.value.php.split(',') // 支持的java版本
			const { data } = await getJavaInfo()
			javaOptions.value = data.jdk_info
				.filter((item: any) => supportJava.includes(item.name))
				.map((item: any) => ({
					title: `${item.name}${item.path ? `[${item.path}]` : ''}`,
					key: item.path || item.name,
					disabled: !item.path,
				})) // 当前已安装的支持的PHP版本
			const javaStatusOptions = javaOptions.value.filter((item: any) => !item.disabled)
			quickForm.project_jdk = javaStatusOptions.length ? javaStatusOptions[0].key : ''
		} else {
			// php版本配置
			const res = await getPHPVersion()
			if (res.status) {
				const supportPHP = row.value.php.replace(/\./g, '').split(',') // 支持的PHP版本
				const phpOption = res.data.filter((item: any) => supportPHP.includes(item.version)) // 当前已安装的支持的PHP版本
				if (phpOption.length === 0) {
					const popup = await oneDeploy.value
					popup?.unmount() // 关闭顶层弹窗
					Message.msg({
						customClass: 'bt-message-error-html',
						dangerouslyUseHTMLString: true,
						message: '缺少被支持的PHP版本，请安装!',
						type: 'error',
						duration: 0,
						showClose: true,
					}) // 提示错误信息
					return
				}
				phpOption
					.filter((item: any) => item.version !== '00')
					.forEach((item: any) => {
						options.value.push({
							label: item.name,
							value: item.version,
						})
					})
				quickForm.version = options.value[0].value
			} else {
				Message.error(res.msg)
			}
			if (row.value.enable_functions.length > 2) {
				Message.warn({
					msg: `注意：部署此项目，以下函数将被解禁:${row.value.enable_functions}`,
					time: 3000,
				})
			}
		}
		if (isRefresh) Message.success('JDK版本，刷新成功')
	}

	// 获取数据库信息
	const getDatabase = (data: any) => {
		// 如果数据库创建成功
		deployMsg.title = '数据库账号资料'
		if (data.databaseStatus) {
			// 获取数据库信息
			deployMsg.databaseName = data.databaseUser
			deployMsg.user = data.databaseUser
			deployMsg.password = data.databasePass
		} else {
			// 如果数据库创建失败
			if (data.databaseUser) deployMsg.databaseName = '数据库【' + data.databaseUser + '】<span class="text-danger">创建失败</span>，请检查是否存在同名数据库!'
			else deployMsg.databaseName = '数据库创建失败，检查是否存在同名数据库!'
			deployMsg.user = ''
			deployMsg.password = ''
		}
	}

	// 获取部署信息
	const getDeployMsg = (data: any, mainDomain: string) => {
		// 如果有账号信息
		if (data.admin_username || data?.config?.admin_username) {
			// 获取账号信息
			deployMsg.title = '已成功部署，无需安装，请登录修改默认账号密码'
			deployMsg.user = data.admin_username || data?.config?.admin_username
			deployMsg.password = data.admin_password || data?.config?.admin_password
		}
		// 访问站点
		deployMsg.domain = (mainDomain + '/' + (data?.success_url || '')).replace('//', '/')
	}

	/**
	 * @description 获取日志
	 */
	const getLogData = async () => {
		try {
			const { msg } = await getInLog()
			logContent.value = msg
			if (msg.indexOf('ERROR：') !== -1) {
				isError.value = true
				clearTimeout(speedTimer.value)
			}
			getDeployProgress()
		} catch (error) {}
	}

	/**
	 * @description 获取参数
	 */
	const getParams = async () => {
		const { webname, ps, path, datauser, datapassword, version, project_jdk } = quickForm
		const domains = webname
			.split('\n')
			.map((domain: any) => domain.trim())
			.filter(Boolean)
		const Webport = domains[0].split(':')[1] || '80' // 主域名端口

		const webParams = JSON.stringify({
			domain: domains[0],
			domainlist: domains.slice(1),
			count: domains.length,
		}) // 拼接json

		let project_jar = ''
		if (projectType.value === 'java') {
			const load = Message.load('正在获取项目jar包路径')
			const res = await getJarPath({ dname: row.value.name, sitename: domains[0] })
			load.close()
			if (res.status) {
				project_jar = res.msg
			} else {
				Message.error(res.msg)
				return false
			}
		}

		const projectTypeParams: any = {
			php: {
				webname_1: domains[0],
				ps: row.value.name + '一键部署',
				path: path,
				version: version,
				port: Webport,
				webname: webParams,
				ftp: false,
				sql: true,
				datauser: datauser,
				datapassword: datapassword,
				address: 'localhost',
				codeing: 'utf8mb4',
			},
			php_async: {
				site_path: path,
				project_cmd: row.value?.config?.run_server,
				install_dependence: 0,
				php_version: version,
				sql: 'MYSQL',
				project_ps: row.value.name + '一键部署',
				open_proxy: 0,
				project_proxy_path: '',
				run_user: 'www',
				composer_version: '',
				sql_user: datauser,
				sql_pwd: datapassword,
				sql_codeing: 'utf8mb4',
				webname: webParams,
			},
			java: {
				data: JSON.stringify({
					project_type: 0,
					domains: domains,
					project_jar: project_jar,
					project_jdk: project_jdk,
					project_name: domains[0].replace(/[:.]/g, '_'),
					project_cmd: row.value?.config?.run_server || `${project_jdk} -jar -Xmx1024M -Xms256M ${project_jar}`,
					project_ps: row.value.name + '一键部署',
					run_user: 'root',
					env_file: '',
					env_list: [],
					jmx_status: false,
					watch_file: false,
					ps: row.value.name + '一键部署',
					by_process: 0,
				}),
			},
		}

		return projectTypeParams[projectType.value] || projectTypeParams.php
	}

	// 提交
	const onConfirm = async () => {
		if (!checkInfo.value?.mysql && projectType.value === 'java') {
			return Message.error('请先安装数据库')
		}
		await quickFormRef.value.validate()
		isError.value = false
		const domain = quickForm.webname.split('\n')
		const mainDomain = domain[0].split(':')[0] //主域名

		const params = await getParams() // 获取参数
		if (!params) return

		const requestType: any = {
			// 请求方法类型
			default: addSite, // php传统项目
			php_async: createAsync, // php异步项目
			java: addJavaProject, // java springboot项目
		}
		const requestFun = requestType[projectType.value] || requestType.default // 请求方法
		let load = Message.load('正在准备部署, 请稍后...')

		// 创建站点
		const res = await requestFun(params)
		load.close()
		if (!res.status) {
			Message.msg({
				customClass: 'bt-message-error-html',
				dangerouslyUseHTMLString: true,
				message: res.msg,
				type: 'error',
				duration: 0,
				showClose: true,
			}) // 提示错误信息
			return res.status
		}
		// 获取数据库信息
		if (projectType.value === 'java') {
			deployMsg.databaseName = ''
			deployMsg.user = ''
			deployMsg.password = ''
		} else {
			if (res.data) getDatabase(res.data)
		}
		logPopup.value = true
		logContent.value = ''
		getDeployProgress() // 获取一键部署进度
		const packParams: { [key: string]: string } = {
			dname: row.value.name,
			site_name: mainDomain,
			project_type: projectType.value,
		}
		if (projectType.value === 'java') {
			packParams['project_name'] = domain[0].replace(/[:.]/g, '_')
			packParams.datauser = quickForm.datauser
			packParams.datapassword = quickForm.datapassword
		} else {
			packParams.php_version = quickForm.version
		}
		// 开始部署
		const ress = await setupPackage(packParams)
		load.close()
		clearInterval(speedTimer.value)
		if (isError.value) return false
		if (ress.status) {
			// 部署成功,获取部署信息
			getDeployMsg(ress.data, mainDomain)
			useDialog({
				title: '部署成功', //【string】 title，组件标题，为空不显示或false，可为空
				area: 64, // 【number、string、array<number/string>】视图大小，支持数组[宽，高]，默认单位rem
				component: () => import('./success-popup.vue'), // 组件引入
				showClose: true,
			})
			return ress.status
		} else {
			Message.msg({
				customClass: 'bt-message-error-html',
				dangerouslyUseHTMLString: true,
				message: ress.msg,
				type: 'error',
				duration: 0,
				showClose: true,
			}) // 提示错误信息
			return false
		}
	}

	/**
	 * @description 获取一键部署进度
	 */
	const getDeployProgress = async (loadVm?: any) => {
		speedTimer.value = setTimeout(async () => {
			!isError.value && (await getLogData())
		}, 1000)
	}

	/**
	 * @description 获取数据库状态
	 */
	const getStatus = async () => {
		try {
			const { data } = await checkProjectEnv()
			checkInfo.value = data
		} catch (error) {}
	}

	/**
	 * @description: 安装插件
	 * @param {string} name 插件名称
	 */
	const installPlugin = async (name: string) => {
		const { data } = await getPluginInfo({ sName: name })
		pluginInstallDialog({ name: data.name, type: 'i', pluginInfo: data })
	}

	/**
	 * @description 获取默认目录
	 */
	const getDefaultPath = () => {
		const path = panel.value?.sitePath
		if (path) {
			const str = checkVariable(path, 'string', '')
			quickForm.path = str
			defaultPathValue = (str + '/')?.replace(/\/\//g, '/')
		}
	}

	/**
	 * @description 初始化
	 */
	const init = async () => {
		loading.value = true
		try {
			await getStatus() // 获取数据库状态
			getForm()
			getDefaultPath()
		} catch (error) {
			console.log(error)
		} finally {
			loading.value = false
		}
	}

	// 打开地址
	const openView = () => {
		window.open('http://' + deployMsg.domain, '_blank', 'noopener,noreferrer')
	}

	const $reset = () => {
		clearInterval(speedTimer.value)
		options.value = []
		checkInfo.value = null
		javaOptions.value = []
		logPopup.value = false
		Object.assign(quickForm, {
			webname: '',
			ps: '',
			path: getCookie('sites_path') || '/www/wwwroot',
			datauser: `sql${setRandomName()}`,
			datapassword: `${getRandomPwd(10)}`,
			code: '',
			version: '',
			project_jdk: '',
		})
	}

	return {
		projectType,
		options,
		loading,
		logPopup,
		logContent,
		quickFormRef,
		quickForm,
		quickRules,
		checkInfo,
		javaOptions,
		speedTimer,
		speedLoading,
		deployMsg,
		changeName,
		onPathChange,
		clearSpace,
		selectVersion,
		getForm,
		onConfirm,
		getDefaultPath,
		init,
		installPlugin,
		openView,
		$reset,
	}
})

export default SOFT_DEPLOY_PROJECT_STORE

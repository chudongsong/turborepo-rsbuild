import { advanceCheckPort, batchStatus, changeProjectConf, createPythonProject, getPythonAppInfo, getPythonProjectInfo, pythonRecreateProject, batchDelSite, setProject, getPythonEnvironment, getVersionList, setPythonEnvironment } from '@/api/site'
import { TableColumnProps } from '@/components/data/bt-table/types'
import { TableBatchEventProps } from '@/components/extension/bt-table-batch/types'
import { useDataHandle, useDialog, useHandleError, useMessage } from '@/hooks/tools'
import { useBatchStatus } from '@/hooks/tools/table/column'
import { assembBatchParams, assembBatchResults, fileSelectionDialog, openResultView } from '@/public'
import { isString } from '@/utils'
import { SITE_STORE, useSiteStore } from '../../useStore'
import { SITE_PYTHON_STORE } from './useStore'

const Message = useMessage()

const { activeType, isRefreshList, siteInfo, rowData } = useSiteStore()
const { getClassList, getProjectConfig, addGeneralProject, getRootUser, setSiteInfo } = SITE_STORE()

const { checkPythonVersion } = SITE_PYTHON_STORE()

// export const maskLayer = ref<boolean>(false) // 环境检测遮罩层
export const maskLayer = useSessionStorage('_python_mask', false) // 环境检测遮罩层

/**
 * @description 打开添加通用项目弹窗
 */
export const openAddPythonSiteView = () => {
	siteInfo.value = null
	useDialog({
		title: '添加Python项目',
		area: [68],
		component: () => import('@site/views/python-model/add-python/index.vue'),
		showFooter: true,
	})
}

/**
 * @description 打开Python环境管理
 */
export const openPythonEnvManageView = (callback: AnyFunction) => {
	useDialog({
		isAsync: true,
		title: `Python环境管理`,
		area: 105,
		component: () => import('@site/views/python-model/command-line-env-manage/index.vue'),
		onCancel: () => {
			typeof callback === 'function' && callback()
		},
	})
}

/**
 * @description 打开模块
 */
export const openPythonModule = (row: any) => {
	rowData.value = row
	useDialog({
		title: `项目【${row.name || ''}】模块管理`,
		area: 60,
		isAsync: true,
		component: () => import('@site/views/python-model/modules-mange/index.vue'),
		compData: row,
	})
}

/**
 * @description 打开终端
 */
export const openPythonTerminal = (row: any) => {
	useDialog({
		title: `终端`,
		area: [90, 50],
		isAsync: true,
		showFooter: false,
		component: () => import('@site/views/python-model/terminal/index.vue'),
		compData: {
			hostInfo: {
				pj_name: row.name,
			},
			row,
			cmd: row.shell_active,
		},
	})
}

/**
 * @description 打开设置
 */
export const openSettingView = async (row: any, tab: string = '') => {
	try {
		// 创建中，打开日志 // 创建失败，重新创建后打开日志
		if (['running', 'failure'].includes(row.project_config.prep_status)) {
			if (row.project_config.prep_status === 'failure') await pythonRecreateProject({ name: row.name })
			return useDialog({
				isAsync: true,
				title: '正在创建Python项目，请耐心等候...',
				area: 52,
				component: () => import('@/components/business/bt-log-dialog/index.vue'),
				compData: {
					type: 'createPythonProject',
					logPath: `/www/server/python_project/vhost/logs/${row.name}.log`,
					endMsg: '尝试启动项目',
					failMsg: '环境准备失败',
					successMsg: '创建成功',
					isClear: true,
					completeEvent: async (status: boolean, close: any) => {
						if (!status) {
							Message.error('环境准备失败')
						}
						isRefreshList.value = true
						// await getModulesList('python')
						close()
						// const currentRow = modulesTableParams.value.list.find(
						// 	(item: any) => item.id === row.id
						// )
						// openSettingView(currentRow, tab)
					},
				},
			})
		}
		// 设置网站信息
		setSiteInfo(row, tab)
		useDialog({
			title: 'Python项目管理[' + row.name + '] -- 添加时间[' + row.addtime + ']',
			area: [84, 76],
			component: () => import('@site/views/python-model/setting/index.vue'),
		})
	} catch (error) {
		console.log(error, 'error')
	}
}

export const checkVersion = async () => {
	try {
		const res: any = await checkPythonVersion()
		maskLayer.value = false
		if (!res.data.cpy_installed.length && !res.data.pypy_installed.length) maskLayer.value = true
		versionData.value = res.data.cpy_installed.concat(res.data.pypy_installed)
	} catch (error) {
		useHandleError(error)
	}
}

/**
 * 检查端口是否被占用
 */
export const checkPortUse = async (param: any) => {
	if (!param.port) return false
	try {
		const res = await advanceCheckPort({ port: param.port }, 'python')
		if (!res.status) {
			Message.request(res)
			param.port = '' // 清空端口
		}
		return res.status
	} catch (error) {
		console.log(error)
	}
}

/**
 * @description: 处理环境变量
 */
const setEnv = (envStr: string) => {
	let env = envStr.split('\n').filter(item => item !== '')
	let arrs: any = []
	env.forEach(item => {
		let arr = item.split('=')
		arrs.push({
			k: arr[0],
			v: arr[1],
		})
	})
	return arrs
}

/**
 * @description 获取Python环境
 */
export const getPythonEnv = async () => {
	try {
		const res: AnyObject = await useDataHandle({
			request: getPythonEnvironment({ sort_not_use: 1 }),
		})
		if (!res.status) {
			Message.error(res.msg)
			envList.value = []
		}
		envList.value = res.data.env_list
	} catch (error) {
		console.error(error)
		return { data: [], total: 0 }
	}
}

/**
 * @description 获取Python环境状态
 */
export const getPythonEnvStatus = (type: 'venv' | 'conda' | 'system') => {
	switch (type) {
		case 'venv':
			return '虚拟环境'
		case 'conda':
			return 'Conda环境'
		case 'system':
			return '系统级环境'
	}
}

export const versionData = ref<any[]>([])
export const envList = ref<any[]>([])
export const userList = ref([])
export const isEdit = computed(() => siteInfo.value?.id)
export const frameData = ref<any>([])
export const pyAddForm = ref<any>({
	envType: 0, // 环境变量类型
	rfile: '', // 项目jar路径
	pjname: '', // 项目名称
	port: '', // 项目端口
	path: '', // 项目路径
	framework: '', // 项目框架
	stype: 'command', // 项目运行方式
	xsgi: 'wsgi', // 项目网络协议
	requirement_path: '', // 项目依赖包
	auto_run: false, // 开机启动 dev
	venv_path: '', // 虚拟环境路径 dev
	version: '', // Python版本
	parm: '', // 自定义命令
	env: '', // 环境变量
	envPath: '', // 环境变量文件路径
	app: '', // 应用名称
	processes: '', // 进程数
	threads: '', // 线程数
	user: 'www', // 启动用户
	is_http: true, // 通信方式
	listenMsg: '', // 监听端口信息
	initialize: '', // 项目初始化命令
	python_bin: '', // Python环境路径
})

/**
 * @description 获取Python版本
 */
export const getVersion = async (isRefresh: boolean = false) => {
	try {
		const res: any = await checkPythonVersion()
		versionData.value = []
		versionData.value = res.data.cpy_installed.concat(res.data.pypy_installed)
		if (isRefresh) return Message.success('Python版本，刷新成功')
		pyAddForm.value.version = res.data.cpy_installed[0] || ''
		frameData.value = res.data.command_path.filter((item: any) => item.type === 'project')
		pyAddForm.value.venv_path = frameData.value[0]?.python_path
	} catch (error) {
		console.log(error)
	}
}

/**
 * @description: 返回env处理
 * @param {string} env
 */
const returnEnv = (env: any[]) => {
	pyAddForm.value.env = env.map(item => item.k + '=' + item.v).join('\n')
	pyAddForm.value.envType = 1
}

export const initPy = async () => {
	try {
		await getPythonEnv()

		const user = await getRootUser()
		userList.value = user.data

		if (isEdit.value) {
			const res = await getProjectConfig({
				data: JSON.stringify({ name: siteInfo.value.name }),
			})
			const { project_config, listen, pyenv_data } = res.data
			const { call_app: app, env_file: envPath, env_list, stype, project_cmd } = project_config
			envPath && ((pyAddForm.value.envPath = envPath), (pyAddForm.value.envType = 2))
			env_list?.length > 0 && (returnEnv(env_list), (pyAddForm.value.envType = 1))
			Object.assign(pyAddForm.value, {
				...project_config,
				app,
				parm: stype === 'command' ? project_cmd : '',
				python_bin: pyenv_data.bin_path,
			})
			if (!listen.includes(Number(pyAddForm.value.port)) && listen.length > 0) {
				pyAddForm.value.listenMsg = `当前监听端口${listen.join(',')}`
			}
		}
	} catch (error) {
		console.error(error)
	}
}

/**
 * @description 重置Python项目表单
 */
export const $resetPyAddForm = () => {
	Object.assign(pyAddForm.value, {
		envType: 0, // 环境变量类型
		rfile: '', // 项目jar路径
		pjname: '', // 项目名称
		port: '', // 项目端口
		path: '', // 项目路径
		framework: '', // 项目框架
		stype: 'command', // 项目运行方式
		xsgi: 'wsgi', // 项目网络协议
		requirement_path: '', // 项目依赖包
		auto_run: false, // 开机启动 dev
		venv_path: '', // 虚拟环境路径 dev
		version: '', // Python版本
		parm: '', // 自定义命令
		env: '', // 环境变量
		envPath: '', // 环境变量文件路径
		app: '', // 应用名称
		processes: '', // 进程数
		threads: '', // 线程数
		user: 'www', // 启动用户
		is_http: true, // 通信方式
		listenMsg: '', // 监听端口信息
		initialize: '', // 项目初始化命令
		python_bin: '', // Python环境路径
	})
}

/**
 * @description 提交Python项目
 * @param param
 * @returns
 */
export const submitPySite = async (param: any) => {
	try {
		if (!isEdit.value && param.stype !== 'command') {
			const res = await checkPortUse(param)
			if (!res) {
				Message.error('端口被占用，请更换端口')
				return false
			}
		}
		let { pjname, port, path, version, parm, framework, requirement_path, envPath, stype, rfile, app, initialize, processes, threads, is_http, user, auto_run, envType, env, xsgi } = param

		const isCommand = stype !== 'command'

		if (envType === 1) env = setEnv(env)
		let data: any = {
			pjname,
			port,
			stype,
			path,
			user,
			requirement_path,
			env_file: envType === 2 ? envPath : '',
			env_list: JSON.stringify(envType === 1 ? env : []),
			framework,
			project_cmd: !isCommand ? parm : undefined, // 9.2没有
			xsgi: isCommand ? xsgi : undefined,
			rfile: isCommand ? rfile : undefined,
			call_app: isCommand ? app : undefined, // 9.2没有
			// version,
			python_bin: pyAddForm.value.python_bin,
		}

		if (isEdit.value) {
			data = { ...data, processes, threads, is_http, auto_run }
		} else {
			data.initialize = initialize
		}

		const params = {
			data: JSON.stringify(!isEdit.value ? data : { name: siteInfo.value.name, data }),
		}
		const requestFun = isEdit.value ? changeProjectConf : createPythonProject
		const res: AnyObject = await useDataHandle({
			loading: '正在提交，请稍后...',
			request: requestFun(params),
			message: true,
		})
		isRefreshList.value = true
		return res.status
	} catch (error) {
		console.log(error)
	}
}

/**
 * @description 目录选择
 */
export const onRootPathChange = () => {
	fileSelectionDialog({
		type: 'dir',
		path: pyAddForm.value.path,
		change: (path: string) => {
			if (path) {
				pyAddForm.value.path = path
				let str = path
					.substring(path.lastIndexOf('/') + 1)
					?.replace(/\./g, '_')
					.replace(/\/\//g, '/')
				pyAddForm.value.pjname = str
				getPathInfo()
			}
		},
	})
}

/**
 * @description 安装依赖包目录选择
 */
export const onRequirementPathChange = () => {
	fileSelectionDialog({
		type: 'file',
		path: pyAddForm.value.requirement_path,
		change: (path: string) => {
			if (path) {
				pyAddForm.value.requirement_path = path
			}
		},
	})
}

/**
 * @description: 触发目录选择
 */
export const onPathChange = () => {
	fileSelectionDialog({
		type: 'file',
		path: pyAddForm.value.rfile,
		change: (path: string) => {
			pyAddForm.value.rfile = path
			getAppInfo()
		},
	})
}

/**
 * @description 环境变量文件目录
 */
export const onEnvFile = () => {
	fileSelectionDialog({
		type: 'file',
		path: pyAddForm.value.envPath,
		change: (path: string) => {
			pyAddForm.value.envPath = path
		},
	})
}

/**
 * @description 根据app路径获取信息
 */
export const getAppInfo = async () => {
	try {
		const res = await getPythonAppInfo({ runfile: pyAddForm.value.rfile })
		if (!res.status) {
			Message.request(res)
			return
		}
		const { framework, xsgi, call_app } = res.data
		framework && (pyAddForm.value.framework = res.data.framework)
		xsgi && (pyAddForm.value.xsgi = res.data.xsgi)
		call_app && (pyAddForm.value.app = res.data.call_app)
	} catch (error) {
		useHandleError(error)
	}
}

/**
 * @description 根据项目路径获取信息
 */
export const getPathInfo = async () => {
	try {
		const path = pyAddForm.value.path
		const res = await getPythonProjectInfo({ path })
		if (!res.status) {
			Message.request(res)
			return
		}
		const { framework, requirement_path, runfile, xsgi, call_app } = res.data
		framework && (pyAddForm.value.framework = res.data.framework)
		requirement_path ? (pyAddForm.value.requirement_path = res.data.requirement_path) : (pyAddForm.value.requirement_path = '')
		runfile && (pyAddForm.value.rfile = res.data.runfile)
		xsgi && (pyAddForm.value.xsgi = res.data.xsgi)
		call_app && (pyAddForm.value.app = res.data.call_app)
	} catch (error) {
		useHandleError(error)
	}
}

/**
 * @description 批量处理事件
 * @param {TableBatchDialogProps} batchConfirm 选中处理事件
 * @param {TableBatchNextAllProps} nextAll 选中处理事件
 * @param {AnyObject[]} selectedList 选中的数据
 * @param {TableBatchOptionsProps} options 选中的配置
 * @returns {Promise<void>} void
 */
export const useBatchEventHandle: TableBatchEventProps = async (batchConfirm, nextAll, selectedList, options, clearBatch, config) => {
	const { label, value } = options
	const { enable, exclude } = config
	const template: Map<string, string> = new Map([
		['start', '批量启动选中项目后，项目将正常访问'],
		['stop', '批量停用选中的项目后，项目将会停止运行'],
		['restart', '批量重启选中的项目后，项目将会重新启动'],
		['delete', '批量删除选中的项目后，项目将无法恢复'],
	])
	const requestHandle = async (item?: any) => {
		const requestList: Map<string, AnyFunction> = new Map([
			['start', batchStatus],
			['stop', batchStatus],
			['restart', batchStatus],
			['delete', batchDelSite],
		])
		const fn = requestList.get(value)
		switch (value) {
			case 'start':
			case 'stop':
			case 'restart':
				if (fn) {
					const list = selectedList.value.map(item => ({ project_name: item.name }))
					const params = assembBatchParams(false, exclude, enable, {
						params: {
							site_list: JSON.stringify(list),
							status: value,
							project_type: activeType.value.toUpperCase(),
						},
					})
					return await fn(params, activeType.value)
				}
			case 'delete':
				if (fn) {
					const delParams = assembBatchParams(selectedList.value, exclude, enable, {
						params: { project_type: activeType.value.toUpperCase() },
					})
					return await fn(delParams)
				}
		}
	}
	await batchConfirm({
		title: `批量${label}`,
		content: `${template.get(value) as string}，是否继续操作？`,
		column: [{ label: '项目名称', prop: 'name' }, useBatchStatus()] as TableColumnProps[], // 弹窗配置
		onConfirm: async () => {
			const res = await requestHandle()
			// 执行完毕的代码，刷新列表
			isRefreshList.value = true
			clearBatch && clearBatch()
			let { data } = assembBatchResults(res.data)
			data = data.map((item: any) => ({ ...item, name: item.name || item.project_name }))
			openResultView(data, { title: `${label}网站` })
		},
	})
}

export const currentVersion = ref('0') // 当前版本
export const pyVersion = ref<any>([
	{
		label: '系统默认',
		value: '0',
	},
]) // py版本

/**
 * @description 获取版本列表
 */
export const getVersionListEvent = async () => {
	try {
		const res: AnyObject = await useDataHandle({
			request: getPythonEnvironment({ sort_not_use: 0 }),
		})
		if (!res.status) {
			Message.error(res.msg)
			pyVersion.value = []
			return { data: [], total: 0 }
		}
		currentVersion.value = res.data.now_env?.bin_path || '0'
		pyVersion.value = res.data.env_list
			.filter((item: any) => item.can_set_default)
			.map((item: any) => ({
				label: item.name,
				value: item.bin_path,
			}))
		if (res.data.now_env?.bin_path) {
			pyVersion.value.unshift({
				label: res.data.now_env.name,
				value: res.data.now_env.bin_path,
			})
		}
		pyVersion.value.push({
			label: '系统默认',
			value: '0',
		})
	} catch (error) {
		console.error(error)
	}
}
/**
 * @description 设置命令行 / 取消设置命令行
 */
export const setPythonVersionEvent = async (path: string) => {
	await useDataHandle({
		loading: '正在设置，请稍后...',
		request: setPythonEnvironment({
			path: path === '0' ? '' : path,
		}),
		message: true,
		success: () => {
			getVersionListEvent()
		},
	})
}

import { useSocket as createSocket, Socket } from '@/hooks/tools'
import { useMessage, useDataHandle, useConfirm, useDialog } from '@/hooks/tools'
import { checkDomain, getRandomPwd, isString, setCookie, isDev } from '@utils/index'
import { setAppStatus, removeApp, installApp, getDependenceApps, getAppRunLog, getAppInstallLog, getUpdateVersions, updateApp, getDatabaseTerminalCmd, getAppComposeFile } from '@/api/docker'
import { FormInput, FormItemCustom, FormTextarea } from '@form/form-item'
import { openSettingView } from '@/views/docker/views/docker-site/useController'
import { appData, getAppList, appParams } from '@docker/views/app-store/useController'
// import { getAppImages } from '@docker/views/app-store/app-list/useController'
import { getCachedImage, CreateTerminalDialog } from '@docker/useMethods'

import { getDockerStore } from '@docker/useStore'
import { getDockerAppStore } from '@docker/views/app-store/useStore'

import BtInputIcon from '@/components/form/bt-input-icon'
import BtTerminal from '@/components/extension/bt-terminal/index.vue'
import BtEditor from '@/components/extension/bt-editor'
import { ElCheckbox, ElSelect, ElOption } from 'element-plus'
import { isDark } from '@/utils/theme-config'

const Message = useMessage() // 消息提示

const {
	refs: { deployMenuData },
} = getDockerAppStore()

const {
	refs: { isRefreshInstallList },
} = getDockerStore()

export const editorConfig = {
	mode: 'ace/mode/yaml',
	theme: !isDark.value ? 'ace/theme/chrome' : 'ace/theme/clouds_midnight', //主题
	wrap: true, // 是否自动换行
	showInvisibles: false, // 是否显示空格
	showFoldWidgets: false, // 是否显示代码折叠线
	useSoftTabs: true, // 是否使用空格代替tab
	tabSize: 2, // tab宽度
	showPrintMargin: false, // 是否显示打印边距
	readOnly: false, // 是否只读
	fontSize: '12px', // 字体大小
}

// 首页
/**
 * @description 渲染软件图片
 * @return {string} 图片地址
 */
export const renderSoftImages = async (data: any, loadingRef: Ref<any>) => {
	const { appname: name, appid } = data
	const basePath = isDev ? '/static/img/soft_ico/dkapp' : appid == -1 ? '/static/img/soft_ico/apphub' : '/static/img/soft_ico/dkapp'
	const prefix = appid == -1 ? 'ico-apphub_' : 'ico-dkapp_'
	const cleanName = name?.replace(/-+[{0-9},\.,]+$/, '')
	const url = `${basePath}/${prefix}${cleanName}.png`
	loadingRef.value = await getCachedImage(url)
	// return getAppImages(url, name?.replace(/-+[{0-9},\.,]+$/, ''))
	// return getCachedImage(url)
}

/**
 * @description: 判断是否显示更新按钮
 * @param {item}  插件信息
 */
export const isShowUpdate = (item: any) => {
	return item.canUpdate && item.installed
}

/**
 * @description: 安装，打开按钮点击事件
 */
export const installEvent = async (item: any) => {
	await initDepend({ appData: item, openDependInstall })
	initVersion() // 初始化版本
	useDialog({
		title: `${item.appname}安装配置`,
		area: 70,
		component: () => import('./add-app-soft.vue'),
		compData: { appData: item, openDependInstall },
		showFooter: true,
	})
}

/**
 * @description 打依赖安装弹窗
 *
 */
const openDependInstall = async ({ name, type }: { name: string; type: string }) => {
	deployMenuData.value.app_type = type
	appParams.query = ''
	await getAppList()
	nextTick(async () => {
		const dependApp = appData.list.find((apps: any) => apps.appname === name)
		if (dependApp) {
			await initDepend({ appData: dependApp, openDependInstall })
			initVersion() // 初始化版本
			useDialog({
				title: `${(dependApp as AnyObject).appname}安装配置`,
				area: 70,
				component: () => import('./add-app-soft.vue'),
				compData: { appData: dependApp, openDependInstall },
				showFooter: true,
			})
		}
	})
}

/**
 * @description 更新软件
 */
export const updateAppEvent = async (data: any): Promise<void> => {
	useDialog({
		title: '更新配置',
		area: 42,
		component: () => import('./app-update.vue'),
		compData: data,
		showFooter: true,
	})
}
/**
 * @description 打开详情
 * @param {any} data 数据
 */
export const openDetail = (data: any) => {
	useDialog({
		title: `详情展示`,
		area: 64,
		component: () => import('./detail-view.vue'),
		compData: data,
		btns: false,
	})
}

/**
 * @description 打开应用设置
 * @param {any} data 数据
 */
export const openAppConfigView = (appname: string, data: any, otherData?: any) => {
	switch (appname) {
		case 'ollama':
		case 'ollama_and_openwebui':
		case 'deepseek_r1':
			useDialog({
				title: '管理',
				area: [86, 52],
				component: () => import('@docker/views/app-store/app-config/ollama/index.vue'),
				compData: { ...data, ...otherData },
				btns: false,
			})
			break
		case 'mysql':
		case 'redis':
		case 'postgresql':
		case 'tdengine':
			openDatabaseTerminal(appname, data)
			break
		default:
			break
	}
}

// 终端组件
const ContainerTerminalDialog = defineComponent({
	name: 'ContainerTerminalDialog',
	props: {
		compData: {
			type: Object,
			default: () => ({}),
		},
	},

	setup(props, { expose }) {
		// 终端ref
		const terminal = ref<any>()

		const cmd = ref(props.compData.cmd)

		let socket = ref<any>(null)

		/**
		 * @description 项目初始化
		 */
		const init = () => {
			socket.value = terminal.value.socketInfo()
			socket.value.send('cd /www/wwwroot\r\n')
			socket.value.send(`clear && ${cmd.value}\r\n`)
		}
		onMounted(() => {
			nextTick(() => {
				init()
			})
		})

		// 暴露方法给父组件
		expose({
			onCancel: () => {
				socket.value.close()
			},
		})

		// 返回渲染函数
		return () => (
			<div class="p-[1rem] bg-black h-full">
				<BtTerminal id="dockerTerminal" class="h-full" active ref={terminal} url="/webssh" host-info={{}} />
			</div>
		)
	},
})

/**
 * @description 获取数据库终端命令
 * @param {string} appname - 应用名称
 * @param {object} data - 应用数据
 */
export const openDatabaseTerminal = async (appname: string, data: any) => {
	const pawKey = ['redis_password', 'mysql_root_password', 'postgres_password']
	// 从appinfo中查找密码字段
	let password = ''
	for (const item of data.appinfo) {
		if (pawKey.includes(item.fieldKey)) {
			password = item.fieldValue
			break
		}
	}
	const ress: any = await useDataHandle({
		request: getDatabaseTerminalCmd({ appname, id: data.container_id, password }),
		loading: '正在获取数据库终端命令，请稍后...',
	})
	if (!ress.status) return Message.error('连接数据库失败')
	useDialog({
		component: () => ContainerTerminalDialog,
		title: `宝塔终端`,
		area: [80, 50],
		compData: {
			cmd: ress.msg,
		},
	})
}

export const getJumpAuth = (data: any) => {
	return data.host_ip === '0.0.0.0' && data.apptype !== 'Database' && data.apptype !== 'System'
}

export const openPortJump = (appData: any, port: number, type: string) => {
	if (appData.host_ip !== '0.0.0.0' || appData.apptype === 'Database' || appData.apptype === 'System') {
		Message.error('当前应用不支持IP+端口访问')
		return
	}
	window.open(`${type}://${appData.server_ip}:${port}`, '_blank', 'noopener,noreferrer')
}

/**
 * @description 点击图标事件
 */
export const onClickIcon = async (type: string, data: any) => {
	if (type === 'path') {
		const { router } = await import('@/router') // 路由
		const path = data.appinfo.filter((item: any) => {
			return item.fieldKey === 'app_path'
		})[0]?.fieldValue
		setCookie('Path', path)
		let loading = Message.load('正在跳转,请稍后...') // 加载
		// 进入安装目录
		router.push({ path: '/files' }) // 跳转路径
		loading.close() // 关闭加载
	}
}
/**
 * @description 打开Nginx视图
 * @param name 网站名称
 */
export const openNginxView = async (data: { site_id: string; site_name: string; site_addtime: string }) => {
	openSettingView({ id: data.site_id, name: data.site_name, addtime: data.site_addtime })
}

/**
 * @description 打开备份视图
 * @param {string} type 类型
 * @param {boolean} isInit 是否初始化 - 日志专用
 */
export const openOperateView = (data: any, type: 'back' | 'log' | 'password', isStatus?: boolean) => {
	if (isStatus && data.status !== 'initializing') return
	let isInit = false
	if (type === 'log' && data.status === 'initializing') isInit = true
	const typeData = {
		back: {
			component: () => import('./backup-view.vue'),
			area: 82,
			title: '应用备份',
			showFooter: false,
		},
		log: {
			component: () => import('./app-log.vue'),
			area: 88,
			title: '应用日志',
			showFooter: false,
		},
		password: {
			component: () => import('./update-password.vue'),
			area: 42,
			title: '修改mysql密码',
			showFooter: true,
		},
	}
	useDialog({
		title: typeData[type].title,
		area: typeData[type].area,
		compData: { ...data, isInit },
		component: typeData[type].component,
		showFooter: typeData[type].showFooter,
	})
}

/**
 * @description 操作状态
 */
export const handleOpearateStatus = async (emits: any, status: string, propsData: { service_name: string; appname: string }) => {
	let data: any = {
		rebuild: '重建',
		start: '启动',
		restart: '重启',
		stop: '停止',
	}
	await useConfirm({
		title: '提示',
		content: `确定要${data[status]}【${propsData.service_name}】吗?`,
		icon: 'warning-filled',
	})
	await useDataHandle({
		request: setAppStatus({
			service_name: propsData.service_name,
			status,
			app_name: propsData.appname,
		}),
		loading: '正在操作,请稍后...',
		message: true,
	})
	emits('refresh') //  刷新已安装列表
}

/**
 * @description 详情
 */
export const handleRemoverApp = async (emits: any, data: { appname: string; id: string }) => {
	await useConfirm({
		title: '提示',
		content: `确定要删除【${data.appname}】吗?`,
		icon: 'warning-filled',
		type: 'check',
		check: {
			content: '同时删除此应用的所有数据',
			onConfirm: async (status: boolean) => {
				await useDataHandle({
					request: removeApp({
						id: data.id,
						delete_data: Number(status),
					}),
					loading: '正在删除,请稍后...',
					message: true,
				})
				emits('refresh') //  刷新已安装列表
			},
		},
	})
}

/**
 * @description 打开域名
 */
export const openDomain = (uri: string) => window.open('http://' + uri, '_blank', 'noopener,noreferrer') // 打开网站

// 图片错误处理
export const imgError = ($event: any) => {
	if ($event.target.src.includes('icon_plug')) {
		$event.target.style.display = 'none'
		return
	}
	$event.target.src = '/static/img/soft_ico/icon_plug.svg'
}

// 安装应用
const compData = shallowRef<any>({})
export let formData = reactive<any>({
	version: '',
	showCompose: 'false',
	editcompose: '',
})

const getFormData = (appData: any) => {
	appData.field?.forEach((item: any) => {
		formData[item.attr] = item.default
		if (item.type === 'checkbox') {
			formData[item.attr] = Boolean(item.default)
		}
	})
	formData.service_name = `${appData.appname}_${getRandomPwd(4)}`
}

// export const formConfig = shallowRef(props.compData?.appData?.field)
export const useTemplateFormItems = (template: any, formDataRef: any) => {
	switch (template.type) {
		case 'password':
			return FormItemCustom(
				template.name,
				() => {
					return (
						<div class="flex flex-col items-start justify-center w-full">
							<BtInputIcon placeholder={`请输入${template.name}`} width="24rem" is-active v-model={formDataRef.value[template.attr]} icon="el-refresh" onInput={(val: string) => onInputEvent(template, val, formDataRef)} onIconClick={() => (formData[template.attr] = getRandomPwd(16))}></BtInputIcon>
						</div>
					)
				},
				template.attr,
				{ rules: {} }
			)
		case 'checkbox':
			return FormItemCustom(
				template.name,
				() => {
					return (
						<ElCheckbox v-model={formDataRef.value[template.attr]} label={template.name} class="!my-0">
							<span class="unit"> * {template.suffix} </span>
						</ElCheckbox>
					)
				},
				template.attr
			)
		case 'textarea':
			return FormTextarea(template.name, template.attr, {
				attrs: { placeholder: `请输入${template.name}`, autosize: { minRows: 1, maxRows: 15 }, class: '!w-[244px]', onInput: (val: string) => onInputEvent(template, val, formDataRef) },
				rules: [{ required: false, message: `请输入${template.name}`, trigger: ['change', 'blur'] }],
				slots: {
					unit: () => showSuffix(template),
				},
			})
		default:
			// 处理ace:xxx格式的情况
			if (typeof template.type === 'string' && template.type.startsWith('ace:')) {
				// 获取语言模式
				const langMode = template.type.split(':')[1] || ''
				// 设置编辑器配置，如果没有指定语言或语言不支持，默认使用text模式
				const customEditorConfig = {
					...editorConfig,
					mode: langMode ? `ace/mode/${langMode}` : 'ace/mode/text',
				}

				return FormItemCustom(
					template.name,
					() => {
						return (
							<div class="flex flex-col items-start justify-center w-full">
								<BtEditor key="editer1" class="!w-[500px] h-[30rem]" v-model={formDataRef.value[template.attr]} editorOption={customEditorConfig} />
								{template.suffix ? <span class="text-secondary text-[1.2rem] leading-[1] mt-[1rem]" innerHTML={` * ${template.suffix}`}></span> : <span></span>}
							</div>
						)
					},
					template.attr
				)
			}

			return FormInput(template.name, template.attr, {
				attrs: { class: '!w-[244px] relative;', placeholder: `请输入${template.name}` },
				slots: {
					unit: () => showSuffix(template),
				},
				rules: [{ required: false, message: `请输入${template.name}`, trigger: 'blur' }],
			})
	}
}
export const useDependFormItems = (template: any, formDataRef: any, popupClose: AnyFunction) => {
	return FormItemCustom(
		template.appTypeCN,
		() => {
			return (
				<div>
					{dependData.value[isArrayName(template)]?.appname && (
						<ElSelect class="!w-[12rem]" v-model={dependData.value['form'][template.apptype]}>
							{template.appname.map((name: any) => (
								<ElOption label={name} value={name}></ElOption>
							))}
						</ElSelect>
					)}
					<ElSelect v-model={dependData.value[currentName(template)].service_name} placeholder={dependData.value[currentName(template)].option.length == 0 ? '未安装' : '请选择'} disabled={dependData.value[currentName(template)].option.length == 0} class="ml-[0.8rem] !w-[16rem]">
						{dependData.value[currentName(template)].option.map((dep: any) => (
							<ElOption label={dep.service_name + ' ' + dep.version} value={dep.service_name}></ElOption>
						))}
					</ElSelect>
					<span class="ml-[2rem] text-small leading-[2.2rem] text-tertiary">{template.appDesc}</span>
					{dependData.value[currentName(template)].option.length == 0 && (
						<div>
							<span class="leading-[1] bt-link !text-small" onClick={() => installDepends({ name: currentName(template), type: template.apptype }, popupClose)}>
								点击安装
							</span>
						</div>
					)}
				</div>
			)
		}
		// template.attr,
		// { rules: {} }
	)
}

export const versionList = shallowRef<any>([]) // 版本列表
export const dependData = ref<any>({}) // 依赖数据

const isArrayName = ({ appname }: any) => (isString(appname) ? appname : appname[0]) // 判断是否为数组
const currentName = (item: any) => dependData.value['form'][item.apptype] // 当前依赖名称

/**
 * @description 输入事件
 */
const onInputEvent = (item: any, val: any, formDataRef: Ref<any>) => {
	if (item.attr === 'domain' && val !== '') {
		formDataRef.value.allow_access = false
	}
	// vm.$forceUpdate()
}

/**
 * @description 显示后缀
 * @param item
 */
const showSuffix = (item: any) => {
	const suffixClass = `whitespace-nowrap absolute left-[250px] top-0 text-secondary`
	if (item.attr === 'cpus') return <span class={suffixClass}>{` * ${item.suffix}${deployMenuData.value.maximum_cpu}`}</span>
	if (item.attr === 'memory_limit') return <span class={suffixClass}>{` * ${item.suffix}${deployMenuData.value.maximum_memory}`}</span>
	return item.suffix ? <span class={suffixClass} innerHTML={` * ${item.suffix}`}></span> : <span></span>
}

/**
 * @description 安装依赖
 * @param {string} name - 依赖
 */
export const installDepends = (depend: any, popupClose: AnyFunction) => {
	compData.value.openDependInstall(depend)
	popupClose()
}

/**
 * @description 分割版本号字符串
 * @param {string} version - 版本号字符串
 * @returns {object|null} - 包含x和y.z或x和y的对象，或null表示格式不正确
 */
const splitVersion = (version: string) => {
	if (!(version.indexOf('.') > -1)) return false
	const parts = version.split('.')
	if (parts.length === 3) {
		return {
			x: parts[0],
			yz: `${parts[1]}.${parts[2]}`,
		}
	} else if (parts.length === 2) {
		return {
			x: parts[0],
			yz: parts[1],
		}
	}

	return false
}

/**
 * @description 处理参数
 */
const handleParams = () => {
	try {
		if (formData.domain && !checkDomain(formData.domain)) {
			// 检验域名
			Message.error('域名格式不正确')
			return
		}
		let params = {
			...formData,
			...(compData.value.appData.appid == -1 ? { appid: Number(compData.value.appData.appid) } : {}),
			app_name: compData.value.appData.appname,
			disable_domain: Number(!formData.domain),
			allow_access: Number(formData.allow_access),
			...(formData.showCompose === 'true' ? { compose_file: formData.editcompose } : {}),
		}
		// 版本号处理-截取对应版本号
		if (splitVersion(formData.version)) {
			params.m_version = (splitVersion(formData.version) as { x: string; yz: string }).x
			params.s_version = (splitVersion(formData.version) as { x: string; yz: string }).yz
		} else {
			params.m_version = formData.version
			params.s_version = ''
		}
		// 依赖项处理
		if (compData.value.appData.depend) {
			params.depend_app = []
			// 从依赖项表单中获取选中的依赖项
			Object.keys(dependData.value['form']).forEach((key: string) => {
				const depend = dependData.value['form'][key]
				// 查询依赖项的数据并填充
				Object.keys(dependData.value).forEach((dep: string) => {
					if (depend === dep) {
						// 未选择必须依赖项
						if (!dependData.value[dep].service_name) {
							Message.error('未选择必须依赖项')
							throw new Error('未选择必须依赖项')
						}
						params.depend_app.push({
							appname: dependData.value[dep].appname,
							service_name: dependData.value[dep].service_name,
						})
					}
				})
			})
			params.depend_app = JSON.stringify(params.depend_app)
		}
		delete params.showCompose

		// 简化版循环 后续优化可用
		// for (const key in dependData.value['form']) {
		// 		const depend = dependData.value['form'][key]
		// 		const depData = dependData.value[depend]
		// 		if (depData && !depData.service_name) {
		// 			Message.error('未选择必须依赖项')
		// 			throw new Error('未选择必须依赖项')
		// 		}
		// 		if (depData) {
		// 			params.depend_app.push({
		// 				appname: depData.appname,
		// 				service_name: depData.service_name,
		// 			})
		// 		}
		// 	}
		return params
	} catch (error) {}
}

/**
 * @description 确认提交
 */
export const installSoft = async (close: any) => {
	// 参数处理
	const params = await handleParams()
	if (!params) return
	useDataHandle({
		loading: '正在安装...',
		request: installApp(params),
		message: true,
		success: (res: any) => {
			// 跳转到安装列表
			if (res.status) {
				deployMenuData.value.app_type = 'installed'
				close()
			}
		},
	})
}

/**
 * @description 初始化版本
 */
export const initVersion = () => {
	versionList.value = []
	compData.value.appData?.appversion?.forEach((item: any) => {
		if (item.s_version.length) {
			// 有子版本
			item.s_version.forEach((v: any) => {
				versionList.value.push({
					label: item.m_version + '.' + v,
					value: item.m_version + '.' + v,
				})
			})
		} else {
			// 无子版本
			versionList.value.push({
				label: item.m_version,
				value: item.m_version,
			})
		}
	})
	formData.version = versionList.value[0]?.value
}

/**
 * @description 初始化依赖
 */
export const initDepend = async (props: any) => {
	let params: any = [] // 依赖参数，请求具体依赖子项需要用到
	// 初始化依赖表单
	dependData.value['form'] = {}
	compData.value = props
	getFormData(props.appData)
	props.appData.depend?.forEach((item: any) => (dependData.value['form'][item.apptype] = ''))
	// 初始化依赖选项
	props.appData.depend?.forEach((item: any) => {
		item.appname.forEach((name: any, index: number) => {
			!index && (dependData.value['form'][item.apptype] = name) // 默认选中第一个
			dependData.value[name] = {
				appname: name,
				apptype: item.apptype,
				version: '',
				service_name: '',
				option: [],
			}
			params.push({ app_name: name, app_type: item.apptype })
		})
	})
	// if (params.length === 0) return
	useDataHandle({
		request: getDependenceApps({ depend_app: JSON.stringify(params) }),
		data: { data: Array },
		success: (res: any) => {
			res.data?.forEach((item: any, index: number) => {
				dependData.value[item.appname].service_name = item.installed[0]?.service_name
				dependData.value[item.appname].option = item.installed || []
			})
		},
	})
}

export const addSoftUnmountedHandle = () => {
	compData.value = {}
	formData = reactive<any>({
		version: '',
		showCompose: 'false',
		editcompose: '',
	})
	versionList.value = []
	dependData.value = {}
}

// 应用日志

let useLogSocket: Socket | null = null
let logArr: string[] = [] // 日志数组
let logCompData: any = {} // 日志组件数据
export const logTabActive = ref('run') // 当前tab
export const logContent = shallowRef('') // 日志内容

/**
 * @description 创建websocket
 */
const createWebSocket = () => {
	useLogSocket = createSocket({
		route: '/sock_shell',
		onMessage: onWSReceive,
	})
	// useSocket?.send({ 'x-http-token': window.vite_public_request_token })
	useLogSocket?.send('tail -f ' + logCompData.appinfo.filter((item: any) => item.fieldKey === 'installed_log')[0]?.fieldValue)
}

/**
 * @description 消息接收检测和输出
 * @param {MessageEvent} e 对象
 */
const onWSReceive = (ws: WebSocket, e: MessageEvent) => {
	try {
		const data = e.data
		logArr.push(data)
		// 如果队列长度超过最大长度，删除多余的消息
		if (logArr.length > 50) {
			logContent.value = logArr?.slice(logArr.length - 50).join(' ')
		} else {
			logContent.value = logArr?.join(' ')
		}
		if (data.includes('bt_successful') || data.includes('bt_failed')) {
			useLogSocket?.close()
		}
	} catch (error) {
		console.log(error)
		useLogSocket?.close()
	}
}

/**
 * @description 切换tab
 */
export const handleToggleTab = (name: any) => {
	logContent.value = ''
	logArr = []
	if (name === 'run') {
		getRunLog()
	} else {
		getInstallLog()
	}
}

export const getFullLogInfo = () => {
	if (logTabActive.value === 'run') {
		getRunLog()
	} else {
		getInstallLog()
	}
}

/**
 * @description 获取运行日志
 */
const getRunLog = async () => {
	useDataHandle({
		request: getAppRunLog({ service_name: logCompData.service_name, app_name: logCompData.appname }),
		success: (res: any) => {
			logContent.value = res.data.data
		},
	})
}

export const initData = (props: any) => {
	logCompData = props
	if (logCompData.isInit) {
		logTabActive.value = 'install'
		getInstallLog()
	} else {
		getRunLog()
	}
}

/**
 * @description 获取安装日志
 */
const getInstallLog = async () => {
	// 若为初始化日志，则使用websocket
	if (logCompData.isInit) {
		createWebSocket()
		return
	}
	useDataHandle({
		request: getAppInstallLog({ service_name: logCompData.service_name }),
		success: (res: any) => {
			logContent.value = res.data.data || ''
		},
	})
}

export const logUnmountedHandle = () => {
	useLogSocket?.close()
	useLogSocket = null
	logArr = []
	logCompData = {}
	logTabActive.value = 'run'
	logContent.value = ''
}

// 应用更新
export const updateForm = reactive({
	version: '',
	backup: false, // 是否备份
	pull: false, // 是否拉取镜像
	id: '',
})
export const updateVersionList = shallowRef<any>([]) // 版本列表
/**
 * @description 获取版本数据
 */
export const getVersionData = async (props: any) => {
	updateForm.id = props.id
	await useDataHandle({
		request: getUpdateVersions({ id: updateForm.id }),
		data: { data: [Array, updateVersionList] },
		success: (res: any) => {
			updateForm.version = res.data[0].version
		},
	})
}

/**
 * @description 确认更新
 */
export const updateConfirm = async (close: any) => {
	let params = {
		id: updateForm.id,
		m_version: updateForm.version.split('.')[0],
		s_version: `${updateForm.version.split('.')[1]}.${updateForm.version.split('.')[2]}`,
		backup: updateForm.backup,
		pull: updateForm.pull,
	}
	await useDataHandle({
		request: updateApp(params),
		loading: '正在更新,请稍后...',
		message: true,
	})
	isRefreshInstallList.value = true
	close()
}

// 销毁
export const updateUnmountedHandle = () => {
	updateForm.version = ''
	updateForm.backup = false
	updateForm.pull = false
	updateForm.id = ''
	updateVersionList.value = []
}

/**
 * @description 获取compose文件
 */
export const getComposeFileEbent = (val: any, formDataRef: any, name: string, appid: number) => {
	if (val === 'true' && formDataRef.value['editcompose'] === '') {
		useDataHandle({
			request: getAppComposeFile({ app_name: name, gpu: typeof formDataRef.value.gpu === 'boolean', appid }),
			success: (res: any) => {
				formDataRef.value['editcompose'] = res.data.data
			},
		})
	}
}

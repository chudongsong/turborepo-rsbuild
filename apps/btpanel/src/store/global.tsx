import { getAlarmModule, getAlarmTaskList, getAuthState as getAuthStateApi, getEnterpriseConfig, getPublicConfig, getSenderAlarmList, getTaskCount, getTaskList, tencentLogin, getUserInfo as getUserInfoApi, getUnbindCount } from '@/api/global'
import { router } from '@router/index'
import { routes } from '@/router/hooks/roles'
import { formatTime, isArray, isNull, isObject, isString } from '@utils/index'
import { defineStore, storeToRefs } from 'pinia'
import { useDataHandle } from '@/hooks/tools'
import type { GlobalTheme } from '@/types/theme'

/**
 * @description 全局数据
 */
export const GLOBAL_STORE = defineStore(
	'GLOBAL_STORE',
	() => {
		const routerActive = ref('/') // 路由是否激活
		const routerName = ref('') // 路由名称
		const routesMenu = ref([]) // 菜单路由
		const mainWidth = ref(0) // 主体宽度
		const mainHeight = ref(0) // 主体高度
		const iframezIndex = ref(997) // iframe层级
		const iframeActive = ref('') // iframe激活的路由
		const isCompatible = ref(false) // 是否兼容
		const robserver = ref() // 观察者监听
		const layoutBody = ref<HTMLElement>() // 是否显示布局ref
		const isRefreshMenu = ref(false) // 是否刷新菜单
		const isRefreshSoftList = ref(false) // 是否刷新软件列表
		const isUpdatePayment = ref(false) // 是否更新支付
		const installInfo = ref() // 安装弹窗
		const enterpriseRec = ref(true) // 企业版推荐
		const forceLtd = ref(false) // 强制企业版
		const aliyunEcsLtd = ref(false) // 阿里云ecs企业版
		const aliyunEcsFailed = ref(false) // 阿里云ecs认证失败

		const isHideAd = ref(true) // 是否隐藏广告

		const globalTheme = ref<GlobalTheme>(window.vite_public_panel_theme)

		const scheme = useLocalStorage('color-scheme', window.vite_public_panel_theme.theme.preset || 'light')

		// 菜单栏控制
		const menuControl = reactive({
			collapse: sessionStorage.getItem('MENU-COLLAPSE') === 'true', // 菜单是否折叠
			collapseAuto: false, // 菜单是否自动折叠
			collapseLock: false, // 菜单是否锁定
			mouserover: false, // 菜单是否鼠标移入
			menuName: '', // 菜单项名称
			menuMousemove: false, // 菜单项是否鼠标移入
			menuMouseleave: false, // 菜单项是否鼠标移出
		}) // 菜单布局

		// 授权和支付
		const payment = reactive({
			bindUser: '', // 绑定用户
			authType: 'free', // 授权类型，默认为免费版
			recommendAuth: 'ltd', // 推荐授权类型
			voucherOpenTime: 0, // 优惠券开启时间
			newUserVoucherOpenTime: 0, // 新用户优惠券开启时间
			isGetCoupon: false, // 是否获取优惠券
			authExpirationTime: -1, // 授权到期时间，-1未购买，0永久授权，其他为时间戳
			isShowCoupon: false, // 是否显示临时优惠券
			noExceedLimit: false, // 是否企业版领取上限
			userGive: false, // 是否已经用户赠送
		})

		// 面板
		const panel = reactive({
			noticeIgnore: {
				https: true, // 是否忽略https通知
				port: true, // 是否忽略端口通知
			}, // 通知忽略
			port: 0, // 端口
			initInstall: true, // 是否初始化安装
			isDebug: false, // 是否开启调试
			isFileRecycle: false, // 是否开启文件回收站
			isDbRecycle: false, // 是否开启数据回收站
			isShowCustomer: false, // 是否显示客服
			sidebarTitle: '', // 如果为空则显示服务器IP
			msgBoxTaskCount: 0, // 消息盒子数量
			panelNps: false, // NPS调查
			sitePath: '', // 默认路径
			backupPath: '', // 备份路径
			logsPath: '', // 日志路径
			migration: false, // 是否开启迁移
		})

		// 更新推送
		const updatePush = reactive({
			modulePush: [], // 模块推送
			updatePush: false, // 更新推送
			updateTaskId: '', // 更新告警任务ID
		})

		// 特殊版本
		const specialVersion = reactive({
			type: '', // 特殊版本类型 tencent、alibaba、huawei、aws、azure、google
			info: {}, // 特殊版本数据
		})

		const task = reactive<{ list: AnyObject; total: number }>({
			list: [], // 任务列表
			total: 0, // 任务总数
		}) // 任务

		// 插件
		const plugin = reactive({
			webserver: '', // web服务器
			web: { setup: false, status: false, version: '', type: '' }, // web服务器
			mysql: {
				setup: false,
				status: false,
				version: '',
			}, // mysql
			ftp: {
				setup: false,
				status: false,
				version: '',
				port: 0,
			}, // ftp
			php: [], // php
			phpmyadmin: {
				setup: false,
				status: false,
				version: '',
			}, // phpmyadmin
			memcached: {
				setup: false,
				status: false,
				version: '',
			}, // memcached
			redis: {
				setup: false,
				status: false,
				version: '',
			}, // redis
			tomcat: {
				setup: false,
				status: false,
				version: '',
			}, // tomcat
			total: false,
		})

		// 告警推送配置
		const push = reactive({
			template: [], // 模板
			alarmPopupData: [], // 告警数据
			config: [], // 推送配置
			old: [], // 旧版推送配置
			info: [], // 推送信息
			checkedLoad: false, // 告警方式复选框加载状态
		})

		// 插件信息
		const pluginInfo = reactive<any>({
			visible: false, // 是否显示插件兼容视图
			id: '', // 插件ID
			name: '', // 插件名称
			built: false, // 是否已内部构建插件
			init: false, // 是否初始化
			callback: null, // 回调函数
		}) // 插件信息

		// 面板版本
		const panelVersion = ref(window.vite_public_version.indexOf('10.') > -1 ? `${window.vite_public_version}` : window.vite_public_version)

		// 标题
		const title = ref(window.vite_public_title)

		// IP信息
		const serverIp = ref(window.vite_public_ip)

		// 更新插件检查
		const updatePluginCheck = ref({
			status: false, // 是否处于更新插件检查状态
			callback: null as any, // 回调函数
		})

		// 侧边栏logo
		const menuLogo = computed(() => {
			const list = ['/static/icons/logo-white.svg', '/static/icons/logo-green.svg']
			if (list.includes(globalTheme.value.logo?.image)) {
				if (globalTheme.value.theme?.view === 'white') {
					return '/static/icons/logo-green.svg'
				}
				if (globalTheme.value.theme?.view === 'default') {
					return '/static/icons/logo-white.svg'
				}
			}
			return globalTheme.value.logo?.image || ''
		})

		// 企业版推荐
		// const enterpriseRec = computed(() => payment.authType === 'ltd')

		/**
		 * @description 折叠菜单图标样式
		 */
		const menuControlIcon = computed((): boolean => menuControl.collapse)

		/**
		 * @description 是否购买
		 */
		const authStatus = computed((): boolean => payment.authExpirationTime !== -1)

		/**
		 * @description 授权类型标题
		 * @returns {string}
		 */
		const authTypeTitle = computed((): string => {
			const authTitles: Record<string, string> = { pro: '专业版', ltd: '企业版', free: '正式版' }
			return authTitles[payment.authType] || '正式版'
		})

		/**
		 * @description 授权格式化授权时间
		 * @returns {string} 格式化授权时间
		 */
		const authExpirationTime = computed((): string => {
			if (payment.authExpirationTime === 0) return '永久授权'
			return formatTime(payment.authExpirationTime, 'yyyy-MM-dd')
		})

		/**
		 * @description 授权剩余天数
		 * @returns {number}
		 */
		const authRemainingDays = computed(() => {
			const newTime = new Date().getTime() / 1000
			const time = parseInt(`${payment.authExpirationTime - newTime}`, 10)
			return (time / 86400).toFixed(0) as unknown as number
		})

		/**
		 * @description 布局主体样式
		 */
		const layoutBodyStyle = computed(() => {
			return menuControl.collapse || menuControl.mouserover ? 'pl-[6rem]' : 'pl-[18rem]'
		})

		/**
		 * @description 布局侧边栏样式
		 */
		const layoutSidebarStyle = computed(() => {
			return `${menuControl.mouserover ? 'box-shadow ' : ''}${menuControl.collapse ? '!w-[6rem]' : '!w-[18rem]'}`
		})

		/**
		 * @description 消息盒子任务数量样式
		 */
		const messageNumberStyle = computed(() => {
			return !menuControl.collapse ? 'message-number' : 'message-shrink-number'
		})

		/**
		 * @description 消息盒子IP长度
		 */
		const messageIpNumberLength = computed(() => {
			if (panel.sidebarTitle) return panel.sidebarTitle.length
			return serverIp.value.replace(/\./g, '').length
		})

		/**
		 * @description 禁用页面
		 * @returns {boolean}
		 */
		const disableSidebar = computed(() => ['/modify_password'].includes(router.currentRoute.value.path)) // 禁用菜单

		/**
		 * @description 切换菜单栏折叠状态
		 */
		const cutCollapseView = () => {
			if (menuControl.mouserover) {
				menuControl.collapse = false // 取消角度激活，防止触发移入事件
				menuControl.mouserover = false // 取消角度激活，防止触发移入事件
			} else {
				menuControl.collapse = !menuControl.collapse
			}
			sessionStorage.setItem('MENU-COLLAPSE', menuControl.collapse.toString()) // 保存菜单折叠状态
		}

		/**
		 * @description 菜单折叠状态下移入
		 */
		const menuCollapseMouseenter = () => {
			// 鼠标没有移入 && 当前处于折叠状态
			if (!menuControl.mouserover && menuControl.collapse) {
				menuControl.mouserover = true
				menuControl.collapse = false // 临时取消折叠
			}
		}

		/**
		 * @description 菜单折叠状态下移出
		 */
		const menuCollapseMouseleave = () => {
			// 当前处于鼠标移入激活状态
			if (menuControl.collapseLock) return // 菜单折叠锁定状态
			if (menuControl.mouserover) {
				menuControl.mouserover = false
				menuControl.collapse = true
			}
		}

		/**
		 * @description 切换菜单路由
		 * @param {string} path 路径
		 * @param {number} index 索引
		 */
		const cutMenuRouter = async (path: string): Promise<void> => {
			if (disableSidebar.value) return
			const pathNew = path.replace(/^\/*/, '')
			const localPath = localStorage.getItem(`${pathNew.toUpperCase()}_ROUTER`) || ''
			const modelRouter = routes.find(item => item.path === path) as AnyObject
			// 判断是否有子路由
			if (modelRouter.children) {
				// 判断是否有子路由
				const childRoute = modelRouter.children.find((child: AnyObject) => child.name === localPath)
				if (childRoute && localPath) {
					router.push({ name: localPath })
					return
				}
			}
			localStorage.removeItem(`${pathNew.toUpperCase()}_ROUTER`)
			router.push({ path: modelRouter.children ? `${path}/${modelRouter.children[0].path}` : path })
		}

		/**
		 * @description: 获取消息盒子任务数量
		 * @returns {Promise<void>}
		 */
		const getMsgBoxTaskCount = async (): Promise<void> => {
			try {
				const { data } = await getTaskCount()
				panel.msgBoxTaskCount = data || 0
			} catch (err) {
				console.error(err)
			}
		}

		/**
		 * @description 获取授权状态
		 * @returns {Promise<void>}
		 */
		const getAuthState = async (): Promise<void> => {
			const { data } = await getAuthStateApi()
			setAuthState(data)
		}

		/**
		 * @description 设置授权状态
		 * @param {any[]} data 授权状态数据
		 */
		const setAuthState = (data: number[]) => {
			if (!isArray(data)) return
			const [, pro, ltd] = data as number[]
			const autoList = pro > -1 ? ['pro', pro] : ltd > -1 ? ['ltd', ltd] : ['free', ltd]
			payment.authType = autoList[0] as string
			payment.authExpirationTime = autoList[1] as number
		}

		/**
		 * @description 重置授权状态
		 */
		const resetAuthState = () => {
			payment.authType = 'free'
			payment.authExpirationTime = -1
		}

		/**
		 * @description 设置实时任务列表
		 * @param {any[]} data 实时任务列表数据
		 * @returns {void}
		 */
		const setRealTimeTaskList = (data: AnyObject): void => {
			if (!isArray(data.task_list)) return
			task.total = data.length
			task.list = data || []
		}

		/**
		 * @description 获取实时任务列表
		 * @returns {Promise<void>}
		 */
		const getRealTimeTaskList = async () => {
			try {
				const { data } = await getTaskList()
				setRealTimeTaskList(data)
			} catch (err) {
				console.error(err)
			}
		}

		/**
		 * @description 设置软件安装信息
		 */
		const setSoftSetup = (data: { [key: string]: any }) => {
			const { web, mysql, memcached, php, phpmyadmin, redis, tomcat, total } = data
			plugin.web = web
			plugin.mysql = mysql
			plugin.ftp = { ...plugin.ftp, ...data['pure-ftpd'] }
			plugin.memcached = memcached
			plugin.php = php
			plugin.phpmyadmin = phpmyadmin
			plugin.redis = redis
			plugin.tomcat = tomcat
			plugin.total = total
		}

		/**
		 * @description 设置基础信息
		 * @param {any} data 基础信息数据
		 */
		const setBasicInfo = (data: AnyObject) => {
			const {
				debug,
				// install_ltd: installLtd,
				recycle_bin: isFileRecycle,
				recycle_db_bin: isDbRecycle,
				show_workorder: isShowCustomer,
				left_title: sidebarTitle,
				user_info: {
					data: { username: bindUser },
					status: bindUserStatus,
				},
				isSetup,
				panel: { port },
				sites_path: sitePath,
				backup_path: backupPath,
				webserver: webServerType,
				notice_risk_ignore: noticeIgnore,
				// exp_ltd: expLtd,
				ftpPort,
				migration,
			} = data

			payment.bindUser = bindUserStatus ? bindUser : ''
			plugin.webserver = webServerType
			plugin.total = data.total
			plugin.ftp.port = ftpPort

			Object.assign(panel, {
				noticeIgnore,
				initInstall: isSetup,
				isShowCustomer,
				isFileRecycle,
				isDbRecycle,
				sidebarTitle,
				port: Number(port),
				isDebug: debug,
				sitePath,
				backupPath,
				migration,
			})
		}
		/**
		 * @description 设置企业版配置
		 * @param {string} data 数据
		 *
		 */
		const setLtdConfig = (data: AnyObject) => {
			const { exp_ltd: expLtd, install_ltd: installLtd } = data
			// 企业版特别版本
			forceLtd.value = installLtd // 是否强制企业版
			payment.noExceedLimit = expLtd.no_exceed_limit // 是否企业版领取上限
			payment.userGive = expLtd.user_give // 是否已经用户赠送
		}

		/**
		 * @description 获取更新推送信息
		 * @param {any} data 更新推送信息
		 * @returns {Promise<void>}
		 */
		const getUpdatePushInfo = async () => {
			try {
				const {
					data: { data },
					status,
				} = await getAlarmTaskList()
				if (status) {
					const task = data.find((item: { keyword: string }) => item.keyword === 'panel_update')
					updatePush.modulePush = task ? task.sender : []
					updatePush.updatePush = task ? task.status : false
					updatePush.updateTaskId = task ? task.id : ''
				}
			} catch (err) {
				console.log(err, 'getUpdatePushInfo')
			}
		}

		/**
		 * @description 获取告警列表
		 * @returns {Promise<Array<AnyObject>>}
		 */
		const getAlarmData = async (): Promise<Array<AnyObject>> => {
			try {
				const {
					data: { data },
				} = await getAlarmTaskList()
				push.alarmPopupData = data
				return data
			} catch (err) {
				console.log(err)
				return []
			}
		}

		/**
		 * @description: 获取告警通知方式
		 */
		const getSenderAlarmListInfo = async (refresh?: boolean) => {
			try {
				push.checkedLoad = true
				const params = { refresh: Number(refresh) }
				const { data: res } = await getSenderAlarmList(params)
				push.config = res.data || []
				push.checkedLoad = false
			} catch (err) {
				console.log(err)
			} finally {
				push.checkedLoad = false
			}
		}

		/**
		 * @description 获取旧版告警通知方式
		 */
		const getOldSenderAlarmListInfo = async () => {
			try {
				const { data: res } = await getAlarmModule()
				push.old = res || {}
			} catch (err) {
				console.log(err)
			}
		}

		/**
		 * @description iframe鼠标移入事件
		 */
		const mountMessage = () => {
			// 监听插件页面发送的消息
			window.addEventListener('message', event => {
				if (event.data === 'showMainView') {
					localStorage.setItem('showMainView', JSON.stringify(event.data))
					iframezIndex.value = 996
				}
				if (isString(event.data) && event.data.indexOf('refreshMain') !== -1) {
					localStorage.setItem('refreshMain', JSON.stringify(event.data))
					if (event.data === 'refreshMain') {
						window.location.reload()
					} else {
						window.location.href = event.data.split('::')[1].replace('_ifame', '')
					}
				}
			})
		}

		/**
		 * @description 获取全局信息配置
		 * @returns {Promise<boolean | AnyObject | undefined>}
		 */
		const getGlobalInfo = useThrottleFn(async (): Promise<boolean | AnyObject | undefined> => {
			try {
				// 获取全局配置信息
				const { data } = await getPublicConfig()

				console.log('getGlobalInfo', data)
				if (!isObject(data) && isNull(data)) return false
				const { get_pd: authState, task_count: taskCount, aliyun_ecs_ltd: aliLtd, hide_ad: hideAd } = data
				isHideAd.value = !!hideAd // 设置是否隐藏广告
				aliyunEcsLtd.value = aliLtd // 设置是否为阿里云镜像企业版
				panel.msgBoxTaskCount = taskCount || 0 // 设置消息盒子任务数量
				sessionStorage.setItem('GlobalInfoTime', `${new Date().getTime()}`) // 设置授权状态
				setBasicInfo(data) // 设置基础信息
				setAuthState(authState) // 设置授权状态
				setRealTimeTaskList(data) // 设置实时任务列表
				setSoftSetup(data) // 设置软件安装信息
				const enterpriseInfo = localStorage.getItem('EnterpriseInfoTime') || ''
				const req = () =>
					getEnterpriseConfig().then(async ({ data }) => {
						setLtdConfig(data)
						localStorage.setItem('EnterpriseInfoTime', JSON.stringify({ time: new Date().getTime(), ...data })) // 设置授权状态
						if (data.aliyun_ecs_ltd) {
							const res: any = await useDataHandle({
								loading: '正在获取阿里云授权，请稍后...',
								request: tencentLogin({ client: 2 }),
								// message: true,
							})
							if (!res.status) aliyunEcsFailed.value = true
							// 若成功认证，刷新到首页
							if (res.status) window.location.reload()
						}
					})
				if (!enterpriseInfo) {
					req()
				} else {
					const info = JSON.parse(enterpriseInfo)
					if (Number(info.time) + 86400000 < new Date().getTime()) {
						req()
					} else {
						setLtdConfig(info) // 设置企业版配置
					}
				}
				return Promise.resolve(data)
			} catch (error) {
				console.log(error)
				return undefined
			}
		}, 1000)

		/**
		 * @description 消息盒子任务数量轮询
		 */
		const updateTaskCount = async () => {
			await getMsgBoxTaskCount()
			if (panel.msgBoxTaskCount > 0) setTimeout(updateTaskCount, 3000)
		}

		const getUserInfo = async () => {
			try {
				const {
					data: { username: bindUser },
					status: bindUserStatus,
				} = await getUserInfoApi()
				payment.bindUser = bindUserStatus ? bindUser : ''
			} catch (error) {
				console.log(error)
			}
		}

		/**
		 * @description 获取指定解绑产品次数
		 */
		const getUnbindNumber = async () => {
			const pidArr: Record<string, '100000011' | '100000032' | '100000068'> = { pro: '100000011', ltd: '100000032', dev: '100000068' }
			if (pidArr[payment.authType]) {
				try {
					const { data } = await getUnbindCount({ pid: pidArr[payment.authType as keyof typeof pidArr] })
					return data?.unbind_count || 0
				} catch (error) {
					return 0
				}
			}
			return 0
		}

		return {
			scheme,
			globalTheme,
			menuLogo,
			enterpriseRec,
			aliyunEcsLtd,
			aliyunEcsFailed,
			isHideAd,
			routerActive,
			routerName,
			routesMenu,
			isRefreshMenu,
			isRefreshSoftList,
			isUpdatePayment,
			mainWidth,
			mainHeight,
			iframezIndex,
			iframeActive,
			isCompatible,
			menuControl,
			menuControlIcon,
			payment,
			panel,
			specialVersion,
			plugin,
			push,
			task,
			updatePush,
			pluginInfo,
			panelVersion,
			title,
			serverIp,
			updatePluginCheck,
			authStatus,
			resetAuthState,
			authTypeTitle,
			authExpirationTime,
			authRemainingDays,
			robserver,
			layoutBody,
			layoutBodyStyle,
			layoutSidebarStyle,
			messageNumberStyle,
			messageIpNumberLength,
			disableSidebar,
			installInfo,
			forceLtd,
			cutCollapseView,
			menuCollapseMouseenter,
			menuCollapseMouseleave,
			getMsgBoxTaskCount,
			getAuthState,
			setAuthState,
			setSoftSetup,
			setBasicInfo,
			getUpdatePushInfo,
			getAlarmData,
			getSenderAlarmListInfo,
			getOldSenderAlarmListInfo,
			getGlobalInfo,
			getRealTimeTaskList,
			getUserInfo,
			updateTaskCount,
			cutMenuRouter,
			mountMessage,
			setLtdConfig,
			getUnbindNumber,
		}
	},
	{
		persist: {
			storage: sessionStorage,
			pick: ['payment'],
		},
	}
)

/**
 * @description 全局数据
 * @returns {Ref<Record<string, any>>}
 */
export const useGlobalStore = () => {
	const store = GLOBAL_STORE()
	const storeRefs = storeToRefs(store)
	return { ...store, ...storeRefs }
}

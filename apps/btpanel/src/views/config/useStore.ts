import { getMenuList } from '@/api/global'
import { useGlobalStore } from '@store/global'
import { useDataHandle } from '@hooks/tools'
import { defineStore, storeToRefs } from 'pinia'
import { isArray, isObject } from '@utils/index'
import { setPanelConfig, getPanelTheme, setPanelTheme } from '@/api/config'
import { RequestProps } from '@/hooks/tools/message/types'

// 全局状态
const useConfigStore = defineStore('CONFIG-STORE1', {
	// 类型问题 需要写interface
	state: (): any => ({
		tabActive: 'message', // 当前tab
		settingSearch: '', // 设置搜索
		openPortPopup: false, // 是否打开端口弹窗
		openSSLPopup: false, // 是否打开SSL弹窗
		isRefreshList: false, // 是否刷新列表

		panelConfig: {
			panelClose: false, // 关闭面板
			loginOrigin: false, // 登录归属信息显示
			listenIpv6: false, // 监听IPv6
			offlineMode: false, // 离线模式
			debugMode: false, // 开发者模式
			apiInterface: false, // API接口
			onlineService: false, // 在线客服
			improvement: false, // 用户体验改善计划
			webname: '', // 面板别名
			leftTitle: '', // 左侧菜单标题
			session_timeout: '1天', // 超时时间
			session_timeout_source: 86400, // 超时时间(秒)
			sites_path: '', // 默认建站目录
			backup_path: '', // 默认备份目录
			serverIp: '', // 服务器ip
			systemdate: '', // 服务器时间
			username: '', // 用户名
			account: '', // 账号
			menuHide: '无配置', // 面板菜单栏隐藏
			requestType: '', //BasicAuth认证11
			checkTwoStep: false, // 动态口令认证
			sslVerify: false, // 面板云端请求方式
			requestLine: '', // 面板云端请求线路
			panelNode: '--', // 面板云端通讯节点配置
			panelNodeId: 0, // 面板云端通讯节点配置id
		},

		safeConfig: {
			panelAlarm: false, // 面板安全告警
			panelSSl: false, // 面板SSL
			basicAuth: false, //  访问设备验证
			pawComplexity: false, // 密码复杂度验证
			uaAstrict: false, // UA限制
			domain: '', // 绑定域名
			limitip: '', // 授权IP
			port: 8888, // 端口
			admin_path: '/', // 安全入口
			statusCode: 0, // 未认证响应状态11
			pawExpireTime: '', // 密码过期时间
		},
		limitArea: {}, // 地区限制数据
	}),
	getters: {},
	actions: {
		/**
		 * @description 获取全局信息
		 */
		async getGlobalConfig() {
			const { getGlobalInfo } = useGlobalStore()
			const data = await getGlobalInfo()
			this.setConfig(data) // 设置配置
			this.setSafeConfig(data) // 设置安全配置
		},

		/**
		 * @description 获取配置信息
		 */
		async getConfigData() {
			await this.getGlobalConfig()
		},

		/**
		 * @description 获取菜单列表
		 */
		async getMenuListEvent() {
			const { data } = await getMenuList()
			if (isArray(data)) {
				// 以字符串形式存储菜单隐藏项
				this.panelConfig.menuHide = data
					.filter((item: any) => !item.show)
					.map((item: any) => item.title)
					.join('、')
			}
		},

		/**
		 * @description 获取UA限制信息
		 */
		async getLimitUaInfo() {
			// try {
			// 	uaTableData.value.loading = true
			// 	const { data } = await getLimitUa()
			// 	safeConfig.value.uaAstrict = data.status === '0' ? false : true
			// 	uaTableData.value.list = data.ua_list
			// } catch (error) {
			// 	console.log(error)
			// } finally {
			// 	uaTableData.value.loading = false
			// }
		},

		/**
		 * @description 设置配置
		 * @param data
		 */
		setConfig(data: AnyObject) {
			this.panelConfig.listenIpv6 = data.ipv6 === 'checked'
			this.panelConfig.offlineMode = data.is_local === 'checked'
			this.panelConfig.debugMode = data.debug === 'checked'
			this.panelConfig.apiInterface = data.api === 'checked'
			this.panelConfig.onlineService = data.show_workorder
			this.panelConfig.improvement = data.improvement
			this.panelConfig.loginOrigin = data.login_origin
			this.panelConfig.webname = data.webname || '宝塔Linux面板'
			this.panelConfig.leftTitle = data.left_title || ''
			this.panelConfig.session_timeout = data.session_timeout || '1天'
			this.panelConfig.session_timeout_source = data.session_timeout_source || 86400
			this.panelConfig.sites_path = data.sites_path || ''
			this.panelConfig.backup_path = data.backup_path || ''
			this.panelConfig.systemdate = data.systemdate || ''
			this.panelConfig.username = data.username || ''
			this.panelConfig.requestType = data.request_type || ''
			this.panelConfig.requestLine = data.request_iptype || ''

			const { panel, user_info: userinfo } = data
			if (isObject(panel)) this.panelConfig.serverIp = panel.address || ''
			if (isObject(userinfo)) this.panelConfig.account = userinfo.data.username
		},

		/**
		 * @description 设置安全配置
		 * @param data
		 */
		setSafeConfig(data: AnyObject) {
			const { panel, SSL } = data
			this.safeConfig.panelSSl = SSL || location.protocol.indexOf('https:') > -1
			this.safeConfig.basicAuth = data.basic_auth?.open || false
			this.safeConfig.statusCode = data.status_code || 404
			if (isObject(panel)) {
				this.safeConfig.domain = panel.domain || ''
				this.safeConfig.limitip = panel.limitip || ''
				this.safeConfig.port = panel.listen_port || ''
				this.safeConfig.admin_path = panel.admin_path || '/'
			}
		},

		/**
		 * @description 保存界面设置
		 * @param loadText
		 * @returns
		 */
		async savaPanelTheme(loadText: string) {
			const { globalTheme } = useGlobalStore()
			await useDataHandle({
				loading: loadText,
				message: true,
				request: setPanelTheme({ data: JSON.stringify(globalTheme.value) }),
			})
		},

		/**
		 * @description 获取界面设置
		 * @param loadText
		 * @returns
		 */
		async getPanelTheme() {
			const res = await useDataHandle({
				request: getPanelTheme(),
				success: (res: RequestProps) => {
					if (res.status) this.setPanelTheme(res?.data.data)
				},
			})
			return res
		},

		/**
		 * @description 设置界面配置
		 * @param data
		 */
		setPanelTheme(data: AnyObject) {
			const { globalTheme } = useGlobalStore()
			// 确保数据结构符合新的GlobalTheme接口
			if (data && typeof data === 'object') {
				globalTheme.value = {
					theme: data.theme || { dark: false, color: '#20a53a', view: 'default' },
					logo: data.logo || { image: '', favicon: '' },
					sidebar: data.sidebar || { dark: false, color: '#3c444d', opacity: 1 },
					interface: data.interface || {
						rounded: 'small',
						is_show_bg: false,
						bg_image: '',
						bg_image_opacity: 1,
						content_opacity: 1,
						shadow_color: '#000',
						shadow_opacity: 0.2,
					},
					home: data.home || { overview_view: 'default', overview_size: 14 },
					login: data.login || {
						logo: '',
						is_show_logo: false,
						bg_image: '',
						is_show_bg: false,
						bg_image_opacity: 1,
					},
					...data,
				}
			}
		},

		/**
		 * @description 保存配置
		 * @param loadText
		 * @param config
		 * @returns
		 */
		async saveConfig(loadText: string, config?: { session_timeout?: number; isReturn?: boolean }) {
			const sessionTimeout = config && config.session_timeout ? config.session_timeout : this.panelConfig.session_timeout_source
			const res = await useDataHandle({
				loading: loadText,
				message: true,
				request: setPanelConfig({
					webname: this.panelConfig.webname || '宝塔Linux面板',
					session_timeout: sessionTimeout || 86400,
					domain: this.safeConfig.domain,
					limitip: this.safeConfig.limitip,
					sites_path: this.panelConfig.sites_path,
					backup_path: this.panelConfig.backup_path,
					address: this.panelConfig.serverIp,
					systemdate: this.panelConfig.systemdate,
				}),
			})
			const isReturn = config && config.isReturn !== undefined ? config.isReturn : false
			if (isReturn) {
				return res
			} else {
				setTimeout(() => {
					window.location.reload()
				}, 1000)
			}
		},
	},
	persist: [{ storage: localStorage, paths: ['tabActive'] }],
})

/**
 * @description 获取软件商店状态管理
 * @returns
 */
const getConfigStore = () => {
	const configStore = useConfigStore()
	return { refs: storeToRefs(configStore), ...configStore }
}

export { getConfigStore }

export default useConfigStore

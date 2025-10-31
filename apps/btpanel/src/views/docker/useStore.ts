// import Vue from 'vue'
import { defineStore, storeToRefs } from 'pinia'
import { useDataHandle } from '@/hooks/tools'
import { getSetting, getURL, getDockerDetail } from '@/api/docker'
import { isEmpty } from '@/utils'

// 全局状态
const useDockerStore = defineStore('DOCKER-STORE', {
	state: (): any => ({
		// containerLogTab: '', // 容器日志活跃tab
		currentConDetail: {}, // 当前容器详情
		maxCPU: 0, // 最大CPU核心数
		maxMem: 0, // 最大内存可用数
		maxGpus: 0, // 最大GPU核心数
		loading: false, // 加载状态
		refreshWs: false, // 容器列表刷新websocket监听
		customLimit: {
			container: false,
			images: false,
			network: false,
			storage: false,
			warehouse: false,
		}, // 是否自定义列表显示条数
		deployMenuData: {
			app_type: 'all', // 应用类型
			maximum_cpu: '--', // 最大CPU核心数
			maximum_memory: '--', // 最大内存可用数
		}, // 部署菜单数据
		orchestrationData: {
			refreshList: false, // 刷新列表
			refreshItem: false, // 刷新项目
			loading: false, // 加载状态
			noRefresh: false, // 不刷新
			isEdit: false, // 是否编辑
			currentCompose: {
				name: '', // 当前编排名称
				path: '', // 当前编排路径
			}, // 当前编排
		}, // 编排数据

		cpuAndMemData: {}, // cpu和内存数据

		isRefreshTableList: false, // 是否刷新列表
		// ------------------------------------
		isRefreshAppList: false, // 是否刷新应用列表
		isRefreshInstallList: false, // 是否刷新安装列表
		isRefreshSiteList: false, // 是否刷新容器列表
		isRefreshTemplateList: false, // 是否刷新模板列表
		isRefreshNetworkList: false, // 是否刷新网络列表
		isRefreshStorageList: false, // 是否刷新存储卷列表
		isRefreshWarehouseList: false, // 是否刷新存储卷列表
		settingData: {
			dk_project_path: '', // 应用商店目录
			allow_update_install_path: false, // 是否允许更新应用商店目录
			service_status: false, //docker服务状态
			docker_installed: false, //docker是否安装
			docker_compose_installed: false, //docker-compose是否安装
			docker_compose_path: '/usr/bin/docker-compose', //docker-compose的路劲
			monitor_status: false, //监控是否开启
			monitor_save_date: 0, //监控保存天数
			url: '11', // 加速url
			options: [], // 加速源选项
			daemon_path: '/etc/docker/daemon.json', // 配置文件路径
			installing: 0, // 安装中
			ipv6: false, // 是否开启ipv6
			ipv6Address: '', // ipv6地址
			bad_registry: false, // 是否推荐加速url
			bad_registry_path: '', // 推荐加速url
			warehouse: '', // 私有仓库
			log_cutting: {
				status: false, // 是否开启日志切割
				file: 0, // 最大文件数
				size: 0, // 最大文件大小
			}, // 日志切割
			iptables: false, // 是否开启iptables
			live_restore: false, // 是否开启live_restore
			driver: '', // 驱动
			docker_compose_version: '', // docker-compose版本
			socket: '', // unix地址
			proxy: {
				status: false, // 是否开启代理
				http_proxy: '',
				https_proxy: '',
				no_proxy: '',
			}, // Docker代理设置
		}, // 设置数据
	}),
	actions: {
		refreshActiveTable() {
			this.isRefreshTableList = true
		},
		refreshSiteTable() {
			this.isRefreshSiteList = true
		},
		resetRefresh() {
			this.isRefreshTableList = false
		},

		/**
		 * @description 分割表格
		 * @returns {Promise<void>} void
		 */
		chunkArray(tableData: any): any[] {
			const result = []
			for (let i = 0; i < tableData.list.length; i += tableData.limit) {
				result.push(tableData.list.slice(i, i + tableData.limit))
			}
			return result
		},
		/**
		 * @description 获取容器详情
		 * @returns {Promise<void>} void
		 */
		async getCurrentCon(id: string): Promise<void> {
			await useDataHandle({
				request: getDockerDetail({ data: JSON.stringify({ id }) }),
				success: (res: any) => {
					if (res.status) {
						this.currentConDetail = res.data
					}
				},
			})
		},
		/**
		 * @description 获取docker设置
		 * @returns {Promise<void>} void
		 */
		async getSet(refresh?: boolean): Promise<void> {
			try {
				this.loading = true
				if (refresh !== false) {
					await useDataHandle({
						request: getSetting(),
						data: {
							dk_project_path: [String, (data: string) => (this.settingData.dk_project_path = data)],
							allow_update_install_path: [Boolean, (data: boolean) => (this.settingData.allow_update_install_path = data)],
							service_status: [Boolean, (data: boolean) => (this.settingData.service_status = data)],
							docker_installed: [Boolean, (data: boolean) => (this.settingData.docker_installed = data)],
							docker_compose_path: [String, (data: string) => (this.settingData.docker_compose_path = data)],
							docker_compose_installed: [Boolean, (data: boolean) => (this.settingData.docker_compose_installed = data)],
							monitor_status: [Boolean, (data: boolean) => (this.settingData.monitor_status = data)],
							monitor_save_date: [Number, (data: number) => (this.settingData.monitor_save_date = data)],
							daemon_path: [String, (data: string) => (this.settingData.daemon_path = data)],
							installing: [Number, (data: number) => (this.settingData.installing = data)],
							ipv6_status: [Boolean, (data: boolean) => (this.settingData.ipv6 = data)],
							ipv6_addr: [String, (data: string) => (this.settingData.ipv6Address = data)],
							bad_registry: [Boolean, (data: boolean) => (this.settingData.bad_registry = data)],
							bad_registry_path: [String, (data: string) => (this.settingData.bad_registry_path = data)],
							warehouse: [Array, (data: string[]) => (this.settingData.warehouse = data.join(','))],
							log_cutting: [Object, (data: any) => (this.settingData.log_cutting = isEmpty(data) ? { status: false, file: 0, size: 0 } : { size: data['max-size'].replace('m', ''), file: data['max-file'], status: true })],
							iptables: [Boolean, (data: boolean) => (this.settingData.iptables = data)],
							live_restore: [Boolean, (data: boolean) => (this.settingData.live_restore = data)],
							driver: [String, (data: string) => (this.settingData.driver = data.split('=')[1])],
							docker_compose_version: [String, (data: string) => (this.settingData.docker_compose_version = data)],
							socket: [String, (data: string) => (this.settingData.socket = data)],
							proxy: [
								Object,
								(data: any) =>
									(this.settingData.proxy = isEmpty(data)
										? {
												http_proxy: '',
												https_proxy: '',
												no_proxy: '',
												status: false,
										  }
										: { ...data, status: true }),
							],
						},
					})
				}
				await useDataHandle({
					request: getURL(),
					success: (res: AnyObject) => {
						const data = res.data
						if (data.registry_mirrors.length === 0) {
							this.settingData.url = '未设置加速URL'
						} else {
							this.settingData.url = data.registry_mirrors[0]
						}
						const arr: any[] = []
						Object.entries(data.com_reg_mirrors).forEach((item: any) => {
							arr.push({
								label: `${item[0]}(${item[1]})`,
								value: item[0],
							})
						})
						this.settingData.options = arr
					},
				})
				this.loading = false
			} catch (error) {
				this.loading = false
				console.log(error)
			}
		},
		/**
		 * @description 获取docker服务状态
		 * @returns {Promise<void>} void
		 */
		async getDockerState(): Promise<void> {
			try {
				const data = await useDataHandle({
					request: getSetting(),
					data: {
						dk_project_path: [String, (data: string) => (this.settingData.dk_project_path = data)],
						allow_update_install_path: [Boolean, (data: boolean) => (this.settingData.allow_update_install_path = data)],
						service_status: [Boolean, (data: boolean) => (this.settingData.service_status = data)],
						docker_installed: [Boolean, (data: boolean) => (this.settingData.docker_installed = data)],
						docker_compose_path: [String, (data: string) => (this.settingData.docker_compose_path = data)],
						docker_compose_installed: [Boolean, (data: boolean) => (this.settingData.docker_compose_installed = data)],
						monitor_status: [Boolean, (data: boolean) => (this.settingData.monitor_status = data)],
						monitor_save_date: [Number, (data: number) => (this.settingData.monitor_save_date = data)],
						daemon_path: [String, (data: string) => (this.settingData.daemon_path = data)],
						installing: [Number, (data: number) => (this.settingData.installing = data)],
						ipv6_status: [Boolean, (data: boolean) => (this.settingData.ipv6 = data)],
						ipv6_addr: [String, (data: string) => (this.settingData.ipv6Address = data)],
						bad_registry: [Boolean, (data: boolean) => (this.settingData.bad_registry = data)],
						bad_registry_path: [String, (data: string) => (this.settingData.bad_registry_path = data)],
						warehouse: [Array, (data: string[]) => (this.settingData.warehouse = data.join('\n'))],
						log_cutting: [Object, (data: any) => (this.settingData.log_cutting = isEmpty(data) ? { status: false, file: 0, size: 0 } : { size: data['max-size'].replace('m', ''), file: data['max-file'], status: true })],
						iptables: [Boolean, (data: boolean) => (this.settingData.iptables = data)],
						live_restore: [Boolean, (data: boolean) => (this.settingData.live_restore = data)],
						driver: [String, (data: string) => (this.settingData.driver = data.split('=')[1])],
						docker_compose_version: [String, (data: string) => (this.settingData.docker_compose_version = data)],
						socket: [String, (data: string) => (this.settingData.socket = data)],
						proxy: [
							Object,
							(data: any) =>
								(this.settingData.proxy = isEmpty(data)
									? {
											http_proxy: '',
											https_proxy: '',
											no_proxy: '',
											status: false,
									  }
									: { ...data, status: true }),
						],
					},
				})
				console.log(this.settingData.log_cutting)
			} catch (error) {
				console.log(error)
			}
		},
	},
	persist: {
		storage: sessionStorage,
		paths: ['settingData.service_status', 'settingData.docker_installed', 'settingData.docker_compose_installed'],
	},
})

/**
 * @description 获取Docker状态管理
 * @returns
 */
const getDockerStore = () => {
	const dockerStore = useDockerStore()
	return { refs: storeToRefs(dockerStore), ...dockerStore }
}

export default useDockerStore
export { getDockerStore }

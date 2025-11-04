import { defineStore, storeToRefs } from 'pinia'
import { getHomeResData, getOverview, getSystemInfo, updatePanel } from '@/api/global'
import { useGlobalStore } from '@store/global'
import { HomeStorePorps } from './types.d'
import { compareVersion } from '@utils/index'

/**
 * @description // 全局持久化状态管理
 */
const homeStore = defineStore('HOME-STORE', {
	state: (): HomeStorePorps => ({
		isRefreshData: 0, // 是否获取首页数据
		isRefreshOverview: false, // 是否刷新概览
		systemInfo: {
			name: '', // 系统名称
			simpleName: '', // 系统简称
		},
		panelInfo: {
			runningDays: 0, // 运行天数
			isBeta: false, // 是否是测试版
			isUpgrade: false, // 是否有新版本
			cloudBeta: false, // 云端是否有测试版
			betaInfo: null, // 云端测试版信息
			officialInfo: null, // 云端正式版信息
			grayscale: 1, // 灰度等级:0-1，0.2为20%的灰度，0.5为50%的灰度，1为正常发布
			isSetup: false, // 是否已安装套件
			isRestart: false, // 是否重启
		},

		recommendInstall: false, // 推荐安装
		// 磁盘,io等动态数据刷新时间
		refreshTime: 0,

		// 负载
		load: { one: 0, max: 0, five: 0, fifteen: 0 }, // 负载信息
		// cpu
		cpu: {
			occupy: '',
			framework: '',
			coresOccupy: [0, 0, 0],
			cpuNumber: 0,
			logicCores: 0,
			cores: 0,
			process: [0, 0],
		},
		// CPU详情
		cpuTimes: {},
		// 内存
		memory: {
			memRealUsed: 0, // 已使用内存
			memTotal: 0, // 总内存
			memFree: 0, // 空闲内存
			memShared: 0, // 共享内存
			memAvailable: 0, // 可用内存
			memBuffers: 0, // 缓冲区
			memCached: 0, // 缓存
			memNewRealUsed: '0', // 新的已使用内存
			memNewTotal: '0', // 新的总内存
			memNewRealUsedList: [], // 新的总内存列表
			memNewTotalList: [], // 新的已使用内存列表
		},
		// 状态表格信息数据
		specificResource: {
			cpuBaseInfo: {
				active_processes: 0,
				cpu_name: 'Common KVM processor * 2',
				load_avg: {},
				logical_cpu: 0,
				num_phys_cores: 0,
				physical_cpu: 0,
				total_processes: 0,
			},
			cpuProcess: [],
			memProcess: [],
		},
		// 磁盘列表
		disk: [],
		// 磁盘配额
		diskQuota: [],
		// 推荐软件
		recommendSoft: [],
		// 流量
		network: [],
		// 磁盘
		diskIo: [],
		// 磁盘使用情况，仅根目录
		diskUsage: [],
		// 概览模块显示列表
		overviewShowList: [],
	}),
	getters: {
		/**
		 * @description 面板版本类型
		 * @returns
		 */
		versionType(): string {
			return this.panelInfo.isBeta ? '测试版' : '正式版'
		},
		/**
		 * @description 获取系统图标
		 */
		systemIcon(): string {
			if (!this.systemInfo.name) return ''
			return this.systemInfo.name.split(' ')[0]?.toLowerCase()
		},
	},
	actions: {
		/**
		 * @description 获取全局信息
		 */
		async getHomeConfig() {
			const { getGlobalInfo } = useGlobalStore()
			const data = await getGlobalInfo()
			if (typeof data === 'object' && data) this.panelInfo.isSetup = data.isSetup
		},
		/**
		 * @description 获取系统信息
		 */
		async getSystemInfo() {
			try {
				const { data } = await getSystemInfo()
				this.isRefreshData = new Date().getTime()
				this.setSystemInfo(data)
			} catch (err) {
				console.log(err)
			}
		},

		/**
		 * @description 设置系统信息
		 * @param {any} data 系统信息数据
		 * @returns {void}
		 */
		setSystemInfo(data: any): void {
			const { disk: diskList, mem: memory, network, iostat: diskIo, cpu, installed: recommendInstall, cpu_times: cpuTimes, load, down, up, downPackets, upPackets, downTotal, upTotal, system, simple_system: simpleSystem, time: runningDays } = data
			const networkGroup = {
				// eslint-disable-next-line @typescript-eslint/naming-convention
				ALL: { down, up, downPackets, upPackets, downTotal, upTotal },
				...network,
			}
			const cpuData = {
				occupy: cpu[0],
				cores: cpu[1],
				coresOccupy: cpu[2],
				framework: cpu[3],
				logicCores: cpu[4],
				cpuNumber: cpu[5],
				process: [cpuTimes['活动进程数'], cpuTimes['总进程数']],
			}

			this.setDiskInfo(diskList) // 磁盘信息处理
			const time = Date.now() // 当前时间
			this.$patch({
				recommendInstall,
				memory,
				network: networkGroup,
				diskIo,
				cpu: cpuData,
				cpuTimes,
				load,
				refreshTime: time,
			})
			this.systemInfo.name = simpleSystem
			this.systemInfo.simpleName = system
			this.panelInfo.runningDays = runningDays
		},

		/**
		 * @description 构建磁盘信息
		 * @param data
		 */
		setDiskInfo(list: any): void {
			const diskList: Array<any> = []
			const quota: Array<any> = []
			list.forEach((data: any) => {
				const { path: title, size } = data
				const range = parseInt(size[3].substring(0, size[3].lastIndexOf('%')))
				const desc = `${size[5]} / ${size[0]}`
				diskList.push({
					show: false,
					data,
					info: { title, range, desc },
				})
				quota.push({
					diskName: title,
					diskQuota: Number.parseFloat(size[0].split('G')[0]),
				})
			})
			this.diskUsage = list[0]?.size || [] // 磁盘使用情况，仅根目录
			this.disk = diskList
			this.diskQuota = quota
		},
		/**
		 * @description 获取概览数据
		 */
		async getOverviewData() {
			try {
				let { data } = await getOverview()
				this.overviewShowList = data
			} catch (error) {
				console.log(error)
			}
		},
		/**
		 * @description: 获取面板更新内容
		 * @param {boolean} data.check 是否检查更新
		 * @param {boolean} data.toUpdate 是否更新版本
		 * @returns {Promise<void>}
		 */
		async getUpdateInfo(data: { check?: boolean; toUpdate?: 'yes' } = {}) {
			try {
				const { status, data: rdata } = await updatePanel(data)
				if (status && rdata) {
					this.setUpdateInfo(rdata)
					return rdata
				}
				return false
			} catch (err) {
				console.log(err, 'getUpdateData')
			}
		},
		/**
		 * @description 设置更新信息
		 * @param {any} data 更新信息数据
		 */
		setUpdateInfo(data: any): void {
			const locaVersion = window.vite_public_version
			const lastPart = locaVersion.split('.').pop() as string
			const isBeta = parseInt(lastPart).toString() === lastPart && lastPart.length === 2

			const { is_beta: cloudBeta, version, beta, downUrl, updateMsg, uptime, grayscale_test: grayscale } = data
			this.panelInfo.isBeta = isBeta
			this.panelInfo.isUpgrade = !compareVersion(locaVersion, isBeta ? beta.version : version)
			this.panelInfo.cloudBeta = cloudBeta
			this.panelInfo.betaInfo = beta
			this.panelInfo.officialInfo = { downUrl, updateMsg, version, uptime }
			this.panelInfo.grayscale = grayscale
		},
		/**
		 * @description 获取首页负载等弹出框数据信息
		 */
		async getHomeProcessInfo(): Promise<void> {
			try {
				const {
					data: { info: cpuBaseInfo, CPU_high_occupancy_software_list: cpuProcess, memory_high_occupancy_software_list: memProcess },
				} = await getHomeResData()
				this.specificResource.cpuBaseInfo = cpuBaseInfo
				this.specificResource.cpuProcess = cpuProcess
				this.specificResource.memProcess = memProcess
				this.specificResource.refresh = Date.now()
			} catch (error) {
				console.log(error)
			}
		},
	},
	persist: {
		storage: sessionStorage, // default: localStorage
	},
})

/**
 * @description 挂载首页状态管理
 * @returns
 */
const useHomeStore = () => {
	const store = homeStore() // 直接初始化
	return { ...store, ...storeToRefs(store) } // 返回store实例，以及store实例的ref
}

export default useHomeStore

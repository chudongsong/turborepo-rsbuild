import { replace } from 'ramda'
import { hasOwnProperty } from './../../utils/data'
import { version } from './../soft/public/environment-plugin/memcached/useController'
import { getSystemInfo as getSystemInfoData, getUpdateInfo as getUpdateInfoApi, getHomeResData, upgradePanelNew, updatePanelEnv, getUpdatePanelEnvLog } from '@/api/global'
import { useGlobalStore } from '@/store/global'
import { useDialog, useDataHandle, Message } from '@hooks/tools'
import { compareVersion, isString } from '@/utils/index'
import { ElNotification } from 'element-plus'
import { defineStore } from 'pinia'
import LoginPrompt from '@home/views/login-prompt/index.vue' // 登录提示
import { App } from 'vue'

const HOME_STORE = defineStore(
	'HOME-STORE',
	() => {
		const { getGlobalInfo } = useGlobalStore()

		const isRefreshData = ref(0) // 是否获取首页数据
		const recommendInstall = ref<boolean>(false) // 推荐安装
		const systemInfo = ref<AnyObject>({
			name: '', // 系统名称
			simpleName: '', // 系统简称
		})
		const refreshTime = ref<number>(0) // 磁盘,io等动态数据刷新时间
		const panelInfo = ref<AnyObject>({
			runningDays: 0, // 运行天数
			isBeta: false, // 是否是测试版
			isUpgrade: false, // 是否有新版本
			cloudBeta: false, // 云端是否有测试版
			betaInfo: null, // 云端测试版信息
			officialInfo: null, // 云端正式版信息
			grayscale: 1, // 灰度等级:0-1，0.2为20%的灰度，0.5为50%的灰度，1为正常发布
			isSetup: true, // 是否已安装套件
			isRestart: false, // 是否重启
			upgrade: 0, // 0:无更新 1:有推荐更新 2:有最新正式版更新
			currentInfo: null, // 当前更新显示对应版本信息
			accountVersionInfo: null, // 多用户版本信息
		})
		const load = ref<AnyObject>({
			// 负载信息
			one: 0, // 一分钟负载
			max: 0, // 最大负载
			five: 0, // 五分钟负载
			fifteen: 0, // 十五分钟负载
		})
		const cpu = ref<AnyObject>({
			// cpu
			occupy: '', // 占用率
			framework: '', // 框架
			coresOccupy: [0, 0, 0], // 三个核心的占用率
			cpuNumber: 0,
			logicCores: 0,
			cores: 0,
			process: [0, 0],
		})

		const cpuTimes = ref<AnyObject>({}) // CPU详情
		const memory = ref<AnyObject>({
			// 内存
			memRealUsed: 0, // 已使用内存
			memRealUsedList: [], // 新的已使用内存列表
			memTotalList: [], // 新的已使用内存列表
			memTotal: 0, // 总内存
			memFree: 0, // 空闲内存
			memShared: 0, // 共享内存
			memAvailable: 0, // 可用内存
			memBuffers: 0, // 缓冲区
			memCached: 0, // 缓存
		})
		const specificResource = ref({
			// 状态表格信息数据
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
		})

		const disk = ref<any>([]) // 磁盘列表
		const diskQuota = ref<any>([]) // 磁盘配额
		const recommendSoft = ref<any>([]) // 推荐软件
		const network = ref<any>([]) // 网络
		const diskIo = ref<any>([]) // 磁盘io
		const diskUsage = ref<any>([]) // 磁盘使用情况
		const overviewShowList = ref<any>([]) // 模板信息
		const isDockerPanel = ref<boolean>(false) // 是否是docker面板

		/**
		 * @description 初始化推荐安装软件，初始化模块，必须提前加载
		 * @returns {App}
		 */
		const recommendInstallDialog = async (): Promise<App> => {
			return useDialog({
				component: () => import('@home/views/rec-install/index.vue'),
				title: '<div class="flex items-center justify-between text-small"><span>初始化推荐配置</span><span class="close-ad">不再显示推荐</span></div>',
				area: 105,
				closeBtn: 2,
			})
		}

		/**
		 * @description: 获取面板更新内容
		 * @param {boolean} data.check 是否检查更新
		 * @param {boolean} data.toUpdate 是否更新版本
		 * @returns {Promise<void>}
		 */
		const getUpdateInfo = async (data: { check?: boolean; toUpdate?: 'yes' } = {}) => {
			try {
				const { data: rdata } = await getUpdateInfoApi(data)
				const { status, msg } = rdata
				if (status && msg) {
					setUpdateInfo(msg)
					return msg
				}
				return false
			} catch (err) {
				console.log(err, 'getUpdateData')
			}
		}

		/**
		 * @description 设置更新信息
		 * @param {any} data 更新信息数据
		 */
		const setUpdateInfo = (data: any) => {
			const locaVersion = window.vite_public_version
			const lastPart = locaVersion.split('.').pop() as string
			const isBeta = parseInt(lastPart).toString() === lastPart && lastPart.length === 2

			const { is_beta: cloudBeta, version, beta, downUrl, updateMsg, uptime, grayscale_test: grayscale } = data
			Object.assign(panelInfo.value, {
				isBeta,
				isUpgrade: !compareVersion(locaVersion, isBeta ? beta.version : version),
				cloudBeta,
				betaInfo: beta,
				officialInfo: { downUrl, updateMsg, version, uptime },
				grayscale,
			})
		}

		/**
		 * @description 获取面板更新内容
		 * @returns {Promise<void>}
		 */
		const getUpdateInfoNew = async () => {
			try {
				const { data } = await upgradePanelNew({ check: true })
				if (data) setUpdateInfoNew(data)
				return data
			} catch (err) {
				console.log(err, 'getUpdateInfoNew')
			}
		}

		/**
		 * @description 设置更新信息
		 * @param {any} data 更新信息数据
		 */
		const setUpdateInfoNew = (data: any) => {
			const { local, cloud, upgrade } = data

			const currentInfo = upgrade === 2 ? cloud?.OfficialVersionLatest : upgrade === 1 ? cloud?.OfficialVersion : local
			const accountVersionInfo = cloud?.AccountVersion
			Object.assign(panelInfo.value, {
				// grayscale,
				upgrade,
				currentInfo,
				accountVersionInfo,
				envUpgradeInfo: {
					has_env_py313: local.has_env_py313, // 环境包是否已预下载
					need_env_check: local.need_env_check, // 是否需要升级环境
					env_update_running: local.env_update_running, // 当前是否正在下载环境包
					plugins_hasUpdate: local.plugins_check.some((item: any) => item.level === 'must'), // 插件是否需要更新
					plugins_check: local.plugins_check, // 需要更新的插件列表
				}, // need_env_check决定当前面板是否需要升级环境,需要升级时必须先下载环境包后再开放升级
				hideBadge: (cloud?.ignore || []).includes(local.version), // 是否隐藏红点
			})
		}

		/**
		 * @description 预下载环境包
		 */
		const downloadEnv = async () => {
			try {
				return useDataHandle({
					loading: '正在下载，请稍后...',
					message: true,
					request: updatePanelEnv(),
				})
			} catch (err) {
				console.log(err)
				return {
					status: false,
					msg: '请求失败',
				}
			}
		}
		let timer: any = null
		const downLogContent = ref('') // 环境下载日志
		/**
		 * @description 获取预下载环境包日志
		 */
		const getDownloadEnvLog = async () => {
			try {
				timer && clearTimeout(timer)
				const { data: res } = await getUpdatePanelEnvLog()
				if (res.data?.env_update_running || res.data.log) {
					downLogContent.value = isString(res.data.log) ? res.data.log : res.msg || '暂无日志'
					if (!res.data.env_update_running) {
						Message.msg({
							customClass: 'bt-message-error-html',
							dangerouslyUseHTMLString: true,
							message: res.msg,
							type: res.status ? 'success' : 'error',
							showClose: res.status ? false : true,
							duration: res.status ? 5000 : 0,
						})
					} else {
						timer = setTimeout(() => {
							getDownloadEnvLog()
						}, 2000)
					}
				} else {
					Message.error(res.msg)
				}
			} catch (error) {
				timer && clearTimeout(timer)
				timer = setTimeout(() => {
					getDownloadEnvLog()
				}, 2000)
			}
		}
		/**
		 * @description 清除定时器
		 */
		const clearRestart = () => {
			timer && clearInterval(timer) // 组件卸载时清除定时器
			downLogContent.value = ''
			getUpdateInfoNew()
		}
		/**
		 * @description 获取全局信息
		 */
		const getHomeConfig = async () => {
			// debugger
			const data = await getGlobalInfo()
			if (typeof data === 'object' && data) panelInfo.value.isSetup = data.isSetup
			if (data.migration) {
				/**
				 * @description 备份进行中提示弹窗
				 */
				useDialog({
					area: 45,
					component: () => import('@components/business/bt-recover-popup/index.vue'),
				})
			}
		}

		/**
		 * @description 获取系统信息
		 */
		const getSystemInfo = async () => {
			try {
				const rdata = await getSystemInfoData()
				isRefreshData.value = new Date().getTime()
				setSystemInfo(rdata.data)
			} catch (err) {
				console.log(err)
			}
		}

		/**
		 * @description 设置系统信息
		 * @param {any} data 系统信息数据
		 * @returns {void}
		 */
		const setSystemInfo = (data: any) => {
			const { disk: diskList, mem, network: networkData, iostat, cpu: cpuData, installed, cpu_times, down, up, downPackets, upPackets, downTotal, upTotal, system, simple_system: simpleSystem, time: runningDays, docker_run: dockerRun } = data
			const networkGroup = {
				ALL: { down, up, downPackets, upPackets, downTotal, upTotal },
				...networkData,
			}

			setDiskInfo(diskList) // 磁盘信息处理
			const time = Date.now() // 当前时间
			recommendInstall.value = installed
			memory.value = mem
			network.value = networkGroup
			diskIo.value = iostat
			console.log(dockerRun, 'dockerRun')
			isDockerPanel.value = !!dockerRun
			cpu.value = {
				occupy: cpuData[0],
				cores: cpuData[1],
				coresOccupy: cpuData[2],
				framework: cpuData[3],
				logicCores: cpuData[4],
				cpuNumber: cpuData[5],
				process: [cpu_times['活动进程数'], cpu_times['总进程数']],
			}
			cpuTimes.value = cpu_times
			load.value = data.load
			refreshTime.value = time
			systemInfo.value.name = simpleSystem
			systemInfo.value.simpleName = system
			panelInfo.value.runningDays = runningDays
		}

		/**
		 * @description 构建磁盘信息
		 * @param data
		 */
		const setDiskInfo = (list: any) => {
			const diskList: Array<any> = []
			const quota: Array<any> = []
			list.forEach((data: any) => {
				const { path: title, size } = data
				const isSize = isString(size)
				const range = isSize ? 0 : parseInt(size[3].substring(0, size[3].lastIndexOf('%')))
				// const desc = isSize ? `未挂载` : `${size[5]}/${size[0].replace(' ', '')}`
				const descInfo = {
					total: size[0].split(' '),
					used: size[1].split(' '),
				}
				diskList.push({
					show: false,
					data,
					info: {
						type: 'disk',
						title: isSize ? '未挂载' : title,
						range,
						desc: {
							total: descInfo.total[0],
							used: descInfo.used[0],
							total_unit: descInfo.total[1],
							used_unit: descInfo.used[1],
						},
					},
				})
				quota.push({
					diskName: title,
					diskQuota: Number.parseFloat(size[0].split('G')[0]),
				})
			})
			diskUsage.value = list[0]?.size || [] // 磁盘使用情况，仅根目录
			disk.value = diskList
			diskQuota.value = quota
			localStorage.setItem('checkWarnInfo', JSON.stringify(diskList[0])) // 磁盘信息
		}

		/**
		 * @description 监听登录信息
		 */
		const monitorLoginInfo = async () => {
			const info = sessionStorage.getItem('loginInfo') as string | null
			if (info !== undefined && info !== null) {
				let loginInfo = JSON.parse(info)
				// 登录成功提示 有上次登录信息才提示
				if (loginInfo != undefined && loginInfo != '' && loginInfo?.last_login?.login_time_str && loginInfo.login_origin) {
					ElNotification({
						title: '登录成功',
						message: h(LoginPrompt as any),
						type: 'success',
						position: 'bottom-right',
						dangerouslyUseHTMLString: true,
						customClass: 'login-success',
						onClose: () => sessionStorage.removeItem('loginInfo'),
					})
				}
			}
		}

		/**
		 * @description 获取首页负载等弹出框数据信息
		 */
		const getHomeProcessInfo = async () => {
			try {
				const {
					data: { info: cpuBaseInfo, CPU_high_occupancy_software_list: cpuProcess, memory_high_occupancy_software_list: memProcess },
				} = await getHomeResData()
				Object.assign(specificResource.value, {
					cpuBaseInfo,
					cpuProcess,
					memProcess,
					refresh: Date.now(),
				})
			} catch (error) {
				console.log(error)
			}
		}

		const $reset = () => {
			disk.value = []
			diskQuota.value = []
			recommendSoft.value = []
			network.value = []
			diskIo.value = []
			overviewShowList.value = []
			Object.assign(specificResource.value, {
				cpuProcess: [],
				memProcess: [],
			})
		}

		return {
			panelInfo,
			memory,
			systemInfo,
			refreshTime,
			load,
			cpu,
			cpuTimes,
			disk,
			diskQuota,
			isDockerPanel,
			recommendSoft,
			network,
			diskIo,
			diskUsage,
			overviewShowList,
			isRefreshData,
			recommendInstall,
			specificResource,
			recommendInstallDialog,
			getUpdateInfo,
			getUpdateInfoNew,
			getHomeConfig,
			getSystemInfo,
			monitorLoginInfo,
			getHomeProcessInfo,
			downLogContent,
			clearRestart,
			downloadEnv,
			getDownloadEnvLog,
			$reset,
		}
	},
	{
		persist: true,
		storage: localStorage,
		omit: ['systemInfo'],
	}
)

export default HOME_STORE

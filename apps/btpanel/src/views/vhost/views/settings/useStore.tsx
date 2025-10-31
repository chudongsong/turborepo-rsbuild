import { defineStore } from 'pinia'
import { isObject } from '@/utils'
import { getServiceInfo, getServerSslApi, getServerAddressApi, setServerAddressApi, getCloudVersionApi } from '@/api/vhost'
import { getPluginInfo } from '@/api/global'
import { useMessage } from '@/hooks/tools'
import { useGlobalStore } from '@/store/global'

const { request: $request } = useMessage()

export const SETTINGS_STORE = defineStore('VHOST-SETTINGS-STORE', () => {
	// 安装状态 0 未安装 1 安装中 2 已安装
	const install = ref(0)

	// nginx安装状态
	const nginx = ref(false)

	// 运行状态 0 停止 1 运行中
	const runStatus = ref(0)

	// 版本号
	const version = ref('')

	// 云端版本信息
	const cloudVersionInfo = ref<{
		version: string
		downUrl: string
		updateMsg: string
		uptime: string
	} | null>(null)

	// 服务是否运行中
	const isServerRunning = computed(() => {
		// console.log(isRunning.value)
		if (isRunning.value) {
			return {
				type: 'stop',
				text: '停止',
				icon: 'start',
				color: '!text-primary',
				tips: '运行中',
			}
		} else {
			return {
				type: 'start',
				text: '启动',
				icon: 'stop',
				color: '!text-danger',
				tips: '已停止',
			}
		}
	})

	// 是否安装
	const isInstall = computed(() => {
		return nginx.value && install.value === 2
	})

	// 是否正在运行
	const isRunning = computed(() => {
		return runStatus.value === 1
	})

	const getNginx = async () => {
		const { data } = await getPluginInfo({ sName: 'nginx' })
		if (isObject<{ setup: boolean }>(data)) {
			nginx.value = data.setup
		}
	}

	const getInfo = async () => {
		await getNginx()
		const { data } = await getServiceInfo()
		if (
			isObject<{
				install_status: number
				run_status: number
				version: string
			}>(data)
		) {
			install.value = data.install_status
			runStatus.value = data.run_status
			version.value = data.version
		}
		return data
	}

	const getCloudVersionInfo = async () => {
		// 获取全局状态中的用户授权信息
		const { payment } = useGlobalStore()

		// 条件判断：只有付费用户（专业版或企业版）且vhost服务已安装完成时才执行
		if (payment.value.authType === 'free' || !isInstall.value) {
			console.log('跳过云端版本信息获取：用户为免费版或vhost服务未安装完成')
			return
		}

		try {
			const { data } = await getCloudVersionApi()
			if (
				isObject<{
					version: string
					downUrl: string
					updateMsg: string
					uptime: string
				}>(data)
			) {
				cloudVersionInfo.value = data
			}
		} catch (error) {
			console.error('获取云端版本信息失败:', error)
			// 防御性编程：确保在获取失败时不影响其他功能
			cloudVersionInfo.value = null
		}
	}

	// 是否存在证书
	const hasCert = ref(false)
	// 证书信息
	const certInfo = ref({
		certificate: '',
		private_key: '',
	})
	// 获取证书信息
	const getCertInfo = async () => {
		const { data } = await getServerSslApi()
		if (isObject<{ certificate: string; private_key: string }>(data)) {
			hasCert.value = data.certificate !== ''
			certInfo.value.certificate = data.certificate
			certInfo.value.private_key = data.private_key
		}
	}
	type ServerInfo = { ip: string; protocol: string; port: string; domain: string }
	// 服务器ip
	const serverIP = ref('')
	// 请求协议
	const serverProtocol = ref('https')
	// 请求端口
	const serverPort = ref('80')
	// 请求服务器域名
	const serverDomain = ref('')
	// 保存所有服务器信息
	const serverInfo = ref<ServerInfo>()
	// 获取服务器ip
	const getServerIP = async () => {
		const { data } = await getServerAddressApi()
		console.log('----------------', data)
		if (isObject<ServerInfo>(data)) {
			serverIP.value = data.domain ? data.domain : data.ip
			serverProtocol.value = data.protocol
			serverPort.value = data.port
			serverDomain.value = data.domain
			serverInfo.value = data
		}
	}
	/**
	 * @description 重置服务器ip事件
	 */
	const resetServerEvent = async () => {
		const rdata = await setServerAddressApi(serverInfo.value?.ip as string)
		await $request(rdata)
		await getServerIP()
	}

	return {
		install,
		runStatus,
		version,
		cloudVersionInfo,
		isInstall,
		isRunning,
		isServerRunning,
		getInfo,
		getCloudVersionInfo,
		hasCert,
		certInfo,
		getCertInfo,
		getServerIP,
		serverIP,
		serverProtocol,
		serverPort,
		resetServerEvent,
	}
})

/**
 * @description 设置store
 * @returns
 */
export const useSettingsStore = () => {
	const store = SETTINGS_STORE()
	const vhostStore = storeToRefs(store)
	return { ...store, ...vhostStore }
}

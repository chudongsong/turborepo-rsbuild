import { useGlobalStore } from '@store/global'
import { defineStore, storeToRefs } from 'pinia'

// 全局状态
const useFirewallStore = defineStore('FIREWALL-STORE1', {
	// 类型问题 需要写interface
	state: (): any => ({
		tabActive: 'ssh', // 当前tab
		systemTabActive: 'port', // 系统tab
		sshTabActive: 'basic', // ssh tab
		safeDetectActive: 'safeDetectTab', // 安全检测tab
		networkActive: 'home', // 扫描感知
		isRefreshSpywares: false, // 是否刷新木马查杀列表

		phpTabActive: 'home', // php tab
		sshLoginType: 'ALL', // ssh登录类型
		sshInfo: {
			ping: false, //ping
			port: 0, //端口
			firewall_status: false, //防火墙状态
			fail2ban: {
				installed: false, //fail2ban 安装状态
				status: false, //fail2ban
			},
			status: false, //ssh开关状态
		}, // 防火墙信息

		firewallInfo: {
			country: 0, //国家
			ip: 0, //ip
			ping: true, //ping
			port: 0, //端口
			trans: 0, //传输
			type: 'ufw', //类型
			update_time: '--', //更新时间
			status: false, //防火墙状态
			init_status: false, //初始化状态
		},

		reinforceStatus: false, // 系统加固状态
	}),
	getters: {},
	actions: {
		/**
		 * @description 获取全局信息
		 */
		async getGlobalConfig() {
			const { getGlobalInfo } = useGlobalStore()
			const data = await getGlobalInfo()
		},
	},
	persist: [
		// {
		// 	storage: localStorage,
		// },
	],
})

/**
 * @description 获取软件商店状态管理
 * @returns
 */
const getFirewallStore = () => {
	const firewallStore = useFirewallStore()
	return { refs: storeToRefs(firewallStore), ...firewallStore }
}

export { getFirewallStore }

export default useFirewallStore

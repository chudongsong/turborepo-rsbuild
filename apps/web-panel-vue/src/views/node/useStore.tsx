import { useGlobalStore } from '@/store/global'
import { nodeList, getClbAllNode } from '@/api/node'
import { useDataHandle, useMessage } from '@/hooks/tools'
import type { SelectOptionProps } from '@/components/form/bt-select/types'

const NODE_STORE = defineStore('NODE-STORE', () => {
	const { getGlobalInfo, mainWidth } = useGlobalStore()
	const message = useMessage()
	const rowData = ref() // 表格行数据
	const isRefreshNodeList = ref(false) // 刷新节点列表
	const nodeCategory = ref<SelectOptionProps[]>([]) // 节点分类
	const nodeStatus = ref<any>([]) // 节点状态
	const forcedFlushes = ref(0) // 强制刷新
	const setNodeInfo = ref<{
		id?: number | string
		server_ip?: string
		ssh_conf?: {
			password?: string
			pkey_passwd?: string
			pkey?: string
			host?: string
			port?: number
			username?: string
		}
	}>({})
	const setNodeSSHisSet = ref(false) // 节点SSH是否已设置
	const sshTerminalVisible = ref(false) // SSH终端是否可见
	const settingTabActive = ref('') // 设置页面tab激活项
	const isJump = ref(false) // 是否跳转tab
	const searchWidth = computed(() => {
		if (mainWidth.value > 1530) return 320
		if (mainWidth.value > 1400) return 200
		if (mainWidth.value > 1200) return 180
		return 140
	})

	// 文件分发当前节点
	const currentNodes = ref<any>({
		source: '',
		sourcePath: '/',
		target: '',
		targetPath: '/',
		localNodeId: '',
	})
	/**
	 * @description 获取节点列表
	 * @param { any } params 请求参数
	 */
	const getNodeList = async () => {
		const res: any = await useDataHandle({
			request: nodeList({ p: '1', limit: '200' }),
		})
		if (!res.status) {
			message.error(res.msg)
			return []
		}
		return res.data
	}
	/**
	 * @description 获取全部节点
	 * @param { any } params 请求参数
	 */
	const getAllNodeList = async (type: 'api' | 'ssh' = 'api') => {
		const res: any = await useDataHandle({
			request: getClbAllNode({ node_type: type }),
		})
		if (!res.status) {
			message.error(res.msg)
			return []
		}
		return res.data
	}
	/**
	 * @description 重置tab
	 */
	const resetTab = () => {
		settingTabActive.value = ''
		isJump.value = false
	}
	return {
		rowData,
		nodeCategory,
		isRefreshNodeList,
		searchWidth,
		nodeStatus,
		getNodeList,
		getAllNodeList,
		currentNodes,
		forcedFlushes,
		resetTab,
		settingTabActive,
		isJump,
		setNodeInfo,
		setNodeSSHisSet,
		sshTerminalVisible,
	}
})

/**
 * @description 节点全局数据
 * @returns {Ref<Record<string, any>>}
 */
const useNodeStore = () => {
	return { ...NODE_STORE(), ...storeToRefs(NODE_STORE()) }
}

export { useNodeStore, NODE_STORE }

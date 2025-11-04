import { TcpudpNodeData } from '@/views/node/types'

const CLB_TCPUDP_STORE = defineStore('CLB-TCPUDP-STORE', () => {
	const tcpudpRowData = ref()
	const isTcpudpClbEdit = ref(false)
	const addTcpudpNodeData = ref<TcpudpNodeData[]>([])
	const nodeClbTcpudpRefresh = ref(false)
	return {
		tcpudpRowData,
		isTcpudpClbEdit,
		addTcpudpNodeData,
		nodeClbTcpudpRefresh,
	}
})

const useClbTcpudpStore = () => {
	return storeToRefs(CLB_TCPUDP_STORE())
}

export { useClbTcpudpStore, CLB_TCPUDP_STORE }

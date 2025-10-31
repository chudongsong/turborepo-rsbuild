import { HttpNodeData } from '@/views/node/types'

const CLB_HTTP_STORE = defineStore('CLB-HTTP-STORE', () => {
	const httpRowData = ref()
	const addNodeData = ref<HttpNodeData[]>([])
	const isHttpClbEdit = ref(false)
	const HttpNodeList = ref<any[]>([])
	const nodeClbHttpRefresh = ref(false)
	const domainList = ref<any[]>([])
	// addNodeData.value = [
	// 	{
	// 		node: '192.168.69.154',
	// 		node_site: '192.168.69.154',
	// 		port: 80,
	// 		path: '/',
	// 		node_status: 'online',
	// 		weight: 1,
	// 		max_fail: 5,
	// 		fail_timeout: 10,
	// 		ps: '',
	// 	}
	// ]
	return {
		httpRowData,
		isHttpClbEdit,
		addNodeData,
		HttpNodeList,
		nodeClbHttpRefresh,
		domainList,
	}
})

const useClbHttpStore = () => {
	return storeToRefs(CLB_HTTP_STORE())
}

export { useClbHttpStore, CLB_HTTP_STORE }

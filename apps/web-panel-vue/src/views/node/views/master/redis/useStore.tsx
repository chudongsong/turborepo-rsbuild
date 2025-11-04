interface RedisNode {
	id: string | number
	name: string
	server_ip: string
	redis_version: string
	is_in_replication_group?: boolean
	group_info?: any
	// ...如有其它字段可补充
}

const MASTER_REDIS_STORE = defineStore('MASTER-REDIS-STORE', () => {
	const isRedisRefreshList = ref(false)
	const redisRowData = ref<any[]>([])
	const redisAvailableNodes = ref<{ row: RedisNode[]; nodes: any[] }>({ row: [], nodes: [] })
	const redisGroupDetail = ref<any>({})
	const openNodesLoading = ref(true)
	const slaveListLoad = ref(true)

	return { isRedisRefreshList, redisRowData, redisAvailableNodes, redisGroupDetail, openNodesLoading, slaveListLoad }
})

const useMasterRedisStore = () => {
	return { ...MASTER_REDIS_STORE(), ...storeToRefs(MASTER_REDIS_STORE()) }
}

export { useMasterRedisStore, MASTER_REDIS_STORE }

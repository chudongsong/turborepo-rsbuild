const NODE_CLB_STORE = defineStore('NODE-CLB-STORE', () => {
	const activeTabs = ref('http')
	const testLinkStatus = ref(false)
	const nodesStatusList = ref([
		{
			label: '参与',
			value: 'online',
		},
		{
			label: '备份',
			value: 'backup',
		},
		{
			label: '停用',
			value: 'down',
		},
	])
	return {
		activeTabs,
		nodesStatusList,
		testLinkStatus,
	}
})

const useNodeClbStore = () => {
	return storeToRefs(NODE_CLB_STORE())
}

export { useNodeClbStore, NODE_CLB_STORE }

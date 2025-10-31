const CLB_LOG_STORE = defineStore('CLB-LOG-STORE', () => {
	const currentTab = ref('today')
	const logCustomDate = ref('')
	const currentDate = ref('')
	const dateTabs = ref([
		{ label: '今天', value: 'today' },
		{ label: '昨天', value: 'yesterday' },
		{ label: '自定义时间', value: 'custom' },
	])
	return {
		currentTab,
		logCustomDate,
		dateTabs,
		currentDate,
	}
})

const useClbLogStore = () => {
	return storeToRefs(CLB_LOG_STORE())
}

export { useClbLogStore, CLB_LOG_STORE }

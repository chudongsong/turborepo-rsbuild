const NODE_ALARM_STORE = defineStore('NODE-ALARM-STORE', () => {
	const alarmRowData = ref()
	const isAlarmEdit = ref(false)
	const nodeAlarmRefresh = ref(false)

	return {
		alarmRowData,
		nodeAlarmRefresh,
		isAlarmEdit,
	}
})

const useNodeAlarmStore = () => {
	return storeToRefs(NODE_ALARM_STORE())
}

export { useNodeAlarmStore, NODE_ALARM_STORE }

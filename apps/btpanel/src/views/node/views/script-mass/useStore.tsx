const NODE_SCRIPT_MASS_STORE = defineStore(
	'NODE-SCRIPT-MASS-STORE',
	() => {
		const activeTabs = ref('script-distribute')
		const contentType = ref('byCustom')
		const isExecute = ref(false) // 是否执行
		const isCanReset = ref(false) // 是否可以重置
		const currentTaskId = ref(0) // 当前任务id
		const taskList = ref<any[]>([]) // 任务列表
		return {
			activeTabs,
			contentType,
			isExecute,
			isCanReset,
			currentTaskId,
			taskList,
		}
	},
	{
		persist: {
			storage: localStorage,
			paths: ['taskList', 'isCanReset', 'currentTaskId'],
		},
	}
)

const useNodeScriptMassStore = () => {
	return storeToRefs(NODE_SCRIPT_MASS_STORE())
}

export { useNodeScriptMassStore, NODE_SCRIPT_MASS_STORE }

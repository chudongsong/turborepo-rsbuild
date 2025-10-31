export const useMailMarketTaskStore = defineStore('MAIL_MARKET_TASK', () => {
	const formModal = reactive({
		row: null,
		isEdit: false,
		title: '',
	})

	return {
		formModal,
	}
})

export default useMailMarketTaskStore

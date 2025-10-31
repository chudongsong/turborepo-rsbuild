import { defineStore } from 'pinia'
import { useLocalStorage } from '@vueuse/core'

const MASTER_STORE = defineStore('MASTER-STORE', () => {
	const tabActive = useLocalStorage('nodeRedisTabActive', 'mysqlMaster')

	return {
		tabActive,
	}
})

const useMasterStore = () => {
	const store = MASTER_STORE()
	return storeToRefs(store)
}

export { useMasterStore, MASTER_STORE }

import { defineStore, storeToRefs } from 'pinia'

const FTP_CAPACITY_STORE = defineStore('FTP-CAPACITY-STORE', () => {
	const capFtpInfo = ref() // 表单实例
	// 容量参数
	const capacityData = ref({
		used: 0,
		size: 0,
		status: false,
		alarmSize: 5,
		alarmNum: 1,
		alarmModel: [],
		module: [] as string[],
		option: {} as any,
	})
	const useSize = ref<number | string>()

	return {
		capacityData,
		capFtpInfo,
		useSize,
	}
})

/**
 * @description FTP全局数据
 * @returns {Ref<Record<string, any>>}
 */
const useFtpCapacityStore = () => {
	return storeToRefs(FTP_CAPACITY_STORE())
}

export { useFtpCapacityStore, FTP_CAPACITY_STORE }

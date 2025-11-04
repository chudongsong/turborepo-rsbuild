// import Vue from 'vue'
import { defineStore, storeToRefs } from 'pinia'
import { useDataHandle } from '@/hooks/tools'
import { getSetting, getURL, getDockerDetail } from '@/api/docker'


// 全局状态
const useDockerStore = defineStore('DOCKER-APPSTORE-STORE', {
	state: (): any => ({
		deployMenuData: {
			app_type: 'all', // 应用类型
			maximum_cpu: '--', // 最大CPU核心数
			maximum_memory: '--', // 最大内存可用数
		}, // 部署菜单数据
	}),
})

/**
 * @description 获取Docker状态管理
 * @returns
 */
const getDockerAppStore = () => {
	const dockerStore = useDockerStore()
	return { refs: storeToRefs(dockerStore), ...dockerStore }
}

export default useDockerStore
export { getDockerAppStore }

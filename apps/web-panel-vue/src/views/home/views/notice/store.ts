import { defineStore } from 'pinia'
import { useRouter } from 'vue-router'
import { useGlobalStore } from '@store/global'
import type { HomeMemoryInfo, HomeDiskItemInfo } from '@home/types.d'
import { homeData } from '@home/useMethod'
import { useConfirm, useDataHandle, useMessage } from '@hooks/tools'
import { cleanMemory } from '@/api/home'
import { setNoticeIgnore } from '@/api/global'

const HOME_NOTICE_STORE = defineStore('NOTICE-STORE', () => {
	const { panel } = useGlobalStore()

	const router = useRouter()

	const memory = ref<HomeMemoryInfo>({
		memRealUsed: 0, // 已使用内存
		memTotal: 0, // 总内存
		memFree: 0, // 空闲内存
		memShared: 0, // 共享内存
		memAvailable: 0, // 可用内存
		memBuffers: 0, // 缓冲区
		memCached: 0, // 缓存
		memNewRealUsed: '0', // 新的已使用内存
		memNewTotal: '0', // 新的总内存
		memNewRealUsedList: [], // 新的已使用内存列表
		memNewTotalList: [], // 新的总内存列表
	})

	const disk = ref<HomeDiskItemInfo[]>([])
	const memoryStatus = ref<boolean>(false) // 内存错误
	const usernameStatus = ref<boolean>(false) // 用户错误
	// const httpsStatus = ref<boolean>(false) // 端口错误
	const diskFullStatus = ref<boolean>(false) // 磁盘错误
	const inodeFullStatus = ref<boolean>(false) // inode错误
	const inodePath = ref<any>([]) // 	inode路径
	const diskUsage = ref<any>([]) // 磁盘使用率

	// 端口状态
	const portStatus = computed(() => {
		return panel.value.port === 8888 && !panel.value.noticeIgnore.port
	})

	// HTTPS状态
	const httpsStatus = computed(() => {
		return !(window.location.protocol.indexOf('https') >= 0) && !panel.value.noticeIgnore.https
	})

	// 错误提示
	const noticeStatus = computed(() => {
		return memoryStatus.value || usernameStatus.value || portStatus.value || httpsStatus.value || diskFullStatus.value || inodeFullStatus.value
	})

	/**
	 * @description 全局挂载内存监听
	 */
	homeData.useSetCallback('memory', (value: HomeMemoryInfo) => {
		memory.value = value
		const { memTotal, memRealUsed } = memory.value
		const memFree = memTotal - memRealUsed
		memoryStatus.value = memFree < 64
	})

	/**
	 * @description 全局挂载磁盘使用率监听
	 *
	 */
	homeData.useSetCallback('diskUsage', (value: string) => {
		diskUsage.value = value
		// 检查是否存在满磁盘
		checkFullDisk()
	})

	/**
	 * @description: 全局挂载内磁盘监听
	 */
	homeData.useSetCallback('disk', (value: HomeDiskItemInfo[]) => {
		disk.value = value
		// 查询是否有inode超过90的,并记录磁盘名
		const inodeFull = disk.value.some((item: any) => parseInt(item.data.inodes[3]) > 90)
		if (inodeFull) {
			inodeFullStatus.value = true
			// 查询inode超过90的磁盘名
			inodePath.value = []
			inodePath.value = disk.value.map((item: any) => {
				if (parseInt(item.data.inodes[3]) > 90) {
					return item.data.path
				}
			})
		} else {
			inodeFullStatus.value = false
		}
	})

	/**
	 * @description: 跳转到安全配置
	 */
	const jumpConfig = () => {
		window.localStorage.setItem('config-dialog', 'ssl')
		router.push({ path: '/config/common' })
	}

	/**
	 * @description: 跳转到文件配置
	 */
	const jumpFiles = () => {
		router.push({ path: '/files' })
	}

	/**
	 * @description 修改端口信息
	 */
	const editPortInfo = () => {
		window.localStorage.setItem('config-dialog', 'port')
		router.push({ path: '/config/common' })
	}

	/**
	 * @description 设置通知状态
	 * @param name 通知名称
	 */
	const setNoticeStatus = async (name: string, title: string) => {
		try {
			await useConfirm({
				title: '忽略通知',
				content: `是否忽略${title}通知，不再提醒？`,
			})
			const { data } = await setNoticeIgnore({ name })
			panel.value.noticeIgnore[name as keyof typeof panel.value.noticeIgnore] = true
			useMessage().request(data)
		} catch (error) {
			// console.error(error)
		}
	}

	/**
	 * @description 立即清理
	 */
	const onClear = async () => {
		await useConfirm({
			type: 'calc',
			title: '释放内存',
			content: '若您的站点处于有大量访问的状态，释放内存可能带来无法预测的后果，您确定现在就释放内存吗？',
		})
		useDataHandle({
			loading: '正在释放内存，请稍后...',
			request: cleanMemory(),
			message: true,
		})
	}

	/**
	 * @description 检查是否存在满磁盘
	 */
	const checkFullDisk = () => {
		if (diskUsage.value && Number(diskUsage.value[2]) < 512 * 1024) {
			diskFullStatus.value = true
		}
	}

	return {
		noticeStatus,
		memoryStatus,
		usernameStatus,
		portStatus,
		httpsStatus,
		diskFullStatus,
		inodeFullStatus,
		inodePath,
		setNoticeStatus,
		checkFullDisk,
		onClear,
		editPortInfo,
		jumpConfig,
		jumpFiles,
	}
})

export default HOME_NOTICE_STORE

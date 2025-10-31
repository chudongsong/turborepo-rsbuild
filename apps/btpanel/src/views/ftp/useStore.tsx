import { SoftInstallOptionProps } from '@/hooks/business/soft-install-mask'
import { useGlobalStore } from '@/store/global'

const FTP_STORE = defineStore('FTP-STORE', () => {
	const { plugin, getGlobalInfo } = useGlobalStore()
	const ftpPort = computed(() => plugin.value.ftp.port) // FTP端口
	const rowData = ref() // 表格行数据
	// 插件信息
	const pluginInfo = ref<SoftInstallOptionProps>({})
	const isRefreshFtpList = ref(false) // 刷新FTP列表
	return {
		ftpPort,
		pluginInfo,
		rowData,
		isRefreshFtpList,
	}
})

/**
 * @description FTP全局数据
 * @returns {Ref<Record<string, any>>}
 */
const useFtpStore = () => {
	return storeToRefs(FTP_STORE())
}

export { useFtpStore, FTP_STORE }

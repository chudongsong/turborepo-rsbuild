import { getDomaiNuniversalModule, getPublicIp } from '@/api/domain'
import { useMessage } from '@/hooks/tools'
import { useDomainRegisterStore } from './views/domain-register/useStore'
import { useGlobalStore } from '@/store/global'
import { bindUserDialog } from '@/public'
const { isLoadingIp, publicIp, showMask, isUserBound } = useDomainRegisterStore()
const message = useMessage()
const { payment } = useGlobalStore()
const { bindUser } = toRefs(payment.value)
/**
 * @description 获取公网IP
 */
export const fetchPublicIp = async (): Promise<string> => {
	try {
		const res = await getPublicIp()
		return res.data.status ? res.data.data : '获取公网IP失败'
	} catch (error) {
		console.error('获取公网IP出错:', error)
		return '获取公网IP失败'
	}
}

/**
 * @description 检测面板访问权限
 */
export const checkPanelAccessPermission = async (ipAddress: string): Promise<boolean> => {
	try {
		const res = await getDomaiNuniversalModule({
			url: '/api/v1/user/security/check_panel_access',
			ip_address: ipAddress
		})
		return res.data.status && res.data.data?.allowed === true
	} catch (error) {
		console.error('检测面板访问权限出错:', error)
		return false
	}
}

/**
 * @description 获取公网IP并检查访问权限
 */
export const loadPublicIp = async () => {
	const load = message.load('正在检测授权状态，请稍候...')
	isLoadingIp.value = true
	try {
		isUserBound.value = !!bindUser.value
		
		if (!isUserBound.value) {
			bindUserDialog()
			showMask.value = true
			return
		}
		
		// 如果已绑定账号，继续检查IP访问权限
		publicIp.value = await fetchPublicIp()
		if (publicIp.value) {
			const hasAccess = await checkPanelAccessPermission(publicIp.value)
			showMask.value = !hasAccess
		}
	} catch (error) {
		showMask.value = true
		console.error('获取公网IP失败:', error)
	} finally {
		isLoadingIp.value = false
		load.close()
	}
}

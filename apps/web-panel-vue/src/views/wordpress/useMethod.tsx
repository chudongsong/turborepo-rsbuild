import { getWpAutoLogin } from '@/api/wp'
import { Message, useDataHandle } from '@/hooks/tools'
import useWPStore from '@/views/wordpress/useStore'
import { useGlobalStore } from '@/store/global'
import { productPaymentDialog } from '@/public'

const { tabActive } = storeToRefs(useWPStore())
const { router, route } = useWPStore()
const { payment } = useGlobalStore()

/**
 * @description 切换tabs切换组件
 * @param {string} name 当前tabs的name
 */
export const cutTabsEvent = async (name: string) => {
	tabActive.value = name
	router.push({ name })
}

/**
 * @description 初始化切换组件
 */
export const init = async () => {
	tabActive.value = route.name as string
}

export function useLoading(initValue = false) {
	const loading = ref(initValue)

	const setLoading = (val: boolean, isLoad = true) => {
		if (isLoad) loading.value = val
	}

	return {
		loading,
		setLoading,
	}
}

/**
 * @description 获取wp免登录地址
 */
export const useWpAutoLogin = (siteId: number, siteType: string) => {
	if (payment.value.authType !== 'ltd') {
		// 开通企业版付费
		productPaymentDialog({
			disablePro: true,
			sourceId: 334,
		})
		return
	}
	try {
		useDataHandle({
			loading: '获取免登录路径中...',
			request: getWpAutoLogin({ site_id: siteId, site_type: siteType }),
			success: (rdata: any) => {
				window.open(rdata.data, '_blank', 'noopener,noreferrer')
			},
		})
	} catch (error) {
		console.log(error)
		Message.error('获取免登录路径失败')
	}
}

import { getPaymentStatus } from '@/api/global'
import { applyCertOrderRenw, getPayStatus } from '@/api/site'
import { Message, useConfirm, useDataHandle, useDialog } from '@/hooks/tools'
import { SITE_STORE, useSiteStore } from '@/views/site/useStore'
import { busCertPaySuccessDialog, busCertVerifyInfoDialog } from '../useController'
import { SITE_SSL_STORE, useSiteSSLStore } from '../useStore'
import { clear } from 'console'
import { isEmpty } from '@/utils'

const { siteInfo, siteType } = useSiteStore()

const { isRefreshSSL, productInfo, orderInfo, pollingPopup } = useSiteSSLStore()
const { jumpSslTabEvent } = SITE_SSL_STORE()

const isCheckWechatPayLimit = computed(() => productInfo.value.totalPrice > 5000)
export const tabActive = ref(isCheckWechatPayLimit.value ? 'alicode' : 'wxcode')
export const pollingTimer = ref<any>(0)
export const polling = ref<any>(false)

/**
 * @description 监听tab切换
 */
export const cutPayType = (type: string, isLarge: Boolean = false) => {
	if (isCheckWechatPayLimit.value && type === 'wxcode') {
		type = 'alicode'
		Message.error('微信支付单笔限额5000元，请使用支付宝支付')
	}
	tabActive.value = type
	sessionStorage.setItem(isLarge ? 'PAY-SSL-VIEW-TIME' : 'PAY-VIEW-SSL-TIME', `${new Date().getTime() / 1000}`)
}

const closePay = async () => {
	const popup = await pollingPopup.value
	popup.unmount() // 关闭商用证书弹窗
}

/**
 * @description 监听支付状态
 */
export const pollingMonitorPayStatus = async (time?: number) => {
	showReSendBtn.value = false// 刷新支付状态后，隐藏重试按钮
	if (time) sessionStorage.setItem('PAY-VIEW-SSL-TIME', `${time}`)
	const timeVal = sessionStorage.getItem('PAY-VIEW-SSL-TIME')
	if (timeVal) {
		const timeDiff = parseInt(`${new Date().getTime() / 1000 - Number(timeVal)}`, 10)
		if (timeDiff > 600 && pollingPopup.value) {
			sessionStorage.removeItem('PAY-VIEW-SSL-TIME')
			return useConfirm({
				title: '支付超时',
				icon: 'warning',
				content: '由于您长时间未操作，支付超时，请刷新网页重新购买！',
				onConfirm: () => {
					closePay()
					window.location.reload()
				},
				onCancel: () => {
					closePay()
					window.location.reload()
				},
			})
		}
		if (!pollingPopup.value) sessionStorage.removeItem('PAY-VIEW-SSL-TIME')
	}
	await monitorPayStatus()
	if (polling.value) {
		pollingTimer.value && clearTimeout(pollingTimer.value)
		pollingTimer.value = setTimeout(() => {
			pollingMonitorPayStatus()
		}, 3000)
	} else {
		if (productInfo.value.isRenew) {
			//  发送订单
			await useDataHandle({
				request: applyCertOrderRenw({ oid: productInfo.value.oid }),
				message: true,
			})
			isRefreshSSL.value = true // 刷新商用证书列表
		} else {
			openBusPaySuccessDialog()
		}
	}
}

export const showReSendBtn = ref(false)// 是否显示重试按钮
/**
 * @description 监听支付状态
 */
export const monitorPayStatus = async () => {
	const data:any = await useDataHandle({
		request: getPayStatus({ oid: orderInfo.value.oid,pid: orderInfo.value.pid }),
		// data: Number,
	})
	// 如果支付状态为false，则重试5次
	if(typeof data.data === 'object' && Object.keys(data.data).length === 0){
		Message.error(`请求失败，请稍后再试。如有支付问题，请联系客服。`)
		showReSendBtn.value = true
		return Promise.reject({status:false,msg:'请求失败，请稍后再试。如有支付问题，请联系客服。'})
	}
	
	polling.value = !data.data
}

/**
 * @description 打开支付成功弹窗
 */
export const openBusPaySuccessDialog = async () => {
	busCertPaySuccessDialog({
		productInfo: productInfo.value,
		orderInfo: orderInfo.value,
	})
	isRefreshSSL.value = true // 刷新商用证书列表
	const popup = await pollingPopup.value
	popup.unmount() // 关闭商用证书弹窗
	clearTimeout(pollingTimer.value)
}

/*****************pay-success********************/

/**
 * @description 完善证书资料
 */
export const perfectCertificateData = () => {
	busCertVerifyInfoDialog({
		productInfo: productInfo.value,
		orderInfo: orderInfo.value,
	})
}

/********************pay-service***********************/

/**
 * @description 获取系统信息
 */
export const pollingMonitorPayServiceStatus = async () => {
	await monitorPayStatus()
	if (polling.value) {
		pollingTimer.value && clearTimeout(pollingTimer.value)
		pollingTimer.value = setTimeout(() => {
			pollingMonitorPayStatus()
		}, 3000)
	}
}

/**
 * @description 监听支付状态
 */
export const monitorPayServiceStatus = async () => {
	try {
		const rdata: AnyObject = await useDataHandle({
			request: getPaymentStatus({
				wxoid: orderInfo.value.wxoid,
			}),
			data: { status: Boolean },
		})
		if (rdata.status) {
			closeMonitorPayStatus()
			useDialog({
				isAsync: true,
				title: '支付成功',
				area: 60,
				component: () => import('@site/public/ssl-arrange/business-cert/pay-ssl-service-success.vue'),
				compData: orderInfo.value,
			})
			// emits('close'); // 关闭商用证书弹窗
		}
	} catch (error) {}
}

export const closeMonitorPayStatus = () => {
	polling.value = false
	showReSendBtn.value = false
	pollingTimer.value && clearTimeout(pollingTimer.value)
}

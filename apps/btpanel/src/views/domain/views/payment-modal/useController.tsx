import { useDialog, useMessage } from '@/hooks/tools'
import { getDomaiNuniversalModule } from '@/api/domain'
import { useDomainRegisterStore } from '@domain/views/domain-register/useStore'
import { formatTime } from '@/utils'
const { isRegListRefresh, domainSearchDialog } = useDomainRegisterStore()
const message = useMessage()

// 支付方式类型
export type PaymentMethod = 'wechat' | 'alipay' | 'balance'

// 订单信息接口
export interface OrderInfo {
	domain: string
    domain_name?: string
	firstYearPrice?: string
	renewalPrice?: string
	totalPrice?: string
	years: number
	accountBalance?: string
	// 续费相关字段
	currentExpiry?: string
	newExpiry?: string
	// 类型：'purchase' | 'renewal'
	type?: 'purchase' | 'renewal'
	// 购买相关字段
	suffix?: string
}

export const orderId = ref('')
export const orderNo = ref('')
export const selectedPayment = ref('wechat')

// 模态框实例引用
export const dialogInstance = ref<any>(null)

// 订单信息
export const orderInfo = ref<OrderInfo>({
	domain: '',
	firstYearPrice: '¥0.00',
	renewalPrice: '¥0.00',
	totalPrice: '',
	years: 1,
	accountBalance: '¥0.00',
	type: 'purchase'
})

// 判断是否为续费模式
export const isRenewal = computed(() => orderInfo.value.type === 'renewal')

// 二维码URL
export const qrcodeUrl = ref('')
// 存储微信和支付宝的二维码URL
export const paymentQrcodes = ref({
	wx: '',
	ali: ''
})
// 获取二维码loading状态
export const qrcodeLoading = ref(false)

// 余额支付loading状态
export const balancePaymentLoading = ref(false)

// 轮询相关
const pollingTimer = ref<NodeJS.Timeout | null>(null)
const isPolling = ref(false)
export const isPaymentSuccess = ref(false) // 支付成功标志

// 协议相关
export const agreementChecked = ref(false)

// 通用支付对话框
export const handlePaymentDialog = async (orderInfo: OrderInfo, type: 'payment' | 'renewal' = 'payment') => {
	const title = type === 'renewal' ? '域名续费' : '支付订单'
	const compData = type === 'renewal' ? { ...orderInfo, type: 'renewal' } : orderInfo
	
	const instance = await useDialog({
		title,
		area: 54,
		btn: false,
		showFooter: false,
		compData,
		component: () => import('./index.vue'),
		onCancel: () => {
			stopPolling() // 停止轮询
			orderId.value = ''
			orderNo.value = ''
			dialogInstance.value = null
			isPaymentSuccess.value = false // 重置支付成功标志
		}
	})
	
	// 保存模态框实例以供子组件使用
	dialogInstance.value = instance
}


// 支付方式变化
export const handlePaymentChange = async (type: string | number | boolean | undefined) => {
    stopPolling()
    
	const newType = String(type)
    selectedPayment.value = newType as 'wechat' | 'alipay' | 'balance'

    if (newType === 'balance') {
        qrcodeUrl.value = ''
        return
    }
	
    const cachedQrCode = newType === 'wechat' ? paymentQrcodes.value.wx : paymentQrcodes.value.ali
    if (cachedQrCode) {
        qrcodeUrl.value = cachedQrCode
        startPolling()
        return
    }

    // 没有缓存时重新生成
    qrcodeLoading.value = true
    qrcodeUrl.value = ''
    await generateQrcode()
}

// 确认支付
export const handleConfirm = async () => {
    if (!isRenewal.value && !agreementChecked.value) {
        message.warn('请先同意协议条款')
        return
    }
    
    balancePaymentLoading.value = true
    
    try {
        const res = await getDomaiNuniversalModule({
            url: '/api/v1/order/buy/buy_payment',
            order_no: orderNo.value
        })
        
	if (res.data.status) {
		isPaymentSuccess.value = true
		message.success(res.data.msg || '支付成功！')
		isRegListRefresh.value = true
		// 关闭模态框
		if (dialogInstance.value && dialogInstance.value.config?.globalProperties?.close) {
			domainSearchDialog.value && domainSearchDialog.value.close()
			dialogInstance.value.config.globalProperties.close()
		}
		return true
	} else {
		message.error(res.data.msg)
		return false
	}
    } catch (error) {
        console.error('余额支付失败:', error)
    } finally {
        balancePaymentLoading.value = false
    }
}

// 取消订单
export const cancelOrder = async (order_id: string | number) => {
    if (!order_id) return false
	try {
		const res = await getDomaiNuniversalModule({
			url: '/api/v1/order/cancel',
			order_id
		})
        return {
            success: res.data.status,
            message: res.data.msg
        }
	} catch (error) {
		console.error('取消订单失败:', error)
		return {
			success: false,
			message: '取消订单失败，请重试'
		}
	}
}

// 账户余额
export const accountBalance = ref('¥0.00')

// 获取账户余额
export const getAccountBalance = async () => {
	try {
		const res = await getDomaiNuniversalModule({
			url: '/api/v1/order/buy/get_buy'
		})
		if (res.data.status) {
			const balance = res.data.data.balance || '0.00'
			accountBalance.value = `¥${(Number(balance)/100).toFixed(2)}`
		} else {
			message.error(res.data.msg)
		}
	} catch (error) {
		console.error('获取账户余额失败:', error)
	}
}

// 创建续费订单
export const createRenewOrder = async (orderInfo: OrderInfo) => {
	try {
		const res = await getDomaiNuniversalModule({
			url: '/api/v1/order/renew',
			domain_list: [{
				domain: orderInfo.domain,
				year: orderInfo.years,
				domain_service: 0
			}]
		})
		console.log('创建续费订单:', res)
        return {
            success: res.data.status,
            data: res.data.data,
            message: res.data.msg
        }
	} catch (error) {
		qrcodeLoading.value = false
		console.error('创建续费订单失败:', error)
		return {
			success: false,
			message: '创建订单失败，请重试'
		}
	} finally {
		qrcodeLoading.value = false
	}
}

// 创建购买订单
export const createPurchaseOrder = async (orderInfo: OrderInfo) => {
    qrcodeLoading.value = true
	try {
		// 从完整域名中提取前缀
		const fullDomain = orderInfo.domain
		const lastDotIndex = fullDomain.lastIndexOf('.')
		
		const res = await getDomaiNuniversalModule({
			url: '/api/v1/order/direct_purchase_domain',
			domain_name: fullDomain.substring(0, lastDotIndex),
			suffix: orderInfo.suffix || (lastDotIndex > 0 ? fullDomain.substring(lastDotIndex + 1) : ''),
			years: orderInfo.years
		})
		return {
			success: res.data.status,
			data: res.data.data,
			message: res.data.msg
		}
	} catch (error) {
		console.error('创建购买订单失败:', error)
		return {
			success: false,
			message: '创建订单失败，请重试'
		}
	} finally {
		qrcodeLoading.value = false
	}
}

// 查询支付状态
const checkPaymentStatus = async () => {
	if (!orderNo.value) return

	try {
		const res = await getDomaiNuniversalModule({
			url: '/api/v1/order/payment/status',
			order_no: orderNo.value
		})
		
		if (res.data.status) {
			if (res.data.data.status === 1) {
				stopPolling()
				isPaymentSuccess.value = true
				message.success('支付成功！')
				isRegListRefresh.value = true
				if (dialogInstance.value && dialogInstance.value.config?.globalProperties?.close) {
					dialogInstance.value.config.globalProperties.close()
				}
			}
			else if (res.data.data.status === 2) {
				message.warn('订单已取消，请重新操作')
				qrcodeUrl.value = ''
			}
			else if (res.data.data.status === 3) {
				stopPolling()
				message.error('订单已退款')
				qrcodeUrl.value = ''
			}
		} else {
			stopPolling()
			message.error(res.data.msg || '支付失败')
			qrcodeUrl.value = ''
		}
	} catch (error) {
		console.error('查询支付状态失败:', error)
	}
}

// 开始轮询
const startPolling = () => {
	if (isPolling.value || pollingTimer.value) return
	isPolling.value = true
	// 每隔3秒查询一次支付状态
	pollingTimer.value = setInterval(() => {
		checkPaymentStatus()
	}, 3000)
	
	console.log('开始轮询支付状态')
}

// 停止轮询
export const stopPolling = () => {
	if (pollingTimer.value) {
		clearInterval(pollingTimer.value)
		pollingTimer.value = null
	}
	isPolling.value = false
	console.log('停止轮询支付状态')
}

// 生成二维码
export const generateQrcode = async () => {
    try {
        // 根据类型创建订单
        const orderResult = isRenewal.value 
            ? await createRenewOrder({
                domain: orderInfo.value.domain,
                totalPrice: orderInfo.value.totalPrice,
                years: orderInfo.value.years,
                accountBalance: orderInfo.value.accountBalance
            })
            : await createPurchaseOrder({
                domain: orderInfo.value.domain,
                firstYearPrice: orderInfo.value.firstYearPrice,
                totalPrice: orderInfo.value.totalPrice,
                years: orderInfo.value.years,
                accountBalance: orderInfo.value.accountBalance,
                suffix: orderInfo.value.suffix
            })
        console.log('orderResult', orderResult)
        if (orderResult.success) {
            orderId.value = orderResult.data.order_id
            orderNo.value = orderResult.data.order_no || ''
		     orderInfo.value.totalPrice = String(orderResult.data.total_price || '0')
            
            paymentQrcodes.value.wx = orderResult.data.wx || ''
            paymentQrcodes.value.ali = orderResult.data.ali || ''
            
            const currentQrCode = selectedPayment.value === 'wechat' 
                ? paymentQrcodes.value.wx 
                : paymentQrcodes.value.ali
            qrcodeUrl.value = currentQrCode
            
            if (currentQrCode) {
                startPolling()
            }
        } else {
            message.error(orderResult.message || '获取支付二维码失败')
        }
    } catch (error) {
        console.error( error)
    }
}

// 处理年限变化
export const handleYearsChange = async (years: number) => {
    stopPolling()
    
    // 清除所有缓存和状态
    qrcodeUrl.value = ''
    orderId.value = ''
    orderNo.value = ''
    paymentQrcodes.value.wx = ''
    paymentQrcodes.value.ali = ''
    
    qrcodeLoading.value = true
	orderInfo.value.years = years
	
	// 更新续费到期时间
	if (isRenewal.value && orderInfo.value.currentExpiry) {
		const currentDate = new Date(orderInfo.value.currentExpiry)
		const newDate = new Date(currentDate)
		newDate.setFullYear(newDate.getFullYear() + years)
		orderInfo.value.newExpiry = formatTime(newDate, 'yyyy-MM-dd')
	}
	
	await generateQrcode()
}

// 显示协议注意事项
export const showAgreement = async (checked: boolean | string | number) => {
	if (!checked) {
		agreementChecked.value = false
		return
	}
	
	agreementChecked.value = false
	
	await useDialog({
		title: '域名注册注意事项',
		area: 60,
		btn: ['同意并继续'],
		component: () => import('./agreement-dialog.vue'),
		onConfirm: () => {
			agreementChecked.value = true
			return true
		}
	})
}
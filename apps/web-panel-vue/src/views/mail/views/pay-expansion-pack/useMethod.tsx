import { getCredits, getPrivilegeSoftList, unbindAuthorization } from '@/api/global'
import { getCreateOrder, getPaymentStatus, getProductInfo, productCreditBuy } from '@/api/mail'
import { DataHandle, Message, useConfirm, useDataHandle, useDialog, useHandleError } from '@/hooks/tools'
import { useGlobalStore } from '@/store/global'
import { pid } from '@/utils/common'
import { getUserSurplus } from '@mail/views/overview/useMethod'

const { payment, authTypeTitle, isUpdatePayment, isRefreshSoftList, setAuthState, authExpirationTime } = useGlobalStore()

const payView = ref(false) // 是否显示支付弹窗

export const emits = ref()

export const tabLoading = reactive({
	status: true,
	title: '正在获取产品信息，请稍侯...',
})

export const countDown = reactive({
	// 优惠券倒计时
	d: '00',
	h: '00',
	m: '00',
	s: '00',
})

export const productPriceLoading = ref(false) // 产品价格加载状态

export const productInfo = reactive({
	activityList: '',
	activeTypeInfo: {
		type: 'ltd',
		describe: '',
		title: '',
		pid: 0,
		recommend: false,
		tipsTitle: '',
		tipsList: [],
	},
	unbindAuthor: {
		status: false,
		count: 0,
	},
})

// 右侧产品信息
export const product = reactive<any>({
	cycleMode: {
		// 产品周期模块
		activeCycleInfo: {
			cycle: 12, // 选中产品周期
		}, // 选中产品周期信息
		list: [
			{
				cycle: 12, // 产品周期
				price: 1999, // 产品价格
				title: '1年', // 产品周期
				originalPrice: 2399, // 原价
				count: 20000000, //
			},
			{
				cycle: 1, // 产品周期
				price: 350, // 产品价格
				title: '1月', // 产品周期
				originalPrice: 350, // 原价
				count: 150000, //
			},
		], // 产品周期列表
	},
	numsMode: {
		// 授权数量模块
		list: [], // 数量列表
		activeNumsInfo: {
			count: 1, // 选中授权数量
			price: 0, // 选中授权数量价格
			discount: 0, // 选中授权数量折扣
		}, // 选中授权数量信息
	},
	couponMode: {
		// 优惠券
		status: false, // 是否勾选
		activeCouponId: '', // 选中优惠券ID
		activeCouponInfo: {}, // 选中优惠券
		discountsTitle: '', // 优惠券折扣标题
		disabled: false, // 是否禁用
		count: 0, // 优惠券数量
		list: [], // 优惠券列表
		endTimeNum: 0, // 优惠券结束时间
	},
	couponInfo: {
		// 所有授权优惠券
		[pid.pro]: [], // 专业版优惠券
		[pid.ltd]: [], // 企业版优惠券
		[pid.dev]: [], // 运维版优惠券
	},
	enterpriseMode: {
		// 一年企业提示人工运维托管信息
		status: false, // 是否勾选
		isHidden: false, // 是否隐藏
	},
	devCycleInfo: {
		// 运维版'12'周期信息
		isGetOperated: false, // 是否存在运维版'12'周期信息
		data: {}, // 运维版'12'周期信息
	},
	voucherMode: {
		// 抵扣券模块
		loading: false, // 加载状态
		isExist: false, // 是否存在抵扣券
		proTypeList: {}, // 产品类型列表
		typeActive: 0, // 选中抵扣券类型
		typeList: {}, // 所有类型列表
		list: [], // 抵扣券列表
		active: 0, // 选中的抵扣券
		activeInfo: {
			// 选中的抵扣券信息
			pid: 0,
			code: '',
		},
	},
	payMode: {
		// 支付模块
		activePayType: 'wechat', // 选中支付方式
		activeBuyInfo: {
			// 购买信息
			price: 0, // 价格
			count: 0, // 数量
			cycle: 0, // 周期
			originalPrice: 0, // 原价
			discount: 0, // 折扣
		},
		activeBalanceInfo: {}, // 余额支付信息
		balance: 0, // 余额
		activePayCode: {
			// 支付码
			apliy: '', // 支付宝支付码
			wechat: '', // 微信支付码
		},
		qrcode: {
			value: '', // 微信二维码
			size: 110, // 支付宝二维码
		},
		createOrderTime: [], // 创建订单时间
	},
})

// 支付订单加载过渡
export const paymentLoading = reactive({
	status: true,
	title: '正在生成支付订单，请稍侯...',
})

export const activePayIcon = computed(() => {
	// 选中支付图标
	return `${product?.payMode.activePayType === 'alipay' ? 'ali' : 'wechat'}-pay.svg`
})

export const paySuccessData = ref<any>({}) // 支付成功数据

export const payList = [
	// 支付方式列表
	{
		type: 'wechat',
		title: '微信扫码支付',
	},
	{
		type: 'alipay',
		title: '支付宝扫码支付',
	},
	{
		type: 'balance',
		title: '余额支付',
	},
	{
		type: 'accounts',
		title: '对公转账',
	},
]

/**
 * @description 点击优惠券栏目
 * @param {boolean} newValue 是否勾选
 */
// eslint-disable-next-line consistent-return
export const changeCouponBoxEvent = (newValue?: boolean | string | number) => {
	const { status, count, activeCouponId } = product.couponMode
	// 没有优惠券时无法选中
	if (count === 0) {
		product.couponMode.status = false
		return Message.warn('暂无可用优惠券')
	}

	// 设置全局优惠券选中状态
	product.couponMode.status = typeof newValue !== 'undefined' ? Boolean(newValue) : !status

	// 是否已经有默认选中的
	if (activeCouponId !== '' && product.couponMode.status) {
		changeCouponEvent(activeCouponId)
	} else if (activeCouponId === '' && product.couponMode.status) {
		Message.request({ msg: '请选择优惠券', status: false })
		product.couponMode.status = false
		return false
	}
	createOrder()
}

/**
 * @description 切换优惠券
 * @param {string} value 优惠券ID
 */
export const changeCouponEvent = async (value: string) => {
	product.couponMode.status = true
	product.couponMode.activeCouponId = value.toString()
	// 获取当前选中的优惠券
	const coupon = product.couponMode.list.find((item: any) => item.id === Number(value))
	if (coupon !== undefined) {
		product.couponMode.activeCouponInfo = coupon
		product.couponMode.endTimeNum = Math.floor(coupon.endtime - Math.floor(new Date().getTime() / 1000))
		// 是否为0.99元试用券
		if (coupon.name.indexOf('0.99') > -1) {
			product.couponMode.discountsTitle = coupon.name
		} else {
			product.couponMode.discountsTitle = `已使用优惠券，立减${coupon.val2}元`
		}
	}
	createOrder()
}

/**
 * @description 切换产品周期
 * @param {any} item 产品周期信息
 * @returns {void} void
 */
export const changeCycleTabEvent = async (item: any, type?: string) => {
	product.cycleMode.activeCycleInfo = item // 当前产品周期信息

	// 切换授权数量时清空优惠券
	resetCouponEvent()

	createOrder()
}

/**
 * @description 恢复默认优惠券初始值
 */
const resetCouponEvent = () => {
	// const { type, pid: productId } = productInfo.activeTypeInfo
	// // 获取对应产品的优惠券
	// if (['plugin', 'coupon'].includes(type)) {
	// 	product.couponMode.count = 0
	// 	product.couponMode.list = []
	// } else {
	// 	let active = productId
	// 	// 当选中人工运维托管时，优惠券使用dev产品的优惠券
	// 	if (product.enterpriseMode.status && type === 'ltd') active = pid.dev
	// 	product.couponMode.count = product.couponInfo[active]?.length || 0
	// 	product.couponMode.list = product.couponInfo[active]
	// }
	// 重置优惠券信息
	product.couponMode = {
		status: false,
		activeCouponId: '',
		activeCouponInfo: {},
		discountsTitle: '',
		count: product.couponMode.count,
		list: product.couponMode.list,
		disabled: !product.couponMode.count,
		endTimeNum: 0,
	}
	// 优惠券长度为0时禁用优惠券
	if (product.couponMode.count <= 0) {
		product.couponMode.disabled = true
	}
}
const autoSwitch = ref(false) // 是否自动切换支付方式
// 支付监听定时器
let payMonitorTimer: null | number | unknown = null
let payKeepTimer: null | number | unknown = null // 支付状态定时器

/**
 * @description 创建订单
 * @param {NumsListProps} item 产品信息
 */
const createOrder = async (
	params: any = {
		spec_id: product.cycleMode.activeCycleInfo.id,
		pid: Number(productInfo.activeTypeInfo.pid), // 产品ID
		// coupon: product.couponMode.status ? product.couponMode.activeCouponId || '' : '', // 优惠券ID
	},
	isLoad: boolean = true
) => {
	try {
		// 当前请求时间
		const nowTime = new Date().getTime() / 1000
		product.payMode.createOrderTime.push(nowTime)

		if (isLoad) paymentLoading.status = true
		const rdata: any = await getCreateOrder(params)
		if (params.spec_id !== Number(product.cycleMode.activeCycleInfo.id)) {
			return
		}
		const { data: res } = rdata
		const { uid } = res

		// 支付数据整理
		product.payMode.activeBuyInfo = setPayInfoData(res)

		product.payMode.activeBalanceInfo = {
			uid,
			pid: params.pid,
			wxoid: res.wxoid,
		} // 余额支付信息

		// 获取账号余额
		const { credits }: any = await useDataHandle({
			request: getCredits({ uid: rdata.uid }),
			data: {
				res: [Number, 'credits'],
			},
		})
		product.payMode.balance = credits / 100

		paymentLoading.status = false

		// 余额能够支付时，自动切换为余额支付，反之保持不变
		if (product.payMode.balance >= product.payMode.activeBuyInfo.price) {
			// const payTypeCache = localStorage.getItem('PAY-VIEW-INFO-PAY-TYPE')
			// 存在缓存支付方式时，使用缓存支付方式
			product.payMode.activePayType = 'balance'
		} else if (product.payMode.activeBuyInfo.price >= 6000) {
			// 价格是否大于6000,当前处于微信支付时，自动切换为支付宝支付，反之保持不变
			autoSwitch.value = true
			product.payMode.activePayType = product.payMode.activePayType === 'wechat' ? 'alipay' : product.payMode.activePayType
		} else if (product.payMode.balance < product.payMode.activeBuyInfo.price) {
			// 当余额不足以支付且金额小于6000，自动切换为微信支付
			if (product.payMode.activeBuyInfo.price < 6000) product.payMode.activePayType = 'wechat'
			// 否则为支付宝
			else product.payMode.activePayType = 'alipay'
		}

		// 当为自动切换支付方式时，且价格小于6000时，自动切换为微信支付
		if (autoSwitch.value && product.payMode.activeBuyInfo.price < 6000) {
			product.payMode.activePayType = 'wechat'
			autoSwitch.value = false
		}
		product.payMode.activePayCode.apliy = res.ali
		product.payMode.activePayCode.wechat = res.wx
		product.payMode.qrcode.value = product.payMode.activePayType === 'wechat' ? res.wx : res.ali

		// 清除支付监听
		if (payMonitorTimer) clearTimeout(payMonitorTimer as number)
		setTimeout(() => {
			payMonitorEvent(new Date().getTime() / 1000)
		}, 5000)
	} catch (error) {
		// Message.error('获取支付订单接口失败')
		console.log(error)
	}
}

/**
 * @description 获取支付状态 支付监听 4s请求一次
 */
const payMonitorEvent = async (time?: number) => {
	try {
		if (time) sessionStorage.setItem('PAY-VIEW-PACK-TIME', `${time}`)
		const timeVal = sessionStorage.getItem('PAY-VIEW-PACK-TIME')
		if (timeVal) {
			const timeDiff = parseInt(`${new Date().getTime() / 1000 - Number(timeVal)}`, 10)
			if (timeDiff > 600 && payView.value) {
				sessionStorage.removeItem('PAY-VIEW-PACK-TIME')
				return useConfirm({
					title: '支付超时',
					icon: 'warning',
					content: '由于您长时间未操作，支付超时，请刷新网页重新购买！',
					onConfirm: () => {
						close()
						window.location.reload()
					},
					onCancel: () => {
						close()
						window.location.reload()
					},
				})
			}
			if (!payView.value) sessionStorage.removeItem('PAY-VIEW-PACK-TIME')
		}
		if (payMonitorTimer) clearTimeout(payMonitorTimer as number)
		if (product.payMode.activePayType === 'balance') {
			// 余额支付不调用支付状态
			payMonitorTimer = setTimeout(() => {
				payMonitorEvent()
			}, 4000)
			return
		}
		const rqTime = new Date().getTime() / 1000
		const { data } = await getPaymentStatus({ oid: product.payMode.activeBalanceInfo.wxoid })
		if (data !== null) {
			Message.request(data)
			refreshClose()
		} else {
			const nowTime = new Date().getTime() / 1000
			payKeepTimer = setTimeout(payMonitorEvent, nowTime - rqTime < 1 ? 4000 : 3000)
		}
	} catch (error) {
		useHandleError(error)
	}
}

/**
 * @description 设置购买信息
 */
const setPayInfoData = (res: any) => {
	const { cycleMode, numsMode, couponMode } = product
	const { activeCycleInfo } = cycleMode
	const cycleOriginalPrice = activeCycleInfo.org_price
	const { activeNumsInfo } = numsMode
	const { activeCouponInfo: discount, status: couponStatus } = couponMode

	let price = res.price
	let cycle = activeCycleInfo.title || ''
	const originalPrice = cycleOriginalPrice

	// 是否使用优惠券
	if (couponStatus) {
		// 如果为0.99试用 调整周期单位
		if (discount.name.includes('0.99')) {
			price = originalPrice - discount.val1
			cycle = `${discount.experimental_interval}天`
		} else {
			// 其他优惠券
			price = (activeNumsInfo.price || 0) - discount.val2
		}
	}

	return {
		price,
		name: activeCycleInfo.name,
		cycle,
		originalPrice,
		discount,
	}
}

/**
 * @description 切换支付方式
 * @param {} item 支付方式
 */
// eslint-disable-next-line consistent-return
export const changePayTypeEvent = (item: AnyObject) => {
	switch (item.type) {
		case 'wechat':
			if (product && product?.payMode.activeBuyInfo.price >= 6000) {
				Message.warn('刷新支付金额已超过微信单笔支付额度，请选择其他支付方式')
				return false
			}
			product.payMode.qrcode.value = product.payMode.activePayCode.wechat
			break
		case 'alipay':
			product.payMode.qrcode.value = product.payMode.activePayCode.apliy
			break
	}
	product.payMode.activePayType = item.type
	// localStorage.setItem('PAY-VIEW-INFO-PAY-TYPE', item.type)
}

/**
 * @description 余额支付
 */
export const changeBalanceBuyEvent = async () => {
	await useDataHandle({
		loading: '正在支付中...',
		request: productCreditBuy({
			spec_id: product.cycleMode.activeCycleInfo.id,
			pid: Number(productInfo.activeTypeInfo.pid), // 产品ID
		}),
		message: true,
		success: (res: any) => {
			if (res.status) refreshClose()
		},
	})
}

/**
 * @description 支付成功视图
 */
const refreshClose = async () => {
	getUserSurplus(true) // 刷新扩展信息
	close() // 关闭支付弹窗
}

/**
 * @description 刷新软件商店
 */
const refreshSoftEvent = async () => {
	if (location.pathname.indexOf('/soft/plugin') !== -1) {
		isUpdatePayment.value = true // 更新支付状态
		isRefreshSoftList.value = true // 刷新软件商店
	}
}

/**
 * @description 初始化
 */
export const init = async () => {
	window.onbeforeunload = () => {
		return '是否要离开'
	}
	payView.value = true
	tabLoading.status = true

	useDataHandle({
		request: getProductInfo(),
		success: (res: any) => {
			product.cycleMode.list = res.data.spec
			productInfo.activeTypeInfo.pid = res.data.pid
			productInfo.activeTypeInfo.title = res.data.title
			Object.assign(product.cycleMode.activeCycleInfo, {
				cycle: res.data.spec[0].id,
				...res.data.spec[0],
			})
			tabLoading.status = false
			createOrder()
		},
	})
}

export const $reset = () => {
	window.onbeforeunload = () => {}
	autoSwitch.value = false
	payView.value = false
	// 组件销毁时清除定时器
	if (payKeepTimer) clearTimeout(payKeepTimer as number)
	if (payMonitorTimer) clearTimeout(payMonitorTimer as number)
}

/**
 * @description 关闭支付弹窗
 */
const close = async () => {
	$reset()
	emits.value('close')
}

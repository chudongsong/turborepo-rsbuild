import { defineStore } from 'pinia'
import { os, pid } from '@/utils/common'
import { DataHandle, Message, useConfirm, useDataHandle, useDialog, useHandleError, useMessage } from '@/hooks/tools'
import { createVoucherOrder, createWithCreditByPanel, getApplyCopon, getCoupons, getCredits, getLastPaidTime, getPaymentStatus, getPluginRemarks, getPrivilegeSoftList, getProductBuyCode, getProductPrice, getVoucherPlugin, ignoreCouponTime, unbindAuthorization } from '@/api/global'
// import { softDataHandle } from '@/views/soft/useMethod'
import { formatTime, isNumber } from '@/utils'
import { useGlobalStore } from '@/store/global'
import { bindUserDialog, productPaymentDialog } from '@/public'
import { ResponseResult } from '@/hooks/tools/axios/types'
import type { CouponItemProps, CycleListProps, NumsListProps, PayTypeListProps, ProductBuyCodeProps, ProductDataProps, StringKeyProps, SwitchTypeProps, TabItemProps, TabProps } from './types'
// eslint-disable-next-line @typescript-eslint/naming-convention
// import SOFT_PLUGIN_STORE from '@/views/soft/views/plugin/store'

const PRODUCT_PAYMENT_STORE = defineStore('PRODUCT-PAYMENT-STORE', () => {
	const compData = ref<any>({}) // 传入组件数据
	const emits = ref() // 实例
	const payView = ref(false) // 是否显示支付弹窗

	const { payment, authTypeTitle, isUpdatePayment, isRefreshSoftList, setAuthState, authExpirationTime, forceLtd, aliyunEcsLtd, getUnbindNumber } = useGlobalStore()
	const { authType, voucherOpenTime, newUserVoucherOpenTime, bindUser, isGetCoupon } = toRefs(payment.value)
	const isPlugin = ref<boolean>(false) // 是否为插件
	const sourceId = ref<number>() // 来源ID
	const isHomeBubble = ref<boolean>(false) // 是否首页气泡
	const isDisablePro = ref<boolean>(false) // 是否禁用专业版
	const productInfo = reactive<TabProps>({} as TabProps) // 产品信息

	const paySkip = ref(true) // 支付跳转

	const scanned = ref(false) // 是否已扫码

	// 右侧产品信息
	const product = reactive<ProductDataProps>({
		cycleMode: {
			// 产品周期模块
			activeCycleInfo: {
				cycle: 12, // 选中产品周期
			}, // 选中产品周期信息
			list: [], // 产品周期列表
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
			payTips: {
				// 是否提示 还剩到期提醒
				status: false, // 是否提示
				name: '', // 授权名称
				day: 0, // 剩余天数
			},
			isLastBuyRepeat: false, // 是否重复购买
			lastPayTime: 0, // 上次支付时间
			createOrderTime: [], // 创建订单时间
		},
	})

	// 左右切换
	const iSwitch = reactive<SwitchTypeProps>({
		right: true,
		left: false,
	})

	const initVoucher = ref(false) // 是否初始化优惠券
	const countDown = reactive({
		// 优惠券倒计时
		d: '00',
		h: '00',
		m: '00',
		s: '00',
	})

	// 支付监听定时器
	let payMonitorTimer: null | number | unknown = null

	let payKeepTimer: null | number | unknown = null // 支付状态定时器

	// TAB视图加载过渡
	const tabLoading = reactive({
		status: true,
		title: '正在获取产品信息，请稍侯...',
	})

	// 支付订单加载过渡
	const paymentLoading = reactive({
		status: true,
		title: '正在生成支付订单，请稍侯...',
	})

	// 错误遮罩信息
	const errorMask = reactive({
		status: false,
		title: '',
	})

	// 领取过优惠券未退出弹窗
	const isCouponFetchStatus = ref(false) // 状态
	const tempVoucher = ref(false) // 是否领取优惠券
	const timer = ref() // 定时器
	// 新用户优惠券到期时间
	const newUserVoucherEndTime = ref<number>(0)

	const activePayIcon = computed(() => {
		// 选中支付图标
		return `${product?.payMode.activePayType === 'alipay' ? 'ali' : 'wechat'}-pay.svg`
	})

	/**
	 * @description 产品周期左侧切换
	 */
	const switchLeft = () => {
		const box = document.getElementById('list-box') as HTMLElement
		const allLength = product.cycleMode.list.length * 172
		if (box === null) {
			return
		}
		const boxLength = box.clientWidth
		if (allLength < boxLength) return
		const listEl = document.getElementById('list') as HTMLElement
		const leftMove = Math.abs(parseInt(window.getComputedStyle(listEl, null)?.left, 10))
		if (leftMove + boxLength - 360 < boxLength) {
			// 滚到
			listEl.style.left = '0px'
			iSwitch.right = true
			iSwitch.left = false
		} else {
			listEl.style.left = `-${leftMove - 360}px`
		}
	}

	/**
	 * @description 产品周期右侧切换
	 */
	const switchRight = () => {
		const box = document.getElementById('list-box') as HTMLElement
		const allLength = product.cycleMode.list.length * 172 // monitorList是项目列表
		const boxLength = box.clientWidth // 用clientWidth获取外层div的宽度
		if (allLength < boxLength) return // 不需要滑动
		const listEl = document.getElementById('list') as HTMLElement
		const leftMove = Math.abs(parseInt(window.getComputedStyle(listEl, null).left, 10))
		if (leftMove + boxLength + 360 > allLength) {
			// 到底的时候
			listEl.style.left = `-${allLength - boxLength}px`
			iSwitch.right = false
			iSwitch.left = true
		} else {
			listEl.style.left = `-${leftMove + 360}px`
		}
	}

	/**
	 * @description 切换tab
	 */
	const changeTypeTabEvent = async (data: TabItemProps | string): Promise<void> => {
		switchLeft()
		tabLoading.status = true
		product.enterpriseMode.status = false
		const { ltd } = pid
		if (typeof data === 'string') {
			data = productInfo.typeList.find(item => item.type === data) as TabItemProps
		}
		productInfo.activeTypeInfo = data // 选中产品信息
		product.cycleMode.list = [] // tab切换时清空产品周期列表
		product.numsMode.activeNumsInfo.count = 1 // tab切换时重置授权数量
		// product.couponMode.status = false // tab切换时重置优惠券状态
		productInfo.unbindAuthor.status = false // 重置解绑授权状态
		productInfo.unbindAuthor.count = 0 // 重置解绑授权数量

		resetCouponEvent() // 重置优惠券
		// 缓存产品类型
		// sessionStorage.setItem('PAY-VIEW-INFO-TYPE', data.type)
		switch (data.type) {
			case 'coupon':
				tabLoading.title = '正在获取产品抵扣券，请稍侯...'
				await getVoucherPluginList({ pid: data.pid }) // 获取抵扣券列
				tabLoading.status = false
				if (product.voucherMode.proTypeList[ltd]) changeVoucherTypeEvent({ pid: ltd, list: product.voucherMode.proTypeList[ltd].list }) // 默认选中抵扣券类型为企业版
				break
			case 'plugin':
			case 'ltd':
			case 'pro':
			case 'dev':
				tabLoading.title = '正在获取产品信息，请稍侯...'
				if (bindUser.value) {
					await getProductPriceList(data.pid)
				} else {
					createSimulatedData(data.type)
					setNewUserCouponEndTime()
					openNewUserVoucherFetchViewDialog()
				}
				tabLoading.status = false
				changeCycleTabEvent(product.cycleMode.list[0]) // 默认选中第一个产品周期
				break
		}
	}

	/**
	 * @description 切换产品周期
	 * @param {CycleListProps} item 产品周期信息
	 * @returns {void} void
	 */
	const changeCycleTabEvent = async (item: CycleListProps, type?: string) => {
		if (!isUserSignUp('cycle', item)) return

		product.numsMode.list = item.nums // 当前产品授权数量列表
		product.cycleMode.activeCycleInfo = item // 当前产品周期信息

		// 企业版人工运维托管提示
		product.enterpriseMode.isHidden = !(productInfo?.activeTypeInfo.type === 'ltd' && item.cycle === 12)

		if (type === undefined && !product.enterpriseMode.isHidden && product.enterpriseMode.status) {
			product.enterpriseMode.status = false
		}

		// 切换授权数量时清空优惠券
		resetCouponEvent()
		if (item.nums?.length) await changeNumsTabEvent(item.nums[0]) // 默认选中第一个授权数量
	}

	/**
	 * @description 切换授权数量
	 * @param {NumsListProps} item 授权数量信息
	 */
	// eslint-disable-next-line consistent-return
	const changeNumsTabEvent = async (item: NumsListProps) => {
		if (!isUserSignUp('nums', item)) return

		product.numsMode.activeNumsInfo = item // 选中授权数量信息
		const usaCoupon: Array<{ val2: string; id: string }> = [] // 可用券
		const { list: couponList } = product.couponMode // 优惠券列表

		if (productInfo?.activeTypeInfo.type === 'pro' || productInfo?.activeTypeInfo.type === 'ltd') {
			// 是否有优惠券
			if (couponList.length > 0) {
				// 循环优惠券列表
				couponList.forEach((citem: AnyObject) => {
					// 满足当前价格的优惠券
					if (Number(citem.val1) <= item.price) {
						usaCoupon.push(citem as { val2: string; id: string })
					}
				})
				// 如果有可用优惠券
				console.log('切换授权数量', usaCoupon, item, product)
				if (usaCoupon.length) {
					product.couponMode.status = true
					// 排序
					usaCoupon.sort((a, b) => {
						return Number(b.val2) - Number(a.val2)
					})
					// 模拟点击优惠券
					changeCouponEvent(usaCoupon[0].id?.toString())
					return false
				}
			}
		}
		// 抵扣券不为空默认选第一个展示,但不勾选,显示倒计时
		if (!initVoucher.value && product.couponMode.count > 0) {
			const firstCoupon = couponList.filter((citem: AnyObject) => {
				return Number(citem.val1) <= item.price
			})[0]
			console.log(firstCoupon, '89750938')

			if (!firstCoupon) product.couponMode.status = false
			console.log(product.couponMode.status, '0909')
			initVoucher.value = true
			product.couponMode.activeCouponId = firstCoupon?.id?.toString()
			product.couponMode.endTimeNum = Math.floor(firstCoupon?.endtime - Math.floor(new Date().getTime() / 1000))
		}
		// 创建支付订单
		createOrder()
	}

	/**
	 * @description 切换优惠券
	 * @param {string} value 优惠券ID
	 */
	const changeCouponEvent = async (value: string) => {
		if (!value) {
			product.couponMode.status = false
			return Message.error('请选择优惠券')
		}
		console.log('切换优惠券', product, value, product.couponMode.activeCouponInfo.val1, product.numsMode.activeNumsInfo.price)
		// 选中优惠券
		const couponInfo = product.couponMode.list.find((item: AnyObject) => item.id === Number(value)) || {}
		if (couponInfo.val1 && Number(couponInfo.val1) <= product.numsMode.activeNumsInfo.price) {
			product.couponMode.status = true
			product.couponMode.activeCouponId = value.toString()
			// 获取当前选中的优惠券
			const coupon = product.couponMode.list.find(item => item.id === Number(value))
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
		}

		createOrder()
	}

	/**
	 * @description 设置缓存数据 缓存产品周期、产品信息、支付状态、抵扣券列表
	 */
	const setSessionStoragePayInfo = () => {
		const payViewInfo = {
			cycleMode: product.cycleMode,
			numsMode: product.numsMode,
			payMode: product.payMode,
			typeTab: productInfo?.activeTypeInfo.type,
			enterpriseMode: product.enterpriseMode,
			couponMode: product.couponMode,
		}
		sessionStorage.setItem('PAY-VIEW-INFO', JSON.stringify(payViewInfo))
	}
	const autoSwitch = ref(false) // 是否自动切换支付方式
	/**
	 * @description 创建订单
	 * @param {NumsListProps} item 产品信息
	 */
	const createOrder = async (
		params: any = {
			pid: Number(product.numsMode.activeNumsInfo.pid), // 产品ID
			cycle: Number(product.cycleMode.activeCycleInfo.cycle), // 周期
			source: Number(sourceId.value), // 来源ID
			num: Number(product.numsMode.activeNumsInfo.count), // 数量
			coupon: product.couponMode.status ? product.couponMode.activeCouponId || '' : '', // 优惠券ID
			get_ali_msg: 0, // 是否获取支付宝消息
			regain: 0, // 是否重新获取
		},
		isLoad: boolean = true
	) => {
		// aliyun版本企业版不用获取
		if (aliyunEcsLtd.value) return

		try {
			// 当前请求时间
			const nowTime = new Date().getTime() / 1000
			product.payMode.createOrderTime.push(nowTime)

			if (isLoad) paymentLoading.status = true
			const { data: rdata }: any = await getProductBuyCode(params)

			const { activeTypeInfo } = productInfo
			const { pid: activePid } = activeTypeInfo
			const { status: enterpriseStatus } = product.enterpriseMode
			if (
				(activePid === pid.ltd && ((enterpriseStatus && Number(params.pid) !== pid.dev) || (!enterpriseStatus && Number(params.pid) !== pid.ltd))) ||
				(activePid !== pid.ltd && Number(params.pid) !== activePid) ||
				Number(product.numsMode.activeNumsInfo.count) !== params.num ||
				params.cycle !== Number(product.cycleMode.activeCycleInfo.cycle)
			) {
				return
			}

			if (typeof rdata.data === 'string' && rdata.data === 'inherit_order') {
				Message.msg({
					message: rdata.msg,
					type: 'warning',
				})
				await changeRefreshAuthor()
				return createOrder()
			}
			if (typeof rdata.msg === 'string' && rdata.msg.indexOf('接口请求失败') !== -1) {
				Message.msg({
					customClass: 'panel-cloud-error',
					dangerouslyUseHTMLString: true,
					message: rdata.msg,
					type: 'error',
					duration: 0,
					showClose: true,
				})
				return
			}
			if (!rdata.status && rdata.data?.code === 1000) {
				errorMask.status = true
				paymentLoading.status = false
				errorMask.title = rdata.data.msg
				return
			}
			const {
				ali_msg: aliMsg,
				msg,
				extra = undefined,
				data,
				is_coupon: isCoupon, // 单个周期五次触发优惠券，否则为0
				status_code: statusCode,
			} = rdata
			const { cash_fee: cashFee, uid } = data

			// 支付数据整理
			product.payMode.activeBuyInfo = setPayInfoData(cashFee, rdata)

			// 存在授权提示
			if (statusCode === 120 && extra) {
				product.payMode.payTips.name = extra.name
				if (productInfo.activeTypeInfo.type === 'pro' && authExpirationTime.value === '永久授权') {
					// 专业版永久授权
					productInfo.unbindAuthor.status = true
					productInfo.unbindAuthor.count = extra?.rest_unbind_count
					paymentLoading.status = false
					bindAuthData.value = {
						type: productInfo?.activeTypeInfo.type,
						typeName: authTypeTitle.value,
						extra,
					}
					return false
				}
				product.payMode.payTips.status = true
				const differenceInTime = new Date(extra.end_time * 1000).getTime() - new Date().getTime()
				const differenceInDays = differenceInTime / (1000 * 3600 * 24)
				product.payMode.payTips.day = Math.ceil(differenceInDays) // 向上取整，如果还剩0.5天，会计算为1天
			} else {
				product.payMode.payTips.status = false
			}

			// 有待领取优惠券且未手动关闭过领取弹窗
			if (isCoupon && isCoupon.length > 0 && voucherOpenTime.value < new Date().getTime() / 1000 && voucherOpenTime.value !== 100) {
				isCouponFetchStatus.value = true
				// 免费限时领取【大额优惠券】弹窗
				openVoucherFetchViewDialog({
					isCoupon,
				})
			} else if (!tempVoucher.value && product.couponMode.list.length > 0 && !isHomeBubble.value && !isCouponFetchStatus.value) {
				tempVoucher.value = true
				const { val1, val2, id, pid: productId } = product.couponMode.list[0]
				// 立即使用优惠券
				changeCouponEvent(id)
				// 您还有一张优惠券未使用弹窗
				// couponUseReminderDialog({
				// 	val1,
				// 	val2,
				// 	proTitle: productInfo?.typeList?.find((item: AnyObject) => item.pid === productId)?.title || '',
				// 	id,
				// })
			}
			data.returnTime = nowTime // 手动追加返回时间，用于判断是否为最后一条返回数据
			product.payMode.activeBalanceInfo = data // 余额支付信息

			// 最近支付时间
			if (product.payMode.lastPayTime <= 0) {
				if (!data.pid) {
					Message.error('请求失败')
					return
				}
				useDataHandle({
					request: getLastPaidTime({ pid: data.pid }),
					data: {
						res: [Number, 'buyVerify'],
					},
					success: (res: any) => {
						if (res) {
							product.payMode.lastPayTime = res.buyVerify
							buyRecentlyTime()
						}
					},
				})
			} else {
				buyRecentlyTime()
			}

			// 获取账号余额
			const { credits }: any = await useDataHandle({
				request: getCredits({ uid }),
				data: {
					res: [Number, 'credits'],
				},
			})
			product.payMode.balance = credits / 100

			// 本条订单非最后一条，跳出循环
			const { createOrderTime } = product.payMode
			if (createOrderTime[createOrderTime.length - 1] !== data.returnTime) return false

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
			product.payMode.activePayCode.apliy = aliMsg
			product.payMode.activePayCode.wechat = msg
			product.payMode.qrcode.value = product.payMode.activePayType === 'wechat' ? msg : aliMsg

			// 企业版判断是否需要获取企业版运维版信息
			if (productInfo?.activeTypeInfo.type === 'ltd') getEnterpriseTips(product.numsMode.activeNumsInfo.count)

			// 清除支付监听
			if (payMonitorTimer) clearTimeout(payMonitorTimer as number)
			if (productInfo?.activeTypeInfo.type !== 'coupon') {
				// 抵扣券不监听
				setTimeout(() => {
					paySkip.value = true
					payMonitorEvent(new Date().getTime() / 1000)
				}, 5000)
			}
			// 缓存产品周期、产品信息、支付状态、抵扣券列表
			setSessionStoragePayInfo()
		} catch (error) {
			// Message.error('获取支付订单接口失败')
			console.log(error)
		}
	}

	const couponCompData = ref<AnyObject>({}) // 传入组件数据
	const couponInstance = ref() // 优惠券实例

	/**
	 * @description 企业版优惠券初始化提醒
	 */
	const couponUseReminderDialog = async (data: { val1: number; val2: number; proTitle: string; id: number }) => {
		couponCompData.value = data
		couponInstance.value = useDialog({
			area: 46,
			component: () => import('./coupon/index.vue'),
		})
	}

	// 立即使用
	const changeVoucher = async () => {
		changeCouponEvent(couponCompData.value.id)
		const popup = await couponInstance.value
		popup?.unmount() // 关闭优惠券弹窗
	}

	/**
	 * @description 最近一次支付时间判断
	 */
	const buyRecentlyTime = () => {
		// 当下时间戳减去最后一次支付的时间戳，如果小于1800秒，就是30分钟内重复购买
		if (new Date().getTime() / 1000 - product.payMode.lastPayTime < 1800) {
			product.payMode.isLastBuyRepeat = true
		} else {
			product.payMode.isLastBuyRepeat = false
		}
	}

	/**
	 * @description 获取企业展示人工运维托管信息
	 */
	const enterprise = ref(0)
	const getEnterpriseTips = async (index: number) => {
		let numsData: Array<AnyObject> = []

		// 是否存在数据缓存
		if (product.devCycleInfo.isGetOperated && product.devCycleInfo.data.nums.length) {
			numsData = product.devCycleInfo.data.nums
		} else {
			const { data } = await getProductPrice({ pid: 100000068 })
			numsData = data['12'].nums

			// 设置数据缓存
			product.devCycleInfo.isGetOperated = true
			product.devCycleInfo.data = data['12']
		}

		// 查找运维托管信息
		const matchedItem = numsData.find((item: AnyObject) => item.count === index)
		if (matchedItem) {
			// 匹配的数据
			enterprise.value = matchedItem.price
		}
	}

	const siteList = [
		{
			label: '今日内不再提醒',
			value: 'today',
		},
		{
			label: '近7天内不再提醒',
			value: 'week',
		},
		{
			label: '永久不再提醒',
			value: 'forver',
		},
	]
	const timeClose = ref<string>('')
	const closeAfterReload = ref(false)
	const timeNow = ref<number>(Math.floor(Date.now() / 1000)) // 当前时间戳

	/**
	 * @description 设置小于10的数字前面加0
	 */
	const addZero = (num: number) => {
		return num < 10 ? `0${num}` : `${num}`
	}

	/**
	 * @description 领取优惠券
	 */
	// eslint-disable-next-line consistent-return
	const claimCouponEvent = async (popupClose?: () => void) => {
		try {
			const { data } = await getApplyCopon()
			isGetCoupon.value = true
			if (isNumber(data?.status) && data?.status === 0) {
				Message.request({ msg: data.msg, status: false })
				closeAfterReload.value = true
				return
			}
			// eslint-disable-next-line @typescript-eslint/naming-convention
			const proArr: StringKeyProps = { '100000011': 'pro', '100000032': 'ltd', '100000068': 'dev' }
			const pro = proArr[data.data[0].pid]
			const { id } = data.data[0]
			Message.request({ msg: data.msg, status: true })
			const popup = await voucherFetchInstance.value
			popup?.unmount() // 关闭领取优惠券弹窗
			if (popupClose && typeof popupClose === 'function') popupClose()
			if (isHome.value) {
				// 打开支付界面
				await productPaymentDialog({
					disablePro: pro !== 'pro',
					sourceId: 176,
					isHomeBubble: { id, pro },
				})
				return false
			}
			await useFirstCouponEvent(id, pro)
		} catch (err) {
			useHandleError(err)
		}
	}

	// 选择关闭的时间
	const changeCloseTimeEvent = async (val: string, isTips: boolean = true) => {
		let time = 0
		let tipsTitle = ''
		timeClose.value = val
		// 根据选择的时间，计算出时间戳（today获取当天晚上12点59分，week获取7天后的晚上12点59分，forver设置为-100）
		switch (timeClose.value) {
			case 'today':
				time = new Date(new Date().toLocaleDateString()).getTime() + 24 * 60 * 60 * 1000 - 1
				tipsTitle = '今日内不再通知'
				break
			case 'week':
				time = new Date(new Date().toLocaleDateString()).getTime() + 7 * 24 * 60 * 60 * 1000 - 1
				tipsTitle = '近7天内不再通知'
				break
			case 'forver':
				time = -100
				tipsTitle = '永久不再通知'
				break
		}
		time = Math.floor(time > 0 ? time / 1000 : time) // 传给后端的时间戳
		if (isTips)
			await useConfirm({
				title: '提示',
				content: `${tipsTitle},是否确认?`,
			})

		// 支付界面的关闭优惠券由前端控制再次开启时间

		if (!isHome.value) {
			try {
				// eslint-disable-next-line @typescript-eslint/naming-convention
				const rdata = await ignoreCouponTime({ limit_time: time })
				if (isTips) Message.request(rdata)
			} catch (e) {
				useHandleError(e)
			}
		} else {
			voucherOpenTime.value = time
			sessionStorage.setItem('voucherOpenTime', voucherOpenTime.value.toString())
		}
		const popup = await voucherFetchInstance.value
		popup?.unmount() // 关闭领取优惠券弹窗
		isGetCoupon.value = true
	}

	const couponItem = ref<CouponItemProps[]>([]) // 是否领取优惠券
	const isHome = ref<boolean>(false) // 是否为首页
	const voucherFetchInstance = ref<any>() // 领取优惠券实例
	const newUserVoucherFetchInstance = ref<any>() // 新用户领取优惠券实例

	/**
	 * @description 企业版优惠券领取界面
	 */
	const openVoucherFetchViewDialog = async (compData: { isCoupon: CouponItemProps[]; isHome?: boolean }) => {
		// aliyun版本企业版不用获取
		if (aliyunEcsLtd.value) return

		couponItem.value = compData.isCoupon
		isHome.value = compData.isHome || false
		voucherFetchInstance.value = useDialog({
			area: 40,
			component: () => import('./coupon-collection/index.vue'),
			customClass: 'voucherFetchView',
			compData,
			onCancel: () => {
				if (closeAfterReload.value) window.location.reload()
			},
		})
	}
	/**
	 * @description 新用户优惠券领取界面
	 */
	const openNewUserVoucherFetchViewDialog = async () => {
		// aliyun版本企业版不用获取
		if (aliyunEcsLtd.value || payment.value.bindUser) return

		newUserVoucherFetchInstance.value = useDialog({
			area: 40,
			component: () => import('./coupon-new-user/index.vue'),
			customClass: 'voucherFetchView',
		})
	}

	/**
	 * @description 领取临时优惠券后使用领取的第一张券
	 * @param {string} id 券ID
	 * @param {string} type 券类型
	 */
	const useFirstCouponEvent = async (id: string, type: string) => {
		await getCouponList() // 重新优惠券列表
		if (type !== productInfo?.activeTypeInfo.type) {
			// 如果当前选中的产品类型不是优惠券类型，就切换到优惠券类型
			await changeTypeTabEvent(type)
		}
		await changeCouponEvent(id) // 选中优惠券
	}

	/**
	 * @description 获取优惠券列表
	 * @param {AnyObject} item 产品周期信息
	 */
	const getCouponList = async () => {
		// aliyun版本企业版不用获取
		if (aliyunEcsLtd.value) return

		product.couponInfo[pid.pro] = []
		product.couponInfo[pid.ltd] = []
		product.couponInfo[pid.dev] = []

		// 未绑定用户时不获取优惠券
		if (!bindUser.value) return

		await useDataHandle({
			request: getCoupons(),
			data: {
				res: [Array, 'data'],
			},
			success: (res: any) => {
				const thDate = new Date().getTime() / 1000
				// 根据产品res中的产品ID，存放到couponInfo对应id的数组中
				res.data.forEach((item: AnyObject) => {
					// 到期时间减现在时间，得到剩余时间
					const hour = Math.floor((item.endtime - Math.floor(thDate)) / (60 * 60)) // 小时
					let day = 0 // 天

					if (hour > 24) {
						day = Math.floor(hour / 24)
					} else if (hour > 0) {
						day = 1
					}
					item.newName = `${item.name}( ${day}天后过期)`
					product.couponInfo[item.product_id]?.push(item)
				})
				resetCouponEvent() // 恢复默认优惠券初始值
			},
		})
	}

	/**
	 * @description 获取支付状态 支付监听 4s请求一次
	 */
	const payMonitorEvent = async (time?: number) => {
		try {
			if (!payView.value) return
			if (time) sessionStorage.setItem('PAY-VIEW-INFO-TIME', `${time}`)
			const timeVal = sessionStorage.getItem('PAY-VIEW-INFO-TIME')
			if (timeVal) {
				const timeDiff = parseInt(`${new Date().getTime() / 1000 - Number(timeVal)}`, 10)
				if (timeDiff > 600 && payView.value) {
					paySkip.value = false
					sessionStorage.removeItem('PAY-VIEW-INFO-TIME')
					// eslint-disable-next-line consistent-return
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
				if (!payView.value) sessionStorage.removeItem('PAY-VIEW-INFO-TIME')
			}
			if (payMonitorTimer) clearTimeout(payMonitorTimer as number)
			// 组件销毁 存在授权 tab为抵扣券 时停止递归
			if (productInfo?.activeTypeInfo.type === 'coupon' || productInfo.unbindAuthor.status) {
				// 组件销毁时停止递归
				return
			}
			if (product.payMode.activePayType === 'balance') {
				// 余额支付不调用支付状态
				payMonitorTimer = setTimeout(() => {
					payMonitorEvent()
				}, 4000)
				return
			}
			const rqTime = new Date().getTime() / 1000
			const { status, data }: ResponseResult = await useDataHandle({
				request: getPaymentStatus({ wxoid: product.payMode.activeBalanceInfo.wxoid, py_type: product.payMode.activePayType === 'alipay' ? 'ali' : '' }),
				data: {
					status: [Boolean, 'status'],
					data: [Object, 'data'],
				},
			})
			const scannedArr = ['WAIT_BUYER_PAY', 'TRADE_CLOSED']
			if (data && scannedArr.includes(data.status)) {
				// 支付宝支付已扫码
				scanned.value = true
			}
			if (status) {
				openBuySuccessView()
			} else {
				const nowTime = new Date().getTime() / 1000
				payKeepTimer = setTimeout(payMonitorEvent, nowTime - rqTime < 1 ? 4000 : 3000)
			}
		} catch (error) {
			useHandleError(error)
		}
	}

	/**
	 * @description 刷新waf界面
	 */
	const refreshBrowser = () => {
		if (window.location.pathname.includes('/waf') || forceLtd.value) window.location.reload()
	}

	/**
	 * @description 刷新软件商店
	 */
	const refreshSoftEvent = async () => {
		if (window.location.pathname.indexOf('/soft/plugin') !== -1) {
			isUpdatePayment.value = true // 更新支付状态
			isRefreshSoftList.value = true // 刷新软件商店
		}
	}

	const paySuccessData = ref<any>({}) // 支付成功数据

	/**
	 * @description 更新授权支付状态
	 */
	const updateAuthPaymentStatus = async () => {
		// 获取软件列表刷新授权
		const { data } = await getPrivilegeSoftList({ force: 1 })
		// 数据处理和类型验证
		const { ltd, pro } = new DataHandle(data, {
			ltd: Number, // 企业版
			pro: Number, // 专业版
		}).exportData()
		setAuthState([0, pro, ltd])
		return { ltd, pro } as AnyObject
	}

	/**
	 * @description 支付成功视图
	 */
	const openBuySuccessView = async () => {
		try {
			await refreshSoftEvent()
			close() // 关闭支付弹窗
			const data = await updateAuthPaymentStatus()
			if (productInfo?.activeTypeInfo?.type === 'plugin') return useMessage().success(`${productInfo.activeTypeInfo.title}支付成功`)
			const type = productInfo?.activeTypeInfo?.type === 'dev' ? 'ltd' : productInfo?.activeTypeInfo?.type || ''
			Object.assign(paySuccessData.value, {
				type: productInfo.activeTypeInfo.type,
				typeTipsList: productInfo.activeTypeInfo.tipsList,
				cycle: product.payMode.activeBuyInfo.cycle,
				count: product.payMode.activeBuyInfo.count,
				lastTime: formatTime(data[type]),
				title: productInfo.activeTypeInfo.title,
			})
			useDialog({
				area: 68,
				component: () => import('./payment-success/index.vue'),
			})
			refreshBrowser()
		} catch (error) {
			useHandleError(error)
		}
	}

	/**
	 * @description 设置购买信息
	 */
	const setPayInfoData = (cashFee: number, data: AnyObject) => {
		const { cycleMode, numsMode, couponMode } = product
		const { activeCycleInfo } = cycleMode
		const cycleOriginalPrice = activeCycleInfo.originalPrice
		const { activeNumsInfo } = numsMode
		const { activeCouponInfo: discount, status: couponStatus } = couponMode

		let price = cashFee / 100
		let cycle = activeCycleInfo.title || ''
		let count = activeNumsInfo.count || 0
		const originalPrice = cycleOriginalPrice * count

		// 是否使用优惠券
		if (couponStatus) {
			// 如果为0.99试用 调整周期单位
			if (discount.name.includes('0.99')) {
				price = originalPrice - discount.val1
				cycle = `${discount.experimental_interval}天`
				count = 1
			} else {
				// 其他优惠券
				price = data.price
			}
		}
		return {
			price,
			count,
			cycle,
			originalPrice,
			discount,
		}
	}
	const productPriceLoading = ref(false) // 产品价格加载状态
	/**
	 * @description 获取指定产品类型周期列表
	 * @param {number} productId 产品ID
	 */
	const getProductPriceList = async (productId: number) => {
		try {
			productPriceLoading.value = true
			const { data } = await getProductPrice({ pid: productId })
			if (Number(data.pid) === pid.dev) {
				delete data['1']
				delete data['6']
				delete data['36']

				// 设置数据缓存
				product.devCycleInfo.isGetOperated = true
				product.devCycleInfo.data = data['12']
			}
			const array: CycleListProps[] = []
			// eslint-disable-next-line no-restricted-syntax
			for (const key in data) {
				if (Object.prototype.hasOwnProperty.call(data, key)) {
					const { price, tip: recommend, sprice: originalPrice, nums, sort } = data[key]
					// if (num > 4) break //仅显示前四条信息
					// eslint-disable-next-line no-restricted-globals
					if (!isNaN(Number(key))) {
						const title = Number(key) % 12 === 0 ? `${Number(key) / 12}年` : `${Number(key)}个月`
						array.push({
							cycle: Number(key),
							price,
							recommend,
							originalPrice,
							nums,
							sort,
							title,
							everyDay: (price / Number(key) / 30).toFixed(2),
						})
					}
				}
			}
			// 顶置推荐产品
			array.sort((a: AnyObject, b: AnyObject) => {
				return a.sort - b.sort
			})
			product.cycleMode.list = array
		} catch (error) {
			useHandleError(error)
		} finally {
			productPriceLoading.value = false
		}
	}

	/**
	 * @description 选中产品抵扣券类型
	 * @param {Array} item.list 产品类型的抵扣券
	 * @param {number} item.pid 产品ID
	 */
	const changeVoucherTypeEvent = (item: { list: any[]; pid: number }) => {
		const { list, pid } = item
		product.voucherMode.list = list
		product.voucherMode.typeActive = pid
		if (list.length) return changeVoucherEvent(list[0]) // 默认选中第一个抵扣券
		return Message.warn('暂无可用优惠券')
	}

	/**
	 * @description 选中抵扣券
	 * @param {number} item.id 抵扣券
	 * @param {number} item.pid 产品ID
	 * @param {string} item.code 抵扣券码
	 */
	// eslint-disable-next-line @typescript-eslint/naming-convention
	const changeVoucherEvent = (item: { id: number; product_id: number; code: string }) => {
		const { id, product_id: pid, code } = item
		product.voucherMode.active = id
		product.voucherMode.activeInfo = { pid, code }
	}

	/**
	 * @description 获取产品抵扣券列表
	 * @param {number} item.pid 产品ID
	 */
	const getVoucherPluginList = async (item: { pid: number }) => {
		try {
			product.voucherMode.loading = true
			product.voucherMode.list = []
			product.voucherMode.typeList = {}
			product.voucherMode.proTypeList = {}
			const { data } = await getVoucherPlugin(item)
			product.voucherMode.isExist = !(data.length === 0) // 是否存在抵扣券
			data.forEach((item: AnyObject) => {
				const { product_id: pid, name } = item
				// eslint-disable-next-line no-prototype-builtins
				if (!product.voucherMode.typeList.hasOwnProperty(pid)) {
					product.voucherMode.typeList[pid] = {
						name,
						pid,
						list: [item],
					}
				} else {
					product.voucherMode.typeList[pid].list.push(item)
				}
			})
			const keysOrder = ['100000011', '100000032']
			keysOrder.reverse().forEach(key => {
				if (product.voucherMode.typeList[key]) {
					const tempValue = product.voucherMode.typeList[key]
					product.voucherMode.proTypeList[key] = tempValue
					delete product.voucherMode.typeList[key]
				}
			})
		} catch (error) {
			useHandleError(error)
		} finally {
			product.voucherMode.loading = false
		}
	}

	/**
	 * @description 一年企业提示人工运维托管
	 * @param {boolean} val 是否勾选
	 */
	const enterpriseEvent = (val: boolean | number | string) => {
		product.enterpriseMode.status = Boolean(val)
		// 选中时
		if (val) {
			// 配置运维托管周期信息
			changeCycleTabEvent(
				{
					cycle: 12,
					price: product.devCycleInfo.data.price,
					recommend: false,
					originalPrice: product.devCycleInfo.data.sprice,
					nums: product.devCycleInfo.data.nums,
					sort: 0,
					title: '1年',
					everyDay: (product.devCycleInfo.data.price / 12 / 30).toFixed(2),
				},
				'dev'
			)
		} else {
			changeCycleTabEvent(product.cycleMode.list[0])
		}
	}

	/**
	 * @description 点击优惠券栏目
	 * @param {boolean} newValue 是否勾选
	 */
	// eslint-disable-next-line consistent-return
	const changeCouponBoxEvent = (newValue?: boolean | string | number) => {
		const { status, count, activeCouponId } = product.couponMode
		// 没有优惠券时无法选中
		if (count === 0) {
			product.couponMode.status = false
			return Message.warn('暂无可用优惠券')
		}
		console.log('点击优惠券栏目', product)
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
	 * @description 恢复默认优惠券初始值
	 */
	const resetCouponEvent = () => {
		const { type, pid: productId } = productInfo.activeTypeInfo
		// 获取对应产品的优惠券
		if (['plugin', 'coupon'].includes(type)) {
			product.couponMode.count = 0
			product.couponMode.list = []
		} else {
			let active = productId
			// 当选中人工运维托管时，优惠券使用dev产品的优惠券
			if (product.enterpriseMode.status && type === 'ltd') active = pid.dev
			product.couponMode.count = product.couponInfo[active]?.length || 0
			product.couponMode.list = product.couponInfo[active]
		}
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
			product.couponMode.status = false
		}
	}

	/**
	 * @description 关闭支付弹窗
	 */
	const close = async () => {
		window.onbeforeunload = () => {}
		$reset()
		emits.value('close')
	}

	/**
	 * @description 关闭弹窗，离开页面提示
	 */
	const onCancel = async () => {
		if (aliyunEcsLtd.value) {
			// 刷新授权
			updateAuthPaymentStatus()
			close()
			return false
		}
		if (!bindUser.value) {
			close()
			return false
		}
		await useConfirm({
			title: '温馨提示',
			content: `支付过程中，请勿关闭该页面，以免出现支付异常！<br><a
				class="bt-link text-small"
				href="https://www.bt.cn/new/wechat_customer"
				target="_blank"
				rel="noreferrer noopener"
				>支付遇到问题？联系客服</a
			>`,
			isHtml: true,
			width: '40rem',
		})
		close()
		return false
	}

	/**
	 * @description 获取当前显示的tab
	 */
	const getCurrentTabList = () => {
		return productInfo?.typeList?.filter((item: AnyObject) => item?.isHidden !== true)
	}

	/**
	 * @description 获取产品类型tab
	 */
	const getTypeTab = () => {
		// aliyunEcsLtd
		if (aliyunEcsLtd.value) return 'dev'
		let typeTab = authType.value === 'free' ? 'ltd' : authType.value
		if (!isDisablePro.value && typeTab !== 'ltd') typeTab = 'pro'
		return typeTab
		// 获取缓存tab
		// const activeType = sessionStorage.getItem('PAY-VIEW-INFO-TYPE')
		// return activeType || typeTab
	}

	/**
	 * @description 检测tab是否存在
	 * @param {string} typeTab 产品类型
	 * @param {Array} tabList tab列表
	 */
	const checkTabExistence = (typeTab: string, tabList: AnyObject[]) => {
		return tabList?.some((item: AnyObject) => item.type === typeTab)
	}

	/**
	 * @description 使用存储数据
	 */
	const setProductInfo = (payInfo: AnyObject, typeTab: string) => {
		const { cycleMode, numsMode, payMode } = payInfo
		Object.assign(product, { cycleMode, numsMode, payMode })
		productInfo.activeTypeInfo.type = typeTab
		product.enterpriseMode.isHidden = !(typeTab === 'ltd' && cycleMode.activeCycleInfo.cycle === 12)
	}

	/**
	 * @description 检测首页气泡打开
	 */
	const checkAndUseHomeBubble = async () => {
		// 检测是否首页气泡打开
		if (isHomeBubble.value && Object.keys(isHomeBubble.value).length > 0 && typeof isHomeBubble.value === 'object') {
			const { id, pro } = isHomeBubble.value
			// 首页气泡打开时，领取临时优惠券后使用领取的第一张券
			await useFirstCouponEvent(id, pro)
		}
	}

	const privilegeContrastInstance = ref<any>() // 特权对比弹窗实例

	/**
	 * @description 打开特权对比弹窗
	 */
	const openPrivilegeContrast = () => {
		privilegeContrastInstance.value = useDialog({
			area: [97, 76],
			component: () => import('./product-introduce/privilege-compared/index.vue'),
		})
	}

	const privilegeList = ['多对一技术支持', '全年5次安全排查', '5分钟极速响应', '30+款付费插件', '20+企业版专享功能', '1000条免费短信（年付）', '2张SSL商用证书（年付）', '一对一服务（年付）', 'WAF防火墙', '更换授权IP', '客服优先响应', '15+款付费插件', '15天无理由退款']
	const proPrivilegeList = [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1]
	const ltdPrivilegeList = [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
	const plusPrivilegeList = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]

	/**
	 * @description 立即购买
	 */
	const go2tab = async (type: string) => {
		changeTypeTabEvent(type)
		// 关闭特权对比弹窗
		const popup = await privilegeContrastInstance.value
		popup?.unmount()
	}

	const isRemarksLoading = ref<boolean>(false)

	/**
	 * @description 初始化产品说明
	 */
	const initRemarks = async () => {
		let remarksList = sessionStorage.getItem('PAY-VIEW-INFO-REMARKS')
		if (!remarksList) {
			// 第一步：获取产品说明
			await useDataHandle({
				loading: isRemarksLoading,
				request: getPluginRemarks(),
				data: {
					pro_list: [Array, 'pro'],
					list: [Array, 'ltd'],
					vip_pro_list: [Array, 'vip_pro_list'],
					activity_list: [Array, 'activityList'],
				},
				success: (res: any) => {
					remarksList = JSON.stringify(res)
					sessionStorage.setItem('PAY-VIEW-INFO-REMARKS', remarksList)
				},
			})
		}
		const res = JSON.parse(remarksList as string)
		isRemarksLoading.value = false
		const { pro, ltd, vip_pro_list: vipTip, activityList } = res
		productInfo.typeList[1].tipsList = pro
		productInfo.typeList[2].tipsList = ltd
		productInfo.typeList[3].tipsList = vipTip
		const parser = new DOMParser()
		const doc = parser.parseFromString(activityList, 'text/xml')
		// const text = doc.querySelector('span')?.textContent
		productInfo.activityList = activityList || ''
		productInfo.activeTypeInfo = productInfo.typeList.find((item: AnyObject) => item.type === productInfo.activeTypeInfo.type) as TabItemProps
		getCouponList()
	}

	const payList = ref<PayTypeListProps[]>([
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
	])

	/**
	 * @description 切换支付方式
	 * @param {} item 支付方式
	 */
	// eslint-disable-next-line consistent-return
	const changePayTypeEvent = async (item: AnyObject) => {
		scanned.value = false
		switch (item.type) {
			case 'wechat':
				if (product && product?.payMode.activeBuyInfo.price >= 6000) {
					Message.warn('刷新支付金额已超过微信单笔支付额度，请选择其他支付方式')
					return false
				}
				product.payMode.qrcode.value = product.payMode.activePayCode.wechat
				break
			case 'alipay':
				if (product.payMode.activePayCode.apliy === '' || item.isRegain) {
					await createOrder(
						{
							pid: Number(product.numsMode.activeNumsInfo.pid), // 产品ID
							cycle: Number(product.cycleMode.activeCycleInfo.cycle), // 周期
							source: Number(sourceId.value), // 来源ID
							num: Number(product.numsMode.activeNumsInfo.count), // 数量
							coupon: product.couponMode.status ? product.couponMode.activeCouponId || '' : '', // 优惠券ID
							get_ali_msg: 1, // 是否获取支付宝消息
							regain: item.isRegain ? 1 : 0,
						},
						true
					)
					product.payMode.qrcode.value = product.payMode.activePayCode.apliy
					scanned.value = false
				} else {
					product.payMode.qrcode.value = product.payMode.activePayCode.apliy
				}
				break
		}
		product.payMode.activePayType = item.type
		// localStorage.setItem('PAY-VIEW-INFO-PAY-TYPE', item.type)
	}

	/**
	 * @description 余额支付
	 */
	const changeBalanceBuyEvent = async () => {
		await useDataHandle({
			loading: '正在支付中...',
			request: createWithCreditByPanel({
				num: Number(product?.numsMode?.activeNumsInfo?.count),
				cycle: Number(product?.cycleMode?.activeCycleInfo?.cycle),
				uid: Number(product?.payMode?.activeBalanceInfo?.uid),
				pid: Number(product?.payMode?.activeBalanceInfo?.pid),
				coupon: product.couponMode.status ? product.couponMode.activeCouponId || '' : '', // 优惠券ID
			}),
			data: {
				res: String,
				success: Boolean,
			},
			success: (res: any) => {
				Message.request({ msg: res.res, status: res.success })
				if (res.success) openBuySuccessView()
			},
		})
	}

	/**
	 * @description 刷新授权
	 */
	const changeRefreshAuthor = async () => {
		try {
			const data = await updateAuthPaymentStatus()
			if (data) {
				Message.request({ msg: '刷新成功', status: true })
				if (productInfo?.activeTypeInfo?.type) changeTypeTabEvent(productInfo.activeTypeInfo.type) // 刷新授权后刷新当前tab
			}
		} catch (error) {
			useHandleError(error)
		}
	}

	// 抵扣券点击事件
	const voucherLoading = ref<boolean>(false)

	/**
	 * @description 获取抵扣券授权周期描述
	 * @param {number} cycle 授权周期
	 * @param {string} unit 授权周期单位
	 * @returns {string} 授权周期描述
	 */
	const getVoucherCycleDescribe = (cycle: number, unit: string) => {
		if (unit === 'month') {
			return cycle % 12 ? `${cycle}个月` : `${cycle / 12}年`
		}
		return `${cycle + (unit === 'year' ? '年' : '天')}`
	}

	/**
	 * @description 使用选中抵扣券
	 */
	const useChangeVoucher = async () => {
		voucherLoading.value = true
		if (product?.voucherMode.activeInfo.code === '') return Message.warn('请选择抵扣券')
		const {
			status,
			extra = undefined,
			statusCode,
			msg,
		}: AnyObject = await useDataHandle({
			loading: '正在使用抵扣券，请稍侯...',
			request: createVoucherOrder({
				pid: Number(product?.voucherMode.activeInfo.pid),
				code: product?.voucherMode.activeInfo.code || '',
			}),
			data: {
				extra: [Object, 'extra'],
				status: Boolean,
				status_code: [Number, 'statusCode'],
				msg: String,
			},
		})
		voucherLoading.value = false
		// 续费成功
		if (status) {
			await updateAuthPaymentStatus()
			Message.request({ msg, status })
			refreshSoftEvent()
			close() // 关闭支付弹窗
			refreshBrowser()
		} else if (statusCode === 120 && !status) {
			voucherLoading.value = false
			// 支付界面抵扣券解绑授权视图
			unbindBuyAuthorDialog({
				type: productInfo?.activeTypeInfo.type,
				typeName: authTypeTitle.value,
				extra,
			})
		} else {
			Message.request({ msg, status })
		}
	}

	const bindAuthData = ref<any>({}) // 绑定授权数据
	const isDisabledAuth = ref<boolean>(false) // 是否禁用授权
	const unbindBuyAuthInstance = ref<any>() // 解绑授权弹窗实例

	/**
	 * @description: 解绑授权
	 * @returns
	 */
	const changeUnbindAuthor = async (isRefreshTab: boolean = false) => {
		// 是否有解绑次数
		if (bindAuthData.value.extra.rest_unbind_count > 0) {
			try {
				await useConfirm({
					title: '提示',
					content: `解绑当前【${authTypeTitle.value}授权】，继续操作！`,
				})
				isDisabledAuth.value = true
				const { data } = await unbindAuthorization()
				Message.request({ msg: data.res, status: data.success })
				if (data.success) {
					await updateAuthPaymentStatus()
					if (isRefreshTab) {
						setTimeout(() => {
							// 延迟刷新tab
							changeTypeTabEvent(productInfo.activeTypeInfo.type)
						}, 500)
					} else {
						// 刷新抵扣券
						await getVoucherPluginList({ pid: pid.coupon })
					}
					refreshSoftEvent()
					const popup = await unbindBuyAuthInstance.value
					popup?.unmount() // 关闭解绑授权弹窗
				}
			} catch (error) {
				console.log(error, 'error')
			} finally {
				isDisabledAuth.value = false
			}
		} else {
			// 跳转官网购买解绑次数
			window.open('https://www.bt.cn/admin/profe_ee', '_blank', 'noopener,noreferrer')
		}
	}

	/**
	 * @description 切换抵扣券类型
	 * @param {string} compData.type 产品类型
	 * @param {string} compData.typeName 授权类型
	 * @param {number} compData.extra 附加信息
	 */
	const unbindBuyAuthorDialog = (compData: {
		type: string
		typeName: string
		extra: {
			// eslint-disable-next-line @typescript-eslint/naming-convention
			rest_unbind_count: number
		}
	}) => {
		bindAuthData.value = compData
		unbindBuyAuthInstance.value = useDialog({
			area: [32, 29],
			component: () => import('./unbind-auth/index.vue'),
		})
	}

	/**
	 * @description 初始化数据
	 */
	const initData = () => {
		const { pluginInfo, disablePro } = compData.value
		isPlugin.value = !!pluginInfo // 是否插件
		sourceId.value = compData.value.sourceId // 设置来源ID
		isDisablePro.value = disablePro // 是否禁用专业版
		isHomeBubble.value = compData.value.isHomeBubble // 首页气泡

		Object.assign(productInfo, {
			typeList: [
				{
					type: 'plugin',
					title: isPlugin.value ? pluginInfo.title : '插件',
					describe: isPlugin.value ? (pluginInfo.type === 8 ? '【专业版】已包含此插件' : '【企业版】已包含此插件') : '',
					pid: isPlugin.value ? pluginInfo.pid : 0,
					isHidden: !isPlugin.value,
					tipsTitle: '插件说明',
					tipsList: [],
				},
				{
					type: 'pro',
					title: `${os}专业版`,
					describe: '适用于个人用户、个人项目',
					pid: pid.pro,
					isHidden: disablePro,
					tipsTitle: '专业版特权',
					tipsList: [],
				},
				{
					type: 'ltd',
					title: `${os}企业版`,
					describe: '适用于官网，电商、教育、医疗等用户',
					pid: pid.ltd,
					recommend: true,
					tipsTitle: '企业版特权',
					tipsList: [],
				},
				{
					type: 'dev',
					title: '企业运维托管',
					describe: '适用于无专业技术、需技术服务的企业',
					pid: pid.dev,
					tipsTitle: '企业运维托管特权',
					isHidden: isPlugin.value,
					tipsList: ['网站性能优化', '网站安全扫描', '网站攻击防护', '服务器运维托管', '企业版所有特权', '文件防篡改配置', '文件代码同步部署', '系统文件垃圾清理', '数据库数据同步部署', '50x/40x网站报错处理', 'CPU内存占用过高处理'],
				},
				{
					type: 'coupon',
					title: '抵扣券',
					describe: '抵扣券授权',
					pid: pid.coupon,
					tipsTitle: '抵扣券来源',
					tipsList: ['官网后台购买', '活动页购买', '推广赠送', '更换绑定IP'],
				},
			],
			activityList: '',
			activeTypeInfo: {
				type: 'pro',
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
	}

	/**
	 * @description 初始化
	 */
	const init = async (data: any) => {
		if (data) compData.value = data
		payView.value = true

		initData() // 初始化 产品信息
		// 初始化
		initRemarks()

		isRemarksLoading.value = true

		// 获取产品类型tab
		let typeTab = getTypeTab()

		// 获取当前显示的tab
		const currentTabList = getCurrentTabList()
		// 判断当前tab是否存在
		const isExistTab = checkTabExistence(typeTab, currentTabList)
		// 不存在tab时默认为 ltd
		if (!isExistTab) typeTab = 'ltd'
		// 获取支付方式缓存数据
		// const activePayType = localStorage.getItem('PAY-VIEW-INFO-PAY-TYPE')
		// if (activePayType) product.payMode.activePayType = activePayType
		// 获取上一次tab缓存得数据，存在则使用缓存数据
		// const payInfoCache = sessionStorage.getItem('PAY-VIEW-INFO')
		// const payInfo = JSON.parse(payInfoCache || '{}')
		// // 存在tab且存在缓存数据时 使用缓存数据显示 直接创建订单
		// if (isExistTab && payInfoCache && payInfo.typeTab === typeTab && !['plugin', 'coupon'].includes(typeTab) && payInfo?.enterpriseMode?.status === false && payInfo?.couponMode?.status === false) {
		// 	// 设置 产品缓存数据
		// 	setProductInfo(payInfo, typeTab)
		// 	await createOrder(product.numsMode.activeNumsInfo, false)
		// } else {
		// 否则切换到对应产品类型
		await changeTypeTabEvent(typeTab)
		// }

		// 检测首页气泡打开
		checkAndUseHomeBubble()

		if (payment.value.bindUser) {
			window.onbeforeunload = () => {
				return '是否要离开'
			}
		}
	}

	/**
	 * @description 当未绑定账号，创建模拟数据
	 */
	const createSimulatedData = (type: string) => {
		// 模拟数据内容
		product.cycleMode.list =
			type === 'dev'
				? [
						{
							cycle: 12,
							price: 5999,
							recommend: false,
							originalPrice: 12000,
							nums: [
								{ count: 1, price: -1, discount: 0 },
								{ count: 3, price: -1, discount: 0 },
								{ count: 5, price: -1, discount: 0 },
								{ count: 10, price: -1, discount: 0 },
								{ count: 20, price: -1, discount: 0 },
								{ count: 50, price: -1, discount: 0 },
								{ count: 100, price: -1, discount: 0 },
							],
							sort: 1,
							title: '1年',
							everyDay: '16.66',
						},
				  ]
				: [
						{
							cycle: 12,
							price: 1399,
							recommend: false,
							originalPrice: 3588,
							nums: [
								{ count: 1, price: -1, discount: 0 },
								{ count: 3, price: -1, discount: 0 },
								{ count: 5, price: -1, discount: 0 },
								{ count: 10, price: -1, discount: 0 },
								{ count: 20, price: -1, discount: 0 },
								{ count: 50, price: -1, discount: 0 },
								{ count: 100, price: -1, discount: 0 },
							],
							sort: 1,
							title: '1年',
							everyDay: '3.89',
						},
						{
							cycle: 36,
							price: 2999,
							recommend: false,
							originalPrice: 10764,
							nums: [
								{ count: 1, price: -1, discount: 0 },
								{ count: 3, price: -1, discount: 0 },
								{ count: 5, price: -1, discount: 0 },
								{ count: 10, price: -1, discount: 0 },
								{ count: 20, price: -1, discount: 0 },
								{ count: 50, price: -1, discount: 0 },
								{ count: 100, price: -1, discount: 0 },
							],
							sort: 2,
							title: '3年',
							everyDay: '2.78',
						},
						{
							cycle: 6,
							price: 999,
							recommend: false,
							originalPrice: 1794,
							nums: [
								{ count: 1, price: -1, discount: 0 },
								{ count: 3, price: -1, discount: 0 },
								{ count: 5, price: -1, discount: 0 },
								{ count: 10, price: -1, discount: 0 },
								{ count: 20, price: -1, discount: 0 },
								{ count: 50, price: -1, discount: 0 },
								{ count: 100, price: -1, discount: 0 },
							],
							sort: 3,
							title: '6个月',
							everyDay: '5.55',
						},
						{
							cycle: 1,
							price: 599,
							recommend: false,
							originalPrice: 599,
							nums: [
								{ count: 1, price: -1, discount: 0 },
								{ count: 3, price: -1, discount: 0 },
								{ count: 5, price: -1, discount: 0 },
								{ count: 10, price: -1, discount: 0 },
								{ count: 20, price: -1, discount: 0 },
								{ count: 50, price: -1, discount: 0 },
								{ count: 100, price: -1, discount: 0 },
							],
							sort: 4,
							title: '1个月',
							everyDay: '19.97',
						},
				  ]
	}
	/**
	 * @description 检测到未登陆时，禁止事件执行并打开登陆界面
	 * @param {String} type 事件类型
	 * @param {Object} item 事件项
	 */
	const isUserSignUp = (type: string, item: any) => {
		if (!bindUser.value) {
			if ((type === 'nums' && item.count !== 1) || (type === 'cycle' && item.cycle !== 12)) {
				bindUserDialog()
				return false
			}
		}
		return true
	}
	/**
	 * @description 设置和重置未登陆时优惠卷到期时间
	 */
	const setNewUserCouponEndTime = () => {
		// 获取结束时间
		let endTime = Number(sessionStorage.getItem('PAYMENT-NEW-COUPON-TIME'))
		// 不存在或过期时，设置新的结束时间
		if (!endTime || endTime < new Date().getTime()) {
			endTime = new Date().getTime() + 10 * 60 * 1000
			// 设置结束时间为当前时间+10分钟
			sessionStorage.setItem('PAYMENT-NEW-COUPON-TIME', endTime.toString())
		}
		newUserVoucherEndTime.value = endTime
	}

	const unbindNumber = ref(0) // 解绑次数

	/**
	 * @description 获取解绑授权次数
	 */
	const getUnbindCount = async () => {
		const num = await getUnbindNumber()
		unbindNumber.value = num
	}
	/**
	 * @description 获取解绑授权次数
	 */
	const unBindAuthor = () => {
		unbindBuyAuthorDialog({
			type: productInfo?.activeTypeInfo.type,
			typeName: authTypeTitle.value,
			extra: { rest_unbind_count: unbindNumber.value },
		})
	}
	const $reset = () => {
		autoSwitch.value = false
		payView.value = false
		scanned.value = false
		// 组件销毁时清除定时器
		if (payKeepTimer) clearTimeout(payKeepTimer as number)
		if (payMonitorTimer) clearTimeout(payMonitorTimer as number)
		if (timer.value) clearInterval(timer.value)
	}

	return {
		voucherFetchInstance,
		openNewUserVoucherFetchViewDialog,
		compData,
		isRemarksLoading,
		productPriceLoading,
		isPlugin,
		productInfo,
		product,
		enterprise,
		tabLoading,
		iSwitch,
		countDown,
		switchLeft,
		switchRight,
		changeTypeTabEvent,
		changeCycleTabEvent,
		changeNumsTabEvent,
		enterpriseEvent,
		changeCouponBoxEvent,
		changeCouponEvent,
		openPrivilegeContrast,
		newUserVoucherFetchInstance,
		newUserVoucherEndTime,
		scanned,
		errorMask,

		bindUser,
		paymentLoading,
		payList,
		changePayTypeEvent,
		paySuccessData,
		openBuySuccessView,
		changeBalanceBuyEvent,
		changeRefreshAuthor,

		couponItem,
		closeAfterReload,
		timeClose,
		siteList,
		timeNow,
		addZero,
		claimCouponEvent,
		changeCloseTimeEvent,

		couponCompData,
		changeVoucher,
		activePayIcon,
		voucherLoading,
		getVoucherCycleDescribe,
		useChangeVoucher,
		changeVoucherEvent,
		changeVoucherTypeEvent,
		refreshSoftEvent,
		unbindBuyAuthorDialog,
		authTypeTitle,
		authExpirationTime,
		getUnbindCount,
		unBindAuthor,

		isDisabledAuth,
		authType,
		bindAuthData,
		changeUnbindAuthor,

		// 特权对比
		privilegeList,
		proPrivilegeList,
		ltdPrivilegeList,
		plusPrivilegeList,
		go2tab,

		emits,
		onCancel,
		init,
		$reset,
	}
})

export default PRODUCT_PAYMENT_STORE

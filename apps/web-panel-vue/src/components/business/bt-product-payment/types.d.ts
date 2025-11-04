/**
 * @description tab切换参数
 */
export interface TabProps {
	typeList: TabItemProps[]
	activityList: string
	activeTypeInfo: TabItemProps
	unbindAuthor: UnbindAuthorProps
}

export interface UnbindAuthorProps {
	status: boolean
	count: number
}

/**
 * @description tab-item参数
 */
export interface TabItemProps {
	type: string
	title: string
	describe: string
	pid: number
	recommend?: boolean
	isHidden?: boolean
	tipsTitle: String
	tipsList?: string[]
}

/**
 * @description 授权数量参数
 */
export interface NumsListProps {
	count: number
	discount: number
	id?: number
	pid?: string
	price: number
	product_cycle?: number
}

/**
 * @description 产品周期参数
 */
export interface CycleListProps {
	cycle: number
	price?: number
	recommend?: string | boolean
	originalPrice?: number
	nums: NumsListProps[]
	sort?: number
	title?: string
	everyDay?: string
}

// 运维版数据结构(周期为1年的数据)
export interface DevDataProps {
	nums: NumsListProps[] // 授权数量
	price: number // 价格
	discount?: number // 折扣
	sprice?: number // 原价
}

// 产品数据结构
export interface ProductDataProps {
	cycleMode: CycleModeProps
	numsMode: NumsModeProps
	couponMode: CouponModeProps
	couponInfo: AnyObject
	enterpriseMode: EnterpriseModeProps
	devCycleInfo: DevCycleProps
	voucherMode: VoucherModeProps
	payMode: PayModeProps
}

// 支付数据结构
export interface PayModeProps {
	activePayType: string
	activeBuyInfo: BuyInfoProps
	activeBalanceInfo: AnyObject
	balance: number
	activePayCode: {
		apliy: string
		wechat: string
	}
	qrcode: {
		value: string
		size: number
	}
	payTips: {
		status: boolean
		name: string
		day: number
	}
	isLastBuyRepeat: boolean
	lastPayTime: number
	createOrderTime: number[]
}

export interface PayTypeListProps {
	type: string
	title: string
}

// 购买信息数据结构
export interface BuyInfoProps {
	price: number
	count: number
	cycle: number
	originalPrice: number
	discount: number | AnyObject
}

// 抵扣券数据结构
export interface VoucherModeProps {
	loading: boolean
	isExist: boolean
	proTypeList: AnyObject
	typeActive: string | number
	typeList: AnyObject
	list: AnyObject[]
	active: number
	activeInfo: ActiveInfoProps
}

export interface ActiveInfoProps {
	pid: number
	code: string
}

// 运维版周期数据结构
export interface EnterpriseModeProps {
	status: boolean
	isHidden: boolean
}

export interface DevCycleProps {
	isGetOperated: boolean
	data: DevDataProps | AnyObject
}

// 产品周期数据结构
export interface CycleModeProps {
	activeCycleInfo: AnyObject
	list: CycleListProps[]
}

// 授权数量数据结构
export interface NumsModeProps {
	activeNumsInfo: NumsListProps
	list: NumsListProps[]
}

// 优惠券数据结构
export interface CouponModeProps {
	status: boolean
	activeCouponId: string
	activeCouponInfo: AnyObject
	discountsTitle: string
	disabled: boolean
	count: number
	list: AnyObject[]
	endTimeNum: number
}

// 创建订单返回优惠券数据结构
export interface CouponItemProps {
	name: string
	pid: number
	ptype: number
	timeout: number
	val1: number
	val2: number
}

export interface StringKeyProps {
	[key: string]: string
}

/**
 * @description 左右切换
 */
export interface SwitchTypeProps {
	right: boolean
	left: boolean
}

/**
 * @description 产品购买参数
 */
export interface ProductBuyCodeProps {
	aliMsg: string // 支付宝支付信息
	extra: AnyObject // 额外信息
	msg: string // 微信支付信息
	uid: number // 用户ID
	data: AnyObject // 订单信息
	isCoupon: any[] // 是否使用优惠券
	statusCode: number // 状态码
	cashFee: number // 现金支付金额
}

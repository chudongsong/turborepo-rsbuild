

interface PluginInfo {
	title: string // 插件标题     
	describe: string // 插件描述
	pid: number // 插件ID
}

interface CompData {
	disablePro: boolean // 是否禁用专业版，默认推荐企业版
	sourceId: string // 来源ID:默认27     
	plugin: boolean // 是否插件
	pluginInfo: PluginInfo // 插件信息
	isHomeBubble: Record<string, unknown> // 是否首页气泡
}


// 产品说明提示
export interface ProductIntroduceItemProps {
	title: string // 产品说明标题
	description: string // 产品说明描述
	privilegeList: string[] // 产品特权列表
}


// 产品列表结构选项
export interface ProductListPropsItem {
	id: number // 产品ID
	name: string // 产品名称
	price: number // 产品价格
	sprice: number // 产品售价
	list: ProductCycleListPropsItem[] // 产品周期列表
}


// 产品周期列表选项
export interface ProductCycleListItem {
	cycle: number // 产品周期
	tip: string // 产品提示
	num_list: number[] // 产品数量列表:
}

// 产品周期列表数量
export interface ProductCycleListProps {
	count: 1 // 产品数量
	discount: 1 // 产品折扣
}


// 优惠券列表结构选项
export interface CouponsListPropsItem {
	coupons_id: number // 优惠券ID
	product_id: number // 支持的产品 id
	name: string // 优惠券名称
	starttime: number // 开始时间，为0，着则代码可以立即使用
	endtime: number //到期时间，用于倒计时显示
	amount: number // 抵扣券金额，必须转换为数字，这里需要计算
	deduction: number // 抵扣券减扣金额，必须转换为数字，这里需要计算
}


// 抵扣券列表结构选项
export interface DeductionProductItemProps {
	pid: number // 产品 id
	name: string // 抵扣券名称
	acc_list: DeductionItemProps[]
}


// 抵扣券列表结构选项
export interface DeductionItemProps {
	id: number, // 抵扣券 id
	cycle: number, // 周期，和 unit 整合显示授权时间
	unit: string, // 展示类型，天、永久、月、年
	endtime: number, // 抵扣券使用期限
	ps: string // 备注
}



// 产品临时信息
export interface ProductTempInfo {
	userInfo: ProductTempUserInfo // 用户信息
	productInfo: ProductTempProductInfo // 产品信息
	couponsInfo: ProductTempCouponsInfo // 优惠券信息
	orderInfo: ProductTempOrderInfo // 订单信息
	paymentInfo: ProductTempPaymentInfo // 支付信息

}


// 临时用户信息
export interface ProductTempUserInfo {
	username: string // 用户名
	credits: number // 用户余额
}


// 临时产品信息
export interface ProductTempProductInfo {
	pid: number // 产品 id
	p_name: string // 产品名称
	sprice: number // 产品原价，用于计算产品的最初价格，如果设计数量，需要计算 原价*数量
	cycle: number // 产品周期
	count: number // 产品数量
}


// 临时优惠券信息
export interface ProductTempCouponsInfo extends CouponsListPropsItem { }


// 临时订单信息
export interface ProductTempOrderInfo {
	pid: number // 产品 id
	cycle: number // 产品周期
	count: number // 产品数量
	source: number // 产品支付来源
	coupon: number // 产品来源
}


// 临时支付信息
export interface ProductTempPaymentInfo {
	ali: string // 支付二维码
	wechat: string // 支付二维码
	product_name: string // 产品名称
	product_price: number // 订单返回的支付金额最真实的 二维码旁边显示必须使用该字段
	wxoid: number // 支付订单 
}



// 支付订单列表结构选项，主要用于缓存
export interface ProductPayOrderListPropsItem {
	pid: number // 产品 id
	cycle: number // 产品周期
	count: number // 产品数量
	coupon: number // 优惠券 id
	info: ProductTempPaymentInfo // info
}
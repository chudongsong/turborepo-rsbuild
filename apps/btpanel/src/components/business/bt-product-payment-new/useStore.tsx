
import { defineStore } from 'pinia'
import { useSessionStorage } from '@vueuse/core'
import { CompData, CouponsListPropsItem, DeductionProductItemProps, ProductIntroduceItemProps, ProductListPropsItem, ProductPayOrderListPropsItem, ProductTempInfo } from './types.d'



/**
 * @description 产品支付存储
 * @returns 
 */
const paymentStore = defineStore('PRODUCT-PAYMENT-STORE', () => {

	// 产品视图状态模板	
	const productViewStatusTemplate = {
		productActive: '', // 产品选中
		cycleActive: '', // 周期选中
		countActive: '', // 数量选中
		couponActive: '', // 优惠券选中
		deductionActive: '', // 抵扣券选中
		payActive: '', // 支付方式选中
		deductionProductActive: '', // 抵扣券产品选中
	}

	// 产品临时模板，用于临时存储产品信息
	const productTempTemplate: ProductTempInfo = {
		userInfo: { // 用户信息
			username: '',
			credits: 0,
		},
		productInfo: { // 产品信息
			pid: 0,
			p_name: '',
			sprice: 0,
			cycle: 0,
			count: 0,
		},
		couponsInfo: {
			coupons_id: 0,
			product_id: 0,
			name: '',
			starttime: 0,
			endtime: 0,
			amount: 0,
			deduction: 0,
		},
		orderInfo: { // 订单信息
			pid: 0,
			cycle: 0,
			count: 0,
			source: 0,
			coupon: 0,
		},
		paymentInfo: { // 支付信息
			ali: '',
			wechat: '',
			product_name: '',
			product_price: 0,
			wxoid: 0,
		}
	}

	// 产品视图状态
	const productViewStatus = ref({...productViewStatusTemplate})

	// 产品说明提示
	const productIntroduceList: Ref<ProductIntroduceItemProps[]> = useSessionStorage('ProductIntroduceList', [])

	// 产品列表
	const productList: Ref<ProductListPropsItem[]> = useSessionStorage('ProductProductList', [])

	// 优惠券列表
	const couponList: Ref<CouponsListPropsItem[]> = useSessionStorage('ProductCouponsList', [])

	// 抵扣券列表
	const deductionList: Ref<DeductionProductItemProps[]> = useSessionStorage('ProductDeductionList', [])

	// 支付订单列表，用于临时存储支付订单信息
	const payOrderList: Ref<ProductPayOrderListPropsItem[]> = useSessionStorage('ProductPayOrderList', [])

	// 中间存储，用于存储临时数据，用于支付订单的临时存储
	const tempInfo: Ref<ProductTempInfo> = ref({...productTempTemplate})

	// 清除中间存储
	const initTempInfo = () => {
		tempInfo.value = {...productTempTemplate}
	}

	// 初始化sessionStorage
	const initSessionStorage = () => {
		productIntroduceList.value = []
		productList.value = []
		couponList.value = []
		deductionList.value = []
		payOrderList.value = []
	}

	// 初始化产品视图状态	
	const initProductViewStatus = () => {
		productViewStatus.value = {...productViewStatusTemplate}
	}

	return {
		productViewStatus,
		productViewStatusTemplate,
		deductionList,
		tempInfo,
		initTempInfo,
		initProductViewStatus,
		initSessionStorage,
	}
})


/**
 * @description 使用产品支付存储
 * @returns 
 */
export const useProductPaymentStore = () => {
	const store = paymentStore()
	return {
		...store,
		...storeToRefs(store),
	}
}
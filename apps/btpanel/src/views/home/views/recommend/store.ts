import { useGlobalStore } from '@store/global'
import { productPaymentDialog } from '@/public/index'
import { defineStore } from 'pinia'

const HOME_RECOMMEND_STORE = defineStore('RECOMMEND-STORE', () => {
	const { payment } = useGlobalStore()
	const { authType, authExpirationTime } = toRefs(payment.value)

	const showPrivilege = ref(false)
	const advantageList = ref([
		['time', '5分钟极速响应'],
		['refund', '15天无理由退款'],
		['plunge', '30+款付费插件'],
		['function', '20+企业版专享功能'],
		['certificate', '2张SSL商用证书（年付）'],
		['message', '1000条免费短信（年付）'],
		// ['group', '专享企业服务群（年付）'],
	])
	const newAdvantageList = ref([
		['speed', '5分钟极速响应'],
		['fifteen', '15天无理由退款'],
		['plugin', '30+款付费插件'],
		['more', '20+企业版专享功能'],
		['recom', '2张SSL商用证书（年付）'],
		['message', '1000条免费短信（年付）'],
	])
	const privilegeList = ref(['多对一技术支持', '全年5次安全排查', '5分钟极速响应', '30+款付费插件', '20+企业版专享功能', '1000条免费短信（年付）', '2张SSL商用证书（年付）', '一对一服务（年付）', 'WAF防火墙', '更换授权IP', '客服优先响应', '15+款付费插件', '15天无理由退款'])
	const proPrivilegeList = ref([0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1])
	const ltdPrivilegeList = ref([0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1])
	const plusPrivilegeList = ref([1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1])
	const limitTimeShow = ref(false)
	const recommendShow = ref(true)

	/**
	 * @description 设置首页推荐弹窗不显示
	 * @param {number} day 是否购买
	 */
	const setRecommendHide = (day: number) => {
		const hideTime = (new Date().getTime() + 86400 * 1000 * day).toString()
		localStorage.setItem('HOME-RECOMMEND-HIDE-TIME', hideTime)
		recommendShow.value = false
	}

	/**
	 * @description 检查首页推荐弹窗是否显示
	 */
	const checkRecommendHide = () => {
		const time = parseInt(localStorage.getItem('HOME-RECOMMEND-HIDE-TIME') || `0`)
		if (time) recommendShow.value = time < new Date().getTime()
	}

	/**
	 * @description: 打开产品支付弹窗
	 */
	const openProduct = (sourceId: number) => productPaymentDialog({ sourceId, disablePro: true })

	return {
		plusPrivilegeList,
		ltdPrivilegeList,
		proPrivilegeList,
		privilegeList,
		limitTimeShow,
		advantageList,
		newAdvantageList,
		recommendShow,
		showPrivilege,
		authType,
		authExpirationTime,
		setRecommendHide,
		checkRecommendHide,
		openProduct,
	}
})

export default HOME_RECOMMEND_STORE

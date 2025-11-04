import { applyCertOrderRenw, buyService, deployTrustAsiaCert, getBusSslOrderList, getBusSslProductList, getCertAdminInfo, getDomainList, getSslInfo, getVerifyResult, setCertOrder } from '@/api/site'
import { Message, useDataHandle } from '@/hooks/tools'
import { useSiteStore } from '../../useStore'

const SITE_SSL_STORE = defineStore('site-ssl-store', () => {
	const { siteInfo, siteType } = useSiteStore()

	const pollingPopup = ref() // 支付状态弹窗
	const otherPopup = ref() // 其他弹窗

	const sslInfo = ref<any>({
		isCertInfo: false, // 是否存在证书信息
		https: false, // 是否开启https
		type: 0, // 证书状态
		key: '', // 证书key
		csr: '', // 证书csr
		index: '', // 证书续签
		oid: -1, // 证书oid
		dns: [], // 证书dns
		subject: '', // 证书主题
		issuer: '', // 证书颁发者
		endtime: '', // 证书到期时间
		push: {}, // 到期提示配置
		pushAlarm: '', // 是否开启到期提醒
		isSupportRenewal: false, // 是否支持续签
		isStart: false, // 是否已启用证书
		notAfter: '', // 证书到期时间
		authType: '', // 证书验证方式
	}) // 证书信息

	const sslTabActive = ref('busSslList') // 当前tab激活项
	const sslApplicationInfo = ref({
		address: '',
		city: '',
		country: '',
		email: '',
		firstName: '',
		job: '',
		lastName: '',
		mobile: '',
		organation: '',
		postCode: '',
		state: '',
	}) // 证书申请信息
	const sslDnsApiInfo = ref() // DNS API信息
	const letApplyInfo = ref({
		result: {}, // 证书申请结果
		info: {
			index: '', // 证书续签
			type: '', // 证书类型
		}, // 证书信息
		dnsTable: [], // 网站DNS解析情况列表
		verifyDialog: false, // 验证弹窗
	}) // 证书申请信息

	const certVerifyInfo = ref<any>({})

	const applySslInfo = ref({
		domain: siteInfo.value?.name || '',
		orgName: '',
		orgRegion: '',
		orgCity: '',
		orgAddress: '',
		orgPhone: '',
		orgPostalCode: '',
		orgDivision: '总务',
		path: siteInfo.value?.path || '',
	})

	const isRefreshSSL = ref(false) // 是否刷新列表
	const isRefreshLetSSL = ref(false) // 是否刷新列表 -let证书 避免与ssl证书冲突

	const productInfo = ref<any>({
		typeList: [],
		activityList: '',
		activeTypeInfo: {},
		productName: '',
		totalPrice: 0,
		install: false,
		years: 1,
	}) // 产品信息
	const orderInfo = ref<any>({
		pid: 0,
		oid: 0,
		title: '',
		limit: 1,
		type: 'dv',
		install: false,
		isWildcard: false,
		isMulti: false,
		isIp: false,
	}) // 订单信息

	const sslAlertState = computed(() => {
		return !sslInfo.value?.isStart || (sslInfo.value?.isSupportRenewal && sslInfo.value?.isStart)
	})

	/**
	 * @description 获取ssl证书信息
	 * @param params
	 * @returns
	 */
	const getSSLInfoEvent = async (params: any) => {
		try {
			const { data } = await getSslInfo(params)
			if (data.hasOwnProperty('msg')) {
				Message.error('获取证书信息失败')
				return { data: {}, status: false, msg: '获取证书信息失败' }
			}
			return { data, status: true, msg: '获取证书信息成功' }
		} catch (error) {
			console.log(error)
			return { status: false, msg: '获取证书信息失败' }
		}
	}

	/**
	 * @description 购买人工服务
	 */
	const buyArtificialServiceEvent = async (params: any) => {
		try {
			const res = await useDataHandle({
				loading: '正在生成支付订单，请稍后...',
				request: buyService(params),
				data: {
					alicode: String,
					oid: Number,
					price: Number,
					qq: String,
					wxcode: String,
					wxoid: Number,
				},
			})
			return { data: res, status: true }
		} catch (error) {
			console.log(error)
			return { status: false, msg: '购买人工服务失败' }
		}
	}
	/**
	 * @description 完善商用证书信息
	 */
	const getCertAdminInfoEvent = async () => {
		try {
			const res: AnyObject = await useDataHandle({
				loading: '正在获取证书默认信息，请稍后...',
				request: getCertAdminInfo(),
			})
			return { data: res.data, status: true, msg: '获取证书默认信息成功' }
		} catch (error) {
			console.log(error)
			return { status: false, msg: '获取证书默认信息失败' }
		}
	}

	/**
	 * @description 提交证书信息
	 * @param params
	 * @returns
	 */
	const submitCertInfoEvent = async (params: any) => {
		try {
			const res: AnyObject = await useDataHandle({
				loading: '正在提交证书信息，请稍后...',
				request: applyCertOrderRenw(params),
				data: {
					status: Boolean,
					msg: [Object, data => data],
				},
			})
			return { data: res.data.msg, status: true, msg: '提交证书信息成功' }
		} catch (error) {
			console.log(error)
			return { status: false, msg: '提交证书信息失败' }
		}
	}

	/**
	 * @description 设置证书部署
	 *  @param {BusinessTableProps} row
	 */
	const setBusSslDeployEvent = async (params: any) => {
		try {
			const res: any = await useDataHandle({
				loading: '正在部署证书，请稍候...',
				request: setCertOrder(params, siteType.value),
				message: true,
			})
			return { data: res.data, status: true, msg: '设置证书部署成功' }
		} catch (error) {
			console.log(error)
			return { status: false, msg: '设置证书部署失败' }
		}
	}

	/**
	 * @description 获取证书列表
	 * @param params
	 * @returns
	 */
	const getSslListEvent = async (params: any) => {
		try {
			const res: any = await useDataHandle({
				request: getBusSslOrderList(params),
				data: Array,
			})
			return { data: res, total: res.length, other: {} }
		} catch (error) {
			console.log(error)
			return { data: [], total: 0, other: {} }
		}
	}

	/**
	 * @description 验证商用证书
	 */
	const verifyBusCertEvent = async (oid: number, certType: number, pid: number) => {
		try {
			const res: AnyObject = await useDataHandle({
				loading: '正在验证商用证书，请稍后...',
				request: getVerifyResult({ oid, cert_ssl_type: certType, pid }),
				data: {
					status: [String, data => data],
					paths: Array,
					kfqq: String,
					hosts: Array,
					data: [Object, 'data'],
					code: Number,
					certStatus: String,
					msg: String,
					...(certType === 1 ? { res: [Object, 'res'] } : {}),
				},
			})
			if (!res.status) {
				Message.request(res)
				return { status: false, msg: '验证商用证书失败' }
			}
			// 返回证书验证信息
			return {
				data: {
					oid,
					// data: res,
					...res,
					isCNAME: res.data.dcvList[0].dcvMethod.indexOf('CNAME_') > -1, // 是否DNS验证
				},
				status: true,
				msg: '验证商用证书成功',
			}
		} catch (error) {
			console.log(error)
			return { status: false, msg: '验证商用证书失败' }
		}
	}

	/**
	 * @description 获取商业证书列表
	 */
	const getCertSslListEvent = async () => {
		try {
			const res: AnyObject = await useDataHandle({
				request: getBusSslProductList(),
				data: {
					info: [Object, 'info'],
					data: [Array, 'data'],
					administrator: [Object, 'administrator'],
				},
			})
			// 证书验证
			sslApplicationInfo.value = { ...res.administrator }
			return { data: res, status: true, msg: '获取商业证书列表成功' }
		} catch (error) {
			console.log(error)
			return { status: false, msg: '获取商业证书列表失败' }
		}
	}

	/**
	 * @description 获取域名列表
	 */
	const getDomainListEvent = async () => {
		try {
			const res: any = await useDataHandle({
				loading: '正在获取域名列表，请稍后...',
				request: getDomainList(),
				data: { data: Array },
			})
			return { data: res.data, status: true, msg: '获取域名列表成功' }
		} catch (error) {
			console.log(error)
			return { status: false, msg: '获取域名列表失败' }
		}
	}

	/**
	 * @description 部署TrustAsia证书
	 * @param params 传参
	 * @param type 页面类型
	 */
	const useDeployTrustAsiaCert = async (
		params: {
			site_name?: string
			siteName?: string
			partnerOrderId: string
		},
		type: string
	) => {
		return await useDataHandle({
			loading: '正在部署证书，请稍后...',
			request: deployTrustAsiaCert(params, siteType.value),
			message: false,
		})
	}

	/**
	 * @description 切换证书tab
	 * @param {string} tab tab名称
	 */
	const jumpSslTabEvent = (tab: string) => {
		sslTabActive.value = tab
	}

	/**
	 * @description let证书申请结果
	 */
	const setApplyInfo = (data: AnyObject, param: AnyObject) => {
		letApplyInfo.value.dnsTable = data.auths
		letApplyInfo.value.info.index = data.index
		letApplyInfo.value.info.type = param.auth_type
	}

	return {
		sslInfo,
		otherPopup,
		pollingPopup,
		sslTabActive,
		sslApplicationInfo,
		isRefreshSSL,
		isRefreshLetSSL,
		sslDnsApiInfo,
		letApplyInfo,
		setApplyInfo,
		productInfo,
		orderInfo,
		sslAlertState,
		certVerifyInfo,
		applySslInfo,

		jumpSslTabEvent,
		getSSLInfoEvent,
		buyArtificialServiceEvent,
		getCertAdminInfoEvent,
		submitCertInfoEvent,
		setBusSslDeployEvent,
		getSslListEvent,
		verifyBusCertEvent,
		getCertSslListEvent,
		getDomainListEvent,
		useDeployTrustAsiaCert,
	}
})

// 证书信息
const useSiteSSLStore = () => {
	const store = SITE_SSL_STORE()
	return { ...store, ...storeToRefs(store) }
}

export { useSiteSSLStore, SITE_SSL_STORE }

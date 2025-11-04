import { useMessage, useDialog } from '@/hooks/tools'
import { getDomaiNuniversalModule } from '@/api/domain'
import { handlePaymentDialog } from '../../payment-modal/useController'

// 域名项接口
interface DomainItem {
	name: string
	price: number
	isHot: boolean
	available: boolean
	premium: boolean
	premium_price: number
	status: string
	status_desc: string
	first_year_price: number
	renew_price: number
	first_year_discount_price: number
	renewal_discount_price: number
	suffix: string
}

const searchValue = ref('')
const domainList = ref<DomainItem[]>([])
const hasSearched = ref(false)
export const loading = ref(false)

const message = useMessage()

/**
 * @description 初始化搜索值
 * @param domainName 域名
 */
export const initSearchValue = (domainName: string) => {
	searchValue.value = domainName
	if (domainName) {
		handleSearch()
	} else {
		domainList.value = []
		hasSearched.value = false
		loading.value = false
	}
}

/**
 * @description 处理搜索
 */
export const handleSearch = async () => {
	if (!searchValue.value.trim()) {
		message.warn('请输入要查询的域名')
		return
	}
	loading.value = true
	
	try {
		const res = await getDomaiNuniversalModule({
			url: '/api/v1/domain/query/check',
			domain: searchValue.value.trim(),
			rows: 20,
			p: 1
		})

		console.log('域名查询响应:', res)

		if (res.data && res.data.data) {
			domainList.value = res.data.data.data.map((item: any) => ({
				name: item.domain,
				price: item.price_info?.first_year_discount_price || item.price_info?.first_year_price || 0,
				isHot: item.premium || false,
				available: item.available,
				premium: item.premium,
				premium_price: item.premium_price || 0,
				status: item.status,
				status_desc: item.status_desc,
				first_year_price: item.price_info?.first_year_price || 0,
				renew_price: item.price_info?.renew_price || 0,
				first_year_discount_price: item.price_info?.first_year_discount_price || 0,
				renewal_discount_price: item.price_info?.renewal_discount_price || 0,
				suffix: item.suffix
			}))
			console.log('处理后的域名列表:', domainList.value)
		} else {
			message.error(res.msg)
			domainList.value = []
		}
	} catch (error) {
		console.error('域名查询失败:', error)
		domainList.value = []
	} finally {
		loading.value = false
	}
}

/**
 * @description 处理购买
 * @param domain 域名信息
 */
export const handleBuy = (domain: DomainItem) => {
	console.log('购买域名:', domain)
	handlePaymentDialog({
		domain: domain.name,
		firstYearPrice: `¥${domain.first_year_discount_price}`,
		renewalPrice: `¥${domain.renewal_discount_price}`,
		years: 1,
		accountBalance: '¥1250.50',
		suffix: domain.suffix
	}, 'payment')
}

/**
 * @description 处理查看WHOIS
 * @param domain 域名信息
 */
export const handleViewWhois = (domain: DomainItem) => {
	console.log('查看WHOIS:', domain)
	useDialog({
		title: 'WHOIS查询',
		area: 70,
		compData: {
			domainName: domain.name,
		},
		component: () => import('../whois-query/index.vue'),
	})
}

// 导出状态
export { searchValue, domainList, hasSearched }

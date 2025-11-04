import { useDialog } from '@/hooks/tools'
import { getDomaiNuniversalModule, getAnalysisIp, refreshLocalCache } from '@/api/domain'
import { useConfirm, useDataHandle } from '@/hooks/tools'
import { formatTime } from '@/utils'
import { handlePaymentDialog } from '../payment-modal/useController'
import { useDomainRegisterStore } from './useStore'
import { ElTooltip } from 'element-plus'
const { isRegListRefresh, ipSearchValue, domainSearchDialog } = useDomainRegisterStore()
import { useGlobalStore } from '@/store/global'
const { payment } = useGlobalStore()
const { bindUser } = toRefs(payment.value)
import { bindUserDialog } from '@/public'

// 缓存对象结构：键是序列化的请求参数，值包含响应数据和时间戳
let cache: { [key: string]: { data: any; timestamp: number } } = {}

// 处理域名注册
export const handleDomainSearch = async (domainSearchValue: Ref<string>) => {
	console.log('bindUser', bindUser.value)
	if (!bindUser.value) {
		bindUserDialog()
		return false
	}
	const dialogInstance = await useDialog({
		title: '域名注册',
		area: 60,
		compData: {
			domainName: domainSearchValue.value,
		},
		component: () => import('./domain-search/index.vue'),
		onCancel: () => {
			domainSearchValue.value = ''
		},
	})
	console.log('dialogInstance', dialogInstance)
	domainSearchDialog.value = {
		close: () => {
			if (dialogInstance && dialogInstance.config?.globalProperties?.close) {
				dialogInstance.config.globalProperties.close()
			}
		}
	}
}

// 处理修改解析IP
export const handleModifyIp = (ipSearchValue: string) => {
	console.log('修改解析IP:', ipSearchValue)
	
	useDialog({
		title: '修改解析IP',
		area: 50,
		btn: ['修改', '取消'],
		compData: {
			currentIp: ipSearchValue,
		},
		component: () => import('./domain-ip-edit/index.vue'),
		onConfirm: () => {
			isRegListRefresh.value = true
		}
	})
}

export const handleDomainWhois = (domainSearchValue: Ref<string>) => {
	console.log('Whois查询:', domainSearchValue.value)
	useDialog({
		title: 'WHOIS查询',
		area: 70,
		compData: {
			domainName: domainSearchValue.value,
		},
		component: () => import('./whois-query/index.vue'),
	})
}

// 域名状态渲染
export const useDomainStatus = () => {
	return {
		label: '状态',
		prop: 'status',
		minWidth: 100,
		isCustom: true,
		render: (row: any) => {
			const statusMap: Record<number, { text: string; color: string }> = {
				0: { text: '待注册', color: 'var(--el-color-info)' },
				1: { text: '正常', color: 'var(--el-color-primary)' },
				2: { text: '即将到期', color: 'var(--el-color-warning)' },
				3: { text: '已过期', color: 'var(--el-color-danger)' },
				4: { text: '待赎回', color: 'var(--el-color-warning)' },
				5: { text: '注册失败', color: 'var(--el-color-danger)' },
			}
			const status = statusMap[row.status] || { text: '未知', color: 'var(--el-color-info)' }
			return <span style={{ color: status.color }}>{status.text}</span>
		},
	}
}

// 实名状态渲染
export const useRealNameStatus = () => {
	return {
		label: '实名状态',
		prop: 'real_name_status',
		width: 100,
		isCustom: true,
		render: (row: any) => {
			const statusMap: Record<number, { text: string; color: string }> = {
				0: { text: '未认证', color: 'var(--el-color-warning)' },
				1: { text: '认证中', color: 'var(--el-color-info)' },
				2: { text: '已认证', color: 'var(--el-color-primary)' },
				3: { text: '认证失败', color: 'var(--el-color-danger)' },
			}
			const status = statusMap[row.real_name_status] || { text: '未知', color: 'var(--el-color-info)' }
			return <span style={{ color: status.color }}>{status.text}</span>
		},
	}
}

export const useNsStatus = () => {
	return {
		label: '宝塔DNS',
		prop: 'ns_status',
		minWidth: 100,
		isCustom: true,
		render: (row: any) => {
			const isInactive = row.ns_status === 0
			const color = isInactive ? 'var(--el-color-error)' : 'var(--el-color-primary)'
			if (isInactive) {
				return (
					<ElTooltip
						placement="top"
					>
						{{
							default: () => (
								<span 
									style={{ 
										color: color, 
										cursor: 'pointer',
									}}
									onClick={() => {
										window.open('https://www.bt.cn/domain/domain-resolve', '_blank')
									}}
								>
									未生效
								</span>
							),
							content: () => '该域名需前往后台设置'
						}}
					</ElTooltip>
				)
			}
			
			return <span style={{ color: color }}>已生效</span>
		}
	}
}

export const handleResolveDomain = (row: any) => {
	console.log('解析域名:', row)
	useDialog({
		title: row.full_domain,
		area: 120,
		compData: {
			domain: row.full_domain,
			domainId: row.id
		},
		component: () => import('./dns-resolve/index.vue'),
	})
}

export const handleRenewDomain = (row: any) => {
	console.log('续费域名:', row)
	
	const calculateNewExpiry = (currentTimestamp: number, years: number) => {
		const currentDate = new Date(currentTimestamp * 1000)
		const newDate = new Date(currentDate)
		newDate.setFullYear(newDate.getFullYear() + years)
		return formatTime(newDate, 'yyyy-MM-dd')
	}
	
	handlePaymentDialog({
		domain: row.full_domain,
		years: 1,
		currentExpiry: formatTime(row.expire_time, 'yyyy-MM-dd'),
		newExpiry: calculateNewExpiry(row.expire_time, 1),
		type: 'renewal'
	}, 'renewal')
}

export const handleViewRealNameInfo = (row: any) => {
	console.log('查看实名信息:', row)
	useDialog({
		title: '实名信息详情',
		area: 50,
		showFooter: false,
		compData: {
			domainId: row.id,
			domain: row.full_domain
		},
		component: () => import('./realname-detail/index.vue'),
	})
}

export const handleDomainDelete = async (row: any) => {
	await useConfirm({
		title: '删除域名【' + row.full_domain + '】',
		content: '即将删除域名【' + row.full_domain + '】，是否继续操作？',
		icon: 'warning',
		onConfirm: () => {
			const params = {
				url: '/api/v1/domain/manage/delete_domain',
				id: row.id
			}
			useDataHandle({
				loading: '正在删除域名，请稍后...',
				request: getDomaiNuniversalModule(params),
				message: true,
				success: () => {
					isRegListRefresh.value = true
				}
			})
		}
	})
}

export const handleRealNameVerification = (row: any) => {
	console.log('立即实名:', row)
	useDialog({
		title: '域名【' + row.full_domain + '】选择实名模板',
		area: 50,
		btn: '提交认证',
		compData: {
			domainName: row.full_domain,
			domainId: row.id,
		},
		component: () => import('./realname-template/index.vue'),
	})
}

/**
 * @description 创建网站弹窗
 */
export const openSiteAddDialog = (row: any) => {
	console.log('openSiteAddDialog', row.id)
	useDialog({
		title: '创建网站 - 【' + row.full_domain + '】',
		area: 80,
		btn: ['创建', '取消'],
		showFooter: true,
		compData: {
			domainId: row.id,
			domainName: row.full_domain,
			type: 'domain'
		},
		component: () => import('./site-add/index.vue'),
	})
}


/**
 * @description 获取域名管理列表数据（带请求防抖缓存机制）
 * @param params 请求参数
 * @returns 当快速重复请求时，返回最近100ms内的缓存结果防止空数据
 */
export const getDomainRegisterList = async (params: any) => {
	const cacheKey = JSON.stringify(params)
	const now = Date.now()
	try {
		const requestParams = {
			url: '/api/v1/domain/manage/list',
			p: params.p || 1,
			rows: params.limit || 30,
			keyword: params.search || ''
		}
		const res = await getDomaiNuniversalModule(requestParams)
		const data = res.data.data
		
		cache[cacheKey] = {
			data: {
				data: data.data || [],
				total: data.count || 0,
				other: {
					search_history: data.search_history || []
				}
			},
			timestamp: now,
		}
		return cache[cacheKey].data
	} catch (error) {
		if ((error as Error).message === 'canceled' && cache[cacheKey] && now - cache[cacheKey].timestamp < 100) {
			return cache[cacheKey].data
		}
		console.error('获取域名列表失败:', error)
		return {
			data: [],
			total: 0
		}
	}
}

/**
 * @description 获取解析IP
 */
export const fetchAnalysisIp = async (): Promise<string> => {
	try {
		const res = await getAnalysisIp()
		return res.data.status ? res.data.data : ''
	} catch (error) {
		console.error('获取解析IP出错:', error)
		return ''
	}
}

/**
 * @description 获取解析IP
 */
export const loadAnalysisIp = async () => {
	try {
		const analysisIp = await fetchAnalysisIp()
		ipSearchValue.value = analysisIp
	} catch (error) {
		console.error('获取解析IP失败:', error)
	}
}

/**
 * @description 刷新本地缓存
 */
export const refreshCacheHandle = async () => {
	await useDataHandle({
		loading: '正在刷新本地缓存，请稍后...',
		request: refreshLocalCache(),
		message: true,
		success: () => {
			isRegListRefresh.value = true
		}
	})
}
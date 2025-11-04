import { useMessage } from '@/hooks/tools'
import { whoisQuery } from '@/api/domain'
import { checkDomain } from '@/utils'

// WHOIS查询结果接口
interface WhoisResult {
	domainName: string
	registryDomainId: string
	registrarWhoisServer: string
	registrarUrl: string
	updatedDate: string
	creationDate: string
	registryExpiryDate: string
	registrar: string
	registrarIanaId: string
	registrarAbuseContactEmail: string
	registrarAbuseContactPhone: string
	domainStatus: string[]
	nameServer: string[]
	dnssec: string
	lastUpdate: string
	registrant: string
	rawData: string
}

// 状态
const loading = ref(false)
const searchValue = ref('')
const whoisResult = ref<WhoisResult | null>(null)

const message = useMessage()


/**
 * @description 处理WHOIS查询
 */
export const handleQuery = async () => {
	if (!searchValue.value.trim()) {
		message.warn('请输入要查询的域名')
		return
	}
	if (!checkDomain(searchValue.value.trim())) {
		message.error('请输入正确的域名格式')
		return
	}
	loading.value = true
	whoisResult.value = null
	
	try {
		const domain = searchValue.value.trim()
		const response = await whoisQuery({ domain })
		
		console.log('WHOIS查询API响应:', response)
		
		if (response.data.status) {
			const apiData = response.data.data
			const processRoid = (roid: string) => {
				if (!roid) return ''
				const roidMatch = roid.match(/ROID:\s*(.+)/i)
				return roidMatch ? roidMatch[1] : roid
			}
			
			whoisResult.value = {
				domainName: apiData.domain_name || domain.toUpperCase(),
				registryDomainId: processRoid(apiData.org || ''),
				registrarWhoisServer: apiData.whois_server || '',
				registrarUrl: apiData.registrar_url || '',
				updatedDate: apiData.updated_date || '',
				creationDate: apiData.creation_date || '2020-10-24 16:00:12 (北京时间)',
				registryExpiryDate: apiData.expiration_date || '2026-10-24 16:00:12 (北京时间)',
				registrar: apiData.registrar || apiData.org || 'Guizhou Zhongyu Zhike Network Technology Co., Ltd.',
				registrarIanaId: '',
				registrarAbuseContactEmail: apiData.emails?.[0] || '',
				registrarAbuseContactPhone: apiData.phone?.[0] || '',
				domainStatus: apiData.status ? [apiData.status] : [],
				nameServer: apiData.name_servers || [],
				dnssec: apiData.dnssec || '',
				lastUpdate: apiData.updated_date || '',
				registrant: apiData.name || '请联系当前域名注册商获取',
				rawData: apiData.rawData || ''
			}
		} else {
			console.error('WHOIS查询失败:', response.data.msg)
			message.error(response.data.msg || '查询失败')
			whoisResult.value = null
		}
	} catch (error) {
		console.error('WHOIS查询失败:', error)
		message.error('查询失败，请稍后重试')
		whoisResult.value = null
	} finally {
		loading.value = false
	}
}

/**
 * @description 生成原始WHOIS文本
 * @param result WHOIS结果
 * @returns 原始文本
 */
export const generateRawText = (result: WhoisResult): string => {
	if (result.rawData && result.rawData.trim()) {
		return result.rawData.trim()
	}

	return `Domain Name: ${result.domainName}
		ROID: ${result.registryDomainId}
		Domain Status: ${result.domainStatus.join(', ')}
		Registrant: ${result.registrant}
		Registrant Contact Email: ${result.registrarAbuseContactEmail}
		Sponsoring Registrar: ${result.registrar}
		Name Server: ${result.nameServer.join('\nName Server: ')}
		Registration Time: ${result.creationDate}
		Expiration Time: ${result.registryExpiryDate}
		DNSSEC: ${result.dnssec}`
}

/**
 * @description 清空查询结果
 */
const clearResult = () => {
	whoisResult.value = null
	loading.value = false
	searchValue.value = ''
}

export { loading, searchValue, whoisResult, clearResult }

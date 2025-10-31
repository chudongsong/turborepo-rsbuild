
import { fileSelectionDialog } from '@/public'
import { checkVariable } from '@/utils'
import { checkDomainStatus, createDnsRecord, getLocalDomainList } from '@/api/domain'
import { addProxyProject } from '@/api/site'
import { useSiteAddStore } from '../../useStore'

const { domainId, domainName, createSiteType } = useSiteAddStore()

// 目标类型选项
export const targetOptions = [
	{ value: 'url', label: 'URL地址' },
	{ value: 'unix', label: 'unix地址' },
]

// 处理域名输入
export const handleDomainInput = (index: number, addSiteForm: any) => {
	const domain = addSiteForm.domains[index]
	if (domain.name && domain.suffix) {
		domain.fullDomain = `${domain.name}${domain.suffix}`
		
		if (index === 0) {
			addSiteForm.remark = domain.fullDomain
		}
	} else {
		domain.fullDomain = ''
	}
}

// 处理多行域名输入
export const handleInputName = (val: string, addSiteForm: any) => {
	const lines = val.split('\n').filter(line => line.trim())
	addSiteForm.domains = lines.map((line, index) => {
		const [name, suffix = ''] = line.split('.')
		return {
			name: name || '',
			suffix: suffix ? `.${suffix}` : '',
			fullDomain: line,
			status: '',
			hint: ''
		}
	})
	
	if (lines.length > 0) {
		const firstDomain = lines[0]
		addSiteForm.remark = firstDomain
	}
}

// 添加域名
export const addDomain = (addSiteForm: any, domainSuffixesArray: any) => {
	let defaultSuffix = ''
	
	if (addSiteForm.domains && addSiteForm.domains.length > 0) {
		const existingDomain = addSiteForm.domains.find((domain: any) => domain.suffix && domain.suffix !== '')
		if (existingDomain) {
			defaultSuffix = existingDomain.suffix
		}
	}
	
	if (!defaultSuffix && Array.isArray(domainSuffixesArray) && domainSuffixesArray.length > 0) {
		defaultSuffix = domainSuffixesArray[0].value
	}
	
	addSiteForm.domains.push({
		name: '',
		suffix: defaultSuffix,
		fullDomain: '',
		status: '',
		hint: ''
	})
}

// 移除域名
export const removeDomain = (index: number, addSiteForm: any) => {
	if (addSiteForm.domains.length > 1) {
		addSiteForm.domains.splice(index, 1)
		
		if (index === 0 && addSiteForm.domains.length > 0) {
			const firstDomain = addSiteForm.domains[0]
			if (firstDomain.name && firstDomain.suffix) {
				firstDomain.fullDomain = `${firstDomain.name}${firstDomain.suffix}`
				addSiteForm.remark = firstDomain.fullDomain
			}
		}
	}
}

// 触发文件选择
export const onPathChange = (addSiteForm: any, addSiteFormRef: any) => {
	fileSelectionDialog({
		type: 'file',
		path: addSiteForm.proxysite,
		change: (path: any) => {
			const str = checkVariable(path as unknown as any, 'string', '' as any) as unknown as string
			addSiteForm.proxysite = str
			if (addSiteFormRef && addSiteFormRef.value) {
				addSiteFormRef.value.validateField('proxysite')
			}
		},
	})
}

// 获取域名列表
export const getDomainList = async (domainSuffixes: any, addSiteForm: any, getDomainRegisterList: any) => {
	try {
		const params = {
			p: 1,
			limit: 200
		}
		const res = createSiteType.value === 'domain' ? await getDomainRegisterList(params) : await getLocalDomainList(params)
		const data = createSiteType.value === 'domain' ? res.data : res.data.data
		
		if (data && data.length > 0) {
			const processedDomains = data
				.map((item: any) => ({
					label: `.${ createSiteType.value === 'domain' ? item.full_domain : item.domain}`,
					value: `.${ createSiteType.value === 'domain' ? item.full_domain : item.domain}`,
					id: createSiteType.value === 'domain' ? item.id : item.id, // 保存域名ID
					fullDomain: createSiteType.value === 'domain' ? item.full_domain : item.domain
				}))
				.sort((a: any, b: any) => a.label.localeCompare(b.label))
			
			console.log('获取域名列表成功:', processedDomains)
			domainSuffixes.value = processedDomains
			
			let defaultSuffix = processedDomains[0]?.value || ''
			
			if (domainName.value) {
				const matchingDomain = processedDomains.find((domain: any) => 
					domain.value === `.${domainName.value}` || 
					domain.value === domainName.value
				)
				if (matchingDomain) {
					defaultSuffix = matchingDomain.value
				}
			}
			
			addSiteForm.domains.forEach((domain: any) => {
				if (!domain.suffix || domain.suffix === '') {
					domain.suffix = defaultSuffix
				}
			})
		} else {
			console.log('域名列表为空或获取失败:', res)
		}
	} catch (error) {
		console.error('获取域名列表失败:', error)
	}
}

// 检测域名可用性
export const checkDomainsAvailability = async (addSiteForm: any) => {
	try {
		const domainsToCheck = addSiteForm.domains
			.filter((domain: any) => domain.name && domain.suffix)
			.map((domain: any) => domain.fullDomain)
		
		if (domainsToCheck.length === 0) {
			return
		}
		addSiteForm.domains.forEach((domain: any) => {
			if (domain.name && domain.suffix) {
				domain.status = 'checking'
				domain.hint = '检测中...'
			}
		})
		const res = await checkDomainStatus({ domains: domainsToCheck })

		if (res.data && res.data.data) {
			const domainStatusMap = res.data.data
			
			addSiteForm.domains.forEach((domain: any) => {
				if (domain.name && domain.suffix) {
					const isAvailable = domainStatusMap[domain.fullDomain]
					if (isAvailable === true) {
						domain.status = 'available'
						domain.hint = '域名可用'
					} else if (isAvailable === false) {
						domain.status = 'registered'
						domain.hint = '域名已被注册'
					} else {
						domain.status = 'error'
						domain.hint = '检测失败'
					}
				}
			})
		}
	} catch (error) {
		console.error('域名检测失败:', error)
		addSiteForm.domains.forEach((domain: any) => {
			if (domain.name && domain.suffix) {
				domain.status = 'error'
				domain.hint = '检测失败'
			}
		})
	}
}



// 处理代理目标输入
export const handelInputTodo = (val: any, addSiteForm: any) => {
	if (typeof val === 'object') return
	if (addSiteForm.targetType === 'unix') {
		addSiteForm.todomain = '$http_host'
		return
	}
	let value = val.replace(/^http[s]?:\/\//, '')
	value = value.replace(/(:|\?|\/|\\)(.*)$/, '')
	addSiteForm.todomain = value
}

// 确认提交
export const onConfirm = async (close: any, addSiteForm: any, addSiteFormRef: any, message: any, formDisabled: any, domainSuffixes: any) => {
	formDisabled.value = true
	let load = null
	
	try {
		const firstDomain = addSiteForm.domains[0]
		if (firstDomain && firstDomain.name === '*') {
			firstDomain.hint = '第一个域名不能是通配符'
			firstDomain.status = 'error'
			message.error('第一个域名不能是通配符')
			return false
		}
		
		if (createSiteType?.value !== 'local') {
			await checkDomainsAvailability(addSiteForm)
		} else {
			addSiteForm.domains.forEach((domain: any) => {
				if (domain.name && domain.suffix) {
					domain.status = 'available'
					domain.hint = ''
				}
			})
		}
		
		// 一次性检查所有域名状态，避免多次循环
		let checkingCount = 0
		let unavailableCount = 0
		let errorCount = 0
		let availableCount = 0
		const validDomainsForSubmit: any[] = []
		
		for (const domain of addSiteForm.domains) {
			if (domain.name && domain.suffix) {
				switch (domain.status) {
					case 'checking':
						checkingCount++
						break
					case 'registered':
						unavailableCount++
						break
					case 'error':
						errorCount++
						break
					case 'available':
						availableCount++
						validDomainsForSubmit.push(domain)
						break
				}
			}
		}
		
		// 根据检查结果返回相应的错误信息
		if (checkingCount > 0) {
			message.error('域名检测中，请稍候...')
			return false
		}
		
		if (unavailableCount > 0) {
			message.error('存在不可用的域名，请检查后重试')
			return false
		}
		
		if (errorCount > 0) {
			message.error('域名检测失败，请重试')
			return false
		}
		
		if (availableCount > 0) {
			load = message.load('所有域名都可用，正在创建反向代理...')
		}
		
		if (validDomainsForSubmit.length === 0) {
			message.error('没有可用的域名')
			return false
		}
		
		const domainList = validDomainsForSubmit.map((domain: any) => domain.fullDomain)
		const firstValidDomain = validDomainsForSubmit[0]
		const params: any = {
			remark: firstValidDomain ? `${addSiteForm.remark}${firstValidDomain.suffix}` : addSiteForm.remark,
			proxy_type: addSiteForm.targetType === 'url' ? 'http' : 'unix',
			proxy_pass: addSiteForm.proxysite,
			domains: domainList.join('\n'),
			proxy_host: firstValidDomain ? `${addSiteForm.todomain}${firstValidDomain.suffix}` : addSiteForm.todomain,
		}
		
		const res = await addProxyProject(params)
		
		if (res.status) {
			// 创建DNS解析记录
			try {
				const domainList = validDomainsForSubmit.map((domain: any) => {
					// 根据选择的后缀找到对应的域名ID
					const selectedDomain = domainSuffixes.value.find((item: any) => item.value === domain.suffix)
					const currentDomainId = selectedDomain?.id || domainId.value || 0
					
					return {
						name: domain.fullDomain,
						[createSiteType.value === 'domain' ? 'domain_id' : 'local_domain_id']: currentDomainId,
						record: domain.name
					}
				})
				const domainListString = JSON.stringify(domainList)
				
				let sslHash = ''
				let httpsEnabled = false
				
				if (addSiteForm.ssl_type === 'certificate' && addSiteForm.ssl_cert) {
					sslHash = addSiteForm.ssl_cert
					httpsEnabled = addSiteForm.force_https
				}
				
				const dnsRecordParams = {
					domain_list: domainListString,
					ssl_hash: sslHash,
					site_name: validDomainsForSubmit[0]?.fullDomain || '',
					https: httpsEnabled
				}

				const dnsResponse = await createDnsRecord(dnsRecordParams)
				console.log('DNS记录创建响应:', dnsResponse)
			} catch (dnsError) {
				console.error('创建DNS记录失败:', dnsError)
			}
			if (close) close()
			message.success('反向代理创建成功')
			return true
		} else {
			message.error('反向代理创建失败')
			return false
		}
	} catch (error: any) {
		console.error('提交失败:', error)
		return false
	} finally {
		load?.close()
		formDisabled.value = false
	}
}
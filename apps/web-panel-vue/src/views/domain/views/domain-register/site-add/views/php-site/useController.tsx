import { useDialog, useHandleError } from '@/hooks/tools'
import { fileSelectionDialog, pluginInstallDialog } from '@/public'
import { checkVariable, getRandomChart } from '@/utils'
import { GetPHPVersion, addPhpSite } from '@/api/site'
import { addSiteTypes, modifySiteTypes, removeSiteType } from '@/api/site'
import { checkDomainStatus, createDnsRecord, getLocalDomainList } from '@/api/domain'
import { useSiteAddStore } from '@domain/views/domain-register/site-add/useStore'
import { getFtpMysqlStatus } from '@api/site'

const { domainId, domainName, createSiteType } = useSiteAddStore()

// 处理域名输入
export const handleDomainInput = (index: number, addSiteForm: any) => {
	const domain = addSiteForm.domains[index]
	if (domain.name && domain.suffix) {
		domain.fullDomain = `${domain.name}${domain.suffix}`
		if (index === 0) {
			addSiteForm.ps = domain.fullDomain
			addSiteForm.path = `/www/wwwroot/${domain.fullDomain}`
			addSiteForm.ftp_username = domain.fullDomain.replace(/\./g, '_')
			addSiteForm.ftp_password = getRandomChart(8)
			addSiteForm.datauser = domain.fullDomain.replace(/\./g, '_')
			addSiteForm.datapassword = getRandomChart(8)
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
	
	// 只有第一个域名才自动填充根目录和备注
	if (lines.length > 0) {
		const firstDomain = lines[0]
		addSiteForm.ps = firstDomain
		addSiteForm.path = `/www/wwwroot/${firstDomain}`
		addSiteForm.ftp_username = firstDomain.replace(/\./g, '_')
		addSiteForm.ftp_password = getRandomChart(8)
		addSiteForm.datauser = firstDomain.replace(/\./g, '_')
		addSiteForm.datapassword = getRandomChart(8)
	}
}

// 添加域名
export const addDomain = (addSiteForm: any, domainSuffixesArray: any) => {
	// 获取默认后缀，优先使用第一个可用的后缀
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
	
	console.log('添加域名，默认后缀:', defaultSuffix, '域名后缀列表:', domainSuffixesArray, 'domainSuffixesArray类型:', typeof domainSuffixesArray)
	
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
		
		// 如果移除的是第一个域名，需要重新设置第一个域名的自动填充
		if (index === 0 && addSiteForm.domains.length > 0) {
			const firstDomain = addSiteForm.domains[0]
			if (firstDomain.name && firstDomain.suffix) {
				firstDomain.fullDomain = `${firstDomain.name}${firstDomain.suffix}`
				addSiteForm.ps = firstDomain.fullDomain
				addSiteForm.path = `/www/wwwroot/${firstDomain.fullDomain}`
				addSiteForm.ftp_username = firstDomain.fullDomain.replace(/\./g, '_')
				addSiteForm.ftp_password = getRandomChart(8)
				addSiteForm.datauser = firstDomain.fullDomain.replace(/\./g, '_')
				addSiteForm.datapassword = getRandomChart(8)
			}
		}
	}
}

// 触发目录选择
export const onPathChange = (addSiteForm: any) => {
	fileSelectionDialog({
		type: 'dir',
		path: addSiteForm.path,
		change: (path: any) => {
			const str = checkVariable(path as unknown as any, 'string', '' as any) as unknown as string
			addSiteForm.path = str
		},
	})
}

// 安装插件
export const installPlugin = async (name: string) => {
	try {
		const { getPluginInfo } = await import('@/api/global')
		const { data } = await getPluginInfo({ sName: name })
		pluginInstallDialog({
			name: data.name,
			type: 'i',
			pluginInfo: data,
		})
	} catch (error) {
		console.log(error)
	}
}

// 获取分类列表
export const getClassListData = async (classList: any, getClassList: any) => {
	try {
		if (classList.value && classList.value.length > 0) return
		const { data } = await getClassList()
		classList.value = data
	} catch (error) {
		console.error('获取分类列表失败:', error)
		classList.value = []
	}
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

// 获取SSL证书列表
export const getSslCertificates = async () => {
	try {
		return [
			{
				id: 'cert1',
				domain: 'example.com',
				expire_date: '2024-12-31'
			},
			{
				id: 'cert2', 
				domain: 'test.com',
				expire_date: '2025-06-15'
			}
		]
	} catch (error) {
		console.error('获取SSL证书列表失败:', error)
		return []
	}
}

// 获取php版本
export const getPHPVersion = async (versionOptions: any, addSiteForm: any) => {
	try {
		const res = await GetPHPVersion()
		versionOptions.value = res.data
		let version: any = '00'
		versionOptions.value?.forEach((item: any) => {
			if (Number(item.version) > Number(version)) {
				version = item.version
			}
		})
		addSiteForm.version = version
	} catch (error) {
		console.log(error)
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

// 设置分类事件
export const setClassEvent = (classList: any, getClassList: any, activeType: any) => {
	useDialog({
		title: '分类管理',
		area: '54',
		compData: {
			ignore: ['0', '-2'],
			field: 'name',
			getClassList: async () => {
				const { data } = await getClassList()
				classList.value = data
				return data
			},
			addClass: (params: any) => {
				return addSiteTypes(params, activeType)
			},
			editClass: (params: any) => {
				return modifySiteTypes(params, activeType)
			},
			deleteClass: (params: any) => {
				return removeSiteType(params, activeType)
			},
			updateOptions: (options: any) => {
				classList.value = options
			},
			showEdit: true,
		},
		component: () => import('@/components/extension/bt-table-class/class-manage.vue'),
	})
}

// 确认提交
export const onConfirm = async (close: any, addSiteForm: any, addSiteFormRef: any, message: any, props: any, formDisabled: any, domainSuffixes: any) => {
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
		
		if (createSiteType.value !== 'local') {
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
			load = message.load('所有域名都可用，正在创建站点...')
		}
		
		if (validDomainsForSubmit.length === 0) {
			message.error('没有可用的域名')
			return false
		}
		
		// 验证表单
		if (!addSiteFormRef.value) {
			message.error('表单引用不存在')
			return false
		}
		
		const valid = await addSiteFormRef.value.validate()
		if (!valid) {
			return false
		}
		
		// 构建提交参数
		const domainList = validDomainsForSubmit.map((domain: any) => domain.fullDomain)
		const params: any = {
			path: addSiteForm.path,
			ftp: addSiteForm.ftp,
			type: 'PHP',
			type_id: addSiteForm.type_id,
			ps: addSiteForm.ps,
			port: addSiteForm.port,
			version: addSiteForm.version,
			need_index: 0,
			need_404: 0,
			sql: addSiteForm.sql,
			codeing: addSiteForm.codeing,
			webname: JSON.stringify({
				domain: domainList[0] || '',
				domainlist: domainList.slice(1),
				count: domainList.length - 1,
			}),
			add_dns_record: false,
			ftp_username: addSiteForm.ftp_username,
			ftp_password: addSiteForm.ftp_password,
			datauser: addSiteForm.datauser,
			datapassword: addSiteForm.datapassword,
		}
		
		// 提交创建站点请求
		const res = await addPhpSite(params)
		
		// 准备结果数据
		const resultData = {
			ftp: addSiteForm.ftp,
			ftpStatus: res.data?.ftpStatus || false,
			ftpData: {
				username: addSiteForm.ftp_username,
				password: addSiteForm.ftp_password,
			},
			sql: addSiteForm.sql,
			databaseStatus: res.data?.databaseStatus || false,
			sqlData: {
				username: addSiteForm.datauser,
				password: addSiteForm.datapassword,
			},
			siteStatus: res.data?.siteStatus || false,
			site: false,
		}
		
		if (res.status && res.data.siteId) {
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
					site_id: res.data.siteId,
					https: httpsEnabled
				}
				
				console.log('DNS记录创建参数:', dnsRecordParams)
				console.log('域名列表:', domainList)
				
				const dnsResponse = await createDnsRecord(dnsRecordParams)
				console.log('DNS记录创建响应:', dnsResponse)
			} catch (dnsError) {
				console.error('创建DNS记录失败:', dnsError)
			}
			
			if (close) close()
			if (addSiteForm.ftp || addSiteForm.sql) {
				useDialog({
					isAsync: true,
					title: '网站添加结果',
					area: 46,
					component: () => import('@site/views/php-model/add-site/add-default/add-result.vue'),
					compData: resultData,
				})
			} else {	
				message.success('网站创建成功')
			}
			return true
		} else {
			message.error(res.msg || '站点创建失败')
			return false
		}
	} catch (error: any) {
		console.error('提交失败:', error)
		message.error(error.message || '提交失败')
		return false
	} finally {
		load?.close()
		formDisabled.value = false
	}
}

export const getStatus = async () => {
	try {
		const { data } = await getFtpMysqlStatus()
		return { ftp: data.ftp, mysql: data.mysql }
	} catch (error) {
		useHandleError(error)
	}
}
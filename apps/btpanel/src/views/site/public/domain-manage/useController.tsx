import { Message, useConfirm, useHandleError } from '@/hooks/tools'
import { checkDomain, checkDomainPort } from '@/utils'
import { openResultDialog } from '../../useController'
import { SITE_STORE, useSiteStore } from '../../useStore'
import { SITE_DOMAIN_STORE, useSiteDomainStore } from './useStore'

const { isBindExtranet, siteType, siteInfo } = useSiteStore()
const { getProjectConfig } = SITE_STORE()

const { port, isRefreshDomain } = useSiteDomainStore()
const { getDomainListEvent, getPortEvent, setPortEvent, addDomainEvent, delDomainEvent, delMultDomainEvent } = SITE_DOMAIN_STORE()

export const popoverFocus = ref(false) // 域名popover
export const domainData = ref('') // 域名数据

const specialData = ['php', 'html'] // 特殊项目类型

const resultColumn = [
	{
		label: '域名',
		prop: 'name',
	},
	{
		label: '结果',
		align: 'right',
		render: (row: unknown) => {
			const data = row as { status: boolean; msg: string }
			return <span class={`${data.status ? 'text-primary' : 'text-danger'}`} innerHTML={data.status ? data?.msg || '操作成功' : data?.msg || '操作失败'}></span>
		},
	},
]

/**
 * @description 获取添加域名参数
 */
const getAddParams = (domain: any) => {
	const { name, id } = siteInfo.value
	const type = siteType.value
	// 提取公共逻辑
	const domainsArray = domain.split('\n')
	const domainsString = JSON.stringify(domainsArray)
	const domainCommaSeparated = domain.replace(/\n/g, ',')

	// 根据不同类型设置不同的参数
	const typeParamsMap: Record<string, any> = {
		php: { domain: domainCommaSeparated, webname: name, id },
		python: { data: JSON.stringify({ name: name, domains: domainsArray }) },
		phpasync: { sitename: name, domains: domainsString },
		proxy: { id, site_name: name, domains: domain },
		java: { project_name: name, domains: domainsString },
		default: {
			data: JSON.stringify({ project_name: name, domains: domainsArray }),
		},
	}
	return typeParamsMap[type] || typeParamsMap.default
}

/**
 * @description 添加域名
 * @param param
 * @returns
 */
export const addDomain = async () => {
	try {
		const val = domainData.value
		const port_bin = ['21', '25', '443', '888', '8888', '8443']
		if (val === '') {
			Message.error('域名不能为空')
			return false
		}

		// 获取：后的端口
		let port = String(val.match(/:(\d+)/g)).replace(/:/g, '')
		if (port_bin.includes(port)) {
			Message.error('端口不能为常用端口21、25、443、888、8888、8443')
			return false
		}
		const check = await checkDomainVerify()
		if (!check) return false

		const params = getAddParams(val)
		const res = await addDomainEvent(params)
		if (res.status && (res?.data?.domains?.length || res?.data?.data?.length)) {
			// 打开结果
			openResultDialog({
				title: '域名添加结果',
				resultData: res?.data?.domains || res?.data?.data || [],
				autoTitle: '添加域名完成',
				resultColumn,
			})
		}
		isRefreshDomain.value = true
		domainData.value = ''
		return res.status
	} catch (error) {
		console.log(error)
	}
}

/**
 * @description 获取域名信息
 * @returns
 */
export const getInfo = async () => {
	try {
		let { project_type, name } = siteInfo.value
		let params = project_type === 'python' ? { name } : { project_name: name }
		await getProjectConfig(params)
	} catch (error) {
		console.log(error)
		return { status: false, msg: '获取域名信息失败' }
	}
}

/**
 * @description 获取参数
 * @param type
 * @param row
 */
const getParams = () => {
	const type = siteType.value
	const row = siteInfo.value
	// 定义一个基础参数对象
	const baseParams = { name: row.name, id: row.id }

	// 特殊数据类型的处理逻辑
	if (specialData.includes(type)) {
		return { table: 'domain', list: 'True', search: baseParams.id }
	}

	// 根据不同类型设置不同的参数
	const typeParamsMap: any = {
		python: { data: JSON.stringify({ name: baseParams.name }) },
		phpasync: { sitename: baseParams.name },
		proxy: { site_name: baseParams.name, id: baseParams.id },
		default: { data: JSON.stringify({ project_name: baseParams.name }) },
	}

	// 返回对应类型的参数，如果没有匹配的类型，则返回默认类型的参数
	return typeParamsMap[type] || typeParamsMap.default
}

/**
 * @description 获取域名列表
 */
export const getDomainList = async () => {
	try {
		const type = siteType.value
		const params = getParams()

		let isSpecial = specialData.includes(type)
		const isPort = ['proxy'].includes(type)
		let resPort: any = null
		if (['phpasync', 'php'].includes(type)) resPort = await getPortEvent()
		const res: any = await getDomainListEvent(params, { isSpecial, isPort })
		if (resPort) port.value = Number(resPort.data) || '未开启'
		if (isPort) {
			port.value = Number(res.data.https_port) || '未开启'
			// portForm.port = data.https_port;
			return {
				data: res.data.domain_list,
				total: res.data.domain_list.length,
				other: {
					port: res.data.https_port,
				},
			}
		} else {
			return { data: res.data, total: res.data.length, other: { ...(resPort ? { port: Number(resPort.data) } : {}) } }
		}
	} catch (error) {
		console.log(error)
		return { data: [], total: 0, other: {} }
	}
}

/**
 * @description 检测域名
 * @param domainInfo 域名数据
 */
const checkDomainVerify = async (domainInfo: any = domainData.value) => {
	let domainList = domainInfo.trim().replace(' ', '').split('\n')
	const invalidIndex = domainList.findIndex((domain: any) => domain.split(':')[0].length < 3)

	for (var i = 0; i < domainList.length; i++) {
		var item = domainList[i]
		let isPort = item.includes(':')
		if (isPort && !checkDomainPort(item)) {
			Message.error('第' + (i + 1) + '行【' + item + '】域名格式错误')
			return false
		}
		if (!isPort && !checkDomain(item)) {
			Message.error('第' + (i + 1) + '行【' + item + '】域名格式错误')
			return false
		}
	}

	if (invalidIndex !== -1) {
		Message.error(`第 ${invalidIndex + 1} 个域名长度不符合要求（必须大于3个字符）`)
		return false
	}
	return domainList
}

/**
 * @description 设置https端口
 * @param params.name 项目名称
 * @param params.port https端口
 */
export const setPort = async (param: any) => {
	try {
		const params = {
			...(siteType.value === 'proxy' ? { site_name: siteInfo.value.name } : { siteName: siteInfo.value.name }),
			...(siteType.value === 'proxy' ? { https_port: param.value.port } : { port: param.value.port }),
		}
		const res = await setPortEvent(params)
		if (res?.status) {
			port.value = Number(param.value.port)
		}
	} catch (error) {
		console.log(error)
	}
}

/**
 * @description 获取删除域名参数
 * @param data 域名列表 行数据
 * @param row 项目信息
 */
const getDelParams = (row: any) => {
	const type = siteType.value
	const { id, name } = siteInfo.value
	const typeParamsMap: Record<string, any> = {
		php: { webname: name, id: row.pid, domain: row.name, port: row.port },
		phpasync: { sitename: name, domain: JSON.stringify([row.id]) },
		python: { data: JSON.stringify({ name, domain: row.name + ':' + row.port }) },
		proxy: {
			id: id,
			site_name: name,
			domain: `${row.name}:${row.port}`,
			port: row.port,
		},
		java: { data: JSON.stringify({ project_name: name, domains: [row.id] }) },
		html: {
			data: JSON.stringify({ project_name: name, domain: `${row.name}:${row.port}` }),
		},
		default: {
			data: JSON.stringify({ project_name: name, domain: `${row.name}:${row.port}` }),
		},
	}
	return typeParamsMap[type] || typeParamsMap.default
}

/**
 * @description 删除域名
 */
export const delDomain = async (row: any) => {
	try {
		await useConfirm({
			icon: 'warning-filled',
			title: `删除【${row.name}】`,
			content: `删除${row.name}后，将无法使用该域名访问网站，是否继续操作？`,
		})
		const params = getDelParams(row)
		const res = await delDomainEvent(params)
		Message.request(res)
		isRefreshDomain.value = true
		return res
	} catch (error) {
		console.log(error)
	}
}

const getMultDelParams = (list: any) => {
	const { id, name } = siteInfo.value
	const type = siteType.value
	const ids = list.map((item: any) => item.id)
	const domains = list.map((item: any) => item.name).join('\n')

	const paramsType: AnyObject = {
		php: { domains_id: ids.join(','), id },
		java: {
			data: JSON.stringify({ project_name: name, domains: ids }),
		},
		python: { name, domain_ids: JSON.stringify(ids) },
		phpasync: { sitename: name, domain: JSON.stringify(ids) },
		proxy: { id, site_name: name, domains },
	}
	return paramsType[type] || paramsType.default
}

/**
 * @description 删除多个域名 一个接口删除
 * @returns
 */
export const delMultDomain = async (list: any) => {
	try {
		await useConfirm({
			icon: 'warning-filled',
			title: `批量删除`,
			content: `同时删除选中的域名，是否继续？`,
			type: 'calc',
		})

		const type = siteType.value
		let result: any = [] // 结果

		if (['php', 'python', 'java', 'phpasync', 'proxy'].includes(type)) {
			const params = getMultDelParams(list)
			const res = await delMultDomainEvent(params)
			result = res.data
		} else {
			// 循环删除
			await Promise.all(
				list.map(async (item: any) => {
					const params = {
						data: JSON.stringify({
							project_name: siteInfo.value.name,
							domain: item.name,
						}),
					}
					try {
						const res = await delDomainEvent(params)
						result.push({ name: item?.name || item?.domain, msg: res.msg, status: res.status })
					} catch (error) {
						useHandleError(error)
					}
				})
			)
		}
		// 打开结果
		await openResultDialog({
			resultData: result,
			autoTitle: '删除域名完成',
			resultColumn,
		})
		isRefreshDomain.value = true
		return { status: true, msg: '删除域名成功' }
	} catch (error) {
		console.log(error)
		return { status: false, msg: '删除域名失败' }
	}
}

/**
 * @description 获取域名数据初始化
 */
export const initDomain = async () => {
	try {
		const type = siteType.value
		if (['php', 'proxy', 'html', 'phpasync'].includes(type)) {
			isBindExtranet.value = true
			// 测试版功能
			// if (!['proxy', 'html', 'nginx'].includes(type)) await getPortEvent();
		} else {
			await getInfo() // 获取项目信息 -判定开启外网映射
		}
		return await getDomainList()
	} catch (error) {
		console.log(error)
		return { data: [], total: 0, other: {} }
	}
}

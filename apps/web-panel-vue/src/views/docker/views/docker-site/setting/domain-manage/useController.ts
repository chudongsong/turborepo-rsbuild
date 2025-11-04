import { Message, useConfirm, useHandleError } from '@/hooks/tools'
import { checkDomain, checkDomainPort } from '@/utils'
import { openResultDialog } from '../../useController'
import { useDockerSiteStore } from '../../useStore'
import { SITE_DOMAIN_STORE, useSiteDomainStore } from './useStore'

const { siteInfo } = useDockerSiteStore()

const { port, isRefreshDomain } = useSiteDomainStore()
const { getDomainListEvent, setPortEvent, addDomainEvent, delDomainEvent, delMultDomainEvent } = SITE_DOMAIN_STORE()

export const popoverFocus = ref(false) // 域名popover
export const domainData = ref('') // 域名数据

/**
 * @description 获取添加域名参数
 */
const getAddParams = (domain: any) => {
	const { name, id } = siteInfo.value

	return { id, site_name: name, domains: domain }
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
		if (res.status) {
			// 打开结果
			openResultDialog({
				title: '域名添加结果',
				resultData: res?.data?.domains || res?.data?.data || [],
				autoTitle: '添加域名完成',
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
 * @description 获取参数
 * @param type
 * @param row
 */
const getParams = () => {
	const row = siteInfo.value

	// 返回对应类型的参数，如果没有匹配的类型，则返回默认类型的参数
	return { site_name: row.name, id: row.id }
}

/**
 * @description 获取域名列表
 */
export const getDomainList = async () => {
	try {
		const params = getParams()
		const res: any = await getDomainListEvent(params)
		port.value = Number(res.data.https_port) || '未开启'
		// portForm.port = data.https_port;
		return {
			data: res.data.domain_list,
			total: res.data.domain_list.length,
			other: {
				port: res.data.https_port,
			},
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
		const res = await setPortEvent({ site_name: siteInfo.value.name, https_port: param.value.port })
		if (res?.status) {
			port.value = Number(param.value.port)
			// portPopup.value = false;
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
	const { id, name } = siteInfo.value
	return {
		id: id,
		site_name: name,
		domain: row.name,
		port: row.port,
	}
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
	const { name } = siteInfo.value
	// const type = siteType.value
	// const ids = list.map((item: any) => item.id)
	// const domains = list.map((item: any) => item.name).join('\n')

	// const paramsType: AnyObject = {
	// 	php: { domains_id: ids.join(','), id },
	// 	java: {
	// 		data: JSON.stringify({ project_name: name, domains: ids }),
	// 	},
	// 	python: { name, domain_ids: JSON.stringify(ids) },
	// 	phpasync: { sitename: name, domain: JSON.stringify(ids) },
	// 	proxy: { id, site_name: name, domains },
	// }

	const params = list.map((item: any) => {
		return {
			id: item.id,
			port: item.port,
			domain: item.name,
			site_name: name,
		}
	})
	return { del_domain_list: JSON.stringify(params) }
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

		let result: any = [] // 结果
		const params = getMultDelParams(list)
		const res = await delMultDomainEvent(params)
		result = res.data
		// 打开结果
		await openResultDialog({
			resultData: result,
			autoTitle: '删除域名完成',
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
		return await getDomainList()
	} catch (error) {
		console.log(error)
		return { data: [], total: 0, other: {} }
	}
}

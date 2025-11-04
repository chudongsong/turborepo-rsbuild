/* eslint-disable @typescript-eslint/naming-convention */
import { useAxios } from '@axios/index'
import { ResponseResult } from '@/types'

/**
 * @description 域名查询接口
 * @param { string } data.domain 域名
 * @param { number } data.recommend_type 推荐类型
 * @param { number } data.rows 每页条数
 * @param { number } data.p 页码
 * @returns { Promise<ResponseResult> }
 */
export const checkDomain = (data: { 
	domain: string
	recommend_type?: number
	rows?: number
	p?: number
}): Promise<ResponseResult> => 
	useAxios.post('/v1/domain/query/check', { data, check: 'object', customType: 'model' })

/**
 * @description 域名管理通用接口（转发接口）
 * @param { string } data.url 目标接口URL
 * @param { number } data.p 页码
 * @param { number } data.rows 每页条数
 * @param { number } data.status 状态 0:待注册,1:正常,2:即将到期,3:已过期,4:待赎回,5:注册失败
 * @param { string } data.suffix 后缀筛选
 * @param { string } data.keyword 关键词搜索
 * @param { number } data.domain_id 域名ID
 * @param { string } data.domain 域名
 * @param { number } data.years 年限
 * @param { number } data.order_type 订单类型
 * @returns { Promise<ResponseResult> }
 */
export const getDomaiNuniversalModule = (data: {
	url?: string
	p?: number
	rows?: number
	status?: number
	suffix?: string
	keyword?: string
	domain_id?: number
	domain?: string
	years?: number
	order_type?: number
	domain_name?: string
	real_name_template_id?: number
	order_id?: string | number
	order_no?: string
	domain_list?: Array<{ domain: string; year: number; domain_service: number }>
	ip_address?: string
}): Promise<ResponseResult> => 
	useAxios.post('/mod/domain/domain/domain_proxy', { data: { data: JSON.stringify(data) }, check: 'object', customType: 'model' })

/**
 * @description 检测域名是否可用
 * @param { string[] } data.domains 完整域名数组
 * @returns { Promise<ResponseResult> }
 */
export const checkDomainStatus = (data: {
	domains: string[]
}): Promise<ResponseResult> => 
	useAxios.post('/mod/domain/domain/get_domain_status', { data, check: 'object', customType: 'model' })

/**
 * @description 创建DNS解析记录
 * @param { string } data.domain_list 域名列表字符串
 * @param { string } data.ssl_hash SSL证书哈希值（不使用SSL时为空字符串）
 * @param { number } data.site_id 站点ID
 * @param { boolean } data.https 是否开启强制HTTPS
 * @returns { Promise<ResponseResult> }
 */
export const createDnsRecord = (data: {
	domain_list: string
	ssl_hash: string
	site_id?: number
	site_name?: string
	https: boolean
}): Promise<ResponseResult> => 
	useAxios.post('/mod/domain/domain/create_dns_record', { data, check: 'object', customType: 'model' })

/**
 * @description 获取SSL证书列表
 * @param { number } data.p 页码
 * @param { number } data.limit 每页显示条数
 * @param { string } data.search 查询参数
 * @param { string } data.type_id 分类id
 * @param { any } data.status_id 状态id
 * @returns { Promise<ResponseResult> }
 */
export const getCertList = (data: {
	p?: number
	limit?: number
	search?: string
	type_id?: string
	status_id?: string | number
}): Promise<ResponseResult> => 
	useAxios.post('/ssl?action=get_cert_list', { data, check: 'object', customType: 'model' })

/**
 * @description WHOIS查询接口
 * @param { string } data.domain 域名
 * @returns { Promise<ResponseResult> }
 */
export const whoisQuery = (data: {
	domain: string
}): Promise<ResponseResult> => 
	useAxios.post('/mod/domain/domain/poxy_whois_query', { data, check: 'object', customType: 'model' })

/**
 * @description 获取公网IP接口
 * @returns { Promise<ResponseResult> }
 */
export const getPublicIp = (): Promise<ResponseResult> => 
	useAxios.post('/mod/domain/domain/get_public_ip', { check: 'object', customType: 'model' })

/**
 * @description 获取解析IP接口
 * @returns { Promise<ResponseResult> }
 */
export const getAnalysisIp = (): Promise<ResponseResult> => 
	useAxios.post('/mod/domain/domain/get_analysis_ip', { check: 'object', customType: 'model' })

/**
 * @description 修改解析IP接口
 * @param { string } data.ip 新的IP地址
 * @returns { Promise<ResponseResult> }
 */
export const setAnalysisIp = (data: {
	ip: string
}): Promise<ResponseResult> => 
	useAxios.post('/mod/domain/domain/set_analysis_ip', { data, check: 'object', customType: 'model' })

/**
 * @description 刷新本地缓存
 * @returns { Promise<ResponseResult> }
 */
export const refreshLocalCache = (): Promise<ResponseResult> => 
	useAxios.post('/mod/domain/domain/refresh_domain_cache', { check: 'object', customType: 'model' })

/**
 * @description 获取域名管理列表
 * @returns { Promise }
 */
export const getLocalDomainList = (data: any): Promise<any> =>
	useAxios.post('ssl/data/get_domain_list', {
		data,
		customType: 'model',
		check: 'object',
	})
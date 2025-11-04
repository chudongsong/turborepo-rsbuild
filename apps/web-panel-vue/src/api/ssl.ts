import { useAxios } from '@/hooks/tools'
import { DomainTableProps, CertificateTableProps } from '@/types/ssl'

/**
 * @description 获取域名管理列表
 * @returns { Promise }
 */
export const getDomainList = (data: DomainTableProps): Promise<any> =>
	useAxios.post('ssl/data/get_domain_list', {
		data,
		customType: 'model',
		check: 'object',
	})

/**
 * @description 获取域名管理类型
 * @returns { Promise }
 */
export const getDomainType = (): Promise<any> =>
	useAxios.post('ssl/data/get_domain_type', {
		customType: 'model',
		check: 'object',
	})

/**
 * @description 添加域名分类
 * @returns { Promise }
 */
export const addDomainType = (data: AnyObject): Promise<any> =>
	useAxios.post('ssl/data/add_domain_type', {
		data,
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 删除域名管理类型
 * @returns { Promise }
 */
export const delDomainType = (data: AnyObject): Promise<any> =>
	useAxios.post('ssl/data/del_domain_type', {
		data,
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 设置域名管理类型
 * @returns { Promise }
 */
export const setDomainType = (data: AnyObject): Promise<any> =>
	useAxios.post('ssl/data/set_domain_type', {
		data,
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 获取证书列表
 * @returns { Promise }
 */
export const getCertList = (data: CertificateTableProps): Promise<any> =>
	useAxios.post('ssl/cert/get_cert_list', {
		data,
		customType: 'model',
		check: 'object',
	})

/**
 * @description 获取证书分组
 * @returns { Promise }
 */
export const getCertGroup = (): Promise<any> =>
	useAxios.post('ssl/cert/get_cert_group', {
		customType: 'model',
		check: 'array',
	})

/**
 * @description 添加证书分组
 * @returns { Promise }
 */
export const addCertGroup = (data: AnyObject): Promise<any> =>
	useAxios.post('ssl/cert/add_cert_group', {
		data,
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 删除证书分组
 * @returns { Promise }
 */
export const delCertGroup = (data: AnyObject): Promise<any> =>
	useAxios.post('ssl/cert/del_cert_group', {
		data,
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 设置证书分组
 * @returns { Promise }
 */
export const setCertGroup = (data: AnyObject): Promise<any> =>
	useAxios.post('ssl/cert/set_cert_group', {
		data,
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 获取dns列表数据
 * @returns { Promise }
 */
export const getDnsData = (): Promise<any> =>
	useAxios.post('ssl/dnsapi/get_dns_data', {
		customType: 'model',
		check: 'object',
	})

/**
 * @description 修改dns数据
 * @returns { Promise }
 */
export const editDnsData = (data: AnyObject): Promise<any> =>
	useAxios.post('ssl/dnsapi/upd_dns_data', {
		data,
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 删除dns列表数据
 * @returns { Promise }
 */
export const delDnsData = (data: AnyObject): Promise<any> =>
	useAxios.post('ssl/dnsapi/del_dns_data', {
		data,
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 新增dns数据
 * @returns { Promise }
 */
export const addDnsData = (data: AnyObject): Promise<any> =>
	useAxios.post('ssl/dnsapi/add_dns_data', {
		data,
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 设置dns
 * @returns { Promise }
 */
export const setDomainDNS = (data: AnyObject): Promise<any> =>
	useAxios.post('ssl/data/set_domain_dns', {
		data,
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 域名操作
 * @param { string } data.fun_name  get_dns_record：获取解析记录
 * 																	delete_dns_record：删除解析记录
 * 																	create_dns_record：创建解析记录
 * @returns { Promise }
 */
export const domainFun = (data: AnyObject): Promise<any> =>
	useAxios.post('ssl/data/run_fun', {
		data,
		customType: 'model',
		check: 'object',
	})

/**
 * @description 保存证书
 * @returns { Promise }
 */
export const saveCert = (data: AnyObject): Promise<any> =>
	useAxios.post('ssl/cert/save_cert', {
		data,
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 从云端同步
 * @returns { Promise }
 */
export const updateCertFromCloud = (): Promise<any> =>
	useAxios.post('ssl/cert/update_cert_from_cloud', {
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 部署商用证书
 * @param { string } data.siteName 域名
 * @param { string } data.oid 订单id
 * @returns { Promise }
 */
export const deploySslCert = (data: AnyObject): Promise<any> =>
	useAxios.post('ssl?action=set_cert', {
		data,
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 部署测试证书
 * @param { string } data.siteName 域名
 * @param { string } data.partnerOrderId 订单号
 * @returns { Promise }
 */
export const deployTestCert = (data: AnyObject): Promise<any> =>
	useAxios.post('ssl?action=GetSSLInfo', {
		data,
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 部署LetsEncrypt证书
 * @param { string } data.siteName 域名
 * @param { string } data.ssl_hash 证书hash
 * @returns { Promise }
 */
export const deployLetsEncryptCert = (data: AnyObject): Promise<any> =>
	useAxios.post('ssl/cert/SetCertToSite', {
		data,
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 获取所有域名列表和dns配置
 * @returns { Promise }
 */
export const getDomainConfigList = (data: AnyObject): Promise<any> =>
	useAxios.post('ssl/data/get_domain_dns_config', {
		data,
		customType: 'model',
		check: 'array',
	})

/**
 * @description 申请证书
 * @returns { Promise }
 */
export const applyBuyCert = (data: AnyObject): Promise<any> =>
	useAxios.post('ssl/cert/apply_for_cert', {
		data,
		customType: 'model',
		check: 'object',
	})

/**
 * @description 下载证书
 * @returns { Promise }
 */
export const downloadCert = (data: AnyObject): Promise<any> =>
	useAxios.post('ssl/cert/download_cert', {
		data,
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 上传证书到云端
 * @returns { Promise }
 */
export const uploadCertToCloud = (data: AnyObject): Promise<any> =>
	useAxios.post('ssl/cert/upload_cert_to_cloud', {
		data,
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 删除证书
 * @returns { Promise }
 */
export const removeCloudCert = (data: AnyObject): Promise<any> =>
	useAxios.post('ssl/cert/remove_cloud_cert', {
		data,
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 删除证书
 * @returns { Promise }
 */
export const batchRemoveCloudCert = (data: AnyObject): Promise<any> =>
	useAxios.post('ssl/cert/batch_remove_cert', {
		data,
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 设置域名到期时间
 * @returns { Promise }
 */
export const setDomainEndTime = (data: AnyObject): Promise<any> =>
	useAxios.post('ssl/data/set_domain_endtime', {
		data,
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 批量下载证书
 * @returns { Promise }
 */
export const batchDownloadCert = (data: AnyObject): Promise<any> =>
	useAxios.post('ssl/cert/batch_download_cert', {
		data,
		customType: 'model',
		check: 'object',
	})

/**
 * @description 开启域名到期提醒
 * @returns { Promise }
 */
export const createReportTask = (data: AnyObject): Promise<any> =>
	useAxios.post('ssl/data/create_report_task', {
		data,
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 关闭域名到期提醒
 * @returns { Promise }
 */
export const removeReportTask = (data: AnyObject): Promise<any> =>
	useAxios.post('ssl/data/remove_report_task', {
		data,
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 开启证书到期提醒
 * @returns { Promise }
 */
export const createReportTaskCert = (data: AnyObject): Promise<any> =>
	useAxios.post('ssl/cert/create_report_task', {
		data,
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 关闭证书到期提醒
 * @returns { Promise }
 */
export const removeReportTaskCert = (data: AnyObject): Promise<any> =>
	useAxios.post('ssl/cert/remove_report_task', {
		data,
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 添加自动续签
 * @returns { Promise }
 */
export const addRenewalTask = (data: AnyObject): Promise<any> =>
	useAxios.post('/ssl/cert/add_renewal_task', {
		data,
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 删除自动续签
 * @returns { Promise }
 */
export const delRenewalTask = (data: AnyObject): Promise<any> =>
	useAxios.post('/ssl/cert/del_renewal_task', {
		data,
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 获取站点列表
 * @returns { Promise }
 */
export const getSiteList = (): Promise<any> =>
	useAxios.post('/ssl/data/get_site_list', {
		customType: 'model',
		check: 'array',
	})

/**
 * @description 批量部署证书
 * @returns { Promise }
 */
export const setBatchCertToSite = (data: AnyObject): Promise<any> =>
	useAxios.post('/ssl/cert/SetBatchCertToSite', {
		data,
		customType: 'model',
		check: 'object',
	})

/**
 * @description 手动同步域名列表
 * @returns { Promise }
 */
export const syncDomains = (): Promise<any> =>
	useAxios.post('/ssl/data/sync_domains', {
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 删除域名
 * @returns { Promise }
 */
export const delDomains = (data: AnyObject): Promise<any> =>
	useAxios.post('/ssl/data/del_domains', {
		data,
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 获取异常日志
 * @param { number } id 证书crontab_id
 * @returns { Promise }
 */
export const getExceptionLog = (id: number): Promise<any> =>
	useAxios.post('/crontab?action=GetLogs', {
		data: { id },
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 删除商业证书
 * @param { number } oid 证书oid
 * @returns { Promise }
 */
export const delCommercialCert = (oid: number): Promise<any> =>
	useAxios.post('/ssl?action=soft_release', {
		data: { oid },
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 创建letsencrypt证书订单
 * @param { string } data.ssl_hash 证书hash
 * @returns { Promise }
 */
export const createLetsEncryptCertOrder = (data: AnyObject): Promise<any> =>
	useAxios.post('/ssl/cert/create_order', {
		data,
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 获取证书部署任务列表
 * @returns { Promise }
 */
export const getCertificateDeployTaskList = (): Promise<any> =>
	useAxios.post('/ssl/autodeploy/plane_synchron_list', {
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 创建同步任务
 * @param { string } data.task_name 任务名称
 * @param { string } data.cloud_id 证书id
 * @param { string } data.private_key 密钥
 * @param { string } data.sites 网站id
 * @param { string } data.cycle 检测周期
 * @returns { Promise }
 */
export const createSynchronTask = (data: AnyObject): Promise<any> =>
	useAxios.post('/ssl/autodeploy/add_task', {
		data,
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 获取任务列表
 * @returns { Promise }
 */
export const getDeployTaskList = (data: AnyObject): Promise<any> =>
	useAxios.post('/ssl/autodeploy/get_task_list', {
		data,
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 修改同步任务
 * @returns { Promise }
 */
export const editSynchronTask = (data: AnyObject): Promise<any> =>
	useAxios.post('/ssl/autodeploy/edit_task', {
		data,
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 删除同步任务
 * @returns { Promise }
 */
export const deleteSynchronTask = (data: AnyObject): Promise<any> =>
	useAxios.post('/ssl/autodeploy/del_task', {
		data,
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 批量删除部署任务
 * @returns { Promise }
 */
export const batchDeleteSynchronTask = (data: AnyObject): Promise<any> =>
	useAxios.post('/ssl/autodeploy/batch_del_task', {
		data,
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 获取部署任务详情
 * @returns { Promise }
 */
export const getDeployTaskDetail = (data: AnyObject): Promise<any> =>
	useAxios.post('/ssl/autodeploy/get_task_deploy_detail', {
		data,
		customType: 'model',
		check: 'object',
	})

/**
 * @description 获取DNS域名列表
 * @returns { Promise }
 */
export const getDnsDomainData = (data: AnyObject): Promise<any> =>
	useAxios.post('/ssl/data/run_fun', {
		data,
		customType: 'model',
		check: 'object',
	})

/**
 * @description 同步DNS域名
 * @returns { Promise }
 */
export const syncDnsDomain = (data: AnyObject): Promise<any> =>
	useAxios.post('/ssl/data/add_domain', {
		data,
		customType: 'model',
		check: 'msg',
	})

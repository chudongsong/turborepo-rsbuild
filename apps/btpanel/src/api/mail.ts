/* eslint-disable @typescript-eslint/naming-convention */
import { useAxios } from '@hooks/tools'
// success111   errorMessage: { close: true }222 errorMessage: false333  isOriginalResult444  errorMessage: { close: true }  555
/**
 * @description 获取今日数据
 */
export const getTodayData = () =>
	useAxios.post('/mail/main/get_today_count', {
		customType: 'model',
		check: 'object',
	})

/**
 * @description 获取日志
 */
export const getMailLogs = (data: { p: number; size: number }) => useAxios.post('/mail/main/mail_log_list', { data, customType: 'model' })

/**
 * @description 获取域名列表
 */
export const getDomains = (data: { p: number; size: number }) => useAxios.post('/mail/main/get_domains', { data, customType: 'model' })

/**
 * @description 刷新域名记录
 */
export const flushDomainRecord = (data: { domain: string }) =>
	useAxios.post('/mail/main/flush_domain_record', {
		data,
		customType: 'model',
	})

/**
 * @description 设置catchall开关111
 */
export const setDomainCatchall = (data: { domain: string; email: string; catch_type: string }) =>
	useAxios.post('/mail/main/enable_catchall', {
		data,
		customType: 'model',
		loading: '正在设置 catchall，请稍候...',
	})

/**
 * @description 设置域名列表的证书状态111
 */
export const setDomainCert = (data: { domain: string; csr: string; key: string }) =>
	useAxios.post('/mail/main/set_mail_certificate_multiple', {
		data: { ...data, act: 'add' },
		customType: 'model',
		loading: '正在设置证书状态，请稍候...',
	})

/**
 * @description 删除域名列表的证书状态111
 */
export const delDomainCert = (data: { domain: string; csr: string; key: string }) =>
	useAxios.post('/mail/main/set_mail_certificate_multiple', {
		data: { ...data, act: 'delete' },
		customType: 'model',
		loading: '正在设置证书状态，请稍候...',
	})

/**
 * @description 添加域名111 222
 */
export const addDomain = (data: { domain: string; a_record: string; mailboxes: number; quota: string; email: string; catch_type: string; auto_create_record: number }) =>
	useAxios.post('/mail/main/add_domain_new', {
		data,
		customType: 'model',
		loading: '正在添加域名，请稍候...',
	})

/**
 * @description 编辑域名111
 */
export const editDomain = (data: { domain: string; a_record: string; mailboxes: number; quota: string; email: string; catch_type: string; auto_create_record: number }) =>
	useAxios.post('/mail/main/update_domain', {
		data,
		customType: 'model',
		loading: '正在编辑域名，请稍候...',
	})

/**
 * @description 删除域名111
 */
export const delDomain = (data: { domain: string }) =>
	useAxios.post('/mail/main/delete_domain', {
		data,
		loading: '正在删除域名，请稍候...',
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 删除max记录和txt记录-请求111
 */
export const delMxTxtCache = (data: { domain: string }) =>
	useAxios.post('/mail/main/delete_mx_txt_cache', {
		data,
		loading: '正在清除 MX 记录和 TXT 记录缓存，请稍候...',
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 获取域名名称列表
 */
export const getDomainName = () =>
	useAxios.post('/mail/main/get_domain_name', {
		customType: 'model',
		check: 'object',
	})

/**
 * @description 获取邮箱用户列表_请求
 */
export const getMailboxList = (data: { p: number; size: number }) =>
	useAxios.post('/mail/main/get_mailboxs', {
		data,
		customType: 'model',
		check: 'array',
	})

/**
 * @description 添加邮箱用户_请求111
 */
export const addMailbox = (data: { full_name: string; username: string; quota: string; is_admin: number; password: string; active: number }) =>
	useAxios.post('/mail/main/add_mailbox', {
		data,
		loading: '正在添加邮箱，请稍候...',
		customType: 'model',
	})

/**
 * @description 编辑邮箱用户_请求111
 */
export const editMailbox = (data: { full_name: string; username: string; quota: string; is_admin: number; password?: string; active: number }) =>
	useAxios.post('/mail/main/update_mailbox', {
		data,
		loading: '正在编辑邮箱，请稍候...',
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 删除邮箱用户列表_请求111
 */
export const delMailbox = (data: { username: string }) =>
	useAxios.post('/mail/main/delete_mailbox', {
		data,
		loading: '正在删除邮箱，请稍候...',
		customType: 'model',
	})

/**
 * @description 获取密抄邮箱列表
 */
export const getBccList = () =>
	useAxios.post('/mail/main/get_bcc', {
		customType: 'model',
		check: 'object',
	})

/**
 * @description 添加密抄邮箱111
 */
export const addMailBcc = (data: { user: string; forward_user: string; type: string; active: number }) =>
	useAxios.post('/mail/main/set_mail_bcc', {
		data,
		loading: '正在添加密送服务，请稍候...',
		customType: 'model',
	})

/**
 * @description 修改密抄邮箱111
 */
export const editMailBcc = (data: { user: string; type: string; forward_user: string; type_new: string; forward_user_new: string; active_new: number }) =>
	useAxios.post('/mail/main/update_bcc', {
		data,
		loading: '正在编辑密送服务，请稍候...',
		customType: 'model',
	})

/**
 * @description 删除密抄邮箱信息111
 */
export const delMailBcc = (data: { user: string; type: string; forward_user: string }) =>
	useAxios.post('/mail/main/del_bcc', {
		data,
		loading: '正在删除密送设置，请稍候...',
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 获取邮件转发列表
 */
export const getMailForward = () =>
	useAxios.post('/mail/main/get_mail_forward', {
		customType: 'model',
		check: 'object',
	})

/**
 * @description 添加转发邮件111
 */
export const addMailForward = (data: { user: string; domain: string; forward_user: string; active: number }) =>
	useAxios.post('/mail/main/set_mail_forward', {
		data,
		loading: '正在添加转发，请稍候...',
		customType: 'model',
	})

/**
 * @description 编辑转发邮件111
 */
export const editMailForward = (data: { user: string; forward_user: string; active: number }) =>
	useAxios.post('/mail/main/edit_mail_forward', {
		data,
		loading: '正在编辑转发，请稍候...',
		customType: 'model',
	})

/**
 * @description 删除转发邮件111
 */
export const delMailForward = (data: { user: string }) =>
	useAxios.post('/mail/main/delete_mail_forward', {
		data,
		loading: '正在删除密送设置，请稍候...',
		customType: 'model',
	})

/**
 * @description 获取所有用户列表
 */
export const getUserList = () =>
	useAxios.post('/mail/main/get_all_user', {
		customType: 'model',
		check: 'array',
	})

/**
 * @description 获取收件者列表
 */
export const getInboxMails = (data: { p: number; username: string }) =>
	useAxios.post('/mail/main/get_mails', {
		data,
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 标记为垃圾邮件111 444
 */
export const moveSpamMail = (data: { path: string; username: string }) =>
	useAxios.post('/mail/main/move_to_junk', {
		data,
		loading: '正在标记为垃圾邮件，请稍候...',
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 删除邮件111 444
 */
export const deleteMail = (data: { path: string }) =>
	useAxios.post('/mail/main/delete_mail', {
		data,
		loading: '正在删除邮件，请稍候...',
		customType: 'model',
	})

/**
 * @description 获取垃圾箱列表
 */
export const getSpamMails = (data: { p: number; username: string }) =>
	useAxios.post('/mail/main/get_junk_mails', {
		data,
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 垃圾邮件恢复111
 */
export const restoreSpam = (data: { path: string; username: string }) =>
	useAxios.post('/mail/main/move_out_junk', {
		data,
		loading: '正在恢复垃圾邮件，请稍候...',
		customType: 'model',
	})

/**
 * @description 获取已发送列表
 */
export const getOutboxMails = (data: { p: number; username: string }) =>
	useAxios.post('/mail/main/get_sent_mails', {
		data,
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 发送邮件_请求111
 */
export const sendMailContent = (data: { mail_from: string; mail_to: string; subject: string; content: string; subtype: string; smtp_server: string }) =>
	useAxios.post('/mail/main/send_mail', {
		data,
		loading: '正在发送邮件，请稍候...',
		customType: 'model',
	})

/**
 * @description 获取发送任务列表_请求
 */
export const getTaskList = (data: { p: number; size: number }) =>
	useAxios.post('/mail/main/get_task_list', {
		data,
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 获取发送失败列表_请求
 */
export const getTaskError = (data: { task_id: number; type: string }) =>
	useAxios.post('/mail/main/get_log_rank', {
		data,
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 获取发送失败列表详情_请求
 */
export const getTaskErrorDetails = (data: { task_id: number; type: string; value: string; page: number; size: number }) => useAxios.post('/mail/main/get_log_list', { data, customType: 'model' })

/**
 * @description 删除任务_请求111
 */
export const deleteTask = (data: { task_id: number }) =>
	useAxios.post('/mail/main/delete_task', {
		data,
		loading: '正在删除任务，请稍候...',
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 导入收件_请求111
 */
export const importRecipient = (data: { file: string }) =>
	useAxios.post('/mail/main/processing_recipient', {
		data,
		loading: '正在导入，请稍候...',
		customType: 'model',
	})

/**
 * @description 获取发送限制列表_请求
 */
export const getRecipientData = (data: { file: string }) =>
	useAxios.post('/mail/main/get_recipient_data', {
		data,
		customType: 'model',
		check: 'object',
	})

/**
 * @description 添加批量发送任务_请求111
 */
export const addSendTask = (data: { task_name: string; addresser: string; file_recipient: string; subject: string; up_content: number; file_content: string; content: string; is_record: number; unsubscribe: number; threads: number }) =>
	useAxios.post('/mail/bulk/add_task', {
		data,
		loading: '正在添加，请稍候...',
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 暂停发送任务_请求111
 */
export const setPauseTask = (data: { task_id: number; pause: number }) =>
	useAxios.post('/mail/main/pause_task', {
		data,
		loading: '正在处理，请稍候...',
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 获取备份设置参数 555
 */
export const getBackupParams = () =>
	useAxios.post('/mail/main/get_backup_task_status', {
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 关闭备份计划111
 */
export const closeBackupTask = () =>
	useAxios.post('/mail/main/close_backup_task', {
		loading: '正在关闭备份设置，请稍候...',
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 获取已安装云存储插件列表
 */
export const getCloudList = () =>
	useAxios.post('/mail/main/get_cloud_storage_list', {
		customType: 'model',
		check: 'object',
	})

/**
 * @description 保存备份设置111
 */
export const saveBackupTask = (data: { type: string; week?: string; hour: number; minute: number; backupTo: string; save: number }) =>
	useAxios.post('/mail/main/open_backup_task', {
		data,
		loading: '正在保存备份设置，请稍候...',
		customType: 'model',
	})

/**
 * @description 获取备份路径
 */
export const getBackupPath = () =>
	useAxios.post('/mail/main/get_backup_path', {
		customType: 'model',
		check: 'object',
	})

/**
 * @description 获取备份邮件列表
 */
export const getBackupList = (data: { path: string }) =>
	useAxios.post('/mail/main/get_backup_file_list', {
		data,
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 获取备份邮件列表111
 */
export const restoreBackup = (data: { file_path: string }) =>
	useAxios.post('/mail/main/restore', {
		data,
		loading: '正在恢复备份邮件，请稍候...',
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 获取服务状态_请求
 */
export const getServiceStatus = () =>
	useAxios.post('/mail/main/get_service_status', {
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 设置服务状态111
 */
export const setServiceStatus = (data: { service: string; type: string }) =>
	useAxios.post('/mail/main/service_admin', {
		data,
		loading: '正在设置服务，请稍候...',
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 修复服务111
 */
export const repairService = (data: { service: string; type: string }) =>
	useAxios.post('/mail/main/repair_service_conf', {
		data,
		loading: '正在修复服务，请稍候...',
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 获取服务配置文件_请求
 */
export const getServiceConfig = (data: { service: string }) =>
	useAxios.post('/mail/main/get_config', {
		data,
		check: 'object',
		customType: 'model',
	})

/**
 * @description 保存服务配置文件_请求111
 */
export const saveServiceConfig = (data: { service: string; data: string }) =>
	useAxios.post('/mail/main/save_config', {
		data,
		loading: '正在保存服务配置文件，请稍候...',
		customType: 'model',
	})

/**
 * @description 获取获取监控任务状态333
 */
export const getServiceMonitor = () =>
	useAxios.post('/mail/main/get_service_monitor_status', {
		customType: 'model',
	})

/**
 * @description 打开服务状态监测任务111
 */
export const openServiceMonitor = () =>
	useAxios.post('/mail/main/open_service_monitor_task', {
		loading: '正在保存监控任务状态，请稍候...',
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 关闭服务状态监控任务111
 */
export const closeServiceMonitor = () =>
	useAxios.post('/mail/main/close_service_monitor_task', {
		loading: '正在关闭监控任务状态，请稍候...',
		customType: 'model',
	})

/**
 * @description 获取邮件保留天数
 */
export const getSaveDays = () =>
	useAxios.post('/mail/main/get_save_day', {
		customType: 'model',
		check: 'object',
	})

/**
 * @description 设置邮件保留天数111
 */
export const setSaveDay = (data: { save_day: number }) =>
	useAxios.post('/mail/main/set_save_day', {
		data,
		loading: '正在设置邮件保留时间，请稍候...',
		customType: 'model',
	})

/**
 * @description 检查邮箱环境
 */
export const getMailEnv = () => useAxios.post('/mail/main/check_mail_env')

/**
 * @description 修复邮局环境111
 */
export const repairMailEnv = (key: string, method: string) =>
	useAxios.post(`/mail/main/${method}`, {
		loading: `正在修复 ${key}，请稍候...`,
	})

/**
 * @description 设置邮件保留天数111
 */
export const changeHostname = (data: { hostname: string }) =>
	useAxios.post('/mail/main/change_hostname', {
		data,
		loading: '正在修复主机名，请稍候...',
	})

/**
 * @description 安装邮局服务
 */
export const installMailService = () => useAxios.post('/mail/main/setup_mail_sys')

/**
 * @description 获取初始化日志
 */
export const getInitLog = () => useAxios.post('/mail/main/get_init_log')

/**
 * @description 获取WebMail状态
 */
export const getRoundcubeStatus = () =>
	useAxios.post('/mail/main/get_roundcube_status', {
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 获取domain
 */
export const getDomain = () =>
	useAxios.post('/mail/main/get_domain', {
		check: 'object',
		customType: 'model',
	})

/**
 * @description 卸载WebMail 111
 */
export const uninstallRoundcube = (data: { id: number; site_name: string; force: number }) =>
	useAxios.post('/mail/main/uninstall_roundcube', {
		data,
		loading: '正在卸载，请稍候...',
		customType: 'model',
		check: 'object',
	})

/**
 * @description 安装WebMail 111
 */
export const installRoundcube = (data: { site_name: string; php_version: string }) =>
	useAxios.post('/mail/main/add_roundcube', {
		data,
		loading: '正在安装，请稍候...',
		customType: 'model',
	})

/**
 * @description 安装WebMail 111
 */
export const addRoundcubeConfig = (data: { id: number; site_name: string; path: string }) =>
	useAxios.post('/mail/main/add_roundcube_info', {
		data,
		loading: '正在安装，请稍候...',
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 一键登录WebMail
 */
export const loginRoundcube = (data: { rc_user: string; rc_pass: string }) =>
	useAxios.post('/mail/main/login_roundcube', {
		data,
		loading: '正在登录，请稍候...',
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 收件人黑名单 列表
 */
export const getBlacklist = (data: { keyword: string }) =>
	useAxios.post('/mail/main/recipient_blacklist', {
		data,
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 加入收件人黑名单111
 */
export const addBlacklist = (data: { emails_to_add: string[] }) =>
	useAxios.post('/mail/main/add_recipient_blacklist', {
		data: { emails_to_add: JSON.stringify(data.emails_to_add) },
		loading: '正在添加，请稍候...',
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 删除收件人黑名单111 successMessage: load
 */
export const delBlacklist = (data: { emails_to_remove: string[] }, load = true) =>
	useAxios.post('/mail/main/del_recipient_blacklist', {
		data: { emails_to_remove: JSON.stringify(data.emails_to_remove) },
		loading: load ? '正在删除，请稍候...' : undefined,
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 导出 收件人黑名单
 */
export const exportBlacklist = (data = {}) =>
	useAxios.post('/mail/main/export_recipient_blacklist', {
		data,
		loading: '正在导出，请稍候...',
		customType: 'model',
	})

/**
 * @description 加入收件人黑名单111
 */
export const importBlacklist = (data: { file: string }) =>
	useAxios.post('/mail/main/import_recipient_blacklist', {
		data,
		loading: '正在导入，请稍候...',
		customType: 'model',
	})

/**
 * @description 删除文件
 */
export const deleteFile = (data: { path: string }) =>
	useAxios.post('/files?action=DeleteFile', {
		data,
		loading: '正在删除文件，请稍候...',
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 获取扩展包信息
 */
export const getProductInfo = () =>
	useAxios.post('/mail/manage/get_product_info', {
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 创建订单
 */
export const getCreateOrder = (data: AnyObject) =>
	useAxios.post('/mail/manage/create_order', {
		data,
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 创建订单
 */
export const productCreditBuy = (data: AnyObject) =>
	useAxios.post('/mail/manage/product_credit_buy', {
		data,
		customType: 'model',
		check: 'object',
	})

/**
 * @description 监听支付
 */
export const getPaymentStatus = (data: AnyObject) =>
	useAxios.post('/mail/manage/pay_status', {
		data,
		customType: 'model',
		check: 'ignore',
	})

/**
 * @description 获取概览今日数据
 */
export const userSurplus = (data: AnyObject) =>
	useAxios.post('/mail/manage/user_surplus', {
		data,
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 安装邮局服务
 */
export const installService = () =>
	useAxios.post('/mail/manage/install_service', {
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 营销邮件数据总览
 */
export const getOverviewInfo = (data: { domain?: string; start_time: number; end_time: number }) =>
	useAxios.post('/mail/main/overview_api?action=overview', {
		data,
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 获取今日数据
 */
export const getErrorDetails = () =>
	useAxios.post('/mail/main/get_data_info', {
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 编辑批量发送任务_请求
 */
export const editSendTask = (data: { id: number }) =>
	useAxios.post('/mail/bulk/update_task', {
		data,
		loading: '正在编辑任务，请稍候...',
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 发送测试邮件
 */
export const sendTestMail = (data: { mail_from: string; mail_to: string; subject: string; temp_id: number }) =>
	useAxios.post('/mail/main/send_mail_test', {
		data,
		loading: '正在发送测试邮件，请稍候...',
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 获取订阅趋势数据
 */
export const getContactsEcharts = (data: { active: number }) =>
	useAxios.post('/mail/main/get_contacts_list', {
		data,
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 获取邮件类型列表
 */
export const getMailTypeList = (data: any) =>
	useAxios.post('/mail/main/get_mail_type_list', {
		data,
		customType: 'model',
		check: 'object',
	})

/**
 * @description 删除批量发送邮箱列表
 */
export const delMassMailList = (data: { ids: number[] }) =>
	useAxios.post('/mail/main/del_mail_type_list', {
		data,
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 获取批量发送邮箱列表
 */
export const getMassMailList = (data: { search: string }) =>
	useAxios.post('/mail/main/get_mail_type_info_list', {
		data,
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 添加邮件类型
 */
export const addMailType = (data: { mail_type: string }) =>
	useAxios.post('/mail/main/add_mail_type', {
		data,
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 编辑邮件类型
 */
export const editMailType = (data: { id: number; mail_type: string }) =>
	useAxios.post('/mail/main/edit_mail_type', {
		data,
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 清空异常邮箱类型数据
 */
export const delAbnormalMailAll = (data: { status: string }) =>
	useAxios.post('/mail/main/clear_abnormal_recipient', {
		data,
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 删除异常邮箱列表
 */
export const delAbnormalMailList = (data: { ids: number }) =>
	useAxios.post('/mail/main/del_abnormal_recipient', {
		data,
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 获取异常邮箱列表
 */
export const getMassAbnormal = (data: { search: string }) =>
	useAxios.post('/mail/main/get_abnormal_recipient', {
		data,
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 获取异常邮箱类型
 */
export const getMassAbnormalType = () =>
	useAxios.post('/mail/main/get_abnormal_status', {
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 获取退订列表
 */
export const getUnsubscribeList = (data: { search: string; etype?: number; active: number }) =>
	useAxios.post('/mail/main/get_unsubscribe_list', {
		data,
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 删除退订
 */
export const delUnsubscribe = (data: { ids: number; active: number }) =>
	useAxios.post('/mail/main/del_unsubscribe_list', {
		data,
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 切换退订状态
 */
export const editSubscribeState = (data: { recipient: string; active: number }) =>
	useAxios.post('/mail/main/update_subscription_state', {
		data,
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 导入联系人
 */
export const importContacts = (data: { file: string; mail_type: string }) =>
	useAxios.post('/mail/bulk/import_contacts', {
		data,
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 导入联系人
 */
export const importContactsEtypes = (data: { file: string; etypes: string; active: number }) =>
	useAxios.post('/mail/bulk/import_contacts_etypes', {
		data,
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 删除邮件类型
 */
export const delMailType = (data: { ids: string }) =>
	useAxios.post('/mail/main/del_mail_type_list', {
		data,
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 设置邮件类型分类
 */
export const setContactChange = (data: { etypes: string; recipients: string; active: number }) =>
	useAxios.post('/mail/main/edit_type_unsubscribe_list', {
		data,
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 设置邮件类型分类
 */
export const setUnsubscribeType = (data: { etypes: string; recipients: string; active: number }) =>
	useAxios.post('/mail/main/edit_type_unsubscribe_list', {
		data,
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 添加邮件模板
 */
export const addMailTemplate = (data: { temp_name?: string; type: number; render?: string; content?: string; upload_path?: string }) =>
	useAxios.post('/mail/bulk/add_email_temp', {
		data,
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 删除邮件模板
 */
export const delMailTemplate = (data: { id: number | number[] }) =>
	useAxios.post('/mail/bulk/del_email_temp', {
		data,
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 获取邮件模板
 */
export const getMailTemplateList = (data: { p: number; size: number }) =>
	useAxios.post('/mail/bulk/get_email_temp_list', {
		data,
		customType: 'model',
		check: 'object',
	})

/**
 * @description 编辑邮件模板
 */
export const editMailTemplate = (data: { id: number; type: number; temp_name: string; render?: string; content?: string; upload_path?: string }, load = true) =>
	useAxios.post('/mail/bulk/edit_email_temp', {
		data,
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 获取邮件模板内容
 */
export const getMailTemplateContent = (data: { id: number }) =>
	useAxios.post('/mail/main/get_task_email_content', {
		data,
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 获取联系人数量
 */
export const getContactNumber = (data: { etypes: string }) =>
	useAxios.post('/mail/main/get_contact_number', {
		data,
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 获取邮件模板
 */
export const getMailTemplateSelect = () =>
	useAxios.post('/mail/bulk/get_email_temp', {
		customType: 'model',
		check: 'object',
	})

/**
 * @description 删除退订用的域名端口
 */
export const delUnsubscribeInfo = (data = {}) =>
	useAxios.post('/mail/main/del_unsubscribe_info', {
		data,
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 获取退订用的域名端口
 */
export const getUnsubscribeInfo = () =>
	useAxios.post('/mail/main/get_unsubscribe_info', {
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 设置退订用的域名端口
 */
export const setUnsubscribeInfo = (data: { url: string }) =>
	useAxios.post('/mail/main/set_unsubscribe_info', {
		data,
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 获取任务退订列表
 */
export const getTaskUnsubscribe = (data: { task_id: number }) =>
	useAxios.post('/mail/main/get_task_unsubscribe_list', {
		data,
		customType: 'model',
		check: 'object',
	})

/**
 * @description 获取邮局提示弹出框
 */
export const getBlacklistTips = () =>
	useAxios.post('/mail/main/get_blacklist_tips', {
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 处理邮局提示弹出框
 */
export const setBlacklistTips = (data: { operation: number }) =>
	useAxios.post('/mail/main/Blacklist_tips', {
		data,
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 检测域名是否在黑名单内
 */
export const checkBlacklists = (data: { a_record: string }) =>
	useAxios.post('/mail/bulk/check_blacklists', {
		data,
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 获取邮局域名扫描日志
 */
export const getMailScanLog = (data: { path: string }) =>
	useAxios.post('/mail/main/read_blacklist_scan_log', {
		data,
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 邮局域名一键解析
 */
export const autoCreateDNSRecord = (data: { domain: string; a_record: string }) =>
	useAxios.post('/mail/main/auto_create_dns_record', {
		data,
		customType: 'model',
	})

/**
 * @description 判断邮局是否安装
 */
export const isInstallMail = () =>
	useAxios.post('/mail/manage/install_status', {
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 证书夹部署证书
 */
export const folderDeployCert = (data: { ssl_hash: string; domain: string }) =>
	useAxios.post('/mail/main/set_cert_from_local', {
		data,
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 获取自动申请证书任务状态
 */
export const getAutoSSLTaskStatus = () =>
	useAxios.post('/mail/main/get_auto_ssl_task_status', {
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 开启自动申请证书任务
 */
export const openAutoSSLTask = () =>
	useAxios.post('/mail/main/open_auto_ssl_task', {
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 关闭自动申请证书任务
 */
export const closeAutoSSLTask = () =>
	useAxios.post('/mail/main/close_auto_ssl_task', {
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 邮局环境初始化
 */
export const initEnvironment = () =>
	useAxios.post('/mail/main/setup_mail_sys', {
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 获取邮局IP列表
 */
export const getIpList = () =>
	useAxios.post('/mail/multipleip/get_ip_tags_api', {
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 获取当前可绑定域名
 */
export const getBindDomainList = (data?: { tag: string }) =>
	useAxios.post('/mail/multipleip/tag_get_domain_list', {
		customType: 'model',
		check: 'array',
		data,
	})

/**
 * @description 获取ip地址列表
 */
export const getIpAddressList = (data?: { refresh: number }) =>
	useAxios.post('/mail/multipleip/get_net_interface', {
		customType: 'model',
		check: 'msg',
		data,
	})

/**
 * @description 添加IP标签
 */
export const addIpTagApi = (data: { tag: string; ip: string; syslog: string; helo: string; ipv: number; binds: string }) =>
	useAxios.post('/mail/multipleip/add_ip_tag_api', {
		customType: 'model',
		check: 'msg',
		data,
	})

/**
 * @description 删除IP标签
 */
export const delIpTagApi = (data: { tags: string }) =>
	useAxios.post('/mail/multipleip/del_ip_tag_api', {
		customType: 'model',
		check: 'msg',
		data,
	})

/**
 * @description 编辑IP标签
 */
export const editIpTagApi = (data: { tag: string; ip: string; syslog: string; helo: string; ipv: number; binds: string }) =>
	useAxios.post('/mail/multipleip/edit_ip_tag_api', {
		customType: 'model',
		check: 'msg',
		data,
	})

/**
 * @description 设置IP轮换
 */
export const setIpRotateApi = (data: { bind: string; tags: string; cycle: number; status: number }) =>
	useAxios.post('/mail/multipleip/set_ip_rotate', {
		customType: 'model',
		check: 'msg',
		data,
	})

/**
 * @description 获取转发列表
 */
export const getForwardList = (data: { dtype: number }) =>
	useAxios.post('/mail/foward/get_mail_forward', {
		customType: 'model',
		check: 'msg',
		data,
	})

/**
 * @description 获取邮箱列表
 */
export const getMailboxListByName = (data: { domain: string }) =>
	useAxios.post('/mail/main/get_mailbox', {
		data,
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 获取邮箱列表
 */
export const addForward = (data: any) =>
	useAxios.post('/mail/foward/add_forward', {
		data,
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 编辑转发规则
 */
export const editForward = (data: any) =>
	useAxios.post('/mail/foward/edit_forward', {
		data,
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 删除转发规则
 */
export const deleteForward = (data: any) =>
	useAxios.post('/mail/foward/del_forward', {
		data,
		customType: 'model',
		check: 'msg',
	})

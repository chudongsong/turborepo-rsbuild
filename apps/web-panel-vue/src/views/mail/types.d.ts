import type { ComposeOption } from 'echarts/core'
// ...软件tab类型
export type MailTabsTypeProps = 'overview' | 'domain' | 'mailbox' | 'mass' | 'blacklist' | 'bcc' | 'forward' | 'inbox' | 'spam' | 'outbox' | 'send' | 'backup' | 'setting'

// 邮局sotre状态
export interface MailStoreStateProps {
	install: boolean
	update: boolean
	checkEnv: boolean
	version: string
	lastVersion: string
}

export type ECOption = ComposeOption<LineSeriesOption | TooltipComponentOption | GridComponentOption | DataZoomComponentOption | GraphicComponentOption>

// 邮局域名
export type MailDomain = {
	domain: string
	a_record: string
	created: string
	active: number
	mx_status: number
	spf_status: number
	dkim_status: number
	dmarc_status: number
	a_status: number
	ptr_status: number
	dkim_value: string
	dmarc_value: string
	mx_record: string
	ssl_status: boolean
	catch_all: boolean
	mailboxes: number
	quota: number
	mailbox_quota: number
	email: string
	ssl_info: DomainSslInfo
	dns_id: number
	auto_create_record: number
	ip_tag: string[]
	catch_type: string
}

// 邮局证书列表
export type DomainSslInfo = {
	issuer: string
	notAfter: string
	notBefore: string
	dns: string[]
	subject: string
	src: string
	key: string
	endtime: number
}

// 邮局bcc
export type MailBcc = {
	type: string
	domain: string
	user: string
	forward_user: string
	active: number
}

// 邮局黑名单
export type MailForward = {
	address: string
	goto: string
	domain: string
	created: string
	modified: string
	active: number
}

// 邮局用户
export type MailUser = {
	full_name: string
	username: string
	quota: number
	created: string
	modified: string
	active: number
	is_admin: number
}

// 邮局-邮件
export type Email = {
	time: number
	subject: string
	body: string
	html: string
	from: string
	to: string
	path: string
}

// 邮局-邮件日志
export type MailLog = {
	hostname: string
	process: string
	email_id: string
	recipient: string
	relay: string
	delay: string
	delays: string
	dsn: string
	status: string
	domain: string
	err_info: string
	created: number
}

// 邮局-邮件-统计
export type Mailbox = {
	full_name: string
	username: string
	password: string
	quota: number
	created: string
	modified: string
	mx: string
	active: number
	is_admin: number
}

// 邮局-邮件-状态
export type MailStats = {
	delivered: number // 发件成功
	bounced: number // 发件失败
	received: number // 收件成功
	rejected: number // 收件失败
}

// 邮局-邮件-每小时
export type MailHourly = {
	time: number
	delivered: number // 发件成功
	bounced: number // 发件失败
	received: number // 收件成功
	rejected: number // 收件失败
}

// 邮局-邮件-任务
export type MailTask = {
	id: number
	task_name: string
	addresser: string
	recipient_count: number
	task_process: number
	pause: number
	temp_id: number
	is_record: number
	created: number
	modified: number
	active: number
	count: {
		error_count: number
	}
	email_info: {
		id: number
		addresser: string
		recipient: string
		subtype: string
		subject: string
		content: string
		is_temp: number
	}
	error_log: string
}

// 邮局-邮件-任务-失败
export type MailTaskFail = {
	domain: string
	status: string
	count: number
}

// 邮局-邮件-任务-失败-详情
export type MailTaskFailDetails = {
	id: number
	task_id: number
	recipient: string
	delay: string
	delays: string
	dsn: string
	relay: string
	domain: string
	status: string
	err_info: string
	tooltip: boolean
}

// 邮局-邮件-发送限制
export type MailSendLimit = {
	domain: string
	count: number
	etc: number
}

// 邮局-邮件-备份
export type MailBackup = {
	name: string
	mtime: number
}

// 邮局-邮件-备份-参数
export type MailBackupParams = {
	id: number
	name: string
	type: string
	where1: string
	where_hour: number
	where_minute: number
	echo: string
	addtime: string
	status: number
	save: number
	backupTo: string
	sName: string
	sBody: string
	sType: string
	save_local: number
	notice: number
	notice_channel: string
}

// 邮局-服务
export type MailService = {
	change_rspamd: boolean
	postfix: boolean
	dovecot: boolean
	rspamd: boolean
	opendkim: boolean
}

// 邮局-服务-表格
export type MailServiceTable = {
	key: string
	name: string
	status: boolean
}

// 邮局-服务-状态
export type MailEnv = {
	env: string
	details: string
	status: boolean
}

// webmail状态
export type WebMailStatus = {
	status: boolean
	id: number
	site_name: string
	php_version: string
	ssl_status: boolean
}

export interface forwardAddProps {
	row?: MailForward
	isEdit: boolean
	onRefresh: () => void
}

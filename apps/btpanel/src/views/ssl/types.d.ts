// ssl store模块
export interface SslStoreProps {
	tabActive: string // 当前tab
	domainParams: DomainTableProps // 域名管理参数
	isRefreshDomainList: boolean // 刷新域名列表
	isRefreshDomainOrCertType: boolean // 刷新域名或证书类型
	certificateParams: CertificateTableProps // 证书管理参数
	isRefreshCertificateList: boolean // 刷新证书列表
	isDomainLoading: boolean // 域名管理loading
	domainTableTotal: number // 域名管理总条数
	typeList: DomainOrCertificateType[] // 分类列表
	certificateTableTotal: number // 证书管理总条数
	isCertificateLoading: boolean // 证书管理Loading
	isRefreshDomainConfigList: boolean // 刷新域名配置列表
	expiringCertificateCount: number // 即将到期的证书数量
}

// 域名管理选项
export interface DomainTableProps {
	p: number // 页码
	type?: string // 类型
	search?: string // 查询参数
	limit: number // 每页显示条数
	type_id?: string // 分类id
}

export interface CertificateTableProps extends DomainTableProps {
	status_id?: any
}

export interface DomainOrCertificateType {
	id: string
	name: string
}

// ssl历史选项
export interface SslHistoryItemProps {
	time: number // 时间
	val: string // 值
}

// ...ssl tab类型
export type SslTabsTypeProps = 'certificate' | 'business' | 'domain' | string

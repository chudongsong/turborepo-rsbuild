const DNS_RESOLVE_STORE = defineStore('DNS-RESOLVE-STORE', () => {
	// 表格状态
	const isSubDomainLoading = ref(false)
	const subDomainTableList = ref<any[]>([])
	const tableList = ref<any[]>([])
	const expandRowKeys = ref<any[]>([])
	
	// 编辑状态
	const isUpdate = ref(false)
	const isAdd = ref(false)
	const isDisabledAdd = ref(true)
	const currentHint = ref('name')

	const isRefreshDomainList = ref(false)
	
	
	// 记录类型选项
	const typeOptions = ref([
		{ title: 'A', key: 'A' },
		{ title: 'AAAA', key: 'AAAA' },
		{ title: 'CNAME', key: 'CNAME' },
		{ title: 'MX', key: 'MX' },
		{ title: 'TXT', key: 'TXT' },
		{ title: 'CAA', key: 'CAA' },
		{ title: 'NS', key: 'NS' },
		{ title: 'SRV', key: 'SRV' },
	])

	// 线路类型选项
	const lineTypeOptions = ref([
		{ label: '默认', value: 0, description: '默认线路' },
		{ label: '电信', value: 285344768, description: '电信线路' },
		{ label: '联通', value: 285345792, description: '联通线路' },
		{ label: '移动', value: 285346816, description: '移动线路' },
	])
	
	// 请求参数
	const requestData = reactive({
		domain_id: 0,
		searchKey: 'record',
		searchValue: '',
		domain_type: 1,
		p: 1,
		limit: 10,
		total: 0,
	})
	
	// 安全验证token
	const securityToken = ref('')
	
	// 记录值示例配置
	const recordValueExamples = ref({
		A: [
			{ key: '8.8.8.8', label: '8.8.8.8', value: '8.8.8.8', description: '公网IPv4地址（Google DNS）', clickable: true },
			{ key: '1.1.1.1', label: '1.1.1.1', value: '1.1.1.1', description: '公网IPv4地址（Cloudflare DNS）', clickable: true },
			{ key: '192.168.1.1', label: '192.168.1.1', value: '192.168.1.1', description: '私有网络地址', clickable: true }
		],
		AAAA: [
			{ key: '2001:4860:4860::8888', label: '2001:4860:4860::8888', value: '2001:4860:4860::8888', description: 'IPv6地址（Google DNS）', clickable: true },
			{ key: '2606:4700:4700::1111', label: '2606:4700:4700::1111', value: '2606:4700:4700::1111', description: 'IPv6地址（Cloudflare DNS）', clickable: true }
		],
		CNAME: [
			{ key: 'www.example.com', label: 'www.example.com', value: 'www.example.com', description: '指向另一个域名的CNAME记录', clickable: true },
			{ key: 'cdn.example.com', label: 'cdn.example.com', value: 'cdn.example.com', description: 'CDN域名CNAME记录', clickable: true }
		],
		MX: [
			{ key: '10 mail.example.com', label: '10 mail.example.com', value: '10 mail.example.com', description: '邮件服务器记录（优先级10）', clickable: true },
			{ key: '20 mail2.example.com', label: '20 mail2.example.com', value: '20 mail2.example.com', description: '备用邮件服务器记录（优先级20）', clickable: true }
		],
		TXT: [
			{ key: 'v=spf1 include:_spf.google.com ~all', label: 'v=spf1 include:_spf.google.com ~all', value: 'v=spf1 include:_spf.google.com ~all', description: 'SPF记录，防止邮件伪造', clickable: true },
			{ key: 'google-site-verification=abc123', label: 'google-site-verification=abc123', value: 'google-site-verification=abc123', description: 'Google网站验证记录', clickable: true }
		],
		CAA: [
			{ key: '0 issue www.51dns.com', label: '0 issue www.51dns.com', value: '0 issue www.51dns.com', description: 'CAA记录示例：flag=0, tag=issue, value=www.51dns.com', clickable: true },
			{ key: '0 issuewild www.51dns.com', label: '0 issuewild www.51dns.com', value: '0 issuewild www.51dns.com', description: 'CAA记录示例：flag=0, tag=issuewild, value=www.51dns.com', clickable: true },
			{ key: '0 iodef mailto:admin@example.com', label: '0 iodef mailto:admin@example.com', value: '0 iodef mailto:admin@example.com', description: 'CAA记录示例：flag=0, tag=iodef, value=mailto:admin@example.com', clickable: true }
		],
		NS: [
			{ key: 'ns1.example.com', label: 'ns1.example.com', value: 'ns1.example.com', description: '主域名服务器', clickable: true },
			{ key: 'ns2.example.com', label: 'ns2.example.com', value: 'ns2.example.com', description: '备用域名服务器', clickable: true },
			{ key: 'dns1.aliyun.com', label: 'dns1.aliyun.com', value: 'dns1.aliyun.com', description: '阿里云DNS服务器', clickable: true }
		],
		SRV: [
			{ key: '0 5 5060 sipserver.example.com', label: '0 5 5060 sipserver.example.com', value: '0 5 5060 sipserver.example.com', description: 'SIP服务记录（优先级0，权重5，端口5060）', clickable: true },
			{ key: '10 5 389 ldapserver.example.com', label: '10 5 389 ldapserver.example.com', value: '10 5 389 ldapserver.example.com', description: 'LDAP服务记录（优先级10，权重5，端口389）', clickable: true },
			{ key: '0 5 443 httpserver.example.com', label: '0 5 443 httpserver.example.com', value: '0 5 443 httpserver.example.com', description: 'HTTPS服务记录（优先级0，权重5，端口443）', clickable: true }
		]
	})

	// 记录值说明配置
	const recordValueDescriptions = ref({
		A: {
			title: 'A记录说明',
			description: '将域名指向IPv4地址，填写服务器的IPv4地址（如：8.8.8.8）'
		},
		AAAA: {
			title: 'AAAA记录说明',
			description: '将域名指向IPv6地址，填写服务器的IPv6地址（如：2001:4860:4860::8888）'
		},
		CNAME: {
			title: 'CNAME记录说明',
			description: '将域名指向另一个域名，填写目标域名（如：www.example.com）'
		},
		MX: {
			title: 'MX记录说明',
			description: '邮件服务器记录，格式为：优先级 邮件服务器域名（如：10 mail.example.com）'
		},
		TXT: {
			title: 'TXT记录说明',
			description: '文本记录，常用于SPF、DKIM、DMARC等邮件验证，或网站验证'
		},
		CAA: {
			title: 'CAA记录格式说明',
			description: '格式为：flag tag value。其中flag目前取值为0-128；tag取值为issue、issuewild、iodef；value为不包含|、""、、<>、中文字符的字符串。'
		},
		NS: {
			title: 'NS记录说明',
			description: '指定域名的权威DNS服务器，填写DNS服务器域名（如：ns1.example.com）'
		},
		SRV: {
			title: 'SRV记录说明',
			description: '服务记录，格式为：优先级 权重 端口 目标主机（如：0 5 5060 sipserver.example.com）'
		}
	})

	// 字段描述配置
	const fieldDescriptions = ref({
		name: {
			title: '主机记录说明',
			description: '指定DNS解析的子域名前缀，温馨提示，如果要解析www.bt.com，主机记录填写www即可：'
		},
		type: {
			title: '记录类型说明',
			description: 'DNS记录的类型决定了如何解析域名：'
		},
		priority: {
			title: 'MX优先级说明',
			description: '数值越小优先级越高；相同优先级将进行负载均衡'
		},
		ttl: {
			title: 'TTL说明',
			description: '生存时间（秒），表示DNS记录在缓存中的保留时长'
		},
		remark: {
			title: '备注',
			description: '为DNS记录添加备注信息，便于管理和识别'
		}
	})

	// 主机记录示例
	const hostRecordExamples = ref([
		{ key: 'www', label: 'www', value: 'www', description: '解析后的域名为www.example.com', clickable: true },
		{ key: '@', label: '@', value: '@', description: '直接解析主域名example.com', clickable: true },
		{ key: '*', label: '*', value: '*', description: '泛解析，匹配其他所有域名*.example.com', clickable: true },
		{ key: 'mail', label: 'mail', value: 'mail', description: '将域名解析为mail.example.com，通常用于解析邮箱服务器', clickable: true }
	])

	
	return {
		// 状态
		isSubDomainLoading,
		subDomainTableList,
		tableList,
		expandRowKeys,
		isUpdate,
		isAdd,
		isDisabledAdd,
		currentHint,
		requestData,
		securityToken,
		isRefreshDomainList,
		typeOptions,
		lineTypeOptions,
		// 新增配置
		recordValueExamples,
		recordValueDescriptions,
		hostRecordExamples,
		fieldDescriptions,
	}
})

/**
 * @description DNS解析全局数据
 * @returns {Ref<Record<string, any>>}
 */
const useDnsResolveStore = () => {
	return storeToRefs(DNS_RESOLVE_STORE())
}

export { useDnsResolveStore, DNS_RESOLVE_STORE }

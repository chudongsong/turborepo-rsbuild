import {
	applyCertApi,
	applyProxyCertArrange,
	authDomainApi,
	delLetsEncrypt,
	downloadCertToLocal,
	getComposerLine,
	getDnsData,
	getDockerLetsEncryptSite,
	getLetsEncryptList,
	getLetsEncryptSite,
	getOrderDetail,
	renewalCert,
	setCertToSite,
	setDockerCertToSite,
	setDomainDNS,
	validateDomain,
} from '@/api/site'
import BtTable from '@/components/data/bt-table'
import { TableColumnProps } from '@/components/data/bt-table/types'
import BtTableGroup from '@/components/extension/bt-table-group'
import BtHelp from '@/components/form/bt-help'
import { closeAllDialog, Message, useConfirm, useDataHandle, useDialog } from '@/hooks/tools'
import { copyText, isArray } from '@/utils'
import { LetsTableProps } from '@/views/site/types'
import { SITE_STORE, useSiteStore } from '@/views/site/useStore'
import { ElButton } from 'element-plus'
import { applyLetResult, applyLetsEncryptDialog, dnsApiVerifyDialog, getSslDnsApiInfo, letsEncryptProgress, showErrorSslDetail, useDeployResult } from '../useController'
import { SITE_SSL_STORE, useSiteSSLStore } from '../useStore'
import { router } from '@/router'

const { siteInfo, siteType } = useSiteStore()

const { isRefreshLetSSL, sslDnsApiInfo, otherPopup } = useSiteSSLStore()
const { jumpSslTabEvent } = SITE_SSL_STORE()

export const verifyDialog = ref<boolean>(false) // 验证弹窗
export const rowData = reactive({} as LetsTableProps) // 表格行数据
export const verifyTableData = ref<any>([]) // 验证表格数据
export const newTableData = ref<any>([])
export const isError = ref<boolean>(false)
export const errorMsg = ref<string>('')
export const isRenew = ref<boolean>(false)

export const renderExpire = (row: any) => {
	const getColor = (endDay: number) => {
		if (endDay <= 0) return 'text-danger'
		if (endDay <= 7) return 'text-danger'
		if (endDay <= 15) return 'text-orange'
		return 'text-primary'
	}

	const hasDomains = row.domains?.length > 0
	const color = hasDomains ? getColor(row.endDay) : 'text-default'
	const displayText = hasDomains ? (row.endDay > 0 ? `剩余${row.endDay}天` : '已过期') : '--'

	return <span class={color}>{displayText}</span>
}

export const renderStatus = (row: any) => {
	let html: any = ''
	switch (row.status) {
		case 'pending':
			if (row.expires < new Date().getTime() / 1000) {
				html = <span>--</span>
				return html
			}
			html = <span class="text-[#e6a23c]">待验证</span>
			break
		default:
			html = <span class="text-primary">订单完成</span>
	}
	return html
}

export const helpList = [
	{ content: () => <span class="text-danger">注意：请勿将SSL证书用于非法网站</span> },
	{
		content: () => (
			<span>
				Let's Encrypt 证书申请和续签限制
				<a class="bt-link" href="https://letsencrypt.org/zh-cn/docs/rate-limits/" target="_blank">
					点击查看
				</a>
			</span>
		),
	},
	{
		content: () => (
			<>
				Let's Encrypt因更换根证书，部分老旧设备访问时可能提示不可信，考虑购买{' '}
				<span class="bt-link" onClick={() => jumpSslTabEvent('busSslList')}>
					[商业证书]
				</span>
			</>
		),
	},
	{
		content: '申请之前，请确保域名已解析，如未解析会导致审核失败',
	},
	{
		content: "Let's Encrypt免费证书，有效期3个月，支持多域名。默认会自动续签",
	},
	{
		content: '若您的站点使用了CDN或301重定向会导致续签失败',
	},
	{
		content: '在未指定SSL默认站点时未开启SSL的站点使用HTTPS会直接访问到已开启SSL的站点',
	},
	{
		content: '如开启后无法使用HTTPS访问，请检查安全组是否正确放行443端口',
	},
]

export const verifyTableColumns = ref<TableColumnProps[]>([
	{ label: '解析域名', prop: 'domain' },
	{
		label: '记录值',
		showOverflowTooltip: true,
		prop: 'auth_value',
		render(row: any, index: number) {
			const str = rowData.auth_type === 'dns' ? row.auth_value : row.file_path
			return (
				<div class="flex items-center">
					<div class="truncate w-[15rem]">{str}</div>
					<span class="svgtofont-icon-copy ml-[4px] text-secondary text-medium w-[1.6rem] cursor-pointer" onClick={() => copyText({ value: str })}></span>
				</div>
			)
		},
	},
	{
		label: '类型',
		prop: 'type',
		render: (row: any, index: number) => {
			if (rowData.auth_type === 'dns') {
				return <span>{row.type}</span>
			}
			return (
				<div class="flex items-center">
					<div class="truncate w-[15rem]">{row.content}</div>
					<span class="svgtofont-icon-copy ml-[4px] text-secondary text-medium w-[1.6rem] cursor-pointer" onClick={() => copyText({ value: row.content })}></span>
				</div>
			)
		},
	},
	{ label: '必需', prop: 'must', width: 100 },
])

export const isLoading = ref(false)

/**
 * @description 获取Let's Encrypt证书列表
 */
export const getLetsDataList = async () => {
	try {
		const res: any = await useDataHandle({
			loading: isLoading,
			request: getLetsEncryptList({ siteName: siteInfo.value.name }),
			data: Array,
		})

		return { data: res, total: res.length, other: {} }
	} catch (error) {
		console.log(error)
		return { data: [], total: 0, other: {} }
	}
}

/**
 * @description 下载证书
 */
export const downloadCertEvent = async ({ index }: LetsTableProps) => {
	try {
		const data: AnyObject = await useDataHandle({
			loading: '正在获取证书信息，请稍后...',
			request: downloadCertToLocal({ index }),
			message: false,
			data: { status: Boolean, msg: String },
		})
		if (data.status) window.open(data.msg)
		else Message.request(data)
		return { status: data.status, msg: data.msg }
	} catch (error) {
		console.log(error)
		return { status: false, msg: '下载失败' }
	}
}

/**
 * @description 部署证书
 */
export const deployCertEvent = async ({ index }: LetsTableProps, isAutoDeploy: boolean = false, siteName: string = siteInfo.value.name) => {
	try {
		const params = { index, siteName }
		const res: AnyObject = await useDataHandle({
			loading: '正在部署证书，请稍候...',
			request: siteType.value === 'docker' ? setDockerCertToSite(params) : setCertToSite(params),
			message: false,
			data: { status: Boolean, msg: String },
		})
		// 处理结果
		useDeployResult(res, isAutoDeploy)
		if (res.status) jumpSslTabEvent('currentCertInfo')
		return { status: res.status, msg: res.msg }
	} catch (error) {
		console.log(error)
		return { status: false, msg: '部署失败' }
	}
}

/**
 * @description 删除证书
 * @param index 证书index
 */
export const delLetsEvent = async ({ index }: LetsTableProps) => {
	try {
		await useConfirm({
			title: '删除证书订单',
			content: '确定删除证书订单吗？',
		})
		const res: AnyObject = await useDataHandle({
			loading: '正在删除证书，请稍候...',
			request: delLetsEncrypt({ index }),
			message: true,
		})
		// if (res.status) getLetsDataList() // 刷新列表
		isRefreshLetSSL.value = true
		return { status: res.status, msg: res.msg }
	} catch (error) {
		console.log(error)
		return { status: false, msg: '删除失败' }
	}
}

/**
 * @description 验证域名
 */
export const verifyDomainEvent = async (row: LetsTableProps) => {
	const { data }: AnyObject = await useDataHandle({
		loading: '正在验证证书申请状态，请稍后...',
		request: getOrderDetail({ index: row.index }),
		message: false,
	})
	if (data.hasOwnProperty('status') && data.hasOwnProperty('msg')) Message.request(data)
	else {
		newTableData.value = data.auths
		if (data.hasOwnProperty('error')) {
			isError.value = data.error
			errorMsg.value = data.error_msg
		} else {
			isError.value = false
			errorMsg.value = ''
		}

		Object.assign(rowData, row)

		verifyTableData.value = []
		data.auths?.forEach((item: any) => {
			verifyTableData.value.push(item.data)
		})

		const isDns = row.auth_type === 'dns'
		verifyTableColumns.value[1].label = isDns ? '记录值' : '文件路径'
		verifyTableColumns.value[1].prop = isDns ? 'auth_value' : 'file_path'
		verifyTableColumns.value[2].label = isDns ? '类型' : '文件内容'
		verifyTableColumns.value[2].prop = isDns ? 'type' : 'content'
		tableHelpList.value[1].content = `可通过CMD命令来手动验证域名解析是否生效: nslookup -q=txt _acme-challenge.${verifyTableData.value[0]?.domain?.replace('*.', '')}`
		useDialog({
			title: `手动${rowData.auth_type === 'dns' ? '解析TXT记录' : '创建验证文件'}`,
			area: 70,
			component: () => (
				<div class="p-[1.5rem]">
					请按以下列表做TXT解析:
					<span class="ml-[.4rem] text-danger">{{ errorMsg }}</span>
					<BtTableGroup>
						{{
							content: () => (
								<div class="max-h-[38rem] overflow-auto">
									{newTableData.value.map(
										(item: any, index: number) =>
											item.data.length > 0 && (
												<div key={index}>
													<span>验证域名：{item.domain}</span>
													<BtTable class="my-[1rem]" column={verifyTableColumns.value} data={item.data}></BtTable>
													{isError.value && (
														<div class="flex justify-end">
															<ElButton type="default" onClick={() => verifySeparatelyEvent(item)}>
																验证
															</ElButton>
														</div>
													)}
												</div>
											)
									)}
								</div>
							),
							['footer-right']: () =>
								!isError.value && (
									<ElButton type="default" onClick={handleVerifyEvent}>
										验证
									</ElButton>
								),
						}}
					</BtTableGroup>
					<BtHelp options={tableHelpList.value} listStyle="disc" class="ml-[20px]" />
				</div>
			),
		})

		isRefreshLetSSL.value = true
	}
}

/**
 * @description 验证单个域名
 * @param {string} item.domain 域名
 */
export const verifySeparatelyEvent = async (item: AnyObject) => {
	const progress: any = await letsEncryptProgress()
	const { data } = await authDomainApi({
		index: rowData.index,
		domain: item.domain,
	})
	progress._props.onCancel()
	if (data.status === 'valid') {
		Message.success('验证成功')
	} else if (data.status === true) {
		verifyDialog.value = false //关闭解析记录弹窗
		deployCertEvent(data, true) // 部署证书
	} else {
		showErrorSslDetail(data, item.data, rowData)
	}
}

/**
 * @description 续签证书
 */
export const renewCertEvent = async ({ index }: LetsTableProps) => {
	const progress: any = await letsEncryptProgress()
	const data: AnyObject = await useDataHandle({
		request: renewalCert({ index }),
		message: false,
		data: {
			status: Boolean,
			msg: String,
		},
	})
	progress._props.onCancel()
	Message.msg({
		dangerouslyUseHTMLString: true,
		message: data.msg,
		type: data.status ? 'success' : 'error',
		duration: data.status ? 2000 : 0,
		showClose: !data.status,
	}) // 提示信息
	if (data.status) getLetsDataList() // 刷新列表
}

/**
 * @description 手动验证事件
 * @param index 表格行索引
 */
export const handleVerifyEvent = async () => {
	const progress: any = await letsEncryptProgress()
	const data: any = await useDataHandle({
		request: validateDomain({ index: rowData.index }),
		message: false,
	})
	progress._props.onCancel()
	if (data.status === true) {
		verifyDialog.value = false
		deployCertEvent(data, true) // 部署证书
	} else {
		showErrorSslDetail({ msg: data.data }, verifyTableData.value, rowData)
	}
}

/**
 * @description 申请证书
 */
export const applyLetsEncrypt = () => {
	isRenew.value = false
	applyLetsEncryptDialog({
		//   jumpSsl: () => {
		// emit('close');
		//     jumpRouter('/ssl/domain');
		//   },
	})
}

// 帮助提示
export const tableHelpList = ref([
	{
		content: '解析域名需要一定时间来生效,完成所以上所有解析操作后,请等待1分钟后再点击验证按钮',
	},
	{ content: '' },
	{
		content: '若您使用的是宝塔云解析插件,阿里云DNS,DnsPod作为DNS,可使用DNS接口自动解析',
	},
])

/**********************apply lest ssl*************************/

export const domains = ref<any>([]) // 域名列表
export const dnsVerify = ref<string>('dns') // DNS验证方式-自动解析
export const isIndeterminate = ref(false)

/**
 * @description 获取Let's Encrypt站点数据
 */
export const getLetsSiteData = async (params: { id: number } = { id: siteInfo.value.id }) => {
	try {
		const data: AnyObject = await useDataHandle({
			request: siteType.value == 'docker' ? getDockerLetsEncryptSite(params) : getLetsEncryptSite(params),
			data: { domains: Array },
		})
		form.domain = data.domains.map((item: any) => item.name)
		domains.value = data.domains
		if (isRenew.value) {
			form.checkAll = true
			handleCheckAllChange(true)
		}
		return { data: data.domains, status: true, msg: '获取站点数据成功' }
	} catch (error) {
		console.log(error)
		return { status: false, msg: '获取站点数据失败' }
	}
}

// 申请证书
export const onSubmitLetCert = async (param: any) => {
	try {
		param = toRaw(param.value)
		const type = siteType.value
		const name = siteInfo.value.name

		if (param.checkList.length === 0) {
			Message.error('请选择一个域名')
			return false
		}
		const domainArr = domains.value.filter((item: any) => param.checkList.includes(item.name))

		if (param.resource === '1' && hasStatusZero(domainArr) && !form.auth_to) {
			Message.error('选中的域名存在未设置DNS接口配置')
			return false
		}
		if (param.resource === '1' && param.autoWildcard && param.checkList.some((item: any) => item.indexOf('*') !== -1)) {
			Message.error('开启自动组合泛域名时不能选择泛域名')
			return false
		}

		let params = {
			domains: JSON.stringify(param.checkList),
			auth_type: param.resource == '1' ? 'dns' : 'http',
			auth_to: param.resource === '1' && param.auth_to ? 'dns' : JSON.stringify(param.checkList),
			auto_wildcard: param.autoWildcard ? '1' : '0',
			id: siteInfo.value.id,
		}

		const progress: any = await letsEncryptProgress()

		const paramsType: AnyObject = {
			proxy: { ...params, site_name: name },
			docker: { ...params, site_name: name },
			default: params,
		}

		const res = await applyCertApi(paramsType[type] || paramsType.default, type)

		// 关闭进度窗口
		progress._props.onCancel()
		const popup = await otherPopup.value
		res.status && popup?.unmount() // 关闭配置弹窗
		applyLetResult(res.data, param)
		isRefreshLetSSL.value = true // 刷新let列表
		return res.status
	} catch (error) {
		console.log(error)
		Message.error('程序发生错误！')
		return false
	}
}

/**
 * @description DNS状态配置弹窗
 * @param {object} site 当前站点信息
 */
export const dnsStatusDialog = (site: any) => {
	useDialog({
		isAsync: true,
		title: `配置DNS接口`,
		area: 50,
		component: () => import('@site/public/ssl-arrange/lets-encrypt-cert/set-domain-dns.vue'),
		compData: {
			row: site,
			refresh: getLetsSiteData,
		},
		showFooter: true,
	})
}

/**
 * @description 切换证书DNS验证方式
 * @param {boolean} status 是否设置
 */
export const setSslDnsApi = (status?: boolean) => {
	const active = dnsVerify.value
	if (active !== 'dns' && active !== 'http') {
		const item = sslDnsApiInfo.value?.find((item: any) => item.value === active)
		if (item) {
			const isDeploy = !item.data
			if (!status || (status && isDeploy)) {
				dnsApiVerifyDialog({
					title: `设置${item.info.title}接口`,
					row: item.info,
				})
			}
		}
	}
}

// 全选
export const handleCheckAllChange = (val: boolean | string | number) => {
	const checkDomains = domains.value.filter((item: AnyObject) => item.apply_ssl === 1)
	form.checkList = val
		? checkDomains.map((item: any) => {
				return item.name
		  })
		: [] // 排除掉不支持申请的域名 apply_ssl === 0
	isIndeterminate.value = false
}

// 选中
export const handleCheckedDomainChange = (value: string[]) => {
	const checkedCount = value.length
	form.checkAll = checkedCount === form.domain.length
	isIndeterminate.value = checkedCount > 0 && checkedCount < form.domain.length
}

export const form = reactive({
	resource: '0',
	auth_to: false,
	autoWildcard: false,
	checkAll: false,
	domain: [],
	checkList: [] as string[],
})

const letsEncryptHelpDnsList = ref([
	{ content: '如开启后无法使用HTTPS访问，请检查安全组是否正确放行443端口' },
	{
		content: () => {
			return (
				<span>
					在DNS验证中，我们提供了多种自动化DNS-API，并提供了手动模式-
					<span
						class="bt-link"
						onClick={() => {
							closeAllDialog()
							router.push({ name: 'domain' })
						}}>
						点击添加DNS接口
					</span>
				</span>
			)
		},
	},
	{ content: '使用DNS接口申请证书可自动续期，手动模式下证书到期后需重新申请' },
])

const defalutHelpList = [
	{ content: () => <span class="text-danger">注意：请勿将SSL证书用于非法网站</span> },
	{
		content: '使用【DnsPod/阿里云DNS】等接口前您需要先在弹出的窗口中设置对应接口的API',
	},
]
const letsEncryptHelpFileList = ref([
	{
		content: () => (
			<span>
				{' '}
				Let's Encrypt 证书申请和续签限制{' '}
				<a class="bt-link" target="_blank" href="https://letsencrypt.org/zh-cn/docs/rate-limits/">
					点击查看
				</a>
			</span>
		),
	},
	{ content: '申请之前，请确保域名已解析，如未解析会导致审核失败' },
	{ content: "Let's Encrypt免费证书，有效期3个月，支持多域名。默认会自动续签" },
	{ content: '若您的站点使用了CDN或301重定向会导致续签失败' },
	{
		content: '在未指定SSL默认站点时,未开启SSL的站点使用HTTPS会直接访问到已开启SSL的站点',
	},
])

// 帮助信息
export const letsEncryptHelpList = computed(() => {
	const tips = form.resource === '0' ? letsEncryptHelpFileList.value : letsEncryptHelpDnsList.value
	const newTips = defalutHelpList.concat([]) // 深拷贝
	newTips.splice(1, 0, ...tips)
	return newTips
})

export const isIpAddress = (str: string) => {
	const ipRegex = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
	return ipRegex.test(str)
}

/**
 * @description 重置表单
 */
export const $resetLetsForm = () => {
	Object.assign(form, {
		resource: '0',
		auth_to: false,
		autoWildcard: false,
		checkAll: false,
		domain: [],
		checkList: [] as string[],
	})
}

/**
 * @description 判断是否有未设置DNS的域名
 */
export const hasStatusZero = (arr: any) => arr.some((item: any) => item.dns_status === 0)

/*********************lets-encrypt-progress************************/

export const applyLog = ref('正在申请证书...')
export const applyTimer = ref() // 申请证书定时器

/**
 * @description 获取申请证书日志
 * @param params
 */
export const getApplyLog = async () => {
	applyTimer.value = setInterval(async () => {
		try {
			await useDataHandle({
				request: getComposerLine({
					filename: '/www/server/panel/logs/letsencrypt.log',
					num: 10,
				}),
				data: {
					msg: [String, applyLog],
				},
			})
		} catch (error) {
			clearInterval(applyTimer.value)
		}
	}, 2000)
}

/*********************lets-encrypt-progress************************/
export const compData = ref<any>() // 组件数据

export const dnsArray = ref([{ title: '文件验证 - HTTP', name: 'http', data: false, config: false }])
/**
 * @description 一键续签
 */
export const oneClickRenew = async (config: any) => {
	const { dns, id } = config
	let param: any = {
		domains: JSON.stringify(dns),
		auth_type: 'http',
		auth_to: id || 'dns', //默认http类型的id
		auto_wildcard: '0',
	}
	if (dnsVerify.value === 'http') {
		const dnsData = JSON.stringify(dns)
		if (dnsData?.indexOf('*.') !== -1) {
			return Message.error('包含通配符的域名不能使用文件验证(HTTP)!')
		}
	} else {
		// 非手动模式，检测是否配置
		if (dnsVerify.value !== 'dns') {
			const {
				data: isDeploy,
				info: { data: dnsConfig },
			} = sslDnsApiInfo.value.find((item: any) => item.value === dnsVerify.value)
			// 是否设置密钥
			if (isDeploy) {
				param['auth_to'] = `${dnsVerify.value}|${dnsConfig[0].value}|${dnsConfig[1].value}`
			} else {
				Message.error('指定dns接口没有设置密钥信息')
				return
			}
		}
		param['auth_type'] = 'dns'
	}
	param['id'] = siteInfo.value.id
	param['siteName'] = siteInfo.value.name
	// 关闭续签弹窗
	const popup = await otherPopup.value
	popup.unmount()
	const progress: any = await letsEncryptProgress()
	const { data } =
		siteInfo.value.project_type == 'proxy' || siteInfo.value.project_type == 'nginx' || siteInfo.value.project_type == 'docker'
			? await applyProxyCertArrange(
					{
						...param,
						site_name: siteInfo.value.name,
					},
					siteInfo.value.project_type == 'docker' ? 'docker' : 'proxy'
			  )
			: await applyCertApi(param, siteType.value)
	// 关闭进度窗口
	progress?.unmount()
	// 申请结果
	applyLetResult(data, param)
}

export const initRenew = async () => {
	dnsVerify.value = 'http'
	const { data } = await getSslDnsApiInfo()
	dnsArray.value = [{ title: '文件验证 - HTTP', name: 'http', data: false, config: false }]
	if (data && Array.isArray(data)) dnsArray.value = dnsArray.value.concat(data)
}

/*********************set-domain-dns************************/

export const dnsList = ref<any>([]) // DNS列表

export const getDnsDataList = async () => {
	try {
		await useDataHandle({
			request: getDnsData(),
			data: { data: [Array, dnsList] },
		})
	} catch (error) {
		console.log(error)
		return { data: [], total: 0, other: {} }
	}
}

export const setDomainDNSEvent = async (param: any) => {
	try {
		if (!param.dns_id) {
			Message.error('请选择验证类型')
			return
		}
		const params = { dns_id: param.dns_id, ids: JSON.stringify(param.ids) }
		const res: AnyObject = await useDataHandle({
			loading: '正在配置DNS接口，请稍候...',
			request: setDomainDNS(params),
			message: true,
		})
		if (res.status) {
			param.dns_id = ''
			param.ids = []
			getLetsSiteData()
		}
		return res.status
	} catch (error) {
		console.log(error)
		return false
	}
}

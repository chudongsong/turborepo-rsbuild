import { authDomainApi, batchSetSsl, closeCertArrange, getDnsApiList, letCertInitApi, letRenewCert, reissueCertOrder, setBatchCertToSite, setCertToSite, setDnsApiInfo, setSslInfo } from '@/api/site'
import BtTableGroup from '@/components/extension/bt-table-group'
import BtHelp from '@/components/form/bt-help'
import { TabsOptionsProps } from '@/components/navigation/bt-tabs/types'
import { useConfirm, useDataHandle, useDialog } from '@/hooks/tools'
import { Message } from '@/hooks/tools/message'
import { copyText, isArray, isObject, isString } from '@/utils'
import BusinessCert from '@site/public/ssl-arrange/business-cert/index.vue'
import CertFolder from '@site/public/ssl-arrange/cert-folder/index.vue'
import CurrentCert from '@site/public/ssl-arrange/current-cert/index.vue'
import LetsEncryptCert from '@site/public/ssl-arrange/lets-encrypt-cert/index.vue'
import TrustAsiaCert from '@site/public/ssl-arrange/trust-asia-cert/index.vue'
import { LetsTableProps, SslInfoProps } from '../../types'
import { openResultDialog } from '../../useController'
import { useSiteStore } from '../../useStore'
import { SITE_SSL_STORE, useSiteSSLStore } from './useStore'
import { useGlobalStore } from '@/store/global'
import useWPLocalStore from '@/views/wordpress/view/local/useStore'
import { ElButton } from 'element-plus'
import BtTable from '@/components/data/bt-table'
import { compData, handleVerifyEvent, rowData } from './lets-encrypt-cert/useController'
import { assembBatchParams, assembBatchResults, openResultView, bindUserDialog } from '@/public'

const { payment } = useGlobalStore()
const { bindUser } = toRefs(payment.value)

const { sslInfo, certVerifyInfo, sslTabActive, letApplyInfo, isRefreshSSL, pollingPopup, sslDnsApiInfo, productInfo, orderInfo, otherPopup } = useSiteSSLStore()
const { siteInfo, siteType, isBindExtranet, isRefreshList, batchConfig, activeType, isSiteMult } = useSiteStore()
const { isRefreshLocalList } = storeToRefs(useWPLocalStore())
const { getSSLInfoEvent, jumpSslTabEvent } = SITE_SSL_STORE()

// 当前证书标题
export const currentCertTitle = computed(() => {
	return `当前证书 -<span class="${sslInfo.value?.isStart ? 'text-primary' : 'text-danger'}">[${sslInfo.value?.isStart ? '已部署SSL' : '未部署SSL'}]</span>`
})

/// tab配置
export const tabComponent = [
	{
		label: () => <span v-html={currentCertTitle.value}></span>,
		name: 'currentCertInfo',
		lazy: true,
		render: () => <CurrentCert></CurrentCert>,
	},
	{
		label: '商用SSL证书',
		name: 'busSslList',
		lazy: true,
		render: () => <BusinessCert></BusinessCert>,
	},
	{
		label: '测试证书',
		name: 'trustAsiaList',
		lazy: true,
		render: () => <TrustAsiaCert></TrustAsiaCert>,
	},
	{
		label: "Let's Encrypt",
		name: 'letsEncryptList',
		lazy: true,
		render: () => <LetsEncryptCert></LetsEncryptCert>,
	},
	{
		label: '证书夹',
		name: 'certFolderList',
		lazy: true,
		render: () => <CertFolder></CertFolder>,
	},
] as TabsOptionsProps[]

/**
 * @description 商业证书产品弹窗
 * @returns
 */
export const busCertProductDialog = () => {
	useDialog({
		isAsync: true,
		title: '购买商业证书',
		area: [79],
		component: () => import('@site/public/ssl-arrange/business-cert/apply-bus-ssl.vue'),
	})
}

/**
 * @description 获取ssl配置信息
 */
export const applyBusSslEvent = () => {
	if (!bindUser.value) {
		bindUserDialog()
		return false
	}
	sslTabActive.value = 'busSslList'
	busCertProductDialog()
}

/**
 * @description 挂载事件
 */
export const mountEvent = () => {
	let type: any = siteInfo.value.project_type?.toLowerCase()
	siteType.value = type

	isBindExtranet.value = !!siteInfo.value.project_config?.bind_extranet

	const isNotBindExtranet = ['php', 'html', 'phpasync', 'proxy', 'docker']
	if (isNotBindExtranet.includes(type)) isBindExtranet.value = true
	if (isBindExtranet.value) getSslConfig()
}

export const getSslConfig = async () => {
	const load = Message.load('正在获取站点证书部署信息，请稍候...')
	await getSslInfoConfig()
	load.close()
}

/**
 * @description 获取证书信息
 */
export const getSslInfoConfig = async () => {
	try {
		const { data } = await getSSLInfoEvent({
			siteName: siteInfo.value.name,
		})
		setCertInfo(data) // 设置证书信息
		return { data, status: true, msg: '获取证书信息成功' }
	} catch (error) {
		console.log(error)
	}
}

/**
 * @description 设置证书信息
 */
export const setCertInfo = (data: any) => {
	const { type, httpTohttps, https_mode, index, auth_type, key, csr, cert_data: { dns = [], subject = '', issuer = '', endtime = '', notAfter = '' } = {}, push, status, oid } = data
	sslInfo.value = {
		...sslInfo.value,
		isCertInfo: !!(subject || false), // 是否存在证书信息
		https: httpTohttps,
		httpsMode: https_mode, // 是否开启https防窜站
		type,
		key: key || '',
		csr: csr || '',
		index: index || '',
		authType: auth_type || '',
		oid,
		dns: dns || [],
		subject,
		issuer,
		endtime,
		notAfter,
		push,
		pushAlarm: !!(typeof push === 'object' ? push.status : push),
		isSupportRenewal: (() => {
			let status = false
			if (endtime <= 30) status = true
			if (type === 2 && endtime < 0) status = true
			if (type === 0 || type === -1) status = false
			return status
		})(),
		isStart: status,
	}
}

/**
 * @description 初始化ssl
 */
export const initSsl = () => {
	sslTabActive.value = sslInfo.value?.isStart ? 'currentCertInfo' : 'busSslList'
	mountEvent()
}

/**
 * @description 完善商业证书资料
 * @param data
 * @returns
 */
export const busCertVerifyInfoDialog = async (data: AnyObject) => {
	orderInfo.value = data.orderInfo
	otherPopup.value = await useDialog({
		title: '完善商业证书资料',
		area: 64,
		component: () => import('@site/public/ssl-arrange/business-cert/bus-cert-verify-info.vue'),
		compData: data,
	})
}

/**
 * @description 验证证书方式
 * @param certVerifyInfo 证书验证信息
 * @returns
 */
export const busCertVerifyWayDialog = async (info: AnyObject): Promise<any> => {
	certVerifyInfo.value = info
	otherPopup.value = await useDialog({
		title: '验证域名-' + (info.isCNAME ? 'DNS验证' : '文件验证'),
		area: 64,
		component: () => import('@site/public/ssl-arrange/business-cert/bus-cert-verify-way.vue'),
	})
}

/**
 * @description 批量部署证书 证书夹部署证书
 */
export const setCertFolderDeployEvent = async (obj: { hash: string; subject: string; list: any[]; type: string }) => {
	const { hash, subject, list, type } = obj
	await useConfirm({
		title: '部署证书',
		content: '批量部署证书后，原有证书将被覆盖，是否继续？',
		icon: 'warning-filled',
	})
	if (isSiteMult.value) {
		const { enable, exclude } = batchConfig.value
		const params = assembBatchParams(list, exclude, enable, {
			params: {
				certName: subject,
				project_type: activeType.value.toUpperCase(),
				ssl_hash: hash,
			},
		})
		await useDataHandle({
			loading: '正在部署证书，请稍候...',
			request: batchSetSsl(params),
			success: async (res: any) => {
				let { data } = assembBatchResults(res.data)
				data = data.map((item: any) => ({ ...item, name: item.siteName }))
				openResultView(data, { title: '部署证书' })
			},
		})
		isSiteMult.value = false
		isRefreshList.value = true // 刷新列表
		isRefreshLocalList.value = true // 刷新wp本地列表
	} else {
		const batchInfo = list.map((item: any) => {
			return {
				ssl_hash: hash,
				siteName: item.name,
				certName: subject,
			}
		})
		const paramsType: AnyObject = {
			proxy: {
				BatchInfo: JSON.stringify(batchInfo),
				site_name: siteInfo.value.name,
			},
			docker: {
				BatchInfo: JSON.stringify(batchInfo),
				site_name: siteInfo.value.name,
			},
			default: { BatchInfo: JSON.stringify(batchInfo) },
		}

		const params = paramsType[type] || paramsType.default

		const res: AnyObject = await useDataHandle({
			loading: '正在部署证书，请稍候...',
			request: setBatchCertToSite(params, type),
			data: {
				faildList: Array,
				successList: Array,
			},
		})

		if (siteInfo.value?.name) getSslInfoConfig()
		isRefreshList.value = true // 刷新列表
		isRefreshLocalList.value = true // 刷新wp本地列表
		await openResultDialog({
			title: '批量部署结果',
			resultTitle: '部署证书操作',
			resultData: [
				...res.faildList.map((item: any) => {
					return {
						name: item.siteName,
						status: false,
						msg: item.msg || item.error_msg,
					}
				}),
				...res.successList.map((item: any) => {
					return {
						name: item.siteName,
						status: true,
					}
				}),
			],
		})
	}
}

/**
 * @description 部署证书结果 测试证书、Let's Encrypt
 * @param res
 * @param isAutoDeploy
 */
export const useDeployResult = (res: AnyObject, isAutoDeploy: boolean) => {
	if (res.status) {
		Message.request(res)
		getSslInfoConfig() // 获取证书信息
		isRefreshList.value = true // 刷新列表
		isRefreshSSL.value = true // 刷新证书列表
		isRefreshLocalList.value = true // 刷新wp本地列表
	} else {
		const msg = !isAutoDeploy ? '' : '当前证书已成功申请！自动部署失败，请尝试手动部署证书！\n'
		Message.msg({
			customClass: 'bt-message-error-html',
			dangerouslyUseHTMLString: true,
			message: msg + res.msg,
			type: res.status ? 'success' : 'error',
			showClose: res.status ? false : true,
		}) // 提示错误信息
	}
}

/**
 * @description dns验证api
 * @param data
 */
export const dnsApiVerifyDialog = (data: { title: string; row: any }): Promise<any> => {
	return useDialog({
		isAsync: true,
		title: data.title,
		area: 50,
		component: () => import('@site/public/ssl-arrange/public/dns-verify-info.vue'),
		showFooter: true,
		compData: data.row,
	})
}

/**
 * @description 获取证书DNS验证API信息
 */
export const getSslDnsApiInfo = async () => {
	try {
		const data = await useDataHandle({
			request: getDnsApiList(),
			data: Array,
		})
		// 设置DNS接口信息
		if (isArray(data)) setDnsApiInfoEvent(data)
		return { data, status: true }
	} catch (error) {
		console.log(error)
		return { status: false, msg: '获取DNS接口信息失败' }
	}
}

/**
 * @description 设置DNS接口信息
 * @param data
 */
const setDnsApiInfoEvent = (data: any[]) => {
	sslDnsApiInfo.value = data
		.filter(item => item.name !== 'CloudxnsDns') // 过滤掉CloudxnsDns
		.map(item => ({
			label: item.title,
			value: item.name,
			config: !!item.data, // 是否配置
			data: item.data ? item.data[0].value != '' : false,
			info: item,
		}))
}

/**
 * @description 验证DNS
 * @param list
 * @returns
 */
export const submitDnsVerify = async (list: any) => {
	try {
		const config = {} as AnyObject
		list.forEach((item: any) => {
			config[item.key] = item.value
		})

		const params = { pdata: JSON.stringify(config) }

		const data: AnyObject = await useDataHandle({
			loading: '正在配置DNS接口，请稍候...',
			request: setDnsApiInfo(params),
			message: true,
		})
		// 重新获取证书DNS验证API信息
		await getSslDnsApiInfo()
		if (data.status) return data.status
	} catch (error) {
		console.log(error)
		return { status: false, msg: '验证失败' }
	}
}

/**
 * @description 显示错误信息
 * @param res 返回数据
 * @param verifyTableData 验证表格数据
 * @param rowData 行数据
 */
export const showErrorSslDetail = (res: AnyObject, verifyTableData: any[], rowData: AnyObject) => {
	// 为字符串类型的错误提示
	if (res.msg && isString(res.msg)) {
		Message.msg({
			customClass: 'bt-message-error-html',
			dangerouslyUseHTMLString: true,
			message: res.msg,
			type: 'error',
			showClose: true,
			duration: 0,
		}) // 提示错误信息
		return
	}

	//  以下为详情错误提示
	let err_info = '',
		err_title = res.msg[0]
	if (res.msg[1]?.challenges === undefined) {
		err_info += `
			<p><span>响应状态：</span>${res.msg[1].status}</p>
			<p><span>错误类型：</span>${res.msg[1].type}</p>
			<p><span>错误来源：</span><a href='https://letsencrypt.org/' style='color:#20a53a'>Let's Encrypt官网</a></p>
			<div class="flex flex-col">
				错误代码：
				<pre class="!text-white !bg-[#333] !inline-block !ml-[4px]">
					${res.msg[1].detail}
				</pre>
			</div>`
	} else {
		if (!res.msg[1]?.challenges[1] && res.msg[1]?.challenges[0]) {
			res.msg[1].challenges[1] = res.msg[1].challenges[0]
		}

		if (res.msg[1].status === 'invalid') {
			let dns_value = ''
			for (const item of verifyTableData) {
				const outerText = item.outerText || item.auth_value
				if (outerText?.includes(res.msg[1].identifier.value)) {
					const s_tmp = outerText.split('\t')
					if (s_tmp?.length > 1) {
						dns_value = s_tmp[1]
						break
					}
				}
			}

			const identifierValue = res.msg[1]?.identifier.value
			const challenge = res.msg[1]?.challenges[1]
			const errorDetail = challenge?.error.detail

			err_info += `
				<p><span>验证域名：</span>${identifierValue}</p>
			`

			if (rowData?.type === 'dns' || rowData?.auth_type === 'dns') {
				const check_url = `_acme-challenge.${identifierValue}`
				err_info += `
					<p><span>验证解析：</span>${check_url}</p>
					<p><span>验证内容：</span>${dns_value || challenge.token}</p>
					<div class="flex flex-col">
						错误代码：
						<pre class="!text-white !bg-[#222] !inline-block !ml-[4px]">
							${errorDetail}
						</pre>
					</div>
				`
			} else {
				const check_url = `http://${identifierValue}/.well-known/acme-challenge/${res.msg[1]?.challenges[0].token}`
				err_info += `
					<p><span>验证URL：</span><a class="text-primary" href='${check_url}' target='_blank'>点击查看</a></p>
					<p><span>验证内容：</span>${res.msg[1]?.challenges[0].token}</p>
					<div class="flex flex-col">
						错误代码：
						<pre class="!text-white !bg-[#222] !inline-block !ml-[4px]">
							${res.msg[1]?.challenges[0].error.detail}
						</pre>
					</div>
				`
			}

			err_info += "<p><span>验证结果：</span> <a class='text-danger'>验证失败</a></p>"
		}
	}
	Message.msg({
		customClass: 'bt-message-error-html',
		dangerouslyUseHTMLString: true,
		icon: 'x',
		message: `
			<div class="flex items-center justify-center mt-[.8rem] mb-2rem">
				<i class="svgtofont-el-circle-close-filled mr-[.8rem] text-danger !text-[3rem]"></i>
				<a style="color: red; font-size:16px">
					${err_title}
				</a>
			</div>
			<div class="p-[2rem] border border-1 border-color-dark !rounded-base !mb-[12px] !leading-[26px] bg-light">
				${err_info}
			</div>
		`,
		showClose: true,
		duration: 0,
	}) // 提示错误信息
}

/**
 * @description Let's Encrypt申请证书进度
 */
export const letsEncryptProgress = (): Promise<any> =>
	useDialog({
		area: [50, 25],
		showFooter: false,
		component: () => import('@site/public/ssl-arrange/lets-encrypt-cert/lets-encrypt-progress.vue'),
	})

const tableColumns = ref([
	{ label: '解析域名', prop: 'name' },
	{
		label: '记录值',
		prop: 'txt',
		render(row: any, index: number) {
			return (
				<div class="flex items-center">
					<div class="truncate w-[15rem]">{row.txt}</div>
					<span class="svgtofont-icon-copy ml-[4px] text-secondary text-medium w-[1.6rem] cursor-pointer" onClick={() => copyText({ value: row.txt })}></span>
				</div>
			)
		},
	},
	{ label: '类型', prop: 'type' },
	{ label: '必需', prop: 'force', width: 100 },
])
const verifyDialog = ref() // 解析记录弹窗
/**
 * @description 申请let's encrypt证书
 */
export const applyLetResult = (data: AnyObject, param: AnyObject) => {
	// 申请信息错误 - 直接返回
	if (data.status === false && data.hasOwnProperty('msg') && isString(data.msg)) {
		Message.msg({
			customClass: 'bt-message-error-html',
			dangerouslyUseHTMLString: true,
			message: data.msg,
			type: 'error',
			showClose: true,
			duration: 0,
		}) // 提示错误信息
		return
	}
	// 验证中/验证通过
	if (data.status === true || data.status === 'pending' || data?.save_path !== undefined) {
		// 验证中》开启验证窗口
		if (data.status === 'pending' && data.auth_type === 'dns') {
			setApplyInfo(data, param) // 设置申请信息
			let newTableData: any[] = []
			data.auths.forEach((item: any) => {
				let _body = []
				const _domain = item.domain.replace('*.', '')
				_body.push({
					name: `_acme-challenge.${_domain}`,
					type: 'TXT',
					txt: item.auth_value,
					force: '是',
				})
				_body.push({
					name: _domain,
					type: 'CAA',
					txt: '0 issue "letsencrypt.org"',
					force: '否',
				})
				newTableData.push({
					domain: item.domain,
					data: _body,
				})
			})
			const tableHelpList = [
				{
					content: '解析域名需要一定时间来生效,完成所以上所有解析操作后,请等待1分钟后再点击验证按钮',
				},
				{
					content: `可通过CMD命令来手动验证域名解析是否生效: nslookup -q=txt _acme-challenge.${data.auths[0].domain.replace('*.', '')}`,
				},
				{
					content: '若您使用的是宝塔云解析插件,阿里云DNS,DnsPod作为DNS,可使用DNS接口自动解析',
				},
			]
			const isError = data.hasOwnProperty('error') ? data.error : false
			Object.assign(rowData, data)
			verifyDialog.value = useDialog({
				title: '手动解析TXT记录',
				area: 70,
				component: () => (
					<div class="p-[1.5rem]">
						请按以下列表做TXT解析:
						<BtTableGroup>
							{{
								content: () => (
									<div class="max-h-[38rem] overflow-auto">
										{newTableData.map((item, index) => (
											<div key={index}>
												{item.data.length > 0 && (
													<>
														<span>验证域名：{item.domain}</span>
														<BtTable class="my-[1rem]" column={tableColumns.value} data={item.data}></BtTable>
														{isError.value && (
															<div class="flex justify-end">
																<ElButton
																	type="default"
																	onClick={() =>
																		verifySeparatelyEvent({
																			index: data.index,
																			domain: item.domain,
																		})
																	}>
																	验证
																</ElButton>
															</div>
														)}
													</>
												)}
											</div>
										))}
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
						<BtHelp options={tableHelpList} listStyle="disc" class="ml-20x" />
					</div>
				),
			})
			return
		}
		// 验证通过》部署证书
		letSslDeploy(data, true)
		return
	}
	// 申请失败【500错误】
	showErrorSslDetail(data, letApplyInfo.value.dnsTable, letApplyInfo.value.info)
}

/**
 * @description 验证单个域名
 * @param {string} params.domain 域名
 * @param {string} params.index 解析记录
 */
const verifySeparatelyEvent = async (params: AnyObject) => {
	const progress: any = await letsEncryptProgress()
	const { data } = await authDomainApi(params)
	progress?.unmount()
	if (data.status === 'valid') {
		Message.success('验证成功')
	} else if (data.status === true) {
		const popup = await verifyDialog.value
		if (popup) popup.unmount() //关闭解析记录弹窗
		deployCertEvent(data, true) // 部署证书
	} else {
		showErrorSslDetail(data, letApplyInfo.value.dnsTable, letApplyInfo.value.info)
	}
}

// 手动验证事件
const handleVerify = async (index: any) => {
	try {
		const progress: any = await letsEncryptProgress()
		const { data } = await applyDnsAuth({ index })
		console.log(data)
		progress?.unmount()
		if (data.status === true) {
			const popup = await verifyDialog.value
			if (popup) popup.unmount() //关闭解析记录弹窗
			deployCertEvent(data, true) // 部署证书
		} else {
			showErrorSslDetail(data, letApplyInfo.value.dnsTable, letApplyInfo.value.info)
		}
	} catch (e) {
		console.log(e)
	}
}
/**
 * @description 部署证书
 */
const deployCertEvent = async ({ index }: LetsTableProps, isAutoDeploy: boolean = false, siteName: string = siteInfo.value.name) => {
	const res: AnyObject = await useDataHandle({
		loading: '正在部署证书，请稍候...',
		request: setCertToSite({ index, siteName }),
		message: false,
		data: {
			status: Boolean,
			msg: String,
		},
	})

	// 处理结果
	useDeployResult(res, isAutoDeploy)
}

/**
 * @description let证书申请结果
 */
export const setApplyInfo = (data: AnyObject, param: AnyObject) => {
	letApplyInfo.value.dnsTable = data.auths
	letApplyInfo.value.info.index = data.index
	letApplyInfo.value.info.type = param.auth_type
}

/**
 * @description 验证通过》部署证书
 */
export const letSslDeploy = async (param: AnyObject, isAutoDeploy: boolean) => {
	if (!param.private_key || !param.cert || !param.root) {
		// 三个必要项一个为空则无法进行部署
		Message.msg({
			customClass: 'bt-message-error-html',
			dangerouslyUseHTMLString: true,
			message: '部署失败，请关闭SSL后重新尝试部署！',
			type: 'error',
			showClose: true,
			duration: 0,
		}) // 提示错误信息
		return
	}

	const { private_key, cert, root } = param
	const type = siteInfo.value.project_type
	// 接口参数
	const paramsType: AnyObject = {
		proxy: {
			site_name: siteInfo.value.name,
			key: private_key,
			csr: cert + root,
		},
		default: {
			type: 1,
			siteName: siteInfo.value.name,
			key: private_key,
			csr: cert + root,
		},
	}

	await useDataHandle({
		loading: '正在保存证书信息，请稍后...',
		request: setSslInfo(paramsType[type] || paramsType.default, type),
		message: true,
		success: (res: any) => {
			if (res.status === true) {
				// Message.request(deplySSL)
				getSslInfoConfig()
				jumpSslTabEvent('currentCertInfo')
			} else {
				let msg = res.msg
				if (isAutoDeploy) {
					msg = '当前证书申请并验证成功，自动部署失败，请尝试手动部署证书！\n' + msg
				}
				Message.msg({
					customClass: 'bt-message-error-html',
					dangerouslyUseHTMLString: true,
					message: msg,
					type: 'error',
					showClose: true,
					duration: 0,
				}) // 提示错误信息
			}
		},
	})
}

/**
 * @description 商业证书支付成功弹窗
 * @param data
 * @returns
 */
export const busCertPaySuccessDialog = (data: AnyObject) => {
	useDialog({
		title: '支付成功',
		area: [60, 60],
		component: () => import('@site/public/ssl-arrange/business-cert/pay-bus-success.vue'),
		compData: data,
	})
}

/**
 * @description 当前证书 续签
 * @returns void
 */
export const renewalCurrentCertEvent = async ({ type, oid, index, authType }: SslInfoProps = sslInfo.value, { name }: AnyObject = siteInfo.value) => {
	// 商用证书
	if (type === 3) {
		renewalCertEvent(oid, type)
	} else {
		// let's Encrypt证书
		// 直接续签
		if (index?.length === 32 && index.indexOf('/') === -1 && authType !== 'dns') {
			renewalLetCertEvent(index)
		} else {
			// 重新申请
			const { data } = await useDataHandle({
				request: letCertInitApi({
					siteName: name,
					pem_file: index,
				}),
			})
			letsEncryptRenewEvent(data as AnyObject)
		}
	}
}

export const renewalCurrentCertEventV2 = async ({ type, oid, index, authType }: SslInfoProps = sslInfo.value, { name }: AnyObject = siteInfo.value) => {
	// 商用证书
	if (type === 3) {
		renewalCertEvent(oid, type)
	} else {
		// let's Encrypt证书
		// 直接续签
		if (index?.length === 32 && index.indexOf('/') === -1 && authType !== 'dns') {
			renewalLetCertEvent(index)
		} else {
			// 重新申请
			applyLetsEncryptDialog(null, true)
		}
	}
}

/**
 * @description  Let's Encrypt续签
 */
export const letsEncryptRenewEvent = async (data: AnyObject): Promise<any> => {
	compData.value = data
	otherPopup.value = useDialog({
		title: "续签Let's Encrypt证书",
		area: 50,
		component: () => import('@site/public/ssl-arrange/lets-encrypt-cert/lets-encrypt-renew.vue'),
		compData: data,
	})
}

/**
 * @description 续签Let's Encrypt证书
 */
export const renewalLetCertEvent = async (index: string) => {
	const progress: any = await letsEncryptProgress()
	const { data }: AnyObject = await useDataHandle({
		request: letRenewCert({ index }),
	})
	progress._props.onCancel()
	applyLetResult(data, { auth_type: data.auth_type })
}

/**
 * @description 切换证书类型
 * @param {number} oid - 证书类型
 * @param {number} type - 证书类型
 * @returns void
 */
export const renewalCertEvent = (oid: number, type: number) => {
	switch (type) {
		case 3: // 商业证书 续签
			renewalBusCertEvent(oid)
			break
		case 2: // 宝塔SSL 续签
			break
		case 1: // Let's Encrypt 续签
			break
	}
}

/**
 * @description 续签商业证书
 */
export const renewalBusCertEvent = async (oid: number) => {
	await useConfirm({
		title: '商业证书续签',
		content: '当前证书订单需要重新生成新订单，需要手动续签，和重新部署证书，是否继续操作？',
	})

	const params = {
		pdata: JSON.stringify({ oid }),
	}

	const res = await useDataHandle({
		loading: '正在续签商业证书，可能等待时间较长，请稍后...',
		request: reissueCertOrder(params),
		data: Object,
	})

	// 当存在order_info时，表示需要重新支付
	if (isObject(res) && res.hasOwnProperty('order_info')) {
		// 展示二维码 重新支付
		let orderData = res.order_info
		busCertPayDialog({
			oid: res.oid,
			wxcode: res.wxcode,
			alicode: res.alicode,
			orderInfo: orderData,
			productInfo: {
				...orderData,
				productName: orderData.title,
				totalPrice: res.data.price,
				isRenew: true,
			},
		})
	} else {
		Message.request(res)
	}

	getSslInfoConfig() // 重新获取证书信息
}

/**
 * @description 商业证书支付弹窗
 * @param data
 * @returns
 */
export const busCertPayDialog = async (data: any) => {
	productInfo.value = data.productInfo
	orderInfo.value = data.orderInfo
	pollingPopup.value = useDialog({
		title: '支付商业证书订单',
		area: [60],
		component: () => import('@site/public/ssl-arrange/business-cert/pay-bus-ssl.vue'),
		compData: data,
	})
}

/**
 * @description 关闭证书
 */
export const closeCertEvent = async () => {
	const type = siteType.value
	const name = siteInfo.value.name

	const paramsType: AnyObject = {
		proxy: { site_name: name },
		default: { updateOf: 1, siteName: name },
	}
	const params = paramsType[type] || paramsType.default

	await useDataHandle({
		loading: '正在关闭证书，请稍后...',
		request: closeCertArrange(params, type),
		message: true,
		success: () => {
			isRefreshList.value = true // 刷新网站列表
			isRefreshLocalList.value = true // 刷新wp本地列表
		},
	})
	getSslInfoConfig() // 重新获取证书信息
}

function applyDnsAuth(arg0: { index: any }): { data: any } | PromiseLike<{ data: any }> {
	throw new Error('Function not implemented.')
}

/**
 * @description 申请let证书
 */
export const applyLetsEncryptDialog = async (data?: any, isRenew?: boolean): Promise<any> => {
	otherPopup.value = await useDialog({
		isAsync: true,
		title: isRenew ? "续签Let's Encrypt证书" : "申请Let's Encrypt证书",
		area: 64,
		component: () => import('@site/public/ssl-arrange/lets-encrypt-cert/applay-lest-ssl.vue'),
		compData: { ...data, isRenew },
	})
	
}

export const openNps = () => {
	useDialog({
		component: () => import('@/components/business/bt-nps-survey-v2/index.vue'),
		area: 52,
		compData: {
			title: 'SSL证书需求反馈收集',
			type: 28,
			isNoRate: true,
			softName: '1',
			isCard: false,
			id: 993,
		},
	})
}

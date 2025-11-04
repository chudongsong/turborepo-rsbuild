import { applyCertByca, applyTrustAsiaCert, closeCertArrange, getTrustAsiaList, verifyTrustAsiaCert, verifyTrustAsiaCret } from '@/api/site'
import { Message, useDataHandle, useDialog } from '@/hooks/tools'
import { bindUserDialog } from '@/public'
import { TrustAsiaTableProps } from '@/views/site/types'
import { SITE_STORE, useSiteStore } from '@/views/site/useStore'
import { useGlobalStore } from '@/store/global'
import { closeCertEvent, useDeployResult } from '../useController'
import { SITE_SSL_STORE, useSiteSSLStore } from '../useStore'
import { getSslStore } from '@ssl/useStore'

const {
	refs: { isRefreshCertificateList },
} = getSslStore()
const { sslInfo, sslTabActive, isRefreshSSL, applySslInfo } = useSiteSSLStore()
const { siteInfo, siteType } = useSiteStore()
const { useDeployTrustAsiaCert, getDomainListEvent, jumpSslTabEvent } = SITE_SSL_STORE()

const { payment } = useGlobalStore()
const { bindUser } = toRefs(payment.value)

export const isLoading = ref<boolean>(false) // 加载状态
export const deployedId = ref<string>('') // 已部署订单编号Id
export const rowData = ref() //
export const domainAllList = ref<any>([])

export const trustAsiaHelpList = [
	{
		content: () => <span class="text-danger">注意：请勿将SSL证书用于非法网站，一经发现，吊销证书。</span>,
	},
	{
		content: '申请之前，请确保域名已解析，如未解析会导致审核失败(包括根域名)。',
	},
	{
		content: '宝塔SSL申请的是免费版TrustAsia DV SSL CA - G5证书，仅支持单个域名申请。',
	},
	{ content: '有效期90天，不支持续签，到期后需要重新申请，每个账号申请数量上限为3张。' },
	{
		content: '建议使用二级域名为www的域名申请证书,此时系统会默认赠送顶级域名为可选名称',
	},
	{
		content: '在未指定SSL默认站点时,未开启SSL的站点使用HTTPS会直接访问到已开启SSL的站点',
	},
	{
		content: () => (
			<span>
				测试SSL申请注意事项及教程
				<a href="https://www.bt.cn/bbs/thread-33113-1-1.html" target="_blank" class="btlink">
					{' '}
					使用帮助
				</a>
			</span>
		),
	},
]

/**
 * @description 商业证书状态列
 * @param row
 * @returns
 */
export const renderState = (row: any) => {
	switch (row.stateName) {
		case '待验证':
			return <span class="text-[#e6a23c]">{row.stateName}</span>
		case '已过期':
			return <span class="text-danger">{row.stateName}</span>
		case '验证中':
			return <span class="text-[#fc6d26]">{row.stateName}</span>
		case '审核已终止':
			return <span>{row.stateName}</span>
		default:
			return <span class="text-primary">{row.stateName}</span>
	}
}

/**
 * @description 申请TrustAsia证书 、修改域名
 * @param row 表格行数据
 */
export const applyTrustCert = (row?: TrustAsiaTableProps) => {
	if (!bindUser.value) {
		bindUserDialog()
		return false
	}
	rowData.value = row
	useDialog({
		isAsync: true,
		title: '申请免费宝塔SSL证书',
		area: 60,
		component: () => import('./apply-bt-ssl.vue'),
	})
}

export const closeTrustCertEvent = async () => {
	try {
		const res = await closeCertEvent()
		getTrustAsiaDataList() // 刷新列表
	} catch (error) {
		console.log(error)
	}
}

/**
 * @description 部署证书
 * @param row 表格行数据
 * @param isAutoDeploy 是否自动部署
 */
export const deployCertEvent = async ({ partnerOrderId }: TrustAsiaTableProps, isAutoDeploy: boolean = false) => {
	const type = siteType.value
	const { name } = siteInfo.value
	const paramsType: AnyObject = {
		proxy: {
			site_name: name,
			partnerOrderId: partnerOrderId,
		},
		default: {
			siteName: name,
			partnerOrderId: partnerOrderId,
		},
	}
	// 获取参数
	const params = paramsType[type] || paramsType.default

	const res: any = await useDeployTrustAsiaCert(params, type)

	// 处理结果
	useDeployResult(res, isAutoDeploy)
	// 跳转
	jumpSslTabEvent('currentCertInfo')
}

/**
 * @description 验证域名
 */
export const verifyDomainEvent = async (row: TrustAsiaTableProps) => {
	const params = {
		partnerOrderId: row.partnerOrderId,
		siteName: siteInfo.value.name,
	}

	const res: AnyObject = await useDataHandle({
		loading: '正在验证证书申请状态，请稍后...',
		request: verifyTrustAsiaCert(params),
		message: true,
		data: {
			status: Boolean,
			'data.stateCode': [String, 'stateCode'],
		},
	})
	if (res.status && res.stateCode === 'COMPLETED') {
		deployCertEvent(row, true)
	} else {
		Message.success('等待CA验证中，若长时间未能成功验证，请登录官网使用DNS方式重新申请...')
	}
	// getTrustAsiaDataList(); // 刷新列表
}

/**
 * @description 获取TrustAsia证书列表
 */
export const getTrustAsiaDataList = async () => {
	try {
		const { data: res }: AnyObject = await useDataHandle({
			loading: isLoading,
			request: getTrustAsiaList({ siteName: siteInfo.value.name }),
		})

		deployedId.value = res.partnerOrderId as string
		// 重置刷新状态
		isRefreshSSL.value = false
		return { data: res.data, total: res.data.length, other: {} }
	} catch (error) {
		console.log(error)
		return { data: [], total: 0, other: {} }
	}
}

export const initApplyBtSSL = async () => {
	try {
		const res = await getDomainListEvent()
		domainAllList.value = res.data as any

		if (rowData.value && rowData.value.ssl_id) {
			applySslInfo.value.domain = domainAllList.value?.find((item: any) => item.name === rowData.value.authDomain)?.name
		}

		domainAllList.value = domainAllList.value.map(({ name, id }: any) => ({
			value: name,
			label: name,
		}))

		return { data: applySslInfo.value, status: true }
	} catch (error) {
		console.log(error)
	}
}

/**
 * @description 提交证书申请信息
 */
export const submitTrustApply = async (param: any) => {
	try {
		const ssl_id = rowData.value?.ssl_id
		let params: any = {
			...param,
			orgDivision: '总务',
			path: siteInfo.value.path,
		}
		if (ssl_id) params.ssl_id = ssl_id
		delete params.data, params.status

		// 请求
		const requestFun = ssl_id ? applyCertByca : applyTrustAsiaCert
		const { data, msg, status }: any = await useDataHandle({
			loading: '正在提交证书申请资料，请稍后...',
			request: requestFun(params),
			// data: {
			//   status: Boolean,
			//   data: [Object, 'data'],
			//   msg: [String, 'msg'],
			// },
		})

		// 证书申请状态 -成功
		if (status) {
			Message.success(data.msg || msg || '申请成功')
			const {
				data: rData,
				status,
				msg: rMsg,
			}: any = await useDataHandle({
				loading: '正在验证证书申请状态，请稍后...',
				request: verifyTrustAsiaCret({
					partnerOrderId: data.partnerOrderId,
					siteName: siteInfo.value.name,
				}),
				// data: {
				// 	status: [Boolean, 'rStatus'],
				// 	'data.stateCode': [String, 'stateCode'],
				// 	msg: [String, 'rMsg'],
				// },
			})
			//  验证成功进入部署
			if (status) {
				if (rData.stateCode == 'COMPLETED') {
					Message.success('验证成功！即将开始证书部署！')
					deployCertEvent(data) // 部署证书
				} else {
					Message.success('等待CA验证中，若长时间未能成功验证，请登录官网使用DNS方式重新申请...')
				}
			} else {
				Message.msg({
					customClass: 'bt-message-error-html',
					dangerouslyUseHTMLString: true,
					message: rMsg,
					type: 'error',
					duration: 0,
					showClose: true,
				}) // 提示错误信息
			}
		} else {
			Message.msg({
				customClass: 'bt-message-error-html',
				dangerouslyUseHTMLString: true,
				message: data.msg || msg,
				type: 'error',
				duration: 0,
				showClose: true,
			}) // 提示错误信息
		}
		isRefreshSSL.value = true
		isRefreshCertificateList.value = true
		return status
	} catch (error) {
		console.log(error)
		return false
	}
}

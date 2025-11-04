import { useDataHandle, useDialog } from '@/hooks/tools'
import { useMessage } from '@/hooks/tools'
import { useConfirm } from '@hooks/tools'
import { delRenewalTask, downloadCert } from '@/api/ssl'
import { npsSurveyV2Dialog } from '@/public'
import { getVerifyResult, reissueCertOrder, renewalCert } from '@api/site'
import { useSiteSSLStore } from '@site/public/ssl-arrange/useStore'
import { isObject } from '@/utils'
import { busCertPayDialog } from '@/views/site/public/ssl-arrange/useController'
import { useCertificateStore } from '@ssl/views/certificate-manger/useStore'
import { alarmDialog } from '@/views/ssl/useMethod'
import { CertificateTypeValue } from '@/types/ssl'

const { orderInfo, certVerifyInfo } = useSiteSSLStore()

const Message = useMessage()

const { activeTabs, sslIsRefresh, testIsRefresh, encryptIsRefresh, otherIsRefresh } = storeToRefs(useCertificateStore())
/**
 * @description 设置自动续签
 */
export const autoRenewDialog = (data: any) =>
	useDialog({
		isAsync: true,
		title: `【${data.title}】自动续签配置`,
		area: 50,
		compData: data,
		component: () => import('@ssl/views/certificate-manger/auto-renewal/index.vue'),
		showFooter: true,
		confirmText: '保存配置',
		onCancel: data.cancel,
	})

/**
 * @description: 删除自动续签
 * @param {any} row
 * @return {void}
 **/
export const delAutoRenew = async (row: any): Promise<void> => {
	let load
	let crontab_id = row.crontab_id
	try {
		row.crontab_id = -1
		await useConfirm({
			title: `删除【${row.title}】自动续签`,
			content: '删除该证书自动续签，是否继续操作？',
			icon: 'warning',
			width: 45,
		})
		load = Message.load('正在删除证书自动续签，请稍候...')
		const ress = await delRenewalTask({
			crontab_id,
		})
		Message.request(ress)
		if (ress.status) {
			const refreshMap = {
				ssl: () => (sslIsRefresh.value = true),
				test: () => (testIsRefresh.value = true),
				encrypt: () => (encryptIsRefresh.value = true),
				other: () => (otherIsRefresh.value = true),
			} as const
			refreshMap[activeTabs.value as keyof typeof refreshMap]?.()
		}
	} catch (error) {
		if (error) {
			nextTick(() => {
				row.crontab_id = crontab_id
			})
		}
	} finally {
		load && load.close()
	}
}

/**
 * @description 完善商业证书资料
 * @param data
 * @returns
 */
export const busCertVerifyInfoDialog = (row: any) => {
	orderInfo.value = row
	useDialog({
		isAsync: true,
		title: '完善商业证书资料',
		area: 64,
		component: () => import('@ssl/views/certificate-manger/profile-completion/index.vue'),
		compData: {
			orderInfo: row,
			refreshEvent: () => {
				const refreshMap = {
					ssl: () => (sslIsRefresh.value = true),
					test: () => (testIsRefresh.value = true),
					encrypt: () => (encryptIsRefresh.value = true),
					other: () => (otherIsRefresh.value = true),
				} as const
				refreshMap[activeTabs.value as keyof typeof refreshMap]?.()
			},
		},
	})
}

/**
 * @description 验证商用证书
 */
export const verifyBusCert = async (oid: number, certType: number, pid: number) => {
	try {
		const res: AnyObject = await useDataHandle({
			loading: '正在验证商用证书，请稍后...',
			request: getVerifyResult({ oid, cert_ssl_type: certType, pid }),
		})
		if (!res.status) {
			Message.request(res)
			return { status: false, msg: '验证商用证书失败' }
		}
		// 返回证书验证信息
		return {
			data: {
				oid,
				// data: res,
				...res.data,
				isCNAME: res.data.data.dcvList[0].dcvMethod.indexOf('CNAME_') > -1, // 是否DNS验证
			},
			status: true,
			msg: '验证商用证书成功',
		}
	} catch (error) {
		console.log(error)
		return { status: false, msg: '验证商用证书失败' }
	}
}

/**
 * @description 验证证书
 * @param data
 * @returns
 */
export const busCertVerifyWayDialog = (info: AnyObject) => {
	certVerifyInfo.value = info
	return useDialog({
		title: '验证域名-' + (info.isCNAME ? 'DNS验证' : '文件验证'),
		area: 64,
		component: () => import('@ssl/views/certificate-manger/domain-validation/index.vue'),
		compData: info,
	})
}

/**
 * @description 验证域名
 * @param oid 域名订单id
 */
export const certVerifyWay = async (oid: number, certType: number, pid: number) => {
	const { data: certVerifyInfo, status }: any = await verifyBusCert(oid, certType, pid)
	// 验证证书方式
	if (status) busCertVerifyWayDialog({ ...certVerifyInfo, cert_ssl_type: certType, pid })
}

/**
 * @description 续签商业证书
 */
export const renewalBusCert = async (oid: number) => {
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
	const refreshMap = {
		ssl: () => (sslIsRefresh.value = true),
		test: () => (testIsRefresh.value = true),
		encrypt: () => (encryptIsRefresh.value = true),
		other: () => (otherIsRefresh.value = true),
	} as const
	refreshMap[activeTabs.value as keyof typeof refreshMap]?.()
}

/**
 * @description 续签本地证书
 */
export const renewalLocalCert = async (row: any) => {
	try {
		const progress: any = await letsEncryptProgress()
		const { data } = await renewalCert({ index: row.index })
		// 申请信息错误 - 直接返回
		if (data.status === false && data.hasOwnProperty('err') && isObject(data.err)) {
			//  以下为详情错误提示
			let err_info = '',
				err_title = data.msg
			if (data.err?.challenges === undefined) {
				err_info += `
				<p><span>响应状态：</span>${data.err.status}</p>
				<p><span>错误类型：</span>${data.err.type}</p>
				<p><span>错误来源：</span><a class="bt-link" href='https://letsencrypt.org/' rel="noreferrer noopener">Let's Encrypt官网</a></p>
				<div class="flex flex-col">
					错误代码：
					<pre class="!text-white !bg-darkPrimary !inline-block !ml-[4px]">
						${data.err.detail}
					</pre>
				</div>`
			} else {
				if (!data.err?.challenges[1] && data.err?.challenges[0]) {
					data.err.challenges[1] = data.err.challenges[0]
				}

				if (data.err.status === 'invalid') {
					const identifierValue = data.err.identifier.value
					const challenge = data.err.challenges[1]
					const errorDetail = challenge?.error.detail

					err_info += `
						<p><span>验证域名：</span>${identifierValue}</p>
					`
					const check_url = `http://${identifierValue}/.well-known/acme-challenge/${data.err?.challenges[0].token}`
					err_info += `
						<p><span>验证URL：</span><a class="bt-link" href='${check_url}' target='_blank' rel="noreferrer noopener">点击查看</a></p>
						<p><span>验证内容：</span>${data.err?.challenges[0].token}</p>
						<div class="flex flex-col">
							错误代码：
							<pre class="!text-white !bg-darkPrimary !inline-block !ml-[4px]">
								${data.err?.challenges[0].error.detail}
							</pre>
						</div>
					`

					err_info += "<p><span>验证结果：</span> <a style='color:red;'>验证失败</a></p>"
				}
			}
			Message.msg({
				customClass: 'bt-message-error-html',
				dangerouslyUseHTMLString: true,
				icon: 'x',
				message: `
					<div class="flex items-center justify-center mt-[.8rem] mb-2rem">
						<i class="svgtofont-el-circle-close-filled mr-[.8rem] text-[var(--el-color-error-light-8)] !text-iconLarge"></i>
						<a style="color: var(--el-color-danger); font-size: var(--el-font-size-medium)">
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
			// 关闭进度窗口
			progress._props.onCancel()
			return
		}
		Message.msg({
			dangerouslyUseHTMLString: true,
			message: data.msg,
			type: data.status ? 'success' : 'error',
			duration: data.status ? 2000 : 0,
			showClose: !data.status,
		}) // 提示错误信息
		if (data.status) {
			const refreshMap = {
				ssl: () => (sslIsRefresh.value = true),
				test: () => (testIsRefresh.value = true),
				encrypt: () => (encryptIsRefresh.value = true),
				other: () => (otherIsRefresh.value = true),
			} as const
			refreshMap[activeTabs.value as keyof typeof refreshMap]?.()
		}
		// 关闭进度窗口
		progress._props.onCancel()
	} catch (error) {
		console.error(error)
	}
}

/**
 * @description Let's Encrypt申请证书进度
 */
export const letsEncryptProgress = () =>
	useDialog({
		isAsync: true,
		area: [50, 25],
		showFooter: false,
		component: () => import('@ssl/views/certificate-manger/certificate-request-notification/index.vue'),
	})

export const openNps = () => {
	npsSurveyV2Dialog({
		title: 'SSL证书需求反馈收集',
		type: 28,
		isNoRate: true,
		softName: '1',
		isCard: false,
		id: 993,
	})
}

/**
 * @description: 部署
 * @param {any} row
 * @return {void}
 **/
export const deploy = (row: any): void => {
	useDialog({
		isAsync: true,
		title: `【${row.title}】部署证书`,
		area: 45,
		component: () => import('@ssl/views/certificate-manger/certificate-deployment/index.vue'),
		compData: {
			row,
		},
		showFooter: true,
	})
}

/**
 * @description: 下载证书
 * @param {any} row
 * @return {void}
 **/
export const download = async (row: any): Promise<void> => {
	if (row.type === '1') {
		window.open(`/ssl?action=download_cert&oid=${row.oid}`, '_blank', 'noopener,noreferrer')
	} else if (row.type === '3') {
		let param = {
			ssl_id: row.id,
			ssl_hash: row.hash,
			index: row.index,
		}
		if (!row.order_status) {
			delete param.index
		} else {
			delete param.ssl_id
			delete param.ssl_hash
		}
		const ress = await downloadCert(param)
		if (ress.status) {
			window.open(ress.msg, '_blank', 'noopener,noreferrer')
		} else {
			Message.error(ress.msg)
		}
	}
}

// 本地证书校验域名弹窗
export const localVerifyDomain = (row: any) =>
	useDialog({
		isAsync: true,
		title: `手动${row.auth_type === 'dns' ? '解析TXT记录' : '创建验证文件'}`,
		area: 70,
		component: () => import('@ssl/views/certificate-manger/certificate-validation/certificate/index.vue'),
		compData: {
			row,
		},
		showFooter: false,
	})

// 校验域名弹窗
export const verifyDomainDialog = (row: any) =>
	useDialog({
		isAsync: true,
		title: `【${row.title}】验证域名`,
		area: 45,
		component: () => import('@ssl/views/certificate-manger/certificate-validation/domain/index.vue'),
		compData: {
			row,
		},
		showFooter: true,
	})

/**
 * @description: 验证域名
 * @param {any} row
 * @return {void}
 **/
export const verifyDomain = (row: any): void => {
	if (row.type === '3') {
		localVerifyDomain(row)
		return
	}
	verifyDomainDialog(row)
}

// 上传证书弹窗
export const uploadCertificateDialog = () =>
	useDialog({
		isAsync: true,
		title: `上传证书`,
		area: 80,
		component: () => import('@ssl/views/certificate-manger/upload-certificate/index.vue'),
		showFooter: true,
	})

/**
 * 证书类型枚举
 */
export const CertificateType = {
	OTHER: 'other', // 其他证书
	TEST: 'test', // 测试证书
	SSL: 'ssl', // SSL证书
	ENCRYPT: 'encrypt', // 加密证书
} as const

/**
 * 证书告警验证规则配置
 */
const CERTIFICATE_ALARM_RULES: Record<
	CertificateTypeValue,
	{
		validate: (cert: any) => boolean
		errorMessage: string
		warningMessage: (invalidCount: number, validCount: number) => string
	}
> = {
	[CertificateType.OTHER]: {
		validate: (cert: any) => cert.endDay > 0,
		errorMessage: '选择的证书中没有可设置告警的证书！只有未过期的证书才能设置告警。',
		warningMessage: (invalidCount: number, validCount: number) => `已过滤掉 ${invalidCount} 个已过期的证书，只对 ${validCount} 个未过期的证书设置告警。`,
	},

	[CertificateType.TEST]: {
		validate: (cert: any) => cert.stateCode === 'COMPLETED' && cert.authDomain !== '' && cert.endDay > 0,
		errorMessage: '选择的证书中没有可设置告警的证书！只有订单完成、有认证域名且未过期的证书才能设置告警。',
		warningMessage: (invalidCount: number, validCount: number) => `已过滤掉 ${invalidCount} 个不符合条件的证书，只对 ${validCount} 个符合条件的证书设置告警。`,
	},

	[CertificateType.SSL]: {
		validate: (cert: any) => cert.endDay > 0,
		errorMessage: '选择的证书中没有可设置告警的证书！只有未过期的证书才能设置告警。',
		warningMessage: (invalidCount: number, validCount: number) => `已过滤掉 ${invalidCount} 个已过期的证书，只对 ${validCount} 个未过期的证书设置告警。`,
	},

	[CertificateType.ENCRYPT]: {
		validate: (cert: any) => cert.order_status === 'valid',
		errorMessage: '选择的证书中没有可设置告警的证书！只有订单状态为有效的证书才能设置告警。',
		warningMessage: (invalidCount: number, validCount: number) => `已过滤掉 ${invalidCount} 个订单状态无效的证书，只对 ${validCount} 个有效证书设置告警。`,
	},
}

/**
 * 检查单个证书是否可以设置告警
 * @param certificate 证书对象
 * @param certificateType 证书类型
 * @returns 是否可以设置告警
 */
export const canSetCertificateAlarm = (certificate: any, certificateType: CertificateTypeValue): boolean => {
	const rule = CERTIFICATE_ALARM_RULES[certificateType]
	return rule ? rule.validate(certificate) : false
}

/**
 * 处理批量设置证书告警
 * @param certificates 证书列表
 * @param certificateType 证书类型
 * @returns 是否成功处理
 */
export const handleBatchCertificateAlarmSetting = (certificates: any[], certificateType: CertificateTypeValue): boolean => {
	const rule = CERTIFICATE_ALARM_RULES[certificateType]

	if (!rule) {
		Message.error(`不支持的证书类型: ${certificateType}`)
		return false
	}

	// 过滤出可以设置告警的证书
	const validCertificates = certificates.filter(rule.validate)
	const validCount = validCertificates.length
	const invalidCount = certificates.length - validCount

	// 没有可设置告警的证书
	if (validCount === 0) {
		Message.error(rule.errorMessage)
		return false
	}

	// 有部分证书不符合条件，显示警告
	if (invalidCount > 0) {
		Message.warn(rule.warningMessage(invalidCount, validCount))
	}

	// 打开告警设置弹窗
	alarmDialog({
		title: '证书',
		data: validCertificates,
		cancel: () => {},
		isMulti: true,
	})

	return true
}

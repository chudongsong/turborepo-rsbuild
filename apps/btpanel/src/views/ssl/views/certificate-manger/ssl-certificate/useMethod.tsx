import { addCertGroup, batchDownloadCert, delCertGroup, getCertGroup } from '@/api/ssl'
import { TableColumnProps } from '@/components/data/bt-table/types'
import { TableBatchDialogProps, TableBatchEventProps, TableBatchNextAllProps, TableBatchOptionsProps } from '@/components/extension/bt-table-batch/types'
import { useTableCategory } from '@/hooks/business'
import { Message, useDataHandle, useDialog } from '@/hooks/tools'
import { useBatchStatus } from '@/hooks/tools/table/column'
import { alarmDialog, resultDialog, setClassDialog } from '@/views/ssl/useMethod'
import { getSslStore } from '@ssl/useStore'
import { CertificateType, handleBatchCertificateAlarmSetting } from '../useMethod'
import { BusinessTableProps, BusCertBuyInfoValue } from '@/types/site'
import { onlineServiceDialog, bindUserDialog } from '@/public'
import { useGlobalStore } from '@/store/global'
import { busCertVerifyInfoDialog, certVerifyWay, deploy as deploySsl, download as downloadSsl, renewalBusCert } from '../useMethod'

import BtDivider from '@/components/other/bt-divider'
import { ElPopover, ElButton } from 'element-plus'
import BtLink from '@/components/base/bt-link'

const {
	refs: { tabActive, typeList },
	router,
} = getSslStore()
const { payment } = useGlobalStore()
const { bindUser } = toRefs(payment.value)

export const cutTabs = (name: any) => {
	tabActive.value = name
	router.push({ name })
}

export const tableBtnGroup: any = [
	{
		content: '申请证书',
		dropdownClass: 'bg-white',
		splitButton: true,
		active: true,
		event: () => {
			if (!bindUser.value) {
				bindUserDialog()
				return false
			}
			busCertProductDialog()
		},
	},
]

export const certificateList = shallowRef<any>([]) // 证书列表

export const useCategory = useTableCategory({
	key: 'type',
	name: '证书分组',
	options: () => [{ label: '全部分组', value: 'all' }],
	event: {
		get: async () => {
			let classList: any[] = []
			await useDataHandle({
				request: getCertGroup(),
				data: Array,
				success: (data: any[]) => {
					classList = [
						{ label: '全部分组', value: 'all' },
						...data.map((item: AnyObject) => ({
							label: item.name,
							value: String(item.group_id),
						})),
					]
				},
			})
			typeList.value = classList as never
			return classList
		},
		add: (params: any) => {
			return addCertGroup({
				name: params.name,
				group_id: Date.now(),
			})
		},
		delete: (params: any) => {
			return delCertGroup({
				group_id: params.id,
			})
		},
	},
	ignore: ['0'],
	field: 'name',
	showEdit: false,
})

// 删除弹窗
export const delPopup = ref<any>(false)
export const isMulti = ref<boolean>(false)
export const delData = ref<any>(null)
export const delRef = ref<any>(null)
/**
 * @description 删除事件
 * @param {string} row 选中row数据
 * @return {void} void
 **/
export const delEvent = (row: any, isMult: boolean): void => {
	isMulti.value = isMult
	delData.value = row
	delPopup.value = true
}

export const handleCancelDel = () => {
	delPopup.value = false
}

/**
 * @description 批量处理事件
 * @param {TableBatchDialogProps} batchConfirm 选中处理事件
 * @param {TableBatchNextAllProps} nextAll 选中处理事件
 * @param {Ref<FtpTableRowProps[]>} selectList 选中的数据
 * @param {TableBatchOptionsProps} options 选中的配置
 * @returns {Promise<void>} void
 */
export const useBatchEventHandle: TableBatchEventProps = async (batchConfirm: TableBatchDialogProps, nextAll: TableBatchNextAllProps, selectList: Ref<any[]>, options: TableBatchOptionsProps): Promise<void> => {
	const { label, value } = options
	const template: Map<string, string> = new Map([
		['download', '批量下载证书'],
		['delete', '批量删除证书'],
	])
	let sslIndexList: any = [],
		sslHashList: any = []
	selectList.value.forEach((item: any) => {
		if (item.hash !== undefined && item.hash !== null) {
			sslHashList.push(item.hash)
		} else if (item.index !== undefined && item.index !== null) {
			sslIndexList.push(item.index)
		}
	})
	const requestHandle = async () => {
		switch (value) {
			case 'delete':
				return await delEvent(selectList.value, true)
		}
	}
	await useDialog({
		title: `批量${label}证书`,
		area: 46,
		component: () => import('@components/extension/bt-result/index.vue'),
		compData: {
			resultTitle: `批量${label}证书`,
			resultData: selectList.value,
			resultColumn: [{ label: '名称', prop: 'title' }, useBatchStatus()] as TableColumnProps[],
			autoTitle: `批量${label}证书`,
		},
		showFooter: true,
		onConfirm: async () => {
			await requestHandle()
		},
	})
}

export const batchCertificateOptions = [
	{
		label: '批量分组',
		value: 'group',
		event: (batchConfirm, nextAll, selectedList, options) => setClassDialog(selectedList.value, 'certificate'),
	},
	{
		label: '批量设置告警',
		value: 'alarm',
		event: (batchConfirm, nextAll, selectedList, options) => {
			handleBatchCertificateAlarmSetting(selectedList.value, CertificateType.SSL)
		},
	},
	{
		label: '批量下载',
		value: 'download',
		event: async (batchConfirm, nextAll, selectedList, options, clearSelection) => {
			await batchDownload(selectedList.value)
			clearSelection && clearSelection()
		},
	},
	{
		label: '删除',
		value: 'delete',
		event: useBatchEventHandle,
	},
] as TableBatchOptionsProps[]

/**
 * @description: 批量下载证书
 * @param {any} rowList
 * @return {Promise<void>}
 **/
export const batchDownload = async (rowList: any): Promise<void> => {
	let loadingMessage = null
	const downloadHashes: any = []
	const resultArray: { name: string; status: boolean; custom?: boolean }[] = []

	const handleTypeThree = (item: any) => {
		downloadHashes.push(item)
	}

	try {
		loadingMessage = Message.load('正在批量下载证书，请稍候...')

		rowList.forEach((item: any) => {
			handleTypeThree(item)
		})

		if (downloadHashes.length > 0) {
			let filteredOids = downloadHashes.filter((item: any) => item.oid !== undefined && item.oid !== null && item.download_status)
			let oid = filteredOids.map((item: any) => item.oid).join(',')
			let params = {
				oid,
			}
			if (!oid) {
				loadingMessage.close && loadingMessage.close()
				Message.error('选择的证书中没有可下载的证书！')
				return
			}
			const { data, status } = await batchDownloadCert(params)

			if (status) {
				if (data.url) window.open(data.url, '_blank', 'noopener,noreferrer')
				if (data.finish_list?.length > 0) {
					data.finish_list.forEach((item: any) => {
						const info = JSON.parse(item.cert.info)
						resultArray.push({
							name: rowList.find((row: any) => row.id == info.issuer).domainName.join(','), // 证书名称
							oid: info.issuer,
							status: item.status,
						})
					})
				}
			}
		}
		const resultColumn: any = [
			{ label: '名称', prop: 'name' },
			{ label: '订单编号', prop: 'oid' },
			{
				label: '结果',
				render: (row: any) => {
					let message = ''
					let className = ''

					if (row.status) {
						message = '下载成功'
						className = 'text-primary'
					} else {
						message = '下载失败'
						className = 'text-danger'
					}

					return h('span', { class: className }, message)
				},
			},
		]

		resultDialog({
			resultData: resultArray,
			resultTitle: '下载',
			resultColumn,
		})
	} catch (error) {
		console.error(error)
	} finally {
		if (loadingMessage) {
			loadingMessage.close()
		}
	}
}

/**
 * @description 商业证书产品弹窗
 * @returns
 */
export const busCertProductDialog = () => {
	useDialog({
		isAsync: true,
		title: '购买商业证书',
		area: [79],
		component: () => import('@/views/ssl/views/certificate-manger/ssl-certificate/commercial-ssl-certificate/index.vue'),
	})
}

/**
 * @description 获取宝塔证书SSL状态
 */
export const getBtSslStatus = (row: BusinessTableProps) => {
	// -1=已取消 0=刚生成 1=待审核 2=正在提交CA 3=待域名验证  4=签发中  5=已签发  6=取消确认 7=待续费 8=待吊销确认 9=待重颁发 10=重颁发中 11=吊销中 12=已吊销
	const troub = (
		<ElPopover placement="bottom-end" width="400" popper-class="white-theme" trigger="click">
			{{
				default: () => (
					<div class="bus-ssl-popover">
						<div class="ssl-popover-item">
							<span class="ssl-popover-title">自行排查</span>
							<p>以图文的形式，一步步教您验证并部署商业SSL</p>
							<BtLink href="https://www.bt.cn/bbs/thread-85379-1-1.html" target="_blank">
								如何验证商用证书?
							</BtLink>
						</div>
						<div class="ssl-popover-item">
							<span class="ssl-popover-title">购买人工</span>
							<p>不会部署?人工客服帮你全程部署，不成功可退款</p>
							<ElButton size="small" type="primary" onClick={() => onlineServiceDialog()}>
								购买人工
							</ElButton>
						</div>
					</div>
				),
				reference: () => <span class="bt-link">排查方法?</span>,
			}}
		</ElPopover>
	)
	const status = row.orderStatus

	const btnGround = []
	switch (Number(status)) {
		case -1:
			btnGround.push(<span class="text-danger">已取消</span>)
			break
		case 0:
			if (!row.install) btnGround.push(troub)
			btnGround.push(<span class="text-warning">待完善资料</span>)
			break
		case 1:
			btnGround.push(<span class="text-warning">待审核</span>)
			break
		case 2:
			btnGround.push(<span class="text-warning">正在提交CA</span>)
			break
		case 3:
			btnGround.push(<span class="text-warning">待域名验证</span>)
			break
		case 4:
			btnGround.push(<span class="text-warning">签发中</span>)
			break
		case 5:
			btnGround.push(<span class="text-success">已签发</span>)
			break
		case 6:
			btnGround.push(<span class="text-warning">取消确认</span>)
			break
		case 7:
			btnGround.push(<span class="text-warning">待续费</span>)
			break
		case 8:
			btnGround.push(<span class="text-warning">待吊销确认</span>)
			break
		case 9:
			btnGround.push(<span class="text-warning">待重颁发</span>)
			break
		case 10:
			btnGround.push(<span class="text-warning">重颁发中</span>)
			break
		case 11:
			btnGround.push(<span class="text-warning">吊销中</span>)
			break
		case 12:
			btnGround.push(<span class="text-danger">已吊销</span>)
			break
		default:
			btnGround.push(<span class="text-warning">待完善资料</span>)
	}
	const newBtnGround: JSX.Element[] = []
	btnGround.map((item, index) => {
		newBtnGround.push(item)
		index < btnGround.length - 1 ? newBtnGround.push(<BtDivider />) : ''
	})
	return newBtnGround
}

/**
 * @description 打开详情
 */
export const openDetailView = (row: BusinessTableProps) => {
	useDialog({
		title: '多年期证书详情',
		area: 52,
		compData: row,
		component: () => import('@site/public/ssl-arrange/business-cert/mulit-cert-detail.vue'),
	})
}

/**
 * @description 获取宝塔证书SSL操作
 */
export const getBtSslOperate = (row: BusinessTableProps) => {
	// 0 完善资料  5 下载证书  3、11  验证
	// 按钮渲染
	const spanRender = (text: string, onClick: AnyFunction) => (
		<span class="bt-link" onClick={onClick}>
			{text}
		</span>
	)
	const artificial = spanRender('人工服务', () => onlineServiceDialog())
	const detail = spanRender('详情', () => openDetailView(row))
	const download = spanRender('下载', () => downloadSsl(row))
	const deploy = spanRender('部署', () => deploySsl(row))
	const verify = spanRender('验证', () => certVerifyWay(row.oid, row.cert_ssl_type, row.pid))
	const renewal = spanRender('续签', () => renewalBusCert(row.oid))
	const improve = spanRender('完善资料', () => busCertVerifyInfoDialog(row))
	const status = row.orderStatus
	const btnGround = []
	if (row.years && row.years > 1 && [5, 15].includes(Number(status))) btnGround.push(detail)
	switch (Number(status)) {
		case 0:
			if (row.install) btnGround.push(artificial)
			btnGround.push(improve)
			break
		case 3:
			if (row.install) btnGround.push(artificial)
			btnGround.push(verify)
			break
		case 5:
			btnGround.push(deploy)
			btnGround.push(download)
			break
		case 7:
			btnGround.push(renewal)
			break
		case 11:
			if (row.install) btnGround.push(artificial)
			btnGround.push(verify)
			break
		default:
			break
	}
	const newBtnGround: JSX.Element[] = []
	btnGround.map((item, index) => {
		newBtnGround.push(item)
		index < btnGround.length - 1 ? newBtnGround.push(<BtDivider />) : ''
	})
	return newBtnGround
}

import { editAgainVerify } from '@/api/site'
import BtDivider from '@/components/other/bt-divider'
import { useDataHandle } from '@/hooks/tools'
import { copyText } from '@/utils'
import { busCertVerifyWayDialog } from '../useController'
import { SITE_SSL_STORE, useSiteSSLStore } from '../useStore'
import { resultsVerify, urlTableData } from './useCertController'

const { certVerifyInfo } = useSiteSSLStore()
const { verifyBusCertEvent } = SITE_SSL_STORE()

export const onConfirm = async (param: any) => {
	try {
		const params = {
			oid: certVerifyInfo.value.oid,
			dcvMethod: param.value.dcvMethod,
			pid: certVerifyInfo.value.pid,
			cert_ssl_type: certVerifyInfo.value.certType,
		}
		const res: AnyObject = await useDataHandle({
			loading: '正在更改验证方式，请稍后...',
			request: editAgainVerify(params),
			message: true,
		})
		if (res?.status) {
			certVerifyWay(params.oid, params.cert_ssl_type, params.pid)
		}
		return res.status
	} catch (error) {
		console.log(error)
		return false
	}
}
/**
 * @description 验证域名
 * @param oid 域名订单id
 */
const certVerifyWay = async (oid: number, certType: number, pid: number) => {
	const { data: info } = await verifyBusCertEvent(oid, certType, pid)
	// 验证证书方式弹窗
	if (info) busCertVerifyWayDialog({ ...info, cert_ssl_type: certType, certType, pid })
}

export const tableColumn = ref([
	{ label: 'URL', prop: 'url', showOverflowTooltip: true },
	{
		label: '验证结果',
		prop: 'status',
		width: 100,
		render: (row: any) => {
			return row.status == 1 ? (
				<span class="text-primary">通过</span>
			) : (
				<span class="text-[red] flex item-center">
					<span>失败[{row.status}]</span>
					<a href="https://www.bt.cn/bbs/thread-56802-1-1.html" target="_blank" class="svgtofont-el-question-filled text-warning ml-[2px]"></a>
				</span>
			)
		},
	},
	{
		label: '操作',
		align: 'right',
		width: 160,
		render: (row: any, index: number) => {
			return (
				<div class="flex items-center justify-end">
					<span class="cursor-pointer bt-link" onClick={() => copyText({ value: row.url })}>
						复制
					</span>
					<BtDivider />
					<a class="bt-link" href={row.url} target="_blank">
						打开
					</a>
					<BtDivider />
					<span class="cursor-pointer bt-link" onClick={() => resultsVerify(row, index)}>
						重新验证
					</span>
				</div>
			)
		},
	},
])

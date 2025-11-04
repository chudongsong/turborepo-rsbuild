import { batchDownloadCert, batchRemoveCloudCert, getExceptionLog } from '@/api/ssl'
import { TableColumnProps } from '@/components/data/bt-table/types'
import { TableBatchDialogProps, TableBatchEventProps, TableBatchNextAllProps, TableBatchOptionsProps } from '@/components/extension/bt-table-batch/types'
import { useBatchStatus } from '@/hooks/tools/table/column'
import { useCertificateStore } from '../useStore'
import { resultDialog } from '@/views/ssl/useMethod'
import { useDataHandle, useDialog } from '@/hooks/tools'
import { isArray } from '@/utils'

const { encryptIsRefresh } = storeToRefs(useCertificateStore())

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
			case 'download':
				return await batchDownloadCert({ ssl_hash: sslHashList.join(','), index: sslIndexList.join(',') })
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
			// 删除时，直接返回，调用子组件的删除方法
			if (value === 'delete') {
				await requestHandle()
				return
			}
			useDataHandle({
				request: await requestHandle(),
				loading: `正在批量${label}证书`,
				success(rdata) {
					const { data, status } = rdata
					if (status) {
						let resultData: any = [],
							resultColumn: any = []
						if (value === 'download') {
							if (data.url) window.open(data.url, '_blank', 'noopener,noreferrer')
							if (data.finish_list?.length > 0) {
								data.finish_list.forEach((item: any) => {
									const info = JSON.parse(item.cert.info)
									resultData.push({
										name: info.issuer,
										status: item.status,
									})
								})
							}
							resultColumn = [
								{
									label: '名称',
									prop: 'name',
								},
								{
									label: '结果',
									render: (row: any) => {
										let message = ''
										let className = ''

										if (row.status) {
											className = 'text-primary'
											message = '下载成功'
										} else {
											className = 'text-danger'
											message = '下载失败'
										}
										return h('span', { class: className }, message)
									},
								},
							]
						} else {
							if (isArray(data.finish_list)) {
								data.finish_list.forEach((item: any) => {
									resultData.push({
										name: item.name,
										status: item.status,
										msg: item.status ? '删除成功' : item.msg,
									})
								})
								resultColumn = [
									{
										label: '名称',
										prop: 'name',
									},
									{
										label: '结果',
										render: (row: any) => {
											let message = row.msg
											let className = ''

											if (row.status) {
												className = 'text-primary'
											} else {
												className = 'text-danger'
											}
											return h('span', { class: className }, message)
										},
									},
								]
								encryptIsRefresh.value = true
							}
						}
						resultDialog({
							resultTitle: `批量${label}证书`,
							resultData: resultData,
							resultColumn: resultColumn,
						})
					}
				},
			})
		},
	})
}

/**
 * @description 异常日志
 * @param {any} row 选中的数据
 * @returns {void} void
 */
export const exceptionLog = async (row: any) => {
	useDataHandle({
		request: await getExceptionLog(row.crontab_id),
		loading: '正在获取异常日志',
		success(rdata) {
			const { msg } = rdata
			useDialog({
				title: '续签异常/失败日志',
				area: 66,
				component: () => import('@/views/ssl/views/certificate-manger/encrypt-certificate/exception-log.vue'),
				compData: {
					reason: row.crontab_data.error_msg,
					logContent: msg || '暂无异常日志',
				},
			})
		},
	})
}

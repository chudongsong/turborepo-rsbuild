import { batchDownloadCert, batchRemoveCloudCert, removeCloudCert, updateCertFromCloud, uploadCertToCloud } from '@/api/ssl'
import { TableColumnProps } from '@/components/data/bt-table/types'
import { TableBatchDialogProps, TableBatchEventProps, TableBatchNextAllProps, TableBatchOptionsProps } from '@/components/extension/bt-table-batch/types'
import { Message, useDataHandle, useDialog } from '@/hooks/tools'
import { useBatchStatus } from '@/hooks/tools/table/column'
import { isArray } from '@/utils'
import { resultDialog } from '@/views/ssl/useMethod'
import { useCertificateStore } from '@ssl/views/certificate-manger/useStore'

const { otherIsRefresh } = storeToRefs(useCertificateStore())

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

export const useBatchEventHandle: TableBatchEventProps = async (batchConfirm: TableBatchDialogProps, nextAll: TableBatchNextAllProps, selectList: Ref<any[]>, options: TableBatchOptionsProps): Promise<void> => {
	const { label, value } = options
	let sslIndexList: any = [],
		sslHashList: any = [],
		sslOidList: any = []
	selectList.value.forEach((item: any) => {
		if (item.hash !== undefined && item.hash !== null) {
			sslHashList.push(item.hash)
		} else if (item.index !== undefined && item.index !== null) {
			sslIndexList.push(item.index)
		} else if (item.oid !== undefined && item.oid !== null) {
			sslOidList.push(item.oid)
		}
	})
	const requestHandle = async () => {
		switch (value) {
			case 'download':
				return await batchDownloadCert({ ssl_hash: sslHashList.join(','), index: sslIndexList.join(','), oid: sslOidList.join(',') })
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
			let load
			load = Message.load(`正在批量${label}证书`)
			useDataHandle({
				request: await requestHandle(),
				success(rdata) {
					const { data, status } = rdata
					if (status) {
						let resultData: any = [],
							resultColumn: any = []
						if (value === 'download') {
							if (data.url) window.open(data.url, '_blank', 'noopener,noreferrer')
							if (isArray(data.finish_list)) {
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
								otherIsRefresh.value = true
							}
						}
						resultDialog({
							resultTitle: `${label}证书`,
							resultData: resultData,
							resultColumn: resultColumn,
						})
						load && load.close()
					}
				},
			})
		},
	})
}

export const uploadCloudCert = async (row: any) => {
	let load
	try {
		load = Message.load('正在上传云端证书，请稍候...')
		await uploadCertToCloud({
			ssl_id: row.id,
			ssl_hash: row.hash,
		})
		otherIsRefresh.value = true
		load && load.close()
	} catch (error) {
		console.log(error)
	} finally {
		load && load.close()
	}
}

export const updateCertFromCloudData = () => {
	useDataHandle({
		request: updateCertFromCloud(),
		loading: '正在从云端同步证书，请稍后...',
		message: true,
		success: rdata => {
			if (rdata.status) {
				otherIsRefresh.value = true
			}
		},
	})
}

export const deleteCloudCert = async (row: any) => {
	useDataHandle({
		loading: '正在从云端删除证书，请稍后...',
		message: true,
		request: await removeCloudCert({
			ssl_id: row.id,
			ssl_hash: row.hash,
			local: false,
			cloud: true,
		}),
		success: rdata => {
			if (rdata.status) {
				otherIsRefresh.value = true
			}
		},
	})
}

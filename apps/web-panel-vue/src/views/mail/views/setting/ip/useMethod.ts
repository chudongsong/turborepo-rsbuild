import { getIpList, getBindDomainList, getIpAddressList, addIpTagApi, delIpTagApi, editIpTagApi } from '@/api/mail'
import { TableColumnProps } from '@/components/data/bt-table/types'
import { TableBatchDialogProps, TableBatchEventProps, TableBatchNextAllProps, TableBatchOptionsProps } from '@/components/extension/bt-table-batch/types'
import { useBatch, useConfirm, useDataHandle, useDialog } from '@/hooks/tools'
import { useBatchStatus } from '@/hooks/tools/table/column'
import { openResultView } from '@/public'
import { isArray } from '@/utils'
import { useModalData } from '@/views/mail/useMethod'

export const isRefresh = ref(false)

export const formModal = useModalData('添加IP标签', {
	isEdit: false,
	row: undefined,
	onRefresh: async () => {
		isRefresh.value = true
	},
})

export const formData = ref({
	tag: '',
	ip: '',
	syslog: '',
	helo: '',
	ipv: 4,
	binds: '',
})

interface IpAddressItem {
	type: string
	addr: string
	public_ip: string
	netmask: string
}

export const ipAddressList = ref<Array<{ label: string; value: string; type: string }>>([])
export const bindDomainList = ref([])
export const isLoading = ref(false)

export const useBatchEventHandle: TableBatchEventProps = async (batchConfirm: TableBatchDialogProps, nextAll: TableBatchNextAllProps, selectList: Ref<any[]>, options: TableBatchOptionsProps, clear, config): Promise<void> => {
	const { label, value } = options
	const template: Map<string, string> = new Map([['delete', '批量删除已选的IP标签']])
	const requestHandle = async () => {
		const requestList: Map<string, AnyFunction> = new Map([['delete', delIpTagApi]])
		const fn = requestList.get(value)
		switch (value) {
			case 'delete':
				const delParams = selectList.value.map((item: any) => item.tag).join(',')
				if (fn) return await fn({ tags: delParams })
				break
		}
	}
	await batchConfirm({
		title: `批量${label}`,
		content: `${template.get(value) as string}，是否继续操作！`,
		column: [{ label: '标签名', prop: 'tag' }, useBatchStatus()] as TableColumnProps[], // 弹窗配置
		onConfirm: async () => {
			const res = await requestHandle()
			console.log(res, 'res')
			// 执行完毕的代码，刷新列表
			isRefresh.value = true
			// const { data, msg } = assembBatchResults(res.data)
			const data: { name: string; msg: string; status: boolean }[] = []
			if (res.status) {
				selectList.value.forEach((item: any) => {
					data.push({
						name: item.tag,
						status: true,
						msg: '删除成功',
					})
				})
			} else {
				selectList.value.forEach((item: any) => {
					data.push({
						name: item.tag,
						status: false,
						msg: '删除失败',
					})
				})
			}
			clear && clear()
			openResultView(data, { title: `${label}标签` })
		},
	})
}

export const useTableBatch = useBatch([
	{
		label: '批量删除',
		value: 'delete',
		event: useBatchEventHandle,
	},
])

export const getIpListData = async () => {
	try {
		const { data } = await getIpList()
		return {
			data: data.data || [],
			total: 0,
		}
	} catch (error) {
		return {
			data: [],
			total: 0,
		}
	}
}

export const addIpTag = async (row: any) => {
	useDialog({
		title: '添加IP标签',
		area: 50,
		component: () => import('./add/index.vue'),
		compData: {
			isEdit: false,
		},
		btn: true,
	})
}

export const getFormRequestData = async () => {
	try {
		isLoading.value = true
		const { data: ipAddressListData } = await getIpAddressList()
		// const { data: bindDomainListData } = await getBindDomainList()

		// 处理域名列表
		// if (isArray(bindDomainListData) && bindDomainListData.length > 0) {
		// 	bindDomainList.value = bindDomainListData.map((item: string) => ({ label: item, value: item }))
		// }
		if (Object.keys(ipAddressListData).length > 0) {
			const allEntries = (Object.values(ipAddressListData) as IpAddressItem[]).flatMap(item => Object.entries(item))
			ipAddressList.value = allEntries.map(([key, value]: [string, IpAddressItem]) => ({ label: `${value.public_ip}`, value: `${value.addr}`, type: value.type }))
		}
	} catch (error) {
		console.error(error)
	} finally {
		isLoading.value = false
	}
}

export const getIpAddressType = (value: string) => {
	const foundType = ipAddressList.value.find(item => item.value === value)?.type
	return foundType ? (foundType === 'IPv4' ? 4 : 6) : 4
}

export const resetFormData = () => {
	formData.value = {
		tag: '',
		ip: '',
		syslog: '',
		helo: '',
		ipv: 4,
		binds: '',
	}
}

export const addIpTagData = async (data: any) => {
	const res = (await useDataHandle({
		request: addIpTagApi(data),
		loading: '添加中...',
		message: true,
	})) as any
	if (res.status) {
		isRefresh.value = true
		return true
	}
	return false
}

export const editIpTagData = async (data: any) => {
	const res = (await useDataHandle({
		request: editIpTagApi(data),
		loading: '编辑中...',
		message: true,
	})) as any
	if (res.status) {
		isRefresh.value = true
		return true
	}
	return false
}

export const delIpTag = async (row: any) => {
	useConfirm({
		title: `删除【${row.tag}】标签`,
		content: `确定删除【${row.tag}】标签吗？`,
		onConfirm: async () => {
			try {
				await delIpTagApi({ tags: row.tag })
				isRefresh.value = true
			} catch (error) {
				console.error(error)
			}
		},
	})
}

const composeIpTagDataForEdit = (row: any) => {
	console.log(row, 'row')
	return {
		tag: row.tag,
		ip: row.ip,
		syslog: row.syslog,
		helo: row.helo,
		ipv: row.preference === 'ipv6' ? 6 : 4,
		binds: isArray(row.binds) ? row.binds : [],
	}
}

export const editIpTag = async (row: any) => {
	formData.value = composeIpTagDataForEdit(row)
	useDialog({
		title: `编辑【${row.tag}】标签`,
		area: 50,
		component: () => import('./add/index.vue'),
		compData: {
			isEdit: true,
		},
		btn: true,
	})
}

import { getCertList, getDeploySiteDomain, removeCloudCert, uploadCertToCloud, getDockerDeploySiteDomain } from '@/api/site'
import BtTable from '@/components/data/bt-table'
import { TableColumnProps } from '@/components/data/bt-table/types'
import BtRadio from '@/components/form/bt-radio'
import { Message, useConfirm, useDataHandle, useDialog } from '@/hooks/tools'
import { useCheckbox } from '@/hooks/tools/table/column'
import { isArray } from '@/utils'
import { CertFolderTableProps } from '@/views/site/types'
import { useSiteStore } from '@/views/site/useStore'
import { ElButton } from 'element-plus'
import { setCertFolderDeployEvent } from '../useController'
import { useSiteSSLStore } from '../useStore'

const { siteType, siteInfo } = useSiteStore()
const { isRefreshSSL } = useSiteSSLStore()

export const typeOptions = [
	{ label: '所有', value: 0 },
	{ label: '未过期', value: 1 },
	{ label: '即将过期', value: 2 },
	{ label: '已过期', value: 3 },
] // 证书类型列表

export const isLoading = ref<boolean>(false) // 加载状态
export const deploySiteTableRef = ref<any>() // 部署站点表格ref
export const certData = ref<any>({}) // 证书数据

export const setPopup = ref<boolean>(false) // 部署当前证书

// 部署当前证书关联数据
export const deploySSLParams = reactive({
	typeValue: '全部',
	btnText: '部署证书',
	search: '',
	data: {
		all: [] as any[],
		site: [],
	},
	siteList: [],
})

/**
 * @description 确认部署证书
 */
export const handleConfirm = async (type: string = siteType.value) => {
	if (deploySSLParams.siteList.length === 0) {
		Message.error('请选择站点')
		return
	}
	const { hash, subject } = certData.value
	await setCertFolderDeployEvent({
		hash,
		subject,
		list: deploySSLParams.siteList,
		type,
	})
	setPopup.value = false
}

/**
 * @description 删除证书
 * @param {any} data 行数据
 */
export const deleteEvent = async (data: CertFolderTableProps) => {
	await useConfirm({
		title: '删除证书',
		content: '删除后该证书将不会显示在证书夹，是否继续操作？',
		icon: 'warning-filled',
	})
	const res: AnyObject = await useDataHandle({
		loading: '正在删除证书...',
		request: removeCloudCert({
			local: data.cloud_id > 0 ? 0 : 1,
			ssl_hash: data.hash,
		}),
		message: true,
	})
	isCloudsRefresh.value = true
}

export const deployTableColumns = ref<TableColumnProps[]>([
	useCheckbox(),
	{
		label: '站点名称',
		prop: 'name',
		render: (row: any) => {
			if (row.current) {
				return row.name + '(当前站点)'
			} else {
				return row.name
			}
		},
	},
])

/**
 * @description 部署证书
 * @param {any} data 行数据
 */
export const certDeployEvent = async (data: CertFolderTableProps) => {
	let param = {},
		isRefresh = true
	if (typeof data != 'undefined') {
		param = { cert_list: JSON.stringify(data.dns) }
		isRefresh = false
		certData.value = data
	}
	const res: AnyObject = await useDataHandle({
		request: siteType.value === 'docker' ? getDockerDeploySiteDomain(param) : getDeploySiteDomain(param),
		data: { all: Array, site: Array },
	})
	deploySSLParams.data = {
		all: res.all.map((item: any) => {
			return { name: item }
		}),
		site: res.site.map((item: any) => {
			return { name: item }
		}),
	}
	if (!isRefresh) {
		setPopup.value = true
		nextTick(() => {
			// 把当前站点调整到首位，并更改名字为xxx(当前站点)
			deploySSLParams.data.all.forEach((item: any, index) => {
				if (item.name === siteInfo.value.name) {
					item.current = true
					deploySSLParams.data.all.unshift(deploySSLParams.data.all.splice(index, 1)[0])
				}
			})

			// 筛选当前站点并选中
			deploySiteTableRef.value?.toggleRowSelection(
				deploySSLParams.data.all.find((item: any) => {
					return item.name === siteInfo.value.name
				}),
				true
			)
		})
	}
}

/**
 * @description 部署证书站点列表
 */
export const handleDeploySelectionChange = (val: any) => {
	deploySSLParams.siteList = val
	if (val.length <= 0) {
		deploySSLParams.btnText = '部署证书'
	} else {
		deploySSLParams.btnText = `部署证书[已选择${val.length}项]`
	}
}

/**
 * @description 选择站点类型
 */
export const changeWebTypeEvent = (val: string) => {
	deploySSLParams.typeValue = val
}

/**
 * @description 上传云端
 * @param {any} data 行数据
 */
export const uploadCloudEvent = async (data: any) => {
	try {
		await useConfirm({
			title: '上传云端证书',
			content: '将会上传证书信息至云端进行替换，是否继续操作？',
			icon: 'warning-filled',
			type: 'calc',
		})
		const res: AnyObject = await useDataHandle({
			loading: '正在上传证书至云端...',
			request: uploadCertToCloud({ ssl_hash: data.hash }),
			message: true,
		})
		// 刷新当前
		// if (res.status) getListData();
		isRefreshSSL.value = true
	} catch (error) {
		console.log(error)
	}
}
export const isCloudsRefresh = ref<boolean>(false) // 云端证书刷新状态
export const refreshClouds = async () => {
	isCloudsRefresh.value = true
	isRefreshSSL.value = true
	Message.success('获取成功')
}

/**
 * @description 获取证书列表
 * @param isRefresh 是否刷新
 */
export const getListData = async (param: any, isRefresh: boolean = isCloudsRefresh.value) => {
	try {
		const params = {
			search_limit: param.search_limit,
			search_name: param.search,
			force_refresh: Number(isRefresh),
		}
		isCloudsRefresh.value = false // 重置刷新状态
		const { data } = await useDataHandle({
			loading: isLoading,
			request: getCertList(params),
		})
		if (!isArray(data)) Message.request(data)
		if (isRefresh) Message.success('获取成功')
		return { data: data, total: 0, other: {} }
	} catch (error) {
		console.log(error)
		return { data: [], total: 0, other: {} }
	}
}

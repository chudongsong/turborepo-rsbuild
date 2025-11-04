import { getPackageListApi, removePackageApi } from '@/api/vhost'
import { ModelType, PackageList, PageResponse } from './types'
import { isObject } from '@/utils'
import { useConfirm, useDialog, useMessage } from '@/hooks/tools'
import editPackage from './editPackage/index.vue'
import { usePackageStore } from './useStore'

const { error: $error, request: $request } = useMessage()
const { isEdit, refreshList, formData } = usePackageStore()

/**
 * @description 获取资源包列表
 */
export const getPackageList = async (param: { p: number; search: string; limit: number }) => {
	const { data } = await getPackageListApi({
		p: param.p,
		search_value: param.search,
		rows: param.limit,
	})
	if (isObject<PageResponse<PackageList>>(data)) return { data: data.list, total: data.page.count }
	return { data: [], total: 0 }
}

/**
 * @description 删除资源包
 * @param {PackageList} row 资源包数据
 */
export const removePackageEvent = async (row: PackageList) => {
	useConfirm({
		title: `删除资源包${row.package_name}`,
		content: `删除${row.package_name}资源包，是否继续？`,
		onConfirm: async () => {
			if (row.status === 1) return $error('资源包正在使用中，无法删除')
			const rdata = await removePackageApi({ package_id: row.package_id as number })
			await $request(rdata)
			refreshList()
		},
	})
}

/**
 * @description 编辑资源包
 * @param
 */
export const editPackageEvent = async (row: PackageList | boolean = false) => {
	if (row) {
		isEdit.value = true
		formData.value = switchFormData(row as PackageList, false)
	}
	useDialog({
		title: `${row ? '编辑' : '添加'}资源包`,
		area: 50,
		showFooter: true,
		component: editPackage,
	})
}

/**
 * @description 切换表单数据
 * @param {PackageList | ModelType} data 表单数据
 * @returns
 */
export const switchFormData = (data: PackageList | ModelType, isSubmit: boolean) => {
	if (isSubmit) {
		return {
			package_id: data?.package_id,
			package_name: data.package_name,
			remark: data.remark,
			disk_space_quota: data.disk_space_quota.unlimited ? 0 : data.disk_space_quota.value * 1024 * 1024,
			monthly_bandwidth_limit: data.monthly_bandwidth_limit.unlimited ? 0 : data.monthly_bandwidth_limit.value * 1024 * 1024,
			max_site_limit: data.max_site_limit.unlimited ? 0 : data.max_site_limit.value,
			php_start_children: data.php_start_children,
			php_max_children: data.php_max_children,
			max_email_account: 0,
			max_database: data.max_database.unlimited ? 0 : data.max_database.value,
		}
	} else {
		return {
			package_id: data?.package_id,
			package_name: data.package_name,
			remark: data.remark,
			disk_space_quota: { value: data.disk_space_quota ? data.disk_space_quota / 1024 / 1024 : 0, unlimited: data.disk_space_quota === 0 },
			monthly_bandwidth_limit: { value: data.monthly_bandwidth_limit ? data.monthly_bandwidth_limit / 1024 / 1024 : 0, unlimited: data.monthly_bandwidth_limit === 0 },
			max_site_limit: { value: data.max_site_limit, unlimited: data.max_site_limit === 0 },
			php_start_children: data.php_start_children,
			php_max_children: data.php_max_children,
			max_email_account: 0,
			max_database: { value: data.max_database, unlimited: data.max_database === 0 },
		}
	}
}

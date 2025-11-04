import type { ModelType, PackageList, PageResponse } from './types'

export const PACKAGE_STORE = defineStore('VHOST-PACKAGE-STORE', () => {
	// 资源包列表
	const isEdit = ref(false)

	// 表单数据
	const formData = ref<ModelType>({
		package_name: '',
		remark: '',
		disk_space_quota: { value: 0, unlimited: true },
		monthly_bandwidth_limit: { value: 0, unlimited: true },
		max_site_limit: { value: 0, unlimited: true },
		php_start_children: 1,
		php_max_children: 3,
		max_database: { value: 0, unlimited: true },
	})
	// 刷新信息
	const refreshInfo = ref(0)

	// 刷新列表
	const refreshList = () => {
		refreshInfo.value = new Date().getTime()
	}

	// 重置数据
	const resetFormData = () => {
		formData.value = {
			package_name: '',
			remark: '',
			disk_space_quota: { value: 0, unlimited: true },
			monthly_bandwidth_limit: { value: 0, unlimited: true },
			max_site_limit: { value: 0, unlimited: true },
			php_start_children: 1,
			php_max_children: 3,
			max_database: { value: 0, unlimited: true },
		}
		isEdit.value = false
	}

	return { isEdit, formData, refreshInfo, refreshList, resetFormData }
})

/**
 * @description 获取资源包store
 * @returns
 */
export const usePackageStore = () => {
	const store = PACKAGE_STORE()
	const packageStore = storeToRefs(store)
	return { ...store, ...packageStore }
}

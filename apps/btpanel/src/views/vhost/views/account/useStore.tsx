import { AccountRow, getDiskListApi, getPackageListApi, getTypeListApi } from '@/api/vhost'
import { getByteUnit, isArray } from '@/utils'
import { useGlobalStore } from '@/store/global'
import { SelectDefalutOptionProps, SelectProps } from '@/components/form/bt-select/types'

import type { modelType } from './types'

export const ACCOUNT_STORE = defineStore('VHOST-ACCOUNT-STORE', () => {
	const { payment } = useGlobalStore()
	const isEdit = ref(false) // 是否为编辑用户
	const accountAuth = reactive({
		number: 0,
		limit: 0,
	}) // 用户权限

	const formData = ref<modelType>({
		accunt_id: 0,
		username: '',
		password: '',
		email: '',
		expireType: 0,
		package_id: 0,
		mountpoint: '',
		expire_date: '',
		remark: '',
	})

	const editorForm = ref({})

	const refreshInfo = ref(0)

	// 账号数量限制
	const checkedAccountLimit = computed(() => {
		switch (payment.value.authType) {
			case 'pro':
				accountAuth.limit = 10
				return `当前为专业版，可创建子用户为 ${accountAuth.number}/${accountAuth.limit}`
			case 'ltd':
				accountAuth.limit = 30
				return `当前为企业版，可创建子用户为 ${accountAuth.number}/${accountAuth.limit}`
		}
	})

	// 刷新列表
	const refreshList = () => {
		refreshInfo.value = new Date().getTime()
	}

	/**
	 * @description 重置表单数据
	 */
	const resetFormData = () => {
		formData.value = {
			username: '',
			password: '',
			email: '',
			expireType: 0,
			package_id: 0,
			mountpoint: '',
			expire_date: '',
			remark: '',
		}
		isEdit.value = false
	}

	// 资源包列表
	const packageOptions = ref<SelectDefalutOptionProps[]>([])
	// 资源包列表loading
	const packageLoading = ref(false)

	/**
	 * @description 获取资源包列表
	 */
	const renderPackageOptions = async () => {
		try {
			packageLoading.value = true
			const {
				data: { list },
			} = await getPackageListApi()
			if (isArray(list)) {
				if (!isEdit.value) {
					formData.value.package_id = list[0].package_id
					selectPackageOptions.value = list[0]
				} else {
					const data = list.find((item: any) => item.package_id === formData.value.package_id)
					selectPackageOptions.value = data
				}
				packageOptions.value = list.map((item: any) => {
					return {
						label: item.package_name + (item.remark ? `(${item.remark})` : ''),
						value: item.package_id,
						data: item,
					}
				})
			}
		} catch (error) {
			console.log(error)
		} finally {
			packageLoading.value = false
		}
	}

	// 资源包列表
	const diskOptions = ref<SelectDefalutOptionProps[]>([])
	// 资源包列表loading
	const diskLoading = ref(false)

	/**
	 * @description 获取资源包列表
	 */
	const renderDiskOptions = async () => {
		try {
			diskLoading.value = true
			const { data } = await getDiskListApi()
			if (isArray(data)) {
				if (!isEdit.value) {
					formData.value.mountpoint = data[0].mountpoint
				} else {
					const { mountpoint } = data.find((item: any) => item.mountpoint === formData.value.mountpoint)
					formData.value.mountpoint = mountpoint
				}
				diskOptions.value = data.map((item: any) => {
					return {
						label: `${item.mountpoint}(${getByteUnit(item.used)}/${getByteUnit(item.total)}) 配额：${item.is_user_quota ? '启用' : '未启用'}`,
						value: item.mountpoint,
						data: item,
					}
				})
			}
		} catch (error) {
			console.log(error)
		} finally {
			diskLoading.value = false
		}
	}

	// 用户分类列表
	const accountTypeOptions = ref<SelectDefalutOptionProps[]>([])

	// 用户分类列表loading
	const accountTypeLoading = ref(false)

	/**
	 * @description 渲染用户分类列表
	 */
	const renderAccountTypeOptions = async () => {
		const { data } = await getTypeListApi()
		if (isArray(data)) {
			accountTypeOptions.value = data.map((item: any) => {
				return {
					label: item.type_name,
					value: item.type_id,
				}
			})
			return data
		}
	}

	const selectPackageOptions = ref({})
	/**
	 * @description 选择资源包
	 * @param value
	 */
	const changePackageEvent = (value: number) => {
		const item = packageOptions.value.find(item => item.data.package_id === value) as AnyObject
		selectPackageOptions.value = item.data as AnyObject
	}

	return {
		isEdit,
		formData,
		editorForm,
		resetFormData,
		packageOptions,
		packageLoading,
		renderPackageOptions,
		accountTypeLoading,
		renderAccountTypeOptions,
		diskOptions,
		diskLoading,
		renderDiskOptions,
		selectPackageOptions,
		changePackageEvent,
		refreshList,
		refreshInfo,
		checkedAccountLimit,
		accountAuth,
	}
})

/**
 * @description 账号管理store
 * @returns
 */
export const useAccountStore = () => {
	const store = ACCOUNT_STORE()
	const accountStore = storeToRefs(store)
	return { ...store, ...accountStore }
}

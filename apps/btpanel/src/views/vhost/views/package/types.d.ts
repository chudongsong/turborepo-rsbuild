export type PackageList = {
	package_id: number
	package_name: string
	status: number
	disk_space_quota: number
	monthly_bandwidth_limit: number
	max_site_limit: number
	// max_email_account: number
	max_database: number
	php_start_children: number
	php_max_children: number
	remark: string
	create_time: number
	used_count: number
}

export type PageResponse<T> = {
	page: {
		count: number
		rows: number
		p: number
		start_line: number
		end_line: number
	}
	list: T[]
}

/**
 * @description 新增账号——资源包表单部分
 */
export type ModelType = {
	package_name: string | number
	remark: string | number
	disk_space_quota: CombineFormItemModel
	monthly_bandwidth_limit: CombineFormItemModel
	max_site_limit: CombineFormItemModel
	php_start_children: string | number
	php_max_children: string | number
	// max_email_account: CombineFormItemModel
	max_database: CombineFormItemModel
}

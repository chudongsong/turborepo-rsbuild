export type Response<T> = {
	message: T[]
}
export type DiskList = {
	device: string
	mountpoint: string
	fstype: string
	total: number
	used: number
	free: number
	used_percent: number
	inodes_total: number
	inodes_used: number
	inodes_free: number
	inodes_used_percent: number
	is_group_quota: boolean
	is_user_quota: boolean
	is_default: boolean
	account_percent: number
	account_allocate: number
}

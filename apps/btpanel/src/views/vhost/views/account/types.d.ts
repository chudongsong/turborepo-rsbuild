export type modelType = {
	accunt_id?: number
	username: string
	password: string
	email: string
	expire_date: string
	expireType?: number
	package_id: number
	remark: string
	mountpoint?: string
	// is_Expand: boolean
	// package_id: number
}

export type loginType = {
	token: string
	login_url: string
}

export interface LoginInfo {
	success: number // 成功总数
	today_success: number // 今日新增成功总数
	error: number // 失败总数
	today_error: number // 今日新增失败总数
	yesterday_success?: number // 昨日成功数
	yesterday_error?: number // 昨日失败数
	sevenday_success?: number // 7天成功数
	sevenday_error?: number // 7天失败数
}

export interface YesterdayData {
	success: number
	error: number
}

export interface WeekData {
	success: number
	error: number
}

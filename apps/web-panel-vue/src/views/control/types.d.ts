// 监控 持久化接口
export interface ControlStoreProps {
	tabActive: string // 当前tab，未激活
	isRefreshActiveList: boolean // 是否刷新活跃列表
	isLoading: boolean // 是否显示视图加载中
	diskUnitType: string // 磁盘单位
	networkUnitType: string // 网络单位
	networkIoKey: string // 网络io 选项
	days: number // 天数
}

// 设置监控状态
export interface SetControlProps {
	type: string
	day?: number
}
// cpu时间
export interface Time {
	start: number
	end?: number
}
// 面板日报的日期
export interface PanelDailyTime {
	date: string
}
// 插件启动信息
export interface SeverAdmin {
	option: number
	name: string
}
// 获取插件状态
export interface GetStatus {
	type: string
	p: number
	limit: number
}

export interface TimeProps {
	startTime: number
	endTime: number
}
export interface PublicProps {
	topData: { [key: string]: Array<number | string> }
	echartsId?: string
	unit?: string
}
export interface CpuProps extends TimeProps, PublicProps {
	yData: number[]
}
export interface MemProps extends TimeProps, PublicProps {
	zData: number[] // 内存数据
}
export interface DiskProps extends TimeProps, PublicProps {
	rData: number[] // 读取数据
	wData: number[] // 写入数据
	zData: number[] // 读写延迟
	yData: number[] // 读写次数
}
export interface LoadProps extends TimeProps, PublicProps {
	aData: number[] // 1分钟数据
	bData: number[] // 5分钟数据
	yData: number[] // 上行数据
	zData: number[] // 下行数据
}

export interface NetworkProps extends TimeProps, PublicProps {
	yData: number[] // 上行数据
	zData: number[] // 下行数据
}

export interface TableData {
	name: string
	is_status?: boolean
	data?: any
	value?: string
	data_excess?: any
	have_data_excess?: boolean
	excess?: string
	is_excess?: boolean
}

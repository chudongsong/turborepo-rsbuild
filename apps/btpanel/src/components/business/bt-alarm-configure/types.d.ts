import { S } from 'vite/dist/node/types.d-aGj9QkWt'

// 告警配置类型定义
export interface AlarmConfig {
	id?: string // 唯一标识 - 修改时需要
	name: string // 告警类型
	title: string // 告警类型标题
	ps: string // 告警类型描述
	help: string // 告警类型帮助
	list: any[] // 告警类型列表
}

// 添加告警配置组件属性
export interface AlarmConfigProps {
	type: string // 告警类型
	title: string // 告警类型标题
	row: AnyObject // 告警类型数据
	callback: (data: any) => void // 回调函数
}

export interface AlarmConfigParams {
	sender_id?: string // 发送ID - 修改时需要
	sender_type: string // 发送类型
	sender_data?: string // 发送数据
}

// 告警行内配置属性
export interface AlarmRowProps {
	data: AnyObject
	original: boolean
	used: boolean
	sender_type: string
	id: string
	load: boolean
	send_type?: string
}

// 表格项目数据类型
export interface TableItemProps {
	name: string
	addtime: string
	start: number
	end: number
	// eslint-disable-next-line @typescript-eslint/naming-convention
	msg_info: {
		title: string
		content: string
	}
}

export type MessageCenter = {
	create_time: number
	id: number
	level: number
	msg_types: string[]
	read: boolean
	read_time: number
	source: string[]
	sub_id: number
	sub_type: string
	title: string
}

export type MessageCenterInfo = MessageCenter & {
	sub: AnyObject
}

export type MessagePushSub = {
	data: string
	id: number
	pid: number
	push_title: string
	push_type: string
	self_type: string
}

export type MessageSoftSub = {
	file_name: string
	id: number
	install_status: string
	pid: number
	self_type: string
	soft_name: string
	status: number
	task_id: number
}

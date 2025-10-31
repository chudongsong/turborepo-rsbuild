// 终端
export interface TermStoreProps {
	refreshServerTable: boolean
}

// 终端主机项目
export interface TermHostItemProps {
	host: string
	port: number
	ps: string
	sort: number
}

// 终端主机列表
export interface TermHostProps {
	[key: string]: string | number
	authType?: 'password' | 'pprivate'
	host: string
	port?: number
	username?: string
	password?: string
	pkey?: string
	pkey_passwd?: string
	ps: string
}

// 终端命令修改
export interface TermCommandProps {
	title: string
	shell: string
	new_title?: string
}

// 终端命令项
export interface TermCommandItemProps {
	id?: number
	title: string
	shell: string
}

// 终端命令列表
export interface TermCommandListProps {
	title: string
	shell: string
}

// 终端录制视频信息
export interface TermVideoInfoProps {
	ssh_user: string
	server_ip: string
	addr: string
	login_time: number
	close_time: number
	user_agent: string
	video_addr: string
	id: number
}

// 终端配置
export interface TerminalConfig {
	socketInfo: () => void
	useStatus: () => Ref<'success' | 'warning' | 'danger'>
	useTerminal: () => void
	disposeTerminal: () => void
	fitTerminal: () => void
}

// 终端信息
export interface TerminalInfoProps {
	id: string // 终端id
	hostInfo: TermHostProps // 服务器信息
}

// 终端状态
export type TermRef = {
	init?: () => void
}

// 终端Ref
export interface TerminalRefsProps {
	[key: `terminal-${string}`]: TermRef
}

// 终端状态
export interface TerminalStatus {
	[key: string]: Ref<'success' | 'warning' | 'danger'> // 状态
}

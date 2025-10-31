import { DatabaseTableDataProps } from './../views/database-o/hooks/types.d'
import { download } from './../utils/index2'
import { ResponseResult } from '@/types'

// // 数据库工具箱表格数据接口
// export interface ToolsTableDataProps {
// 	table_name: string
// 	type: string
// 	collation: string
// 	rows_count: string
// 	data_size: string
// }
// export interface DeleteTableDataProps {
// 	name: string
// 	total: number
// 	db_type: string
// }
// export interface ImportFileProps {
// 	fileName: string
// 	modifyTime: string
// 	size: string
// }
// export interface BackTableProps {
// 	name: string
// 	addtime: string
// 	size: string
// 	ps: string
// 	filename: string
// 	id: number
// 	local: string
// 	cron_id?: number
// 	backup_id?: number
// }

// export interface CloudTableProps {
// 	id: number
// 	db_host: string
// 	db_port: string | number
// 	db_type: string
// 	db_user: string
// 	db_password: string
// 	ps: string
// 	type?: string
// 	db_ps?: string
// }
// // 数据库工具箱事件接口
// export interface ToolsTableEventProps {
// 	// repairEvent: (row: ToolsTableDataProps, type?: boolean = false) => Promise<ResponseResult | void>
// 	// optimizationEvent: (
// 	// 	row: ToolsTableDataProps,
// 	// 	type?: boolean = false
// 	// ) => Promise<ResponseResult | void>
// 	// conversionEngineEvent: (
// 	// 	row: ToolsTableDataProps,
// 	// 	type?: boolean = false,
// 	// 	target?: string
// 	// ) => Promise<ResponseResult | void>
// }

// // 数据库表格接口
// export interface DatabaseTableEventProps {
// 	changePermissionEvent: (row: DatabaseTableDataProps) => void
// 	openToolsEvent: (row: DatabaseTableDataProps) => void
// 	editPasswordEvent: (row: DatabaseTableDataProps) => void
// 	openPhpAdmin: (row: DatabaseTableDataProps) => Promise<void>
// 	deleteDataEvent: (row: DatabaseTableDataProps, isConfirm: boolean) => Promise<void>
// 	setBackupEvents: (row: DatabaseTableDataProps, type: string) => Promise<void>
// 	setQuotaEvent: (row: DatabaseTableDataProps, isSetup: boolean) => void
// }

// export interface ImportEventProps {
// 	importDbFileEvent: (row: ImportFileProps) => void
// 	delDatabaseFileEvent: (row: ImportFileProps) => void
// }
// // 数据库备份表格事件接口
// export interface BackEventProps {
// 	restoreBackEvent: (row: BackTableProps) => void
// 	downBackEvent: (row: BackTableProps) => void
// 	delBackEvent: (row: BackTableProps) => void
// }
// // 数据库增量备份表格事件接口
// export interface InBackEventProps {
// 	executeEvent: (row: InBackTableProps) => void
// 	editEvent: (row: InBackTableProps) => void
// 	logEvent: (row: InBackTableProps) => void
// 	delInBackEvent: (row: InBackTableProps) => void
// 	// restoreInBackEvent: (row: InBackTableProps) => void
// 	// downloadEvent: (row: InBackTableProps) => void
// }

// // 数据库远程服务器表格
// export interface CloudEventProps {
// 	delCloudEvent: (row: CloudTableProps) => void
// 	editCloudEvent: (row: CloudTableProps) => void
// }

// // sqlserver数据库表格数据接口
// export interface SqlServerTableDataProps {
// 	addtime: number
// 	db_host: string
// 	db_password: string
// 	db_port: number
// 	db_type: string
// 	db_user: string
// 	id: number
// 	ps: string
// 	name: string
// }

// // sqlserver数据库表格事件接口
// export interface SqlServerTableEventProps {
// 	editPasswordEvent: (row: SqlServerTableDataProps) => void
// 	deleteDataEvent: (row: SqlServerTableDataProps, isConfirm: boolean) => Promise<void>
// }

// // pgsql备份表格数据接口
// export interface PgsqlBackTableProps {
// 	addtime: string
// 	filename: string
// 	id: number
// 	local: string
// 	localexist: number
// 	name: string
// 	pid: number
// 	ps: string
// 	size: number
// }

// // pgsql数据库表格事件接口
// export interface PgsqlTableEventProps {
// 	editPasswordEvent: (row: SqlServerTableDataProps) => void
// 	deleteDataEvent: (row: SqlServerTableDataProps, isConfirm: boolean) => Promise<void>
// 	setBackupEvents: (row: SqlServerTableDataProps, type: string) => Promise<void>
// }
// export interface PgsqlBackEventProps {
// 	restoreBackEvent: (row: PgsqlBackTableProps) => void
// 	downloadBackEvent: (row: PgsqlBackTableProps) => void
// 	deleteBackEvent: (row: PgsqlBackTableProps) => void
// }

/**
 * @description 数据库远程数据库接口
 */
export interface CloudServerItem {
	addtime: number
	db_host: string
	db_password: string
	db_port: number
	db_user: string
	id: number
	ps: string
}

/**
 * @description 数据库导入数据接口
 */
export interface ImportFileProps {
	fileName: string
	modifyTime: string
	size: string
	path: string
	name: string
	mtime: number
}

/*
 * @description 数据库添加表单接口
 */
export interface AddFormProps {
	name: string
	db_user: string
	password: string
	dataAccess: string
	address: string
	codeing: string
	dtype: string
	ps: string
	sid: string | number
	listen_ip: string
	host: string
}

// 数据库表格数据接口
export interface DatabaseTableItemProps {
	id: number
	name: string
	db_type: number
	username: string
	password: string
	ps: string
	sid: number
	type: string
	addtime: string
	backup_count: any
	conn_config: any
	[key: string]: any
}

// 数据库工具箱表格数据接口
export interface ToolsTableDataProps {
	table_name: string
	type: string
	collation: string
	rows_count: string
	data_size: string
}

// redis key列表数据接口
interface KeyItem {
	id: number
	name: string
	keynum: number
}

// redis value列表数据接口
interface ValueItem {
	name: string
	val: string
	type: string
	len: number
	showtime: string
	endtime: number
}

// 数据库增量备份数据接口
export interface InBackTableProps {
	ackup_cycle: string
	backup_id: number
	cron_id: any
	end_time: string
	excute_time: string
	full_size: string
	inc_size: number
	name: string
	notice: string
	notice_channel: string
	start_time: string
	type: string
	upload_alioss: string
	upload_bos: string
	upload_ftp: string
	upload_localhost: string
	upload_obs: string
	upload_qiniu: string
	upload_txcos: string
	zip_password: string
}

export interface UserFormProps {
	sid: number
	username: string
	password: string
	host: string
	dbname: string
	tbname?: any
	address?: any
	access: string
	disabled: boolean
	selected: number[]
	loading?: boolean
}

// 表格请求参数接口
export interface MysqlTableProps {
	p: number
	limit: number
	search: string
	sid?: number | string
	table: string
}

import exp from 'node:constants'

// 文件映射处理，用于重新调整文件路径,entry: 入口文件路径,export: 导出文件路径,replacePath: 是否替换文件中的资源路径
export interface FileMapsRules {
	entry: string // 入口文件路径,支持glob匹配
	export: string // 导出文件路径
	replacePath?: boolean // 是否替换文件中的资源路径
	copy?: boolean // 是否复制文件
}

// 文件替换规则，用于替换文件中的内容，处理文件中的路径或非标准的内容
interface FileReplaceDefalutRules {
	entry: string // 入口文件路径,支持glob匹配
}

interface FileReplaceAloneRules {
	replace: string | RegExp // 替换内容,支持正则表达式
	content: string // 替换后的内容
}

// 默认替换
export interface FileReplaceAloneRules {
	replace: string | RegExp // 替换内容,支持正则表达式
	content: string // 替换后的内容
	ignore?: string // 忽略替换的文件
}

export interface FileCompress {
	entry: string // 入口文件路径, 不支持glob匹配
	export: string // 导出文件路径
}

// 组替换
export interface FileReplaceGroupRules extends FileReplaceDefalutRules {
	replaceList: FileReplaceAloneRules[] // 替换列表
}

// 文件替换规则，用于替换文件中的内容，处理文件中的路径或非标准的内容
export type FileReplaceRules = FileReplaceAloneRules | FileReplaceGroupRules

// 文件重命名规则，用于重命名文件
export interface FileRenameRules {
	entry: string // 入口文件路径,支持glob匹配
	rename: string // 重命名文件
}

// 同步远程服务器配置
export interface SyncRemoteServerOptions {
	param?: string // 监听参数，用于触发脚本同步
	remotePath?: string // 远程路径
	host?: string // 远程服务器地址
	port?: number // 远程服务器端口
	username?: string // 用户名
	password?: string // 密码
}

// 同步git仓库配置，用于将编译的代码同步到另一个git仓库
export type SyncRemoteGitOptions = {
	param: string // 监听参数，用于触发脚本同步
	remote: string // 远程仓库地址
	branch: string // 分支
	localPath: string // 本地路径
}

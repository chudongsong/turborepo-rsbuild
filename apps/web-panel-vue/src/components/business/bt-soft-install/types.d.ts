import { SelectOptionProps } from '@/components/form/BtSelect/index.d'

// 插件安装默认参数
export interface Props {
	compData: CompDataProps
}

// 插件安装组件
export interface CompDataProps {
	name: string
	type: 'r' | 'u' | 'i' // 操作类型 i：安装 u：更新 r：修复
	isBeta?: boolean
	update?: boolean
	softData: SoftDataProps
	pluginInfo: PluginRowProps
}

// 软件数据
export interface SoftDataProps {
	title: string
	name: string
	ps: string
	endtime: number
	introduction: string
	dependnet: DependnetProps
	other_php?: any[]
	version: string
	versions: any[]
	setup: boolean
	pid: string
	type: number
	callBack?: Function
}

// 软件依赖
export interface DependnetProps {
	need: string[]
	selected: string[]
}

// 插件信息
export interface PluginInfoProps {
	call: 'r' | 'u' | 'i' // 操作类型 i：安装 u：更新 r：修复
	title: string // 插件名称
	name: string // 插件名称-id
	ps: string // 插件描述
	type: number // 插件类型，5-环境插件、7-免费插件、8-专业插件、12-企业插件
	label: any[] // 插件标签
	isBeta: boolean // 是否是测试版
	isPHPInstall: boolean // 是否是PHP插件
	isMysqlUpdate: boolean // 是否是MySQL插件更新
	isSystem: boolean // 是否是系统插件
	isInstall: boolean // 是否安装
	isUpdate: boolean // 是否有更新
	isRepair: boolean // 是否是修复
	currentVersion: string // 当前版本
	isSpecialPlugins: boolean // 是否是特殊插件，例如PHP、MySQL、Nginx、Apache，等子版本可选
	compile: boolean // 是否支持编译安装，仅类型为5的插件支持
	otherPHP: any[]
	versions: any[] // 版本列表
	introduction: string[][] // 插件介绍图片
	isDependnet: boolean // 是否有依赖
	dependnet: DependnetProps
}

// 选中的插件版本信息
export interface ActiveInfoProps {
	fullVersion: string // 完整版本
	mVersion: string // 主版本
	version: string // 子版本
	isBeta: boolean // 是否是测试版
	status: boolean // 是否安装，仅php
	updateTime: string // 更新时间
	updateMsg: string // 更新信息
}

export interface VersionModelProps {
	value: number
	version: SelectOptionProps[]
}

export interface VersionProps {
	title: string
	key: string
	disabled?: boolean
}

// 插件信息
export interface PluginRowProps {
	type: number // 插件类型
	is_beta: boolean // 是否是测试版
	setup: boolean // 是否安装
	other_php?: any[] // 其他PHP版本，仅PHP插件有
	name: string // 插件名称，用于唯一标识和参数传递
	title: string // 插件名称
	ps: string // 插件描述
	version: string // 当前版本，可能为空，未安装时为空
	dependnet: DependnetProps // 插件依赖
	introduction: string // 插件介绍
	versions: any[] // 版本列表
}
// 插件安装参数
export interface EnvInstallProps {
	sName: string
	version: string
	min_version: string
	type?: number
	fullVersion?: string
	upgrade?: boolean | string
}

export interface PluginInstallProps {
	plugin_name: string
	tmp_path: string
	install_opt: 'i' | 'u' | 'r'
}

export interface PluginInstallOtherProps {
	title: string
	fullVersion: string
}

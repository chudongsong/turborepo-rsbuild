import { SelectOptionProps } from '@/components/form/bt-select/types'
import exp from 'node:constants'

// 文件选择对话框选项
export interface FileSelectionOptions {
	type: 'file' | 'dir' | 'all'
	path?: string // 选择路径
	change?: (path: string) => void // 选择路径回调
	confirmText?: string // 确认按钮文本
	customRequest?: boolean // 是否自定义请求
	customRequestApi?: (params: { path: string; disk: boolean; search: string }) => Promise<{ status: boolean; data: any }>
	disabledCreate?: boolean // 是否禁用创建
}

export interface Dialog {
	title: string // 标题
}

export interface AlarmModuleOptionsProps extends Dialog {
	// 报警模块配置
	type: 'dingding' | 'sms' | 'mail' | 'weixin' | 'wx_account' | string
	callback: (data?: AnyObject) => void // 回调函数
}

// 产品购买选项
export interface ProductBuyOptions {
	// 产品显示类型，必填项，
	// 如果为插件，则显示插件购买界面，判断类型，显示企业和专业版购买界面，插件模式下，也不会显示企业运维版购买界面
	// 如果为 ltd，则仅显示企业版购买界面
	// 如果为 pro|default，则显示专业版购买界面，和企业版购买界面
	type: 'plugin' | 'ltd' | 'pro' | 'default'
	source: string // 来源ID，用于统计支付来源数据，非必填;
	plugin?: AnyObject // 类型为插件时，需要传入插件信息。
}

// 插件安装选项
export interface PluginInstallOptions {
	type: 'i' | 'u' | 'r' // 类型 i：安装 u：更新 r：修复
	name?: string // 插件信息-插件名称
	pluginInfo?: AnyObject // 具体的插件信息，如果传入，则不会根据name去获取插件信息
}

// 批量设置分类
export interface BatchSetClassOptions {
	name: string // 分类名称
	options: SelectOptionProps[] // 分类列表
	selectList: AnyObject[] // 选择的列表
	request: (data: AnyObject, close: AnyFunction) => Promise<viod> // 请求方法
}

export interface NpsSurveyV2DialogProps {
	id?: number // 问卷ID
	type: number // 问卷类型
	name?: string // 问卷名称
	softName?: string // 软件名称
	description?: string // 问卷描述
	isNoRate?: boolean // 是否不评分
	title?: string // 标题
	isCard?: boolean // 是否卡片模式
	isShowPhone?: boolean // 是否显示手机号回访
}

// 产品支付界面
export interface ProductPaymentDialogProps {
	disablePro?: boolean // 是否禁用专业版
	disableEsc?: boolean // 是否禁用ESC关闭
	sourceId?: string | number // 来源ID
	plugin?: boolean // 是否插件
	pluginInfo?: any // 插件信息
	isHomeBubble?: AnyObject // 是否首页气泡
	compulsionLtd?: boolean // 是否强制显示企业版
	showClose?: boolean // 是否显示关闭按钮
}

export interface PopupFromSubmitProps extends ConfirmSubmitProps {
	$refs: any
}

// 通用表单提交的接口
export interface ConfirmSubmitProps {
	confirm?: AnyObject
	loading: string | Ref<boolean> | LoadingProps
	message?: boolean
	request: () => Promise<any>
	complete?: (any) => Promise<any>
	fail?: (any) => Promise<any>
	popup?: PopupFromProps
}

// 消息通道设置选项
export interface PushMessageConfigOptions extends Dialog {
	type: string // 消息类型
	callback: (data: any) => void // 回调函数
}

// 批量操作配置参数
export interface BatchConfigProps {
	params?: AnyObject
	key?: string // 名称参数
}

export interface BatchResultsProps {
	code?: number // 返回码
	msg: string // 返回信息
	status: boolean // 状态
	data?: {
		error: Array<any> // 错误数据
		success: Array<any> // 成功数据
	} // 返回数据
	error?: any // 错误信息
	success?: any // 成功信息
}

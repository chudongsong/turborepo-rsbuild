export interface FullScreenProps {
	title?: string // 标题
	onRefresh?: () => void // 刷新事件
}

export interface FullScreenDialogProps {
	isHtml: boolean // 是否是html
	autoScroll: boolean // 是否自动滚动
	onRefresh: () => void // 刷新事件
	getContent: () => string // 获取内容
}

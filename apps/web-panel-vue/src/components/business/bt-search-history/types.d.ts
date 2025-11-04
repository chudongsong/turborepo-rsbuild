export interface RecommendProps {
	name: string;// 名称
	callback?: () => void;// 点击回调
}
export interface HistoryProps {
	val: string;// 历史搜索值
}
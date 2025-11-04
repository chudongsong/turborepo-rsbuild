// Desc: Help组件类型定义
export interface HelpOptionsProps {
	content: string | JSX.Element; // 文本内容，如果isHtml为true，则为html内容，支持组件开发
	class?: string; // 文本类名
	isHtml?: boolean; // 是否使用html
}

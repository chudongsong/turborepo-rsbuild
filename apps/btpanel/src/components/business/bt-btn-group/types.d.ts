export interface BtnGroupProps {
	division?: boolean// 当前是否为分割线
	title?: string// 按钮原生title属性
	content: string// 按钮内容
	hide?: boolean | (()=>boolean)// 是否隐藏
	active?: boolean// 是否激活
	class?: string// 普通按钮类名
	icon?: boolean// 图标按钮类名
	size?: 'large' | 'default' | 'small'// 按钮大小
	event: (value?: any) => void// 点击事件
	dropdown?: boolean// 是否为下拉按钮
	settingList?: Array<settingListProps>// 下拉按钮列表
	splitButton?: boolean// 下拉是否为分割按钮
}

interface settingListProps {
	hide?: boolean // 是否隐藏
	name: string // 下拉选项的指令
	description?: string // 下拉选项的描述
	label: string // 下拉选项的文本
}
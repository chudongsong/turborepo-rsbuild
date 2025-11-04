// 菜单单行数据类型
export interface MenuProps {
	id: string; // 菜单栏目ID
	title: string; // 菜单栏目名称
	show: boolean; // 是否显示
	children?: MenuProps[] | boolean; // 子级菜单栏目
	parentId?: string; // 父级菜单栏目ID
}

// 菜单设置参数类型
export interface MenuParamProps {
	hide_list: string; // 隐藏菜单栏目ID
	site_menu?: number; // 是否为站点菜单栏目
}

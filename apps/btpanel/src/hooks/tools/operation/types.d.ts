// 操作类型
export interface OperationOptionsProps {
	type?: 'button' | 'link' | 'dropdown' | 'divider' | 'custom'; // 操作类型
	label?: string; // 文字
	title?: string; // 悬浮文字
	active?: boolean; // 是否激活
	icon?: string; // 图标 排除'divider'
	href?: string; // 链接
	options?: OperationOptionsProps[]; // dropdown 选项
	onClick?: () => void; // 点击事件
	render?: () => JSX.Element; // 自定义渲染
}

export interface OperationBaseProps {
	label?: string; // 文字
}

/**
 * @description 操作按钮类型
 */
export interface OperationButtonProps extends OperationBaseProps {
	type: 'button'; // 操作类型
	title?: string; // 悬浮文字
	active?: boolean; // 是否激活
	icon?: string; // 图标 排除'divider'
	onClick?: () => void; // 点击事件
}

/**
 * @description 操作链接类型
 */
export interface OperationLinkProps extends OperationBaseProps {
	type: 'link'; // 操作类型
	icon?: string; // 图标 排除'divider'
	href?: string; // 链接
}

/**
 * @description 操作下拉类型
 */
export interface OperationDropdownProps extends OperationBaseProps {
	type: 'dropdown'; // 操作类型
	icon?: string; // 图标 排除'divider'
	options?: OperationOptionsProps[]; // dropdown 选项
}

/**
 * @description 操作分割线类型
 */
export interface OperationDividerProps {
	type: 'divider'; // 操作类型
}

/**
 * @description 操作自定义类型
 */
export interface OperationCustomProps {
	type: 'custom'; // 操作类型
	render: () => JSX.Element; // 自定义渲染
}

// UseOperationProps
export interface UseOperationProps {
	options: Ref<Array<OperationButtonProps | OperationLinkProps | OperationDropdownProps | OperationDividerProps | OperationCustomProps>>; // 操作按钮
}

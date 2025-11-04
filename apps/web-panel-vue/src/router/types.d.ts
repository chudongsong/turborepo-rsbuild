import { Component } from 'vue'

// 路由meta参数类型定义
export interface RoutesMetaProps {
	title: string
	icon?: string
	keepAlive?: boolean
	maxAge?: number
}

// 路由参数类型定义
export interface RoutesMenuProps extends RoutesMenuChildProps {
	children?: RoutesMenuChildProps[]
}

export interface RoutesMenuChildProps {
	name: string
	path: string
	meta: RoutesMetaProps
	redirect?: string
	compatible?: boolean
	show?: boolean
	isReleaseDis?: boolean
	component?: () => Promise<any>
}

/**
 * @description 菜单模板参数
 */
export interface MenuTemplateProps {
	class: string
	href: string
	id: string
	sort: number
	title: string
}

export interface MenuRouteProps {
	name: string
	path: string
	title: string
	show: boolean
	children?: MenuRouteProps[]
}

export interface MenuTemplateProps {
	show: boolean
	id: string
	title: string
	sort?: number
	children?: { id: string; title: string; show: boolean }[]
}

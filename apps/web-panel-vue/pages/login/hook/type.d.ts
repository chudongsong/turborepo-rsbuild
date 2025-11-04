// 类型定义
export interface RgbColor {
	r: number
	g: number
	b: number
}

// 颜色配置接口
export interface ColorConfig {
	primary?: string
	success?: string
	warning?: string
	danger?: string
	error?: string
	info?: string
	[key: string]: string | undefined
}

// 生成选项接口
export interface GeneratorOptions {
	darkMode?: boolean
}

// 颜色变量接口
export interface ColorVariables {
	[key: string]: string
}

// 颜色等级类型
export type LightLevel = 3 | 5 | 7 | 8 | 9
export type DarkLevel = 2

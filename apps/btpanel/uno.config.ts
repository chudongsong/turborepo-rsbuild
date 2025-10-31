import { defineConfig, presetAttributify, presetUno, transformerDirectives, transformerVariantGroup } from 'unocss'
import presetRemToPx from '@unocss/preset-rem-to-px'

const basicColor = {
	white: 'var(--el-color-white)', // 白色 (#ffffff)
	black: 'var(--el-color-black)', // 黑色 (#000000)
	primary: 'var(--el-color-primary)', // 主要颜色 (#20a53a)
	primaryDark: 'var(--el-color-primary-dark-2)', // 主要颜色-深 (#1e7e34)
	warning: 'var(--el-color-warning)', // 警告颜色 (#f2711c)
	warningDark: 'var(--el-color-warning-dark-2)', // 警告颜色-深 (#c25a16)
	danger: 'var(--el-color-danger)', // 危险颜色 (#db2828)
	dangerDark: 'var(--el-color-danger-dark-2)', // 危险颜色-深 (#af2020)
	success: 'var(--el-color-success)', // 成功颜色 (#67c23a)
	successDark: 'var(--el-color-success-dark-2)', // 成功颜色-深 (#429938)
}

export default defineConfig({
	shortcuts: {
		btCustomForm: 'px-[2rem] py-[2.4rem]',
	},
	content: {
		filesystem: ['./src/**/*.{html,vue,jsx,tsx,ts,css,scss,sass}'],
	},
	theme: {
		colors: {
			...basicColor,
			ltd: 'var(--bt-ltd-color)', // 企业版配色
			pro: 'var(--bt-pro-color)', // 专业版配色
			default: 'var(--el-color-text-primary)', // 主要文本颜色 (#303133)
			supplement: 'var(--el-base-supplement)', // 补充颜色 (#2563eb)
			secondary: 'var(--el-color-text-secondary)', // 次要文本颜色 (#606266)
			tertiary: 'var(--el-color-text-tertiary)', // 第三文本颜色 (#909399)
			disabled: 'var(--el-color-text-disabled)', // 禁用文本颜色 (#c0c4cc)
		},
		backgroundColor: {
			...basicColor,

			// 浅色
			base: 'var(--el-fill-color)', // 填充颜色 (#f0f2f5)
			light: 'var(--el-fill-color-light)', // 填充颜色-浅 (#f5f7fa)
			lighter: 'var(--el-fill-color-lighter)', // 填充颜色-更浅 (#fafafa)
			extraLight: 'var(--el-fill-color-extra-light)', // 填充颜色-额外浅 (#fafcff)
			dark: 'var(--el-fill-color-dark)', // 填充颜色-深 (#ebedf0)
			darker: 'var(--el-fill-color-darker)', // 填充颜色-更深 (#e6e8eb)

			// 深色
			darkPrimary: 'var(--el-base-primary)', // 主要颜色-深 (#303133)
			darkSecondary: 'var(--el-base-secondary)', // 次要颜色-深 (#606266)
			darkTertiary: 'var(--el-base-tertiary)', // 次要颜色-深 (#909399)
		},
		borderColor: {
			...basicColor,
			// 浅色
			base: 'var(--el-color-border)', // 边框颜色 (#dcdfe6)
			light: 'var(--el-color-border-dark-tertiary)', // 边框颜色-浅 (#e4e7ed)
			lighter: 'var(--el-color-border-dark-tertiaryer)', // 边框颜色-更浅 (#ebeef5)
			extraLight: 'var(--el-color-border-extra-light)', // 边框颜色-额外浅 (#f2f6fc)
			dark: 'var(--el-color-border-dark)', // 边框颜色-深 (#d4d7de)
			darker: 'var(--el-color-border-darker)', // 边框颜色-更深 (#c6c9cf)

			// 深色
			darkPrimary: 'var(--el-base-primary)', // 主要颜色-深 (#303133)
			darkSecondary: 'var(--el-base-secondary)', // 次要颜色-深 (#606266)
			darkTertiary: 'var(--el-base-tertiary)', // 次要颜色-深 (#909399)
		},
		borderRadius: {
			small: 'var(--el-border-radius-small)', // 小圆角（2px）
			base: 'var(--el-border-radius-base)', // 基础圆角（4px）
			medium: 'var(--el-border-radius-medium)', // 中圆角（6px）
			large: 'var(--el-border-radius-large)', // 大圆角（8px）
			extraLarge: 'var(--el-border-radius-extra-large)', // 额外大圆角（12px）
			round: 'var(--el-border-radius-round)', // 圆角 （20px）
			extraRound: 'var(--el-border-radius-extra-round)', // 圆角 （50px）
			circle: 'var(--el-border-radius-circle)', // 圆形（100%）
		},
		fontSize: {
			extraSmall: 'var(--el-font-size-extra-small)', // 额外小（10px）
			small: 'var(--el-font-size-small)', // 小（12px）
			base: 'var(--el-font-size-base)', // 基础（14px）
			medium: 'var(--el-font-size-medium)', // 中（16px）
			large: 'var(--el-font-size-large)', // 大（18px）
			extraLarge: 'var(--el-font-size-extra-large)', // 额外大（20px）
			subtitleLarge: 'var(--el-font-size-subtitle-large)', // 副标题大（24px）
			iconLarge: 'var(--el-font-size-icon-large)', // 图标大（32px）
			titleLarge: 'var(--el-font-size-title-large)', // 标题大（40px
			large36: 'var(--el-font-size-large-36)', // 大36（36px）
			large40: 'var(--el-font-size-large-40)', // 大（40px）
			large46: 'var(--el-font-size-large-46)', // 大46（46px）
			large50: 'var(--el-font-size-large-50)', // 大50（50px）
			large54: 'var(--el-font-size-large-54)', // 大54（54px）
			large60: 'var(--el-font-size-large-60)', // 大60（60px）
			large70: 'var(--el-font-size-large-70)', // 大70（70px）
			large100: 'var(--el-font-size-large-100)', // 大100（100px）
		},
	},
	presets: [
		// 基础配置
		presetUno(),
		// rem转px
		presetRemToPx({
			baseFontSize: 10,
		}) as any,
		// 属性配置，使用属性方式归类参数
		presetAttributify(),
	],
	transformers: [transformerDirectives(), transformerVariantGroup()],
})

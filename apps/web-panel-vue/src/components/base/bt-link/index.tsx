/*
 * @Descripttion: 链接
 * @Author: chudong
 * @version: 1.0
 * @Date: 2024-09-25 11:43:00
 * @LastEditors: chudong
 * @LastEditTime: 2024-09-25 23:00:00
 */

import { ElLink, linkProps } from 'element-plus'
import 'element-plus/theme-chalk/src/link.scss'

export default defineComponent({
	name: 'BtLink',
	props: {
		...linkProps,
		type: {
			type: String as PropType<'primary' | 'success' | 'warning' | 'danger' | 'info'>,
			default: 'primary',
		},
		title: {
			type: String,
			default: '',
		},
		target: {
			type: String,
			default: '_blank',
		},
		underline: {
			type: Boolean,
			default: false,
		},
		href: {
			type: String,
			default: '',
		},
		size: {
			type: String,
			default: '12px',
		},
	},
	setup(props, { attrs, slots }) {
		const { size, href, target, underline, type, title } = toRefs(props)

		// 字体大小
		const fontSize = computed(() => {
			return Number.isNaN(Number(size.value)) ? size.value : `${size.value}rem`
		})
		return () => (
			<>
				{href.value ? (
					<ElLink {...attrs} href={href.value} type={type.value} title={title.value || ''} target={href.value !== 'javascript:;' ? target.value : ''} underline={underline.value} rel="noreferrer noopener" style={{ fontSize: fontSize.value }}>
						{slots}
					</ElLink>
				) : (
					<span class="bt-link" style={{ fontSize: fontSize.value }} {...attrs}>
						{slots?.default && slots.default?.()}
					</span>
				)}
			</>
		)
	},
})

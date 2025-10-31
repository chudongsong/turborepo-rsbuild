/*
 * @Descripttion: 折叠面板
 * @Author: chudong
 * @version: 1.0
 * @Date: 2024-09-25 11:43:00
 * @LastEditors: chudong
 * @LastEditTime: 2024-09-25 23:00:00
 */

import { ElCollapse, collapseProps } from 'element-plus'
import 'element-plus/theme-chalk/src/collapse.scss'

export default defineComponent({
	name: 'BtCollapse',
	props: { ...collapseProps },
	setup(props, { attrs, slots }) {
		return () => (
			<ElCollapse {...attrs} {...props}>
				{slots}
			</ElCollapse>
		)
	},
})

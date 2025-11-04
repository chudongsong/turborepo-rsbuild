/*
 * @Descripttion: 文字提示
 * @Author: chudong
 * @version: 1.0
 * @Date: 2024-09-25 11:43:00
 * @LastEditors: chudong
 * @LastEditTime: 2024-09-25 23:00:00
 */

import { ElTooltip } from 'element-plus'
import 'element-plus/theme-chalk/src/popper.scss'

export default defineComponent({
	name: 'BtTooltip',
	setup(props, { attrs, slots }) {
		return () => (
			<ElTooltip {...attrs} {...props}>
				{slots}
			</ElTooltip>
		)
	},
})

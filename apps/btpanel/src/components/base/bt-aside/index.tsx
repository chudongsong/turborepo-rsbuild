/*
 * @Descripttion: 侧边栏
 * @Author: chudong
 * @version: 1.0
 * @Date: 2024-09-25 11:43:00
 * @LastEditors: chudong
 * @LastEditTime: 2024-09-25 23:00:00
 */

import { ElAside } from 'element-plus'
import 'element-plus/theme-chalk/src/aside.scss'

export default defineComponent({
	name: 'BtAside',
	setup(props, { attrs, slots }) {
		return () => (
			<ElAside {...props} {...attrs}>
				{slots}
			</ElAside>
		)
	},
})

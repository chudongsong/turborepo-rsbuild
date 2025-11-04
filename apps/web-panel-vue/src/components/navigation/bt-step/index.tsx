/*
 * @Descripttion: 步骤
 * @Author: chudong
 * @version: 1.0
 * @Date: 2024-09-25 11:43:00
 * @LastEditors: chudong
 * @LastEditTime: 2024-09-25 23:00:00
 */

import { ElStep, stepProps } from 'element-plus'
import 'element-plus/theme-chalk/src/step.scss'

export default defineComponent({
	name: 'BtStep',
	props: { ...stepProps },
	setup(props, { attrs, slots }) {
		return () => (
			<ElStep {...attrs} {...props}>
				{slots}
			</ElStep>
		)
	},
})

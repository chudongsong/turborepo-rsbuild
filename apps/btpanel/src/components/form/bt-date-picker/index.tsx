/*
 * @Descripttion: 日期选择器
 * @Author: chudong
 * @version: 1.0
 * @Date: 2024-09-25 11:43:00
 * @LastEditors: chudong
 * @LastEditTime: 2024-09-25 23:00:00
 */

import { ElDatePicker, datePickerProps } from 'element-plus'
import 'element-plus/theme-chalk/src/date-picker/date-picker.scss'
import 'element-plus/theme-chalk/src/date-picker/date-table.scss'

export default defineComponent({
	name: 'BtDatePicker',
	props: { ...datePickerProps },
	setup(props, { attrs, slots }) {
		return () => (
			<ElDatePicker {...attrs} {...props}>
				{slots}
			</ElDatePicker>
		)
	},
})

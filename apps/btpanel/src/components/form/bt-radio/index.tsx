/*
 * @Descripttion: 单选框
 * @Author: chudong
 * @version: 1.0
 * @Date: 2024-09-25 11:43:00
 * @LastEditors: chudong
 * @LastEditTime: 2024-09-25 23:00:00
 */

import { ElRadioGroup, ElRadio, ElRadioButton, radioGroupProps } from 'element-plus'
import 'element-plus/theme-chalk/src/radio.scss'
// import 'element-plus/theme-chalk/src/radio-button.scss'
import 'element-plus/theme-chalk/src/radio-group.scss'
import type { RadioOptionsProps } from '@components/form/bt-radio/types'

export default defineComponent({
	props: {
		...radioGroupProps,
		options: {
			type: Array as PropType<Array<RadioOptionsProps>>,
			required: true,
		},
		type: {
			type: String as PropType<'radio' | 'button'>,
			default: 'radio',
		},
	},
	setup(props, { attrs }) {
		return () => (
			<ElRadioGroup class="flex items-center" {...attrs} {...props}>
				{props.type === 'radio'
					? props.options.map((item, index) =>
							!item.isHide ? (
								<ElRadio key={index} value={item.value} disabled={item.disabled}>
									{item.label}
								</ElRadio>
							) : null
					  )
					: props.options.map((item, index) =>
							!item.isHide ? (
								<ElRadioButton key={index} value={item.value} disabled={item.disabled}>
									{item.label}
								</ElRadioButton>
							) : null
					  )}
			</ElRadioGroup>
		)
	},
})

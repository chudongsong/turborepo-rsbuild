/*
 * @Descripttion: 多选框
 * @Author: chudong
 * @version: 1.0
 * @Date: 2024-09-25 11:43:00
 * @LastEditors: chudong
 * @LastEditTime: 2024-09-25 23:00:00
 */

import { ElCheckbox, ElCheckboxButton, ElCheckboxGroup, checkboxProps } from 'element-plus';
import 'element-plus/theme-chalk/src/checkbox.scss';
import 'element-plus/theme-chalk/src/checkbox-button.scss';
import 'element-plus/theme-chalk/src/checkbox-group.scss';
import type { CheckboxOptionsProps } from '@components/form/bt-checkbox/types';

export default defineComponent({
	name: 'BtCheckbox',
	props: {
		...checkboxProps,
		options: {
			type: Array as PropType<Array<CheckboxOptionsProps>>,
			required: true,
		},
		type: {
			type: String as PropType<'checkbox' | 'button'>,
			default: 'checkbox',
		},
	},
	setup(props, { attrs, slots }) {
		return () => (
			<ElCheckboxGroup {...attrs} {...props}>
				{props.type === 'checkbox'
					? props.options.map((item, index) =>
							!item.isHide ? (
								<ElCheckbox key={index} value={item.value} disabled={item.disabled}>
									{item.label}
								</ElCheckbox>
							) : null
					  )
					: props.options.map((item, index) =>
							!item.isHide ? (
								<ElCheckboxButton key={index} v-model={item.value} disabled={item.disabled}>
									{item.label}
								</ElCheckboxButton>
							) : null
					  )}
			</ElCheckboxGroup>
		);
	},
});

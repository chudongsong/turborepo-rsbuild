/*
 * @Descripttion: 下拉菜单主视图
 * @Author: chudong
 * @version: 1.0
 * @Date: 2024-09-25 11:43:00
 * @LastEditors: chudong
 * @LastEditTime: 2024-09-25 23:00:00
 */

import { dropdownProps, ElDropdown, ElDropdownItem, ElDropdownMenu } from 'element-plus'
import 'element-plus/theme-chalk/src/dropdown.scss'
import BtIcon from '@/components/base/bt-icon'
import { dropdownOptionProps } from './types'

export default defineComponent({
	name: 'BtDropdown',
	props: {
		...dropdownProps,
		options: {
			type: Array as PropType<dropdownOptionProps[]>,
			default: () => [],
		},
		icon: {
			type: String,
			default: 'svgtofont-el-more-filled',
		},
		splitButton: {
			type: Boolean,
			default: false,
		},
	},
	setup(props, { attrs, slots }) {
		return () => (
			<ElDropdown {...attrs} splitButton={props.splitButton}>
				{{
					default: () => (slots.default ? slots.default() : <BtIcon icon={props.icon} />),
					dropdown: () => (
						<ElDropdownMenu>
							{props.options.map((item: dropdownOptionProps) => (
								<ElDropdownItem {...item}>{item.label}</ElDropdownItem>
							))}
						</ElDropdownMenu>
					),
				}}
			</ElDropdown>
		)
	},
})

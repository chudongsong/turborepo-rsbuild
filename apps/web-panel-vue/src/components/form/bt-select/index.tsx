/*
 * @Descripttion: 选择器
 * @Author: chudong
 * @version: 1.0
 * @Date: 2024-09-25 11:43:00
 * @LastEditors: chudong
 * @LastEditTime: 2024-09-25 23:00:00
 */

import { ElOption, ElSelect } from 'element-plus'
import 'element-plus/theme-chalk/src/select.scss'
import 'element-plus/theme-chalk/src/option.scss'
import 'element-plus/theme-chalk/src/tag.scss'

import { has } from 'ramda'
import { SelectCustomProps, SelectOptionProps } from './types'

export default defineComponent({
	props: {
		disabled: {
			type: Boolean,
			default: false,
		},
		options: {
			type: Array as PropType<Array<SelectOptionProps | SelectCustomProps>>,
		},
	},
	setup(props, { attrs, slots }) {
		return () => (
			<ElSelect {...attrs} class={attrs.multiple === true || has('multiple', attrs) ? 'bt-multiple-select' : ''} disabled={props.disabled}>
				{props.options
					? props.options.map((item: SelectOptionProps, index: number) => {
							return (
								<ElOption key={index} label={item.label} value={item.value} disabled={item?.disabled}>
									{has('render', item) ? (
										item?.render(item, index)
									) : has('isStatus', item) ? (
										<div class="flex flex-row items-center content-between">
											<span class={`block mr-1 w-[5px] h-[5px]`} style={`background-color:${item.isStatus === 'success' ? 'var(--el-color-primary)' : item.isStatus === 'warning' ? '#2034a5' : 'red'}`}></span>
											<span>{item.label}</span>
										</div>
									) : (
										<span>{item.label}</span>
									)}
								</ElOption>
							)
					  })
					: slots?.default?.()}
				{slots?.header?.()}
				{slots?.footer?.()}
				{slots?.prefix?.()}
				{slots?.empty?.()}
				{slots?.tag?.()}
				{slots?.loading?.()}
				{slots?.label?.()}
			</ElSelect>
		)
	},
})

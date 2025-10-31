/*
 * @Descripttion: 搜索框
 * @Author: chudong
 * @version: 1.0
 * @Date: 2024-09-25 11:43:00
 * @LastEditors: chudong
 * @LastEditTime: 2024-09-25 23:00:00
 */

import BtButton from '@/components/base/bt-button'
import { ElInput, ElPopover, inputProps } from 'element-plus'

export default defineComponent({
	name: 'BtInputSearch',
	props: {
		...inputProps,
		disabledPopover: {
			type: Boolean,
			default: true,
			required: false, // 非必传
		},
		clearable: {
			type: Boolean,
			default: true,
			required: false, // 非必传
		},
	},
	emits: ['search', 'focus', 'blur'],
	setup(props, { attrs, slots, emit, expose }) {
		const isSlotsFocus = ref(false)
		// const disabled = ref(props.disabledPopover);

		/**
		 * @description 获取焦点
		 */
		const onFocus = (event: FocusEvent) => {
			emit('focus', event)
			isSlotsFocus.value = true
		}

		/**
		 * @description 失去焦点
		 */
		const onBlur = (event: FocusEvent) => {
			emit('blur', event)
			isSlotsFocus.value = false
		}

		const onClear = (e: any) => {
			console.log('onClear', e)
			// console.log('onClear', e)
			emit('search', '')
			isSlotsFocus.value = true
		}

		const onKeyup = (event: KeyboardEvent) => {
			if (event.key === 'Enter') {
				emit('search', props.modelValue)
			}
		}

		expose({
			blur: onBlur,
			focus: onFocus,
		})
		return () => (
			<ElPopover visible={isSlotsFocus.value && !props.disabledPopover} width={'auto'} auto-close={2000}>
				{{
					reference: () => (
						<ElInput {...props} {...attrs} onFocus={onFocus} onBlur={onBlur} onClear={onClear} onKeyup={onKeyup} clearable={props.clearable}>
							{{
								append: () => (
									<BtButton onClick={() => emit('search', props.modelValue)}>
										<i class="svgtofont-el-search text-medium"></i>
									</BtButton>
								), // 搜索按钮
							}}
						</ElInput>
					),
					default: () => <div>{slots.default && slots.default()}</div>,
				}}
			</ElPopover>
		)
	},
})

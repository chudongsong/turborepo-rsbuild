/*
 * @Descripttion: 输入框
 * @Author: chudong
 * @version: 1.0
 * @Date: 2024-09-25 11:43:00
 * @LastEditors: chudong
 * @LastEditTime: 2024-09-25 23:00:00
 */

import { ElInput, inputProps } from 'element-plus'
import 'element-plus/theme-chalk/src/input.scss'

export default defineComponent({
	name: 'BtInput',
	props: {
		width: {
			type: [String, Number],
			default: '100%',
		},
		textType: {
			type: String,
			default: '',
		},
		prependText: {
			type: String,
			default: '',
		},
		...inputProps,
		modelValue: {
			type: [String, Number],
			default: '',
		},
	},
	emits: ['iconClick', 'focus', 'blur', 'input', 'keyup', 'change'],
	setup(props, { slots, emit, attrs }) {
		const modelVal = ref(props.modelValue)
		const isSlotsFocus = ref(false)
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
		/**
		 * @description 输入
		 * @param {any} val
		 */
		const onInput = (val: any) => {
			emit('input', val)
		}

		/**
		 * @description 改变
		 * @param {any} val
		 */
		const onChange = (val: any) => {
			emit('change', val)
		}

		/**
		 * @description 按键抬起
		 * @param {KeyboardEvent} event
		 */
		const onKeyUp = (event: KeyboardEvent) => emit('keyup', event)
		return () => (
			<div class={`${slots.unit ? 'flex items-center' : ''}`}>
				<ElInput {...props} onInput={onInput} onChange={onChange} onFocus={onFocus} onBlur={onBlur} onKeyup={onKeyUp} {...attrs} style={{ width: props.width }}>
					{{
						...slots,

						...(slots.append || props.textType
							? {
									append: () => (slots.append ? slots.append() : <span>{props.textType}</span>),
							  }
							: {}),
						...(slots.prepend || props.prependText
							? {
									prepend: () => (slots.prepend ? slots.prepend() : <span>{props.prependText}</span>),
							  }
							: {}),
					}}
				</ElInput>
				{slots.unit && <div class="text-small text-secondary ml-[0.4rem]">{slots.unit()}</div>}
			</div>
		)
	},
})

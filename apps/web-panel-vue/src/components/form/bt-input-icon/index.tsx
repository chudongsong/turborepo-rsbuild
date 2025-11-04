/*
 * @Descripttion: 输入框
 * @Author: chudong
 * @version: 1.0
 * @Date: 2024-09-25 11:43:00
 * @LastEditors: chudong
 * @LastEditTime: 2024-09-25 23:00:00
 */

import BtButton from '@/components/base/bt-button'
import BtIcon from '@/components/base/bt-icon'
import { ElInput, inputProps } from 'element-plus'
import 'element-plus/theme-chalk/src/input.scss'
import 'element-plus/theme-chalk/src/button.scss'

export default defineComponent({
	name: 'BtInput',
	props: {
		width: {
			type: [String, Number],
			default: '100%',
		},
		icon: {
			type: String,
			default: '',
		},
		isActive: {
			type: Boolean,
			default: false,
		},
		...inputProps,
	},
	emits: ['iconClick', 'focus', 'blur'],
	setup(props, { slots, emit, attrs }) {
		const isSlotsFocus = ref(false)

		onMounted(() => {
			if (props.isActive) {
				// 触发一次iconClick事件
				emit('iconClick')
			}
		})

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

		return () => (
			<ElInput {...props} {...attrs} onFocus={onFocus} onBlur={onBlur} style={{ width: props.width }}>
				{{
					append: () => (
						<BtButton class="cursor-pointer" onClick={() => emit('iconClick')}>
							<BtIcon icon={props.icon} />
						</BtButton>
					),
					...slots,
				}}
			</ElInput>
		)
	},
})

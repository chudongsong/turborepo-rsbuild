/*
 * @Descripttion: 分割线
 * @Author: chudong
 * @version: 1.0
 * @Date: 2024-09-25 11:43:00
 * @LastEditors: chudong
 * @LastEditTime: 2024-09-25 23:00:00
 */

import { ElDivider, type DividerInstance } from 'element-plus'
import 'element-plus/theme-chalk/src/divider.scss'

export default defineComponent({
	name: 'BtDivider',
	props: {
		direction: {
			type: String as PropType<'horizontal' | 'vertical'>,
			default: 'vertical',
		},
	},
	setup(props, { attrs, slots, expose }) {
		const dividerRef = ref()
		const divider = reactive({})
		expose(dividerRef.value)
		onMounted(() => {
			Object.assign(divider, { ...(dividerRef.value as unknown as DividerInstance) })
		})
		return () => (
			<ElDivider {...attrs} {...props}>
				{slots}
			</ElDivider>
		)
	},
})

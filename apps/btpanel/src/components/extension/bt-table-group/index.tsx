/*
 * @Descripttion: 表格
 * @Author: chudong
 * @version: 1.0
 * @Date: 2024-09-25 11:43:00
 * @LastEditors: chudong
 * @LastEditTime: 2024-09-25 23:00:00
 */

export default defineComponent({
	name: 'BtTableGroup',
	setup(_, { slots }) {
		return () => (
			<div class="flex flex-col">
				<div class="flex justify-between flex-wrap" style={{ rowGap: '0.8rem' }}>
					<div class="flex flex-shrink-0">{slots['header-left'] && slots['header-left']()}</div>
					<div class="flex flex-shrink-0">{slots['header-right'] && slots['header-right']()}</div>
				</div>
				<div class="w-full content py-[12px]">{slots.content && slots.content()}</div>
				<div class="flex justify-between">
					<div class="flex flex-shrink-0">{slots['footer-left'] && slots['footer-left']()}</div>
					<div class="flex flex-shrink-0">{slots['footer-right'] && slots['footer-right']()}</div>
				</div>
				{slots.popup && slots.popup()}
			</div>
		)
	},
})

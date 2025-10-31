/*
 * @Descripttion: 自动完成
 * @Author: chudong
 * @version: 1.0
 * @Date: 2024-09-25 11:43:00
 * @LastEditors: chudong
 * @LastEditTime: 2024-09-25 23:00:00
 */

import { ElAutocomplete, autocompleteProps } from 'element-plus'
import 'element-plus/theme-chalk/src/autocomplete.scss'

export default defineComponent({
	name: 'BtAutocomplete',
	props: { ...autocompleteProps },
	setup(props, { attrs, slots }) {
		return () => (
			<ElAutocomplete {...attrs} {...props}>
				{slots}
			</ElAutocomplete>
		)
	},
})

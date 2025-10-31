/*
 * @Descripttion: 滚动条
 * @Author: chudong
 * @version: 1.0
 * @Date: 2024-09-25 11:43:00
 * @LastEditors: chudong
 * @LastEditTime: 2024-09-25 23:00:00
 */

import { ElScrollbar, scrollbarProps } from 'element-plus';
import 'element-plus/theme-chalk/src/scrollbar.scss';

export default defineComponent({
	name: 'BtScrollbar',
	props: { ...scrollbarProps },
	setup(props, { attrs, slots }) {
		return () => (
			<ElScrollbar {...props} {...attrs}>
				{slots}
			</ElScrollbar>
		);
	},
});

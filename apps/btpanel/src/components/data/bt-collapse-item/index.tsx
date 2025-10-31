/*
 * @Descripttion: 折叠面板项
 * @Author: chudong
 * @version: 1.0
 * @Date: 2024-09-25 11:43:00
 * @LastEditors: chudong
 * @LastEditTime: 2024-09-25 23:00:00
 */

import { ElCollapseItem, collapseItemProps } from 'element-plus';
import 'element-plus/theme-chalk/src/collapse-item.scss';

export default defineComponent({
	name: 'BtCollapseItem',
	props: { ...collapseItemProps },
	setup(props, { attrs, slots }) {
		return () => (
			<ElCollapseItem {...attrs} {...props}>
				{slots}
			</ElCollapseItem>
		);
	},
});

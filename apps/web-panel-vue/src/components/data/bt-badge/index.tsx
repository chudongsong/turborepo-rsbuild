/*
 * @Descripttion: 徽标
 * @Author: chudong
 * @version: 1.0
 * @Date: 2024-09-25 11:43:00
 * @LastEditors: chudong
 * @LastEditTime: 2024-09-25 23:00:00
 */

import { ElBadge, badgeProps } from 'element-plus';
import 'element-plus/theme-chalk/src/badge.scss';

export default defineComponent({
	name: 'BtBadge',
	props: { ...badgeProps },
	setup(props, { attrs, slots }) {
		return () => (
			<ElBadge {...attrs} {...props}>
				{slots}
			</ElBadge>
		);
	},
});

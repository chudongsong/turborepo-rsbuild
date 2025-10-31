/*
 * @Descripttion: 卡片
 * @Author: chudong
 * @version: 1.0
 * @Date: 2024-09-25 11:43:00
 * @LastEditors: chudong
 * @LastEditTime: 2024-09-25 23:00:00
 */

import { ElCard, cardProps } from 'element-plus';
import 'element-plus/theme-chalk/src/card.scss';

export default defineComponent({
	name: 'BtCard',
	props: { ...cardProps },
	setup(props, { attrs, slots }) {
		return () => (
			<ElCard {...attrs} {...props}>
				{slots}
			</ElCard>
		);
	},
});

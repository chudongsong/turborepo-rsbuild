/*
 * @Descripttion: 标签
 * @Author: chudong
 * @version: 1.0
 * @Date: 2024-09-25 11:43:00
 * @LastEditors: chudong
 * @LastEditTime: 2024-09-25 23:00:00
 */

import { ElTag, tagProps } from 'element-plus';
import 'element-plus/theme-chalk/src/tag.scss';

export default defineComponent({
	name: 'BtTag',
	props: { ...tagProps },
	setup(props, { attrs, slots }) {
		return () => (
			<ElTag {...attrs} {...props}>
				{slots}
			</ElTag>
		);
	},
});

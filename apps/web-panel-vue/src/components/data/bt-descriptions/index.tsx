/*
 * @Descripttion: 描述列表
 * @Author: chudong
 * @version: 1.0
 * @Date: 2024-09-25 11:43:00
 * @LastEditors: chudong
 * @LastEditTime: 2024-09-25 23:00:00
 */

import { ElDescriptions, descriptionProps } from 'element-plus';
import 'element-plus/theme-chalk/src/descriptions.scss';

export default defineComponent({
	name: 'BtDescriptions',
	props: { ...descriptionProps },
	setup(props, { attrs, slots }) {
		return () => (
			<ElDescriptions {...attrs} {...props}>
				{slots}
			</ElDescriptions>
		);
	},
});

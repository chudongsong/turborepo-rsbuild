/*
 * @Descripttion: 描述列表项
 * @Author: chudong
 * @version: 1.0
 * @Date: 2024-09-25 11:43:00
 * @LastEditors: chudong
 * @LastEditTime: 2024-09-25 23:00:00
 */

import { ElDescriptionsItem, descriptionProps } from 'element-plus';
import 'element-plus/theme-chalk/src/descriptions-item.scss';

export default defineComponent({
	name: 'BtDescriptionsItem',
	props: { ...descriptionProps },
	setup(props, { attrs, slots }) {
		return () => (
			<ElDescriptionsItem {...props} {...attrs}>
				{slots}
			</ElDescriptionsItem>
		);
	},
});

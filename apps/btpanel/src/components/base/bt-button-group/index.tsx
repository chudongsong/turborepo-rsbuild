/*
 * @Descripttion: 按钮组
 * @Author: chudong
 * @version: 1.0
 * @Date: 2024-09-25 11:43:00
 * @LastEditors: chudong
 * @LastEditTime: 2024-09-25 23:00:00
 */

import { ElButtonGroup, buttonProps } from 'element-plus';
import 'element-plus/theme-chalk/src/button-group.scss';

export default defineComponent({
	name: 'BtButtonGroup',
	props: { ...buttonProps },
	setup(props, { attrs, slots }) {
		return () => (
			<ElButtonGroup {...props} {...attrs}>
				{slots}
			</ElButtonGroup>
		);
	},
});

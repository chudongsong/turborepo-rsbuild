/*
 * @Descripttion: 按钮
 * @Author: chudong
 * @version: 1.0
 * @Date: 2024-09-25 11:43:00
 * @LastEditors: chudong
 * @LastEditTime: 2024-09-25 23:00:00
 */

import { ElButton, buttonProps } from 'element-plus';
import 'element-plus/theme-chalk/src/button.scss';

export default defineComponent({
	name: 'BtButton',
	props: { ...buttonProps },
	setup(props, { slots, attrs }) {
		return () => (
			<ElButton {...props} {...attrs}>
				{slots}
			</ElButton>
		);
	},
});

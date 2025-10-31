/*
 * @Descripttion: 数字输入框
 * @Author: chudong
 * @version: 1.0
 * @Date: 2024-09-25 11:43:00
 * @LastEditors: chudong
 * @LastEditTime: 2024-09-25 23:00:00
 */

import { ElInputNumber, inputNumberProps } from 'element-plus';
import 'element-plus/theme-chalk/src/input-number.scss';

export default defineComponent({
	name: 'BtInputNumber',
	props: {
		...inputNumberProps,
	},
	setup(props, { attrs, slots }) {
		return () => (
			<ElInputNumber {...attrs} {...props}>
				{slots}
			</ElInputNumber>
		);
	},
});

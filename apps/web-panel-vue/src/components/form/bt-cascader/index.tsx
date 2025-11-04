/*
 * @Descripttion: 级联选择
 * @Author: chudong
 * @version: 1.0
 * @Date: 2024-09-25 11:43:00
 * @LastEditors: chudong
 * @LastEditTime: 2024-09-25 23:00:00
 */

import { ElCascader, cascaderProps } from 'element-plus';
import 'element-plus/theme-chalk/src/cascader.scss';

export default defineComponent({
	name: 'BtCascader',
	props: { ...cascaderProps },
	setup(props, { attrs, slots }) {
		return () => (
			<ElCascader {...attrs} {...props}>
				{slots}
			</ElCascader>
		);
	},
});

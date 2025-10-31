/*
 * @Descripttion: 警告提示
 * @Author: chudong
 * @version: 1.0
 * @Date: 2024-09-25 11:43:00
 * @LastEditors: chudong
 * @LastEditTime: 2024-09-25 23:00:00
 */

import { alertProps, ElAlert } from 'element-plus';
import 'element-plus/theme-chalk/src/alert.scss';

export default defineComponent({
	name: 'BtAlert',
	props: { ...alertProps },
	setup(props, { attrs, slots }) {
		return () => (
			<ElAlert {...attrs} {...props}>
				{slots}
			</ElAlert>
		);
	},
});

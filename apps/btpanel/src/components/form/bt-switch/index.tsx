/*
 * @Descripttion: 开关
 * @Author: chudong
 * @version: 1.0
 * @Date: 2024-09-25 11:43:00
 * @LastEditors: chudong
 * @LastEditTime: 2024-09-25 23:00:00
 */

import { ElSwitch, switchProps } from 'element-plus';
import 'element-plus/theme-chalk/src/switch.scss';

export default defineComponent({
	name: 'BtSwitch',
	props: { ...switchProps },
	setup(props, { attrs, slots }) {
		return () => (
			<ElSwitch {...attrs} {...props}>
				{slots}
			</ElSwitch>
		);
	},
});

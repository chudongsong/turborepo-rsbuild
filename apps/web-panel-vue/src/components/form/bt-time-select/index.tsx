/*
 * @Descripttion: 时间下拉选择器
 * @Author: chudong
 * @version: 1.0
 * @Date: 2024-09-25 11:43:00
 * @LastEditors: chudong
 * @LastEditTime: 2024-09-25 23:00:00
 */

import { ElTimeSelect, timeSelectProps } from 'element-plus';
import 'element-plus/theme-chalk/src/time-select.scss';

export default defineComponent({
	name: 'BtTimeSelect',
	props: { ...timeSelectProps },
	setup(props, { attrs, slots }) {
		return () => (
			<ElTimeSelect {...attrs} {...props}>
				{slots}
			</ElTimeSelect>
		);
	},
});

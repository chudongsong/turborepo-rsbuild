/*
 * @Descripttion: 时间选择器
 * @Author: chudong
 * @version: 1.0
 * @Date: 2024-09-25 11:43:00
 * @LastEditors: chudong
 * @LastEditTime: 2024-09-25 23:00:00
 */

import { ElTimePicker } from 'element-plus';
import 'element-plus/theme-chalk/src/time-picker.scss';

export default defineComponent({
	name: 'BtTimePicker',
	setup(_, { attrs, slots }) {
		return () => <ElTimePicker {...attrs}>{slots}</ElTimePicker>;
	},
});

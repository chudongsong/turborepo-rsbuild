/*
 * @Descripttion: 头部显示
 * @Author: chudong
 * @version: 1.0
 * @Date: 2024-09-25 11:43:00
 * @LastEditors: chudong
 * @LastEditTime: 2024-09-25 23:00:00
 */

import { ElHeader } from 'element-plus';
import 'element-plus/theme-chalk/src/header.scss';

export default defineComponent({
	name: 'BtHeader',
	setup(_, { attrs, slots }) {
		return () => <ElHeader {...attrs}>{slots}</ElHeader>;
	},
});

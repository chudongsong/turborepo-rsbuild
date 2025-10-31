/*
 * @Descripttion: 主要内容
 * @Author: chudong
 * @version: 1.0
 * @Date: 2024-09-25 11:43:00
 * @LastEditors: chudong
 * @LastEditTime: 2024-09-25 23:00:00
 */

import { ElMain } from 'element-plus';
import 'element-plus/theme-chalk/src/main.scss';

export default defineComponent({
	name: 'BtMain',
	setup(_, { attrs, slots }) {
		return () => <ElMain {...attrs}>{slots}</ElMain>;
	},
});

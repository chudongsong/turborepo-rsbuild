/*
 * @Descripttion: 内容
 * @Author: chudong
 * @version: 1.0
 * @Date: 2024-09-25 11:43:00
 * @LastEditors: chudong
 * @LastEditTime: 2024-09-25 23:00:00
 */

import { ElContainer } from 'element-plus';
import 'element-plus/theme-chalk/src/container.scss';

export default defineComponent({
	name: 'BtContainer',
	setup(_, { attrs, slots }) {
		return () => <ElContainer {...attrs}>{slots}</ElContainer>;
	},
});

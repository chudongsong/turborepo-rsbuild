/*
 * @Descripttion: 选择器-虚拟滚动
 * @Author: chudong
 * @version: 1.0
 * @Date: 2024-09-25 11:43:00
 * @LastEditors: chudong
 * @LastEditTime: 2024-09-25 23:00:00
 */

import { ElSelectV2 } from 'element-plus';
import 'element-plus/theme-chalk/src/select-v2.scss';

export default defineComponent({
	name: 'BtSelectV2',
	setup(_, { attrs, slots }) {
		return () => <ElSelectV2 {...attrs}>{slots}</ElSelectV2>;
	},
});

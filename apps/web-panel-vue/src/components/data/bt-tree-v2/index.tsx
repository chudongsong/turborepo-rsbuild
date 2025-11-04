/*
 * @Descripttion: 树形控件-虚拟滚动
 * @Author: chudong
 * @version: 1.0
 * @Date: 2024-09-25 11:43:00
 * @LastEditors: chudong
 * @LastEditTime: 2024-09-25 23:00:00
 */

import { ElTreeV2 } from 'element-plus';
import 'element-plus/theme-chalk/src/tree-v2.scss';

export default defineComponent({
	name: 'BtTreeV2',
	setup(_, { attrs, slots }) {
		return () => <ElTreeV2 {...attrs}>{slots}</ElTreeV2>;
	},
});

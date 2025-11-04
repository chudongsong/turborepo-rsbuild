/*
 * @Descripttion: 树选择
 * @Author: chudong
 * @version: 1.0
 * @Date: 2024-09-25 11:43:00
 * @LastEditors: chudong
 * @LastEditTime: 2024-09-25 23:00:00
 */

import { ElTreeSelect } from 'element-plus';
import 'element-plus/theme-chalk/src/tree-select.scss';

export default defineComponent({
	name: 'BtTreeSelect',
	setup(_, { attrs, slots }) {
		return () => <ElTreeSelect {...attrs}>{slots}</ElTreeSelect>;
	},
});

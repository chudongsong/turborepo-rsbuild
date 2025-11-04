/*
 * @Descripttion: 级联选择器
 * @Author: chudong
 * @version: 1.0
 * @Date: 2024-09-25 11:43:00
 * @LastEditors: chudong
 * @LastEditTime: 2024-09-25 23:00:00
 */

import { ElCascaderPanel } from 'element-plus';
import 'element-plus/theme-chalk/src/cascader-panel.scss';

export default defineComponent({
	name: 'BtCascaderPanel',
	setup(_, { attrs, slots }) {
		return () => <ElCascaderPanel {...attrs}>{slots}</ElCascaderPanel>;
	},
});

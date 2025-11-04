/*
 * @Descripttion: 树形控件
 * @Author: chudong
 * @version: 1.0
 * @Date: 2024-09-25 11:43:00
 * @LastEditors: chudong
 * @LastEditTime: 2024-09-25 23:00:00
 */

import { ElTree } from 'element-plus';
import 'element-plus/theme-chalk/src/tree.scss';
import { treeProps } from 'element-plus/es/components/tree-v2/src/virtual-tree';

export default defineComponent({
	name: 'BtTree',
	props: { ...treeProps },
	setup(props, { attrs, slots }) {
		return () => (
			<ElTree {...attrs} {...props}>
				{slots}
			</ElTree>
		);
	},
});

/*
 * @Descripttion: 表格-虚拟滚动
 * @Author: chudong
 * @version: 1.0
 * @Date: 2024-09-25 11:43:00
 * @LastEditors: chudong
 * @LastEditTime: 2024-09-25 23:00:00
 */

import { ElTableV2, tableV2Props } from 'element-plus';
import 'element-plus/theme-chalk/src/table-v2.scss';

export default defineComponent({
	name: 'BtTableV2',
	props: { ...tableV2Props },
	setup(props, { attrs, slots }) {
		return () => (
			<ElTableV2 {...attrs} {...props}>
				{slots}
			</ElTableV2>
		);
	},
});

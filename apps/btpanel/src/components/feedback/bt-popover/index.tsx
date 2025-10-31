/*
 * @Descripttion: 气泡卡片
 * @Author: chudong
 * @version: 1.0
 * @Date: 2024-09-25 11:43:00
 * @LastEditors: chudong
 * @LastEditTime: 2024-09-25 23:00:00
 */

import { ElPopover, popoverProps } from 'element-plus';
import 'element-plus/theme-chalk/src/popover.scss';

export default defineComponent({
	name: 'BtPopover',
	props: { ...popoverProps },
	setup(props, { attrs, slots }) {
		return () => (
			<ElPopover {...attrs} {...props}>
				{slots}
			</ElPopover>
		);
	},
});

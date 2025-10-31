/*
 * @Descripttion: 时间轴项
 * @Author: chudong
 * @version: 1.0
 * @Date: 2024-09-25 11:43:00
 * @LastEditors: chudong
 * @LastEditTime: 2024-09-25 23:00:00
 */

import { ElTimelineItem, timelineItemProps } from 'element-plus';
import 'element-plus/theme-chalk/src/timeline-item.scss';

export default defineComponent({
	name: 'BtTimelineItem',
	props: { ...timelineItemProps },
	setup(props, { attrs, slots }) {
		return () => (
			<ElTimelineItem {...attrs} {...props}>
				{slots}
			</ElTimelineItem>
		);
	},
});

/*
 * @Descripttion: 时间轴
 * @Author: chudong
 * @version: 1.0
 * @Date: 2024-09-25 11:43:00
 * @LastEditors: chudong
 * @LastEditTime: 2024-09-25 23:00:00
 */

import { ElTimeline } from 'element-plus';
import 'element-plus/theme-chalk/src/timeline.scss';

export default defineComponent({
	name: 'BtTimeline',
	setup(_, { attrs, slots }) {
		return () => <ElTimeline {...attrs}>{slots}</ElTimeline>;
	},
});

/*
 * @Descripttion: 骨架屏
 * @Author: chudong
 * @version: 1.0
 * @Date: 2024-09-25 11:43:00
 * @LastEditors: chudong
 * @LastEditTime: 2024-09-25 23:00:00
 */

import { ElSkeleton, skeletonProps } from 'element-plus';
import 'element-plus/theme-chalk/src/skeleton.scss';

export default defineComponent({
	name: 'BtSkeleton',
	props: { ...skeletonProps },
	setup(props, { attrs, slots }) {
		return () => (
			<ElSkeleton {...attrs} {...props}>
				{slots}
			</ElSkeleton>
		);
	},
});

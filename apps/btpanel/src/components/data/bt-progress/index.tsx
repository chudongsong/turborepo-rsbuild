/*
 * @Descripttion: 进度条
 * @Author: chudong
 * @version: 1.0
 * @Date: 2024-09-25 11:43:00
 * @LastEditors: chudong
 * @LastEditTime: 2024-09-25 23:00:00
 */

import { ElProgress, progressProps } from 'element-plus';
import 'element-plus/theme-chalk/src/progress.scss';

export default defineComponent({
	name: 'BtProgress',
	props: { ...progressProps },
	setup(props, { attrs, slots }) {
		return () => (
			<ElProgress {...attrs} {...props}>
				{slots}
			</ElProgress>
		);
	},
});

/*
 * @Descripttion: 评分
 * @Author: chudong
 * @version: 1.0
 * @Date: 2024-09-25 11:43:00
 * @LastEditors: chudong
 * @LastEditTime: 2024-09-25 23:00:00
 */

import { ElRate, rateProps } from 'element-plus';
import 'element-plus/theme-chalk/src/rate.scss';

export default defineComponent({
	name: 'BtRate',
	props: { ...rateProps },
	setup(props, { attrs, slots }) {
		return () => (
			<ElRate {...attrs} {...props}>
				{slots}
			</ElRate>
		);
	},
});

/*
 * @Descripttion: 滑块
 * @Author: chudong
 * @version: 1.0
 * @Date: 2024-09-25 11:43:00
 * @LastEditors: chudong
 * @LastEditTime: 2024-09-25 23:00:00
 */

import { ElSlider, sliderProps } from 'element-plus';
import 'element-plus/theme-chalk/src/slider.scss';

export default defineComponent({
	name: 'BtSlider',
	props: { ...sliderProps },
	setup(props, { attrs, slots }) {
		return () => (
			<ElSlider {...attrs} {...props}>
				{slots}
			</ElSlider>
		);
	},
});

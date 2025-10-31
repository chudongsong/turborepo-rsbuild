/*
 * @Descripttion: 走马灯
 * @Author: chudong
 * @version: 1.0
 * @Date: 2024-09-25 11:43:00
 * @LastEditors: chudong
 * @LastEditTime: 2024-09-25 23:00:00
 */

import { ElCarousel, carouselProps } from 'element-plus';
import 'element-plus/theme-chalk/src/carousel.scss';

export default defineComponent({
	name: 'BtCarousel',
	props: { ...carouselProps },
	setup(props, { attrs, slots }) {
		return () => (
			<ElCarousel {...attrs} {...props}>
				{slots}
			</ElCarousel>
		);
	},
});

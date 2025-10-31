/*
 * @Descripttion: 走马灯项
 * @Author: chudong
 * @version: 1.0
 * @Date: 2024-09-25 11:43:00
 * @LastEditors: chudong
 * @LastEditTime: 2024-09-25 23:00:00
 */

import { ElCarouselItem, carouselItemProps } from 'element-plus';
import 'element-plus/theme-chalk/src/carousel-item.scss';

export default defineComponent({
	name: 'BtCarouselItem',
	props: { ...carouselItemProps },
	setup(props, { attrs, slots }) {
		return () => (
			<ElCarouselItem {...attrs} {...props}>
				{slots}
			</ElCarouselItem>
		);
	},
});

/*
 * @Descripttion: 空状态
 * @Author: chudong
 * @version: 1.0
 * @Date: 2024-09-25 11:43:00
 * @LastEditors: chudong
 * @LastEditTime: 2024-09-25 23:00:00
 */

import { ElEmpty, emptyProps } from 'element-plus';
import 'element-plus/theme-chalk/src/empty.scss';

export default defineComponent({
	name: 'BtEmpty',
	props: { ...emptyProps },
	setup(props, { attrs, slots }) {
		return () => (
			<ElEmpty {...attrs} {...props}>
				{slots}
			</ElEmpty>
		);
	},
});

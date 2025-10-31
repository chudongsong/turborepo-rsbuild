/*
 * @Descripttion: 底部显示
 * @Author: chudong
 * @version: 1.0
 * @Date: 2024-09-25 11:43:00
 * @LastEditors: chudong
 * @LastEditTime: 2024-09-25 23:00:00
 */

import { ElFooter } from 'element-plus';
import 'element-plus/theme-chalk/src/footer.scss';

export default defineComponent({
	name: 'BtFooter',
	setup(_, { attrs, slots }) {
		return () => <ElFooter {...attrs}>{slots}</ElFooter>;
	},
});

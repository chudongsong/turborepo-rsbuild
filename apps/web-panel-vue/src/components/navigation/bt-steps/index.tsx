/*
 * @Descripttion: 步骤条
 * @Author: chudong
 * @version: 1.0
 * @Date: 2024-09-25 11:43:00
 * @LastEditors: chudong
 * @LastEditTime: 2024-09-25 23:00:00
 */

import { ElSteps, stepsProps } from 'element-plus';
import 'element-plus/theme-chalk/src/steps.scss';

export default defineComponent({
	name: 'BtSteps',
	props: { ...stepsProps },
	setup(props, { attrs, slots }) {
		return () => (
			<ElSteps {...attrs} {...props}>
				{slots}
			</ElSteps>
		);
	},
});

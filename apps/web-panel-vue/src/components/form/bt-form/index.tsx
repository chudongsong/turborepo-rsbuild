/*
 * @Descripttion: 表单
 * @Author: chudong
 * @version: 1.0
 * @Date: 2024-09-25 11:43:00
 * @LastEditors: chudong
 * @LastEditTime: 2024-09-25 23:00:00
 */

import { ElForm, formProps, type FormInstance } from 'element-plus';
import 'element-plus/theme-chalk/src/form.scss';

export default defineComponent({
	name: 'BtForm',
	props: { ...formProps },
	setup(props, { attrs, slots, expose }) {
		const formRef = ref();
		const form = reactive({});
		expose(form);
		onMounted(() => {
			Object.assign(form, { ...(formRef.value as unknown as FormInstance) });
		});
		return () => (
			<ElForm ref={formRef} {...attrs} {...props}>
				{slots}
			</ElForm>
		);
	},
});

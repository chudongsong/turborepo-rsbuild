<template>
	<div class="p-[20px]">
		<div class="p-[10px]">{{ formData }}</div>
		<BtForm label-width="200px" />
	</div>
	<div class="p-[20px]">
		<div class="p-[10px]">{{ formData2 }}</div>
		<BtForm1 label-width="200px" />
	</div>
</template>

<script setup lang="tsx">
import type { FormItemProps } from '@form/types';

import { useForm } from '@/hooks/tools';
import { useGlobalStore } from '@/store/global';
import { getRandomChart } from '@/utils';
import { FormInput, FormInputPaw, FormRadioButton, FormTextarea } from '@form/form-item';

const { panel } = useGlobalStore();
const formData = reactive({
	id: '',
	name: '11111',
	path: panel.value.sitePath,
	password: getRandomChart(12),
});

const formData2 = reactive({
	id: '',
	type: 'password',
	path: panel.value.sitePath,
	password: getRandomChart(12),
});

const { BtForm: BtForm1 } = useForm({
	data: () => formData2,
	options: (formData: AnyObject): ComputedRef<FormItemProps[]> => {
		const defalut = { class: 'w-[320px]', clearable: true };
		const typeList = [
			{ label: '密码', value: 'password' },
			{ label: '密钥', value: 'key' },
		];
		return computed(
			() =>
				[
					FormInput('用户名', 'name', {
						attrs: { ...defalut, placeholder: '请输入用户名' },
					}),
					FormRadioButton('验证类型', 'type', typeList, { attrs: { ...defalut } }),
					...(formData.value.type === 'password'
						? [FormInputPaw('密码', 'password', { attrs: { ...defalut } }, () => {})]
						: [FormTextarea('密钥', 'key', { attrs: { ...defalut } }), FormInput('密码', 'password', { attrs: { ...defalut } }), FormInput('确认密码', 'password', { attrs: { ...defalut } })]),
				] as FormItemProps[]
		);
	},
});
</script>

<style scoped></style>

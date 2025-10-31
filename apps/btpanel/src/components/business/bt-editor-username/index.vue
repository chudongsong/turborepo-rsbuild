<template>
	<div class="w-[38rem] px-[5rem] py-[3rem]">
		<el-form ref="formRef" size="small" label-width="4.6rem" autocomplete="off" :model="form" :rules="rules">
			<el-form-item label="用户名" prop="username1">
				<el-input v-model="form.username1"></el-input>
			</el-form-item>
			<el-form-item class="!mb-0" label="重复" prop="username2">
				<el-input v-model="form.username2"></el-input>
			</el-form-item>
		</el-form>
	</div>
</template>

<script lang="ts" setup>
import { setUsername } from '@api/global';
import { refreshBrowser } from '@utils/index';
import { useMessage } from '@/hooks/tools';
const Message = useMessage(); // 消息提示

interface Form {
	username1: string;
	username2: string;
}
const emits = defineEmits(['resize']);

const formRef = ref<any>(null);

const form = reactive<Form>({
	username1: '',
	username2: '',
});

// 验证密码
const validatePass = (rule: any, value: any, callback: AnyFunction) => {
	if (value === '') {
		callback(new Error('请再次输入用户名'));
	} else if (value !== form.username1) {
		callback(new Error('两次输入的用户名不一致'));
	} else {
		callback();
	}
};
const rules = reactive<any>({
	username1: [
		{ required: true, message: '请输入用户名', trigger: 'blur' },
		{ min: 4, message: '用户名长度必须大于3位', trigger: 'blur' },
	],
	username2: [{ validator: validatePass, trigger: 'blur' }],
});

const onConfirm = () => {
	formRef.value?.validate(async (valid: any) => {
		if (!valid) return;

		const res = await setUsername(form);
		Message.request(res);
		if (res.status) refreshBrowser('/login?dologin=True');
	});
};

nextTick(() => {
	emits('resize');
});

defineExpose({ onConfirm });
</script>

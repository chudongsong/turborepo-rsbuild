<template>
	<div class="p-20px">
		<el-form ref="formRef" :model="form" :rules="rules">
			<el-form-item label="被抄送者" prop="user">
				<div class="w-300px">
					<el-input v-model="form.user" :disabled="propsData.isEdit" placeholder="输入需要密抄用户的邮箱"> </el-input>
				</div>
			</el-form-item>
			<el-form-item label="抄送到" prop="forward_user">
				<div class="w-300px">
					<el-input v-model="form.forward_user" placeholder="输入您需要收到密抄的邮箱"> </el-input>
				</div>
			</el-form-item>
			<el-form-item label="抄送类型" prop="type">
				<div class="w-300px">
					<bt-select v-model="form.type" :options="typeOptions"></bt-select>
				</div>
			</el-form-item>
			<el-form-item label="开启" :show-feedback="false">
				<el-switch v-model="form.active" :active-value="1" :inactive-value="0"></el-switch>
			</el-form-item>
		</el-form>
	</div>
</template>

<script lang="ts" setup>
import { MailBcc } from '@mail/types';
import MAIL_BCC_ADD from '@mail/views/setting/bcc/add/store';
import { storeToRefs } from 'pinia';
import { initForm, onConfirm } from '@mail/views/setting/bcc/add/useMethod';

const { form, propsData, formRef } = storeToRefs(MAIL_BCC_ADD());
const { rules, typeOptions } = MAIL_BCC_ADD();

interface PropsData {
	row?: MailBcc;
	isEdit: boolean;
	onRefresh: () => void;
}

interface Props {
	compData: PropsData;
}

const props = withDefaults(defineProps<Props>(), {});

nextTick(() => {
	initForm(props.compData);
});

defineExpose({
	onConfirm,
});
</script>

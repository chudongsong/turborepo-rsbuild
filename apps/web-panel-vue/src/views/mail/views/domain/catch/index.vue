<template>
	<div class="p-20px">
		<el-form ref="formRef" :model="form" :rules="rules">
			<el-form-item label=" ">
				<el-radio-group v-model="form.catch_type">
					<el-radio value="none" size="default">捕获不存在的邮箱</el-radio>
					<el-radio value="all" size="default">捕获所有邮箱</el-radio>
				</el-radio-group>
			</el-form-item>
			<el-form-item label="转发电子邮件" :show-feedback="false" prop="email">
				<el-input class="!w-290px" v-model="form.email" placeholder="捕获不存在的邮件，转发到此邮件"> </el-input>
			</el-form-item>
		</el-form>
	</div>
</template>

<script lang="ts" setup>
import { MailDomain } from '@mail/types';
import MAIL_DOMAIN_CATCH from '@mail/views/domain/catch/store';
import { storeToRefs } from 'pinia';

const store = MAIL_DOMAIN_CATCH();
const { form, formRef } = storeToRefs(store);
const { init, rules } = store;

interface PropsData {
	row: MailDomain;
	onRefresh: () => void;
}

interface Props {
	compData: PropsData;
}

const props = withDefaults(defineProps<Props>(), {});

init(props.compData);

// defineExpose({
// 	onConfirm,
// })
</script>

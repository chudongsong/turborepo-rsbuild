<template>
	<div class="p-[16px]">
		<el-form ref="formRef" class="pt-8px" :model="form" :rules="rules">
			<el-form-item label="发件人" prop="sender">
				<div class="w-350px">
					<sender-select ref="senderRef" v-model:value="form.sender" placeholder="请输入或选择用户邮箱">
					</sender-select>
				</div>
			</el-form-item>
			<el-form-item label="收件人" prop="mail_to">
				<div class="w-760px">
					<el-input v-model="form.mail_to" :placeholder="`多个收件人使用 &quot;,&quot; 来分隔收件人邮箱`"> </el-input>
				</div>
			</el-form-item>
			<el-form-item label="主题" prop="subject">
				<div class="w-760px">
					<el-input v-model="form.subject" placeholder=""> </el-input>
				</div>
			</el-form-item>
			<el-form-item label="内容" prop="content">
				<div class="w-[760px]">
					<textarea class="hidden" name="editor" id="editor" rows="10"></textarea>
				</div>
			</el-form-item>
			<el-form-item label=" " :show-feedback="false">
				<el-button type="primary" size="large" @click="onSend">发送</el-button>
			</el-form-item>
		</el-form>
		<bt-help class="ml-24px mt-24px">
			<li class="text-dangerDark">提示：此功能只建议测试发件功能用，真正使用请使用客户端软件（比如foxmail）或者api接口</li>
		</bt-help>
	</div>
</template>

<script lang="ts" setup>
import { renderCkeditor, removeCkeditor } from '@mail/useMethod'
import SenderSelect from '@mail/public/sender-select.vue'
import MAIL_SEND from '@mail/views/email/send/store'
import { storeToRefs } from 'pinia'
import { onSend } from '@mail/views/email/send/useMethod'

const { form, formRef, senderRef } = storeToRefs(MAIL_SEND())
const { rules, reset } = MAIL_SEND()

onMounted(() => {
	renderCkeditor('editor')
	senderRef.value.getList()
})

onBeforeUnmount(() => {
	removeCkeditor()
	reset()
})
</script>

<style lang="css">
.cke_editor_editor .cke_top {
	padding: 2px;
	height: 28px !important;
}
</style>

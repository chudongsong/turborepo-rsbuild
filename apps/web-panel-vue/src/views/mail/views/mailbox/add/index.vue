<template>
	<div class="p-20px">
		<el-form ref="formRef" :model="form" :rules="rules">
			<el-form-item label="名字" prop="full_name">
				<div class="w-280px">
					<el-input v-model="form.full_name" placeholder="请输入姓名"> </el-input>
				</div>
			</el-form-item>
			<el-form-item label="配额" prop="quota">
				<el-input-number v-model="form.quota" class="w-170px" :min="0" :controls="false" placeholder="输入邮箱的配额大小"> </el-input-number>
				<div class="w-100px ml-10px">
					<bt-select v-model="form.quota_unit" :options="unitOptions"></bt-select>
				</div>
			</el-form-item>
			<el-form-item label="用户类型" prop="is_admin">
				<div class="w-280px">
					<bt-select v-model="form.is_admin" :options="typeOptions"></bt-select>
				</div>
			</el-form-item>
			<el-form-item label="邮箱地址" prop="username">
				<div class="w-130px">
					<el-input v-model="form.username" :disabled="compData.isEdit" placeholder="您的域名"> </el-input>
				</div>
				<div class="w-140px ml-10px">
					<bt-select v-model="form.domain" :disabled="compData.isEdit" :filterable="true" :options="domainOptions"> </bt-select>
				</div>
			</el-form-item>
			<el-form-item label="邮箱密码" prop="password">
				<div class="w-280px">
					<el-input v-model="form.password" :placeholder="compData.isEdit ? '如果为空，密码不会更改' : '请输入您的邮箱密码'"> </el-input>
				</div>
			</el-form-item>
			<el-form-item label="状态" prop="active" :show-feedback="false">
				<el-switch v-model="form.active" :active-value="1" :inactive-value="0"></el-switch>
			</el-form-item>
		</el-form>
	</div>
</template>

<script lang="ts" setup>
import { Mailbox } from '@mail/types'
import MAIL_MAILBOX_ADD from '@mail/views/mailbox/add/store'
import { storeToRefs } from 'pinia'

const { rules, getDomainOptions, unitOptions, typeOptions, initForm } = MAIL_MAILBOX_ADD()
const { form, domainOptions, formRef } = storeToRefs(MAIL_MAILBOX_ADD())

interface PropsData {
	row?: Mailbox
	isEdit: boolean
	onRefresh: () => void
}

interface Props {
	compData: PropsData
}

const props = withDefaults(defineProps<Props>(), {})

getDomainOptions()
nextTick(() => {
	initForm(props.compData)
})
</script>

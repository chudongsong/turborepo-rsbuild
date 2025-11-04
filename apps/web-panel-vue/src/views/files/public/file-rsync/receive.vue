<template>
	<div class="p-20px">
		<el-form ref="receiveFormRef" :disabled="formDisabled" :rules="rules" :model="receiveForm">
			<el-form-item label="用户名" prop="mName">
				<bt-input class="!w-[24rem]" v-model="receiveForm.mName" :disabled="isSuccess" placeholder="请填写用户名，不能有中文或特殊符号"></bt-input>
			</el-form-item>
			<el-form-item label="密码" prop="password">
				<bt-input-icon class="!w-[24rem]" v-if="!isSuccess" icon="el-refresh" v-model="receiveForm.password" :isActive="true" @icon-click="() => (receiveForm.password = getRandomChart(16))"> </bt-input-icon>
				<bt-input v-else class="!w-[24rem]" v-model="receiveForm.password" disabled></bt-input>
			</el-form-item>
			<el-form-item label="同步到" prop="path" v-if="!isSuccess">
				<bt-input class="!w-[24rem]" v-model="receiveForm.path" disabled></bt-input>
			</el-form-item>
			<!-- <el-form-item label="备注" prop="comment" v-if="!isSuccess">
				<bt-input class="!w-[24rem]" v-model="receiveForm.comment"></bt-input>
			</el-form-item> -->
		</el-form>
		<bt-help v-if="isSuccess" class="pl-2rem" :options="[{ content: '使用上面的用户信息，前往发送数据的服务器创建发送端' }]"></bt-help>
	</div>
</template>

<script lang="ts" setup>
import { storeToRefs } from 'pinia'
import FILES_RSYNC_STORE from './store'
import { getRandomChart } from '@/utils'

const store = FILES_RSYNC_STORE()
const { formDisabled, rules, isSuccess, receiveForm, receiveFormRef } = storeToRefs(store)
</script>

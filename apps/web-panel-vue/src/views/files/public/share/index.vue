<template>
	<div class="flex flex-col p-2rem">
		<el-form ref="quickFormRef" size="small" :model="quickForm" :rules="quickRules" :disabled="disable" label-width="8rem" label-position="right" @submit.native.prevent>
			<el-form-item prop="ps" label="分享名称">
				<bt-input v-model="quickForm.ps" width="26rem" />
			</el-form-item>
			<el-form-item prop="expire" label="有效期">
				<el-radio-group v-model="quickForm.expire">
					<el-radio :label="24">1天</el-radio>
					<el-radio :label="168">7天</el-radio>
					<el-radio :label="1130800">永久</el-radio>
				</el-radio-group>
			</el-form-item>
			<el-form-item prop="password" label="提取码">
				<bt-input v-model="quickForm.password" width="20.5rem" class="mr-[.5rem]" placeholder="为空则不设置提取码" />
				<el-button type="primary" size="default" @click="quickForm.password = getRandomPwd(6)">随机</el-button>
			</el-form-item>
			<bt-help :options="help" list-style="disc" class="pl-2rem pt-2rem"> </bt-help>
		</el-form>
	</div>
</template>

<script setup lang="ts">
import { getRandomPwd } from '@/utils/index'
import { storeToRefs } from 'pinia'
import FILES_SHARE_STORE from './store'

const store = FILES_SHARE_STORE()
const { quickFormRef, quickForm, quickRules, disable } = storeToRefs(store)
const { help, init } = store

onMounted(init)
</script>

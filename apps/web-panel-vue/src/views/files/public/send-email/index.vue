<template>
	<div class="flex flex-col lib-box">
		<el-form ref="quickFormRef" size="small" :model="quickForm" :rules="quickRules" :disabled="disable" label-width="8rem" class="relative w-full p-[2rem]" label-position="right" @submit.native.prevent>
			<el-form-item prop="email" label="接受者邮箱">
				<bt-input v-model="quickForm.email" width="36rem" placeholder="请输入接收者邮箱，支持同时发送到多个邮箱，用逗号“,”隔开" />
			</el-form-item>
			<el-form-item prop="msg" label="内容">
				<bt-input type="textarea" class="max-h-[60rem]" :rows="4" v-model="quickForm.msg" width="36rem" />
			</el-form-item>
			<el-form-item prop="fileName" label="附件">
				<bt-input v-model="fileItem.fileName" width="36rem" disabled />
			</el-form-item>
		</el-form>
	</div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import FILES_SEND_EMAIL_STORE from './store'

interface Props {
	compData?: any
}

const props = withDefaults(defineProps<Props>(), {
	compData: () => ({}),
})

const store = FILES_SEND_EMAIL_STORE()
const { fileItem, quickFormRef, quickForm, quickRules, disable } = storeToRefs(store)
const { getDetail, $reset } = store

onMounted(() => {
	getDetail()
})

onUnmounted(() => {
	$reset()
})
</script>

<style lang="css" scoped>
:deep(.el-form-item__label) {
	@apply w-[9rem] text-default;
}

.el-form-item {
	@apply mb-[1.4rem];
}

.check :deep(.el-form-item__content) {
	@apply leading-[1.4];
}

:deep(.el-form .el-form-item--small.el-form-item + .el-form-item) {
	margin-top: 1.5rem !important;
}
</style>

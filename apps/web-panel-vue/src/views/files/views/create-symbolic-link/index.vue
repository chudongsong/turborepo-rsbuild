<template>
	<div class="flex flex-col p-2rem lib-box">
		<el-form ref="quickFormRef" size="small" :model="quickForm" :rules="quickRules" :disabled="quickForm.disable" class="relative w-full" label-position="right" @submit.native.prevent>
			<el-form-item prop="filename" label="名称">
				<bt-input width="30rem" v-model="quickForm.filename" placeholder="请输入软链接名称" />
			</el-form-item>
			<el-form-item prop="path" label="链接到">
				<bt-input-icon v-model="quickForm.path" width="30rem" icon="icon-file_mode" @icon-click="openFile" :placeholder="`请选择需要创建的软链的文件夹或文件`" />
			</el-form-item>
			<el-form-item label=" ">
				<span class="text-secondary text-small">* 提示：请选择需要创建的软链的文件夹或文件</span>
			</el-form-item>
		</el-form>
	</div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import FILES_CREATE_SYMBOLIC_LINK_STORE from './store'

interface Props {
	compData?: any
}

const props = withDefaults(defineProps<Props>(), {
	compData: () => ({}),
})

const store = FILES_CREATE_SYMBOLIC_LINK_STORE()
const { quickFormRef, quickForm, quickRules } = storeToRefs(store)
const { openFile, $reset } = store

onUnmounted(() => {
	$reset()
})
</script>

<style lang="css" scoped></style>

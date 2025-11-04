<template>
	<!-- 添加ip黑白表单 -->
	<el-form ref="authRef" :rules="authRules" :disabled="formDisabled" :model="authFormData" class="p-[2rem] addfrom" label-width="5rem">
		<el-form-item label="名称" prop="name">
			<bt-input v-model="authFormData.name" :disabled="!!rowData" width="20rem" placeholder="请输入名称" />
		</el-form-item>
		<el-form-item label="路径" prop="path">
			<el-autocomplete v-model="authFormData.path" class="!w-[20rem]" :disabled="!!rowData" :fetch-suggestions="querySearch" placeholder="请输入路径，例如：/web"></el-autocomplete>
		</el-form-item>
		<el-form-item label="用户名" prop="user">
			<bt-input v-model="authFormData.user" width="20rem" placeholder="请输入用户名" />
		</el-form-item>
		<el-form-item label="密码" prop="password">
			<bt-input v-model="authFormData.password" width="20rem" placeholder="请输入密码" />
		</el-form-item>
		<bt-help :options="authHelpList" class="pl-[5.6rem] pt-[2.4rem]"></bt-help>
	</el-form>
</template>
<script lang="ts" setup>
import { rowData, formDisabled, authRef, authFormData, authHelpList, authRules, initAddAuthData, querySearch, onConfirmAuth as onConfirm } from './useController';

onMounted(initAddAuthData);

defineExpose({ onConfirm });
</script>

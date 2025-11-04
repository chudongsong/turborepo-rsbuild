<template>
	<div class="p-[16px]">
		<el-form ref="logFormRef" class="h-[48rem]" :model="logData" label-width="60px" v-bt-loading="formLoading" :rules="logRules" :disabled="formDisabled">
			<el-form-item label="日志" prop="type">
				<bt-select class="!w-[24rem]" v-model="logData.type" :options="typeOptions" placeholder="请选择"></bt-select>
			</el-form-item>
			<div v-show="logData.type === 'file'" class="mt-[1.6rem]">
				<el-form-item label="访问日志" prop="accessLog">
					<bt-input-icon v-model="logData.accessLog" icon="el-folder-opened" @icon-click="openPathDialog('accessLog')" placeholder="请选择或输入目录，例如：/www/wwwlogs" width="35rem" />
				</el-form-item>
			</div>
			<div v-show="logData.type === 'rsyslog'" class="mt-[1.6rem]">
				<el-form-item label="接收地址" prop="address">
					<bt-input v-model="logData.address" placeholder="接收地址，如：202.96.128.86:9204" width="24rem" />
				</el-form-item>
				<!-- <el-form-item label="接收端口" prop="port">
					<bt-input v-model="logData.port" width="24rem" />
				</el-form-item> -->
			</div>
			<el-form-item class="mt-[1.6rem]" label=" ">
				<el-button type="primary" @click="onConfirm">保存</el-button>
			</el-form-item>
		</el-form>
		<div class="ml-[20px]">
			<bt-help :options="logHelpList"></bt-help>
		</div>
	</div>
</template>

<script setup lang="ts">
import { globalConfig, formLoading, formDisabled, logRules, logFormRef, logData, typeOptions, logHelpList, openPathDialog, initLogData, onConfirmLog as onConfirm } from './useController'

watch(
	() => globalConfig.value.proxy_log,
	val => {
		initLogData(val)
	}
)

onMounted(() => {
	initLogData(globalConfig.value.proxy_log)
})

defineExpose({
	onConfirm,
})
</script>

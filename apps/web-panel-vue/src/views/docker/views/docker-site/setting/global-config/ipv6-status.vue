<template>
	<div class="p-[20px]">
		<el-form ref="cacheFormRef" class="h-[40rem]" :model="cacheData" label-width="100px" :rules="cacheRules" v-bt-loading="formLoading" :disabled="formDisabled">
			<el-form-item label="监听IPv6" prop="status">
				<el-switch v-model="globalConfig.ipv6_status" @change="onConfirm"> </el-switch>
			</el-form-item>
		</el-form>
		<div class="ml-[20px]">
			<!-- <bt-help :options="cacheHelpList"></bt-help> -->
		</div>
	</div>
</template>

<script setup lang="ts">
import { globalConfig, formLoading, formDisabled, cacheFormRef, cacheData, cacheHelpList, cacheRules, onConfirmIpv6 as onConfirm } from './useController'

defineExpose({
	onConfirm,
})
</script>

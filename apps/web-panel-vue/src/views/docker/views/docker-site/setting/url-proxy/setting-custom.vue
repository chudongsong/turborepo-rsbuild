<template>
	<div class="p-[20px]">
		<el-form ref="customFormRef" :model="customData" label-width="100px" v-bt-loading="formLoading" :disabled="formDisabled">
			<el-form-item label="需要插入的配置" prop="config">
				<bt-input v-model="customData.config" :placeholder="customTip" type="textarea" width="42rem" :rows="6" resize="none" />
			</el-form-item>
			<el-form-item label=" ">
				<el-button type="primary" @click="onConfirm">保存</el-button>
			</el-form-item>
		</el-form>
		<bt-help :options="customHelpList" class="mt-2rem ml-[20px]"></bt-help>
	</div>
</template>

<script setup lang="ts">
import { proxyData, customTip, customData, formDisabled, formLoading, customHelpList, initCustomData, onConfirmCustom as onConfirm } from './useController'

watch(
	() => proxyData.value.custom_conf,
	val => {
		if (val) {
			customData.config = val
		}
	}
)

onMounted(initCustomData)
</script>

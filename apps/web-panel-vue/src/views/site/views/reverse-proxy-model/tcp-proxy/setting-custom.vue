<template>
	<div class="p-[20px]">
		<el-form ref="customFormRef" :model="customData" label-width="100px">
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
import { rowData, customTip, customData, customHelpList, initCustomData, onConfirmCustom as onConfirm } from './useController'

watch(
	() => rowData.value.custom,
	val => {
		if (val) {
			customData.config = val
		}else{
			customData.config = ''
		}
	}
)

onMounted(initCustomData)
</script>

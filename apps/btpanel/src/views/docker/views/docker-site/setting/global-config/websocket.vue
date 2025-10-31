<template>
	<div class="p-[20px]">
		<el-form ref="customFormRef" :model="formData" label-width="100px" v-bt-loading="formLoading" :disabled="formDisabled">
			<el-form-item label="websocket支持" label-width="100px">
				<el-switch v-model="formData.websocket" @change="setSocketEvent"> </el-switch>
			</el-form-item>
		</el-form>
	</div>
</template>

<script setup lang="ts">
import { globalConfig, formLoading, formDisabled, formData, setSocketEvent, initSocketData } from './useController'

watch(
	() => globalConfig.value.websocket,
	val => {
		initSocketData(val)
	}
)

onMounted(() => {
	initSocketData(globalConfig.value.websocket)
})
</script>

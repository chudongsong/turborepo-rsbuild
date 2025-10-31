<template>
	<div class="p-[20px]">
		<el-form class="h-[38rem]" :model="bufferData" label-width="140px">
			<el-form-item label="proxy_buffering开关" prop="status">
				<el-switch v-model="bufferData.status" @change="onConfirm"> </el-switch>
			</el-form-item>
			<!-- <el-form-item label=" ">
				<el-button type="primary" v-show="cacheData.status" class="!mt-[1.6rem]" @click="onConfirm">保存</el-button>
			</el-form-item> -->
		</el-form>
		<div class="ml-[0px]">
			<bt-help :options="bufferHelpList"></bt-help>
		</div>
	</div>
</template>

<script setup lang="ts">
import { proxyData, bufferData, bufferHelpList, onConfirmBuffer as onConfirm } from './useController'

watch(
	() => proxyData.value.proxy_buffering,
	val => {
		bufferData.status = !!val
	},
	{ immediate: true }
)
</script>

<template>
	<div>
		<div class="flex items-end mb-[12px]" v-bt-loading="viewLoading" v-bt-loading:title="'正在加载中，请稍后...'">
			<bt-input v-model="domainData" type="textarea" resize="none" :rows="12" width="42rem" class="!w-42rem" placeholder="请输入内容"></bt-input>
			<el-button type="primary" class="!ml-[12px]" @click="saveDefaultData"> 保存 </el-button>
		</div>
		<bt-help :options="[{ content: '默认文档，每行一个，优先级由上至下' }]" class="ml-[20px] mt-[20px]"></bt-help>
	</div>
</template>

<script setup lang="ts">
import { domainData, getDefaultData, saveDefaultData, viewLoading } from './useController'

onMounted(getDefaultData)
defineExpose({
	init: getDefaultData,
})
</script>

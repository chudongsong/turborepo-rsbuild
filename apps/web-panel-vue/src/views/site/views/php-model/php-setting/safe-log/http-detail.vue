<template>
	<div class="flex-wrap">
		<bt-log class="h-[40rem] !rounded-none" :content="logContent" />
	</div>
</template>
<script lang="tsx" setup>
import { initHttpDetail, logContent } from './useController';
// 页面加载完成
onMounted(initHttpDetail);
</script>

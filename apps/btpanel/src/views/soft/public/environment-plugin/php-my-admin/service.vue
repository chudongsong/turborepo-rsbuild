<template>
	<div class="p-[16px]">
		<div class="flex items-center w-full mb-[16px]">
			<div class="relative w-[14rem] bg-darker h-[4.2rem] mr-[24px] rounded-small">
				<div class="h-[4rem] leading-[4rem] text-center w-full cursor-pointer link-hover" @click="goPhpAdmin('panel')">通过面板访问</div>
				<span class="bg-contain inline-block recommend-bg absolute -top-[0.1rem] -left-[0.1rem]"></span>
			</div>
			<div class="relative w-[14rem] bg-darker h-[4.2rem] rounded-small">
				<div class="h-[4rem] leading-[4rem] text-center w-full cursor-pointer link-hover" @click="goPhpAdmin()">通过公共访问</div>
			</div>
		</div>
		<bt-help :options="phpHelpList" class="pl-2rem list-disc"></bt-help>
	</div>
</template>

<script setup lang="ts">
import { phpHelpList, goPhpAdmin } from './useController'
</script>

<style lang="css" scoped>
.recommend-bg {
	background-image: url('/static/payment/recommend.svg');
	@apply w-[3.2rem] h-[3.2rem];
}
.link-hover:hover {
	background-color: var(--el-color-primary);
	color: var(--el-color-white);
}
</style>

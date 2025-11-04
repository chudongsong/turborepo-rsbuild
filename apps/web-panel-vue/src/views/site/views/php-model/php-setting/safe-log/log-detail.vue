<template>
	<div class="p-[16px]">
		<div class="flex flex-col border border-dark">
			<div class="flex h-[3rem] items-center border-dark border-b px-[1rem]">
				<div class="item">
					<div class="title">时间</div>
					<div class="w-[22rem]">{{ formatTime(logDetail.addtime || 0) }}</div>
				</div>
				<div class="item">
					<div class="title">用户IP</div>
					<bt-link @click="addIpWhite(logRowData.data)" title="加入白名单">{{ logDetail.address }}</bt-link>
				</div>
			</div>
			<div class="flex h-[3rem] items-center px-[1rem]">
				<div class="item">
					<div class="title">触发函数</div>
					<div class="w-[22rem]">{{ logDetail.fun_name || '' }}</div>
				</div>
				<div class="item">
					<div class="title">过滤器</div>
					<div>{{ logDetail.intercept || '' }}</div>
				</div>
			</div>
		</div>
		<div class="s-title">URL地址</div>
		<div class="con-box">{{ logDetail.url }}</div>
		<div class="s-title">User-Agent</div>
		<div class="con-box">
			{{ logDetail.data_info?.data?.request?.headers['user-agent'] || '' }}
		</div>
		<div class="s-title">
			传入值
			<bt-link @click="addUrlWhite(logRowData.data)">URL加白</bt-link>
		</div>
		<div class="con-box">
			{{ logDetail.data_info?.data?.args?.join('\n') || '' }}
		</div>
		<div class="s-title">调用栈</div>
		<div class="con-box">
			{{ logDetail.data_info?.data?.stack_trace?.join('\n') || '' }}
		</div>
		<template v-if="logDetail.fun_name === 'move_uploaded_file'">
			<div class="s-title">风险文件</div>
			<div class="con-box">{{ logDetail.data_info?.filename || '' }}</div>
		</template>
	</div>
</template>
<script lang="tsx" setup>
import { formatTime } from '@/utils'
import { addIpWhite, addUrlWhite, initLogDetail, logDetail, logRowData } from './useController'

// 页面加载完成
onMounted(initLogDetail)
</script>
<style lang="css" scoped>
.item {
	@apply flex;
}
.item .title {
	@apply w-[8rem] font-bold;
}
.s-title {
	@apply mt-[2rem] font-bold flex items-center pl-[1rem] h-[3rem] justify-between;
}
.con-box {
	@apply border border-dark rounded-base bg-light p-[1rem];
}
</style>

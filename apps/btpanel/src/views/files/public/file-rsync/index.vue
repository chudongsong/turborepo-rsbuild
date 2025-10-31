<template>
	<div class="p-24px">
		<div class="flex justify-between items-center h-full px-[3rem]">
			<div @click="handleClick('receive', true, () => emits('close'))" class="block-hover flex flex-col items-center bg-[#EEEEEE] border border-[#ddd] p-16px cursor-pointer mr-24px">
				<span class="font-bold text-base mb-12px">接收端</span>
				<span>我需要从其他服务器中接收数据</span>
			</div>
			<div @click="handleClick('send', true, () => emits('close'))" class="block-hover flex flex-col items-center bg-[#EEEEEE] border border-[#ddd] p-16px cursor-pointer">
				<span class="font-bold text-base mb-12px">发送端</span>
				<span>我需要将本服务器数据发送出去</span>
			</div>
		</div>
		<ul class="mt-24px list-disc ml-20px leading-10">
			<li>注意：不同的同步任务及服务器请不要使用相同的同步名称及用户名，这会导致管理混乱。</li>
			<li>
				<bt-link href="https://www.bt.cn/bbs/thread-98022-1-1.html">详细使用方法，请点击这里查看教程</bt-link>
			</li>
		</ul>
	</div>
</template>

<script lang="ts" setup>
import FILES_RSYNC_STORE from './store'

const { handleClick } = FILES_RSYNC_STORE()

const emits = defineEmits(['close'])
</script>

<style lang="css">
.block-hover {
	@apply transition-all duration-300;
	border-radius: 4px;
}

.block-hover:hover {
	background: #20a53a;
	border-color: #20a53a;
	color: #fff;
	@apply transition-all duration-300;
	cursor: pointer;
}
</style>

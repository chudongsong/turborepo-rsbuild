<template>
	<div class="online-service">
		<div class="text-medium pt-6 pb-2 font-bold text-primary">在线客服</div>
		<bt-image src="/other/customer-qrcode.png" class="w-[14rem] mt-1rem" />
		<div class="flex text-base font-bold justify-center items-center mt-1rem">
			<i class="svgtofont-icon-scan text-large text-tertiary mr-2 mt-[0.2rem]"></i>
			<span class="text-tertiary">微信扫码</span>
		</div>
		<hr style="border-top: 1px solid var(--el-color-border-dark-tertiaryer)" class="w-[160px] h-[1px] bg-darker mx-[auto] my-[10px]" />
		<bt-link bt-link href="https://www.bt.cn/new/wechat_customer" class="text-base px-[4px]">
			点击咨询客服
			<span class="svgtofont-el-caret-right"></span
		></bt-link>
	</div>
</template>

<style lang="css">
.online-service {
	@apply flex flex-col flex-wrap items-center bg-lighter rounded-base pb-2rem;
}
</style>

<template>
	<div class="p-[3.4rem]">
		<div class="plan">
			<div class="title">修复方案一：</div>
			<div class="content">请根据当前风险项提供的解决方案手动修复</div>
		</div>
		<div class="plan">
			<div class="title">修复方案二（<span>推荐，简单快捷</span>）：</div>
			<div class="content">
				<span>使用微信扫描二维码，联系客服，付费修复</span>
				<div class="qrcode">
					<bt-image :src="'customer/customer-qrcode.png'" />
				</div>
			</div>
		</div>
	</div>
</template>

<style lang="css" scoped>
.plan {
	@apply mb-[1.5rem];
}
.plan div {
	line-height: 2.4rem !important;
}
.plan .title {
	@apply text-base font-bold text-default;
}
.plan .content {
	@apply text-tertiary;
}
.plan .content .qrcode {
	@apply w-[10rem] h-[10rem] relative rounderd-[.2rem] border border-primary mt-[1rem];
}
.plan .content .qrcode img {
	@apply w-[9rem] h-[9rem];
}
</style>

<template>
	<div class="buy-authorization-view buy-ltd">
		<div class="text-center pt-2.5rem">
			<div class="flex items-center justify-center">
				<i class="w-[4rem] h-3.7rem inline-block buy-title-icon mr-[6px]"></i>
				<span class="text-subtitleLarge font-bold buy-title"> 恭喜获取您获得14天企业版试用特权 </span>
			</div>
		</div>
		<!-- <div class="flex">{{ countdown }}秒后自动关闭</div> -->
		<div class="relative-background">
			<div class="relative-content">
				<div v-for="(item, index) in typeTipsList" :key="index" class="relative-text inline-block pl-2.5rem w-[20rem] text-left">
					<i class="svgtofont-el-check have-icon"></i>
					<span class="icon-text">{{ item }}</span>
				</div>
			</div>
		</div>
	</div>
</template>

<script lang="ts" setup>
const typeTipsList = ['5分钟极速响应', '15天无理由退款', '30+款付费插件', '20+企业版专享功能']

const emits = defineEmits(['close'])
const countdown = ref(10)
onMounted(() => {
	const timer = setInterval(() => {
		if (countdown.value <= 0) {
			clearInterval(timer)
			emits('close')
		} else {
			countdown.value--
		}
	}, 1000)
})
</script>

<style lang="css" scoped>
.buy-success-info div {
	border: 1px solid var(--bt-ltd-border-color);
}

.buy-authorization-view {
	background-image: url('/static/payment/ltd-success-title-bg.svg');
	background-size: contain;
}

.buy-authorization-view .text-center .buy-title-icon {
	background-image: url('/static/payment/ltd-success-title-icon.svg');
	background-repeat: no-repeat;
	background-size: 80%;
}

.buy-authorization-view .text-center .buy-title {
	background: linear-gradient(180deg, var(--bt-ltd-light-bg-color) 20%, var(--bt-ltd-color) 100%);
	-webkit-background-clip: text;
	-webkit-text-fill-color: transparent;
}

.buy-authorization-view .text-center .info-account-number {
	color: var(--bt-ltd-light-color);
}

.buy-authorization-view .text-center .info-other {
	color: var(--bt-ltd-light-color);
}

.buy-authorization-view .relative-background {
	width: 100%;
	background: url('/static/payment/ltd-privilege.svg') no-repeat center;
	background-size: contain;
	height: 200px;
	margin-top: 7rem;
	margin-bottom: 2rem;
}

.buy-authorization-view .relative-background .relative-content {
	padding-top: 6rem;
	padding-left: 6rem;
}

.buy-authorization-view .relative-background .relative-content .have-icon {
	color: var(--bt-ltd-sub-bg-color);
}

.buy-authorization-view .relative-background .relative-content .relative-text {
	font-size: var(--el-font-size-base);
	color: var();
	margin-bottom: 2rem;
}
/*  */
</style>

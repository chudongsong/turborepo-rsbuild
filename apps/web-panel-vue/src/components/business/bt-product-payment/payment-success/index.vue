<template>
	<div :class="'buy-authorization-view buy-' + type">
		<div class="text-center pt-2.5rem">
			<div>
				<i class="w-[4rem] h-3.7rem inline-block buy-title-icon"></i>
				<span class="text-large36 font-bold buy-title"> 恭喜您购买{{ type == 'pro' ? '专业版' : type == 'ltd' ? '企业版' : type == 'plugin' ? title : '企业运维托管' }}成功 </span>
			</div>
			<div class="buy-success-info mt-2rem text-base">
				<span class="info-account-number">当前账号：{{ bindUser }}</span>
				<div class="inline-block h-1.2rem mx-[16px]"></div>
				<span class="info-other">{{ cycle }}{{ count }}台</span>
				<div class="inline-block h-1.2rem mx-[16px]"></div>
				<span class="info-other">{{ lastTime }}到期</span>
			</div>
		</div>
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
import { storeToRefs } from 'pinia'
import PRODUCT_PAYMENT_STORE from '../store'

const store = PRODUCT_PAYMENT_STORE()
const { bindUser, paySuccessData } = storeToRefs(store)

const { type, cycle, count, lastTime, typeTipsList, title } = paySuccessData.value
</script>

<style lang="css" scoped>
.buy-success-info div {
	border: 1px solid var(--bt-ltd-border-color);
}

.buy-authorization-view {
	background: url('/static/payment/ltd-success-title-bg.svg');
}

.buy-authorization-view .text-center .buy-title-icon {
	background: url('/static/payment/ltd-success-title-icon.svg');
}

.buy-authorization-view .text-center .buy-title {
	background: linear-gradient(180deg, var(--bt-ltd-light-color) 20%, var(--bt-ltd-sub-color) 100%);
	-webkit-background-clip: text;
	-webkit-text-fill-color: transparent;
}

.buy-authorization-view .text-center .info-account-number {
	color: var(--bt-ltd-sub-bg-color);
}

.buy-authorization-view .text-center .info-other {
	color: var(--bt-ltd-light-color);
}

.buy-authorization-view .relative-background {
	background: url('/static/payment/ltd-privilege.svg') no-repeat center;
	height: 33rem;
	margin-top: 7rem;
	margin-bottom: 2rem;
}

.buy-authorization-view .relative-background .relative-content {
	padding-top: 11rem;
	padding-left: 4.5rem;
}

.buy-authorization-view .relative-background .relative-content .have-icon {
	color: var(--bt-ltd-color);
}

.buy-authorization-view .relative-background .relative-content .relative-text {
	font-size: var(--el-font-size-base);
	color: var(--el-color-text-tertiary);
	margin-bottom: 4rem;
}

/* 专业版 */
.buy-authorization-view.buy-pro {
	background: url('/static/payment/pro-success-title-bg.svg');
}

.buy-authorization-view.buy-pro .info-account-number,
.buy-authorization-view.buy-pro .buy-title {
	color: var(--bt-pro-color);
	-webkit-text-fill-color: var(--bt-pro-color);
}

.buy-authorization-view.buy-pro .info-other {
	color: var(--bt-pro-sub-color);
}

.buy-authorization-view.buy-pro .buy-title-icon {
	background: url('/static/payment/pro-success-title-icon.svg');
}

.buy-authorization-view.buy-pro .relative-background {
	background: url('/static/payment/pro-privilege.svg') no-repeat center;
	height: 29rem;
}

.buy-authorization-view.buy-pro .relative-background .have-icon {
	color: var(--bt-pro-light-color);
}
</style>

<template>
	<section class="my-[4.5rem] text-center">
		<div class="text-extraLarge text-ltd mb-[4.2rem]">您还有一张优惠券未使用</div>
		<div class="voucher-content h-[8rem] mb-2rem inline-block relative">
			<div class="voucher-amount inline-flex items-center text-white text-extraLarge justify-center inline-block h-full align-top leading-[9rem] px-1rem">
				￥<span class="text-large36">{{ Math.floor(val2) }}</span>
			</div>
			<div class="p-[1.5rem] inline-block bg-extraLight text-left voucher-instructions h-full">
				<div class="text-base text-secondary mb-1rem h-[1.4rem]">大额优惠券</div>
				<div class="max-out rounded-small text-ltd text-small px-[1rem] py-[0.6rem]">满{{ Math.floor(val1) }}使用，仅{{ proTitle }}</div>
			</div>
		</div>
		<div class="mt-[3rem] voucher-footer">
			<span class="text-white bg-ltd hover:bg-[var(--bt-ltd-sub-color)]" @click="changeVoucher()">立即使用</span>
		</div>
	</section>
</template>

<script lang="ts" setup>
import { storeToRefs } from 'pinia'
import PRODUCT_PAYMENT_STORE from '../store'

const store = PRODUCT_PAYMENT_STORE()
const { couponCompData } = storeToRefs(store)
const { changeVoucher } = store

const { val1, val2, proTitle } = couponCompData.value
</script>

<style lang="css" scoped>
.voucher-amount {
	background: linear-gradient(to right, var(--bt-ltd-sub-bg-color), var(--bt-ltd-light-bg-color));
	@apply rounded-l-small;
}

.voucher-instructions {
	border: 1px solid var(--bt-ltd-border-color);
	@apply rounded-r-small;
}

.max-out {
	background: var(--bt-ltd-light-bg-color);
}

.voucher-content::after,
.voucher-content::before {
	@apply content-[''] absolute block w-[.9rem] h-[1.8rem] bg-white;
	border: 1px solid var(--el-color-white);
}

.voucher-content::after {
	@apply right-0 top-[50%] -mt-[.9rem] rounded-l-large;
	border-right: none;
	border-color: var(--bt-ltd-border-color);
}

.voucher-content::before {
	@apply -left-[2px] top-[50%] -mt-[.9rem] rounded-r-large;
	border-left: none;
}

.voucher-footer span {
	@apply h-[3.6rem] text-base py-[0.8rem] px-[4rem] rounded-extraLarge cursor-pointer;
}
</style>

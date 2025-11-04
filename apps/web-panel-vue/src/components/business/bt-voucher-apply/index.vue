<template>
	<div v-if="voucherList.length > 0 && !isGetCoupon && !aliyunEcsLtd" class="flex items-center px-[1rem] py-[.4rem] mr-[8px] rounded-small recom-bg" @click="changeVoucher">
		<span class="icon-end-time voucher-logo">
			<span class="ml-[4px] font-bold text-[var(--bt-pro-sub-color)]">您有{{ voucherList.length }}个优惠券待领取</span>
		</span>
	</div>
</template>

<script setup lang="ts">
import { useDataHandle, useDialog } from '@/hooks/tools'
import { delayExecAsync } from '@/public/index'
import { getPaymentCouponList, ignoreCouponTime } from '@api/global'
import { useGlobalStore } from '@store/global'
// import PRODUCT_PAYMENT_STORE from '@/components/business/bt-product-payment/store.tsx'

const voucherList = ref<AnyObject[]>([])

const { payment, aliyunEcsLtd } = useGlobalStore()
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const { voucherOpenTime, isGetCoupon } = toRefs(payment.value)

/**
 * @description 获取优惠券列表
 */
const getVoucherList = async () => {
	useDataHandle({
		request: getPaymentCouponList(),
		data: [Array, voucherList],
	})
}

/**
 * @description 打开优惠券弹窗
 */
const changeVoucher = () => {
	if (aliyunEcsLtd.value) return
	useDialog({
		area: 40,
		component: () => import('@/components/business/bt-product-payment/coupon-collection/index.vue'),
		customClass: 'voucherFetchView',
		compData: {
			isCoupon: voucherList.value,
			isHome: true,
		},
	})
}

// 选择关闭的时间 一周不显示
const changeCloseTime = async () => {
	let time = new Date(new Date().toLocaleDateString()).getTime() + 7 * 24 * 60 * 60 * 1000 - 1
	time = Math.floor(time > 0 ? time / 1000 : time) // 传给后端的时间戳
	useDataHandle({
		request: ignoreCouponTime({ limit_time: time }),
	})
	isGetCoupon.value = true
}

onMounted(() => {
	const endTime = Number(sessionStorage.getItem('voucherOpenTime'))
	if (endTime === -100) return
	if (endTime) {
		const diff = endTime - Math.floor(Date.now() / 1000) // 倒计时剩余时间
		if (diff <= 0) {
			isGetCoupon.value = true
			sessionStorage.removeItem('voucherOpenTime')
			changeCloseTime()
		}
	}
	delayExecAsync({
		promises: [getVoucherList],
		delay: 3000, // 3秒后请求优惠券列表
	})
})
</script>

<style lang="css" scoped>
.recom-bg {
	@apply bg-[var(--el-color-warning-light-9)] rounded-base;
}

.icon-end-time {
	@apply flex items-center h-[2.2rem] pl-6 bg-no-repeat bg-left cursor-pointer leading-[2.2rem] relative background-size: 1.4rem;
}

.icon-end-time::after {
	@apply content-[''] inline-block w-[0] h-[0] top-[50%] -left-[1.8rem] -mt-[.5rem] absolute;
	border-top: 6px solid transparent;
	border-bottom: 6px solid transparent;
	border-right: 8px solid var(--el-color-warning-light-9);
}

.voucher-logo {
	background-image: url('/static/images/vip/voucher-icon.svg');
}
</style>

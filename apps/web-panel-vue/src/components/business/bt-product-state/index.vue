<template>
	<div class="flex items-center mr-[1.2rem]" :class="authType + '-theme'">
		<span :class="(authType === 'free' && !props.isHome ? 'icon-end-time ' : 'icon-end-time-free ') + 'icon-' + (authType === 'free' ? 'un' : '') + 'paid-' + (authType === 'free' ? recommendAuth : authType) + ' text-small'" @click="openProductPayView">
			{{ authType === 'ltd' ? '企业版' : authType === 'pro' ? '专业版' : '企业版' }}
		</span>
		<template v-if="authType !== 'free'">
			<span class="leading-[1.6rem] ml-[.5rem]">
				<span
					class="font-bold !mr-2 text-small"
					:class="{
						'text-danger': authRemainingDays < 7,
						'text-warning': authRemainingDays >= 7,
					}">
					{{ authExpirationTime }}
				</span>
			</span>
			<bt-link v-if="authRemainingDays !== 0 && authExpirationTime !== '永久授权'" class="!align-top font-bold" @click="openProductPayView"> 续费 </bt-link>
		</template>
		<!-- <button v-show="authType === 'free' && !props.isHome" class="recom-btn" @click="openProductPayView">立即体验</button> -->
	</div>
</template>

<script setup lang="ts">
import { productPaymentDialog } from '@/public'
import { useGlobalStore } from '@store/global'

const { authRemainingDays, authExpirationTime, payment, aliyunEcsLtd, forceLtd } = useGlobalStore()
const { recommendAuth, authType } = toRefs(payment.value)

const props = withDefaults(defineProps<{ disablePro?: boolean; isHome?: boolean }>(), {
	disablePro: false,
	isHome: false,
})

const showClose = computed(() => {
	if (aliyunEcsLtd.value && payment.value.authType !== 'ltd') return false
	// if (forceLtd.value && payment.value.authType !== 'ltd') return false
	return true
})

/**
 * @description 打开产品支付弹窗
 */
const openProductPayView = () => {
	const config = { disablePro: true }
	if (authType.value === 'pro') config.disablePro = false // 如果当前是专业版，不禁用专业版
	productPaymentDialog({
		disablePro: config.disablePro,
		sourceId: 27,
		showClose: showClose.value,
	})
}
</script>

<style lang="css" scoped>
.recom-bg {
	@apply bg-[var(--bt-pro-bg-color)] rounded-base;
}

.recom-btn {
	@apply bg-[var(--bt-pro-sub-color)] text-white w-[6.2rem] h-[2.4rem] rounded-small px-[.6rem] py-[.2rem] border-none opacity-80;
}

.recom-btn:hover {
	@apply bg-[var(--bt-pro-sub-bg-color)];
}

.icon-end-time {
	@apply flex items-center h-[2.2rem] pl-28 bg-no-repeat bg-left cursor-pointer leading-[2.2rem] relative;
	background-size: 6.4rem;
}

.icon-end-time::after {
	@apply content-[''] inline-block w-[0] h-[0] top-[50%] -right-[1.8rem] -mt-[.5rem] absolute;
	border-top: 6px solid transparent;
	border-bottom: 6px solid transparent;
	border-left: 8px solid var(--bt-pro-bg-color);
}

.icon-end-time-free {
	@apply flex items-center h-[2.2rem] pl-28 bg-no-repeat bg-left cursor-pointer leading-[2.2rem] relative;
	background-size: 6.4rem;
	background-position: 0 2px;
}

.icon {
	@apply h-[2.2rem] w-[6.4rem];
}

.icon-paid-pro {
	background-image: url('/static/images/vip/vip-pro.svg');
}

.icon-unpaid-pro {
	background-image: url('/static/images/vip/vip-pro-not.svg');
}

.icon-unpaid-ltd,
.icon-paid-ltd {
	background-color: var(--el-color-text-tertiary);
	color: var(--el-color-white);
	border-radius: var(--el-border-radius-extra-large);
	padding-left: 28px;
	padding-right: 12px;
	margin-right: 4px;
	background-image: url('/static/images/home/home-vip-pop-img.png');
	background-size: 15px 15px;
	background-position: left 8px top 3px;
	filter: grayscale(100%);
}
.icon-unpaid-ltd.icon-end-time-free {
	color: var(--el-color-white);
}
.ltd-theme {
	color: var(--el-fill-color-darker);
}

/* .icon-unpaid-ltd::after,
.icon-paid-ltd::after {
	content: '企业版';
	color: var(--el-color-white);
	font-size: var(--el-font-size-small);
} */
.icon-paid-ltd {
	background:
		url('/static/images/home/home-vip-pop-img.png') no-repeat left 8px top 3px/15px 15px,
		linear-gradient(90deg, var(--bt-ltd-color-linear-1) 0%, var(--bt-ltd-color-linear-2) 50%, var(--bt-ltd-color-linear-1) 100%);
	filter: grayscale(0);
}
.icon-paid-ltd::after {
	color: var(--bt-pro-light-color);
}
</style>

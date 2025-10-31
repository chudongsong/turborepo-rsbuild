<template>
	<div class="header-pop-vip w-full bg-white p-0">
		<!-- 头部 -->
		<div class="header-pop-vip-header flex items-center justify-between px-6 pt-6 pb-4 rounded-t-base">
			<span class="header-pop-vip-title font-bold font-italic">企业版VIP特权</span>
			<button @click="openProductPayView" class="header-pop-vip-btn w-48 h-16 border-solid border-[1px] border-[var(--bt-ltd-color)] tracking-widest py-2 rounded-full font-bold text-medium text-[var(--bt-ltd-light-bg-color)]">立即开通</button>
		</div>
		<!-- 内容区 -->
		<div class="grid grid-cols-3 grid-rows-2 gap-x-[20px] gap-y-[20px] px-6 pb-8 pt-10 bg-[var(--el-fill-color-light)]">
			<div v-for="(item, idx) in list" :key="idx" class="flex items-center">
				<span class="icon-square flex items-center justify-center w-[2rem] h-[2rem] rounded-base mr-2 flex-shrink-0 flex-grow-0">
					<bt-svg :name="`tools-${item.icon}`" size="20" class="vip-icon" />
				</span>
				<span class="text-base font-bold text-default flex-1 min-w-0 break-words">
					{{ item.text }}
				</span>
			</div>
		</div>
	</div>
</template>

<script setup lang="tsx">
import { productPaymentDialog } from '@/public'
import { useGlobalStore } from '@store/global'
const { payment, aliyunEcsLtd, forceLtd } = useGlobalStore()
const { authType } = toRefs(payment.value)

const showClose = computed(() => {
	if (aliyunEcsLtd.value && payment.value.authType !== 'ltd') return false
	// if (forceLtd.value && payment.value.authType !== 'ltd') return false
	return true
})

const list = [
	{ text: '5分钟极速响应', icon: 'speed' },
	{ text: '15天无理由退款', icon: 'fifteen' },
	{ text: '30+款付费插件', icon: 'plugin' },
	{ text: '20+企业版专享功能', icon: 'more' },
	{ text: '2张SSL商业证书(年付)', icon: 'recom' },
	{ text: '1000条免费短信(年付)', icon: 'message' },
]

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

<style scoped lang="scss">
.header-pop-vip-header {
	background:
		url('/static/images/home/home-vip-pop-img.png') no-repeat left 13px top 3px/80px 80px,
		linear-gradient(120deg, #ffe7b7 0%, #fff1d2 40%, #fdb94d 100%);
	position: relative;
	min-height: 70px;
	padding-left: 100px;
}
.header-pop-vip-title {
	background: linear-gradient(90deg, #806425 20%, #c5a54d 50%, #806425 100%);
	-webkit-background-clip: text;
	-webkit-text-fill-color: transparent;
	background-clip: text;
	font-size: var(--el-font-size-subtitle-large);
	padding-right: 8px;
}
.header-pop-vip-btn {
	background: linear-gradient(90deg, #634825 0%, #3c2f19 50%, #634825 100%);
	transition: filter 0.2s;
}
.header-pop-vip-btn:hover {
	filter: brightness(0.95);
}
.icon-square {
	color: var(--el-color-white);
	font-size: var(--el-font-size-extra-large);
	border-radius: var(--el-border-radius-large);
}
</style>

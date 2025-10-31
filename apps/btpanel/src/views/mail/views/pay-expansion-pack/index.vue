<template>
	<div class="flex w-full h-full theme-ltd">
		<div class="sidebar-info sidebar-ltd">
			<div class="sidebar-title">
				<span :class="'icon-currency '"></span>
				<span>{{ productInfo.activeTypeInfo.title }}</span>
			</div>
			<div class="flex flex-col">
				<div class="sidebar-privilege">说明:</div>
				<div class="w-[16.5rem] text-base leading-loose mt-[2rem] text-disabled break-all">多域，多用户邮局，邮件服务器，支持SMTP/IMAP/POP3/HTTP接口，需要25端口</div>
			</div>
		</div>
		<!-- 右侧产品类型 -->
		<ProductSelect ref="productSelectRef" />
	</div>
</template>

<script lang="tsx" setup>
import ProductSelect from './product-select/index.vue'
import { init, $reset, productInfo, emits } from './useMethod'

const emit = defineEmits<{ (event: 'close'): void }>()
emits.value = emit

onMounted(() => init())

onUnmounted(() => $reset())
</script>

<style lang="css">
.sidebar-info {
	@apply flex-[2] bg-lighter rounded-tl-base rounded-bl-base pt-[2.8rem] pl-[2.4rem];
}
.sidebar-title {
	@apply pb-16px flex text-center pt-24px font-bold text-extraLarge items-center;
}
.sidebar-privilege {
	-webkit-background-clip: text !important;
	color: transparent !important;
	@apply mb-8px text-medium text-secondary;
}
.sidebar-ltd {
	background-color: var(--bt-ltd-bg-color);
	background-image: url('/static/payment/lib-pay-ltd-bg-logo.png');
	background-repeat: no-repeat;
	background-position-y: bottom;
}
.sidebar-ltd .sidebar-title span:last-child,
.sidebar-ltd .sidebar-privilege {
	background-image: linear-gradient(to bottom, #e8a833, #ebc874, #ae7222);
}
.sidebar-ltd .sidebar-describe,
.sidebar-ltd .sidebar-tips-item {
	@apply text-disabled;
}
.sidebar-ltd .sidebar-details {
	border: 2px solid var(--el-color-warning-light-8);
	background: linear-gradient(to bottom, #e8aa36, #e9c571, #af7323);
}

.sidebar-title span:last-child,
.sidebar-privilege {
	-webkit-background-clip: text;
	color: transparent;
}
</style>

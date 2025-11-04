<template>
	<div class="sidebar-info" :class="`sidebar-${tab?.activeTypeInfo?.type}`">
		<div class="sidebar-title">
			<span v-show="!isPlugin" :class="'icon-currency !mr-10px !w-[2.4rem] icon-' + tab?.activeTypeInfo?.type"></span>
			<span>{{ tab?.activeTypeInfo?.title }}</span>
		</div>
		<div v-show="!isPlugin" class="sidebar-describe">{{ tab?.activeTypeInfo?.describe }}</div>
		<div class="flex flex-col">
			<div class="sidebar-privilege">{{ tab?.activeTypeInfo?.tipsTitle }}:</div>
			<div v-if="tab?.activeTypeInfo?.type === 'plugin'" class="w-[16.5rem] text-base leading-loose mt-[2rem]" v-html="compData?.pluginInfo?.ps"></div>
			<div v-else class="pt-16px">
				<div v-for="(item, index) in tab?.activeTypeInfo?.tipsList" :key="index" class="sidebar-tips-item">
					<span class="mr-8px"><i class="svgtofont-el-check font-black text-[var(--el-color-warning-light-3)] text-medium"></i></span>
					<span class="whitespace-nowrap">{{ item }}</span>
				</div>
			</div>
		</div>
		<div v-if="tab?.activeTypeInfo?.type === 'dev'" class="sidebar-tips-item pro-introduce safe-report">
			<span data-v-0c1f7542="" class="mr-4px"><i class="svgtofont-el-star-filled font-black text-[var(--el-color-warning-light-3)]"></i></span><span><bt-link target="_blank" href="https://www.bt.cn/new/product/safety_report.html" style="text-decoration: underline">获取安全检查报告</bt-link></span>
		</div>
		<div v-if="tab?.activeTypeInfo?.type === 'plugin'" class="pro-left-footer-recom">
			<span>Linux企业版可免费使用【{{ tab?.activeTypeInfo?.title }}】等30+款插件，价格仅售￥<span class="plugin_pro_price">1399</span>/年</span>
		</div>
		<div v-else-if="tab?.activeTypeInfo?.type !== 'coupon'" class="sidebar-details" @click="openPrivilegeContrast">特权对比</div>
		<bt-link v-else class="sidebar-details" href="https://www.bt.cn/new/activity.html" target="_blank"> 查看更多活动 </bt-link>
	</div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import PRODUCT_PAYMENT_STORE from '../store'

const store = PRODUCT_PAYMENT_STORE()
const { productInfo: tab, isPlugin, compData } = storeToRefs(store)
const { openPrivilegeContrast } = store
</script>

<style lang="css" scoped>
/* 侧边栏 */
.sidebar-info {
	@apply flex-[2] bg-lighter rounded-tl-base rounded-bl-base pt-[2.8rem] pl-[2.4rem];
}
.sidebar-title {
	@apply pb-16px flex text-center pt-24px font-bold text-extraLarge items-center;
}
.sidebar-describe {
	@apply mb-20px text-small h-[4rem] pr-16px leading-6 text-tertiary;
}
.sidebar-tips-item {
	@apply py-[6px] text-base;
}
.sidebar-privilege {
	-webkit-background-clip: text !important;
	color: transparent !important;
	@apply mb-8px text-medium text-secondary;
}
.sidebar-details {
	-webkit-background-clip: text !important;
	color: transparent !important;
	@apply w-[14rem] h-[4rem] absolute bottom-18 left-16 leading-[3.8rem] block text-center text-medium text-white rounded-base cursor-pointer;
}

/* 侧边栏产品类型专业版 */
.sidebar-pro,
.sidebar-plugin {
	@apply bg-[var(--bt-pro-bg-color)] bg-no-repeat relative;
	/* background-image: url('/static/payment/lib-pay-pro-bg-logo.png');
	background-position: 2rem 58rem; */
}
.dark .sidebar-pro:before,
.dark .sidebar-plugin:before {
	@apply bg-no-repeat absolute top-0 left-0 w-full h-[98%];
	content: '';
	background-image: url('/static/payment/lib-pay-pro-bg-logo.png');
	background-position: 2rem 58rem;
	opacity: .1;
}
.sidebar-pro .sidebar-privilege,
.sidebar-plugin .sidebar-privilege {
	color: var(--el-color-text-secondary) !important;
}
.sidebar-pro .sidebar-title span:last-child,
.sidebar-plugin .sidebar-title span:last-child {
	background-image: linear-gradient(to right, var(--bt-ltd-sub-bg-color), var(--bt-ltd-sub-color));
}
.sidebar-pro .sidebar-describe,
.sidebar-plugin .sidebar-describe,
.sidebar-pro .sidebar-tips-item,
.sidebar-plugin .sidebar-tips-item {
	@apply text-secondary;
}
.sidebar-pro .sidebar-details,
.sidebar-plugin .sidebar-details {
	border: 2px solid var(--el-color-warning-light-8);
	background: linear-gradient(to bottom, var(--bt-ltd-sub-bg-color), var(--bt-ltd-sub-bg-color), var(--bt-ltd-color));
}
.dark .sidebar-pro .sidebar-details,
.dark .sidebar-plugin .sidebar-details {
	border: 2px solid var(--bt-ltd-color);
}
.pro-left-footer-recom {
	position: absolute;
	bottom: 30px;
	border: var(--bt-ltd-sub-color) 1px solid;
	background: var(--el-fill-color-extra-light);
	border-radius: var(--el-border-radius-medium);
	margin-right: 20px;
	padding: 40px 12px;
	font-size: var(--el-font-size-base);
	line-height: 25px;
	font-weight: bold;
	width: 18rem;
}
.pro-left-footer-recom:before {
	content: '购买推荐';
	background: url('/static/payment/lib-pay-left-footer-plugin-explain.png');
	width: 93px;
	height: 23px;
	position: absolute;
	right: -1px;
	top: -8px;
	background-size: 100%;
	color: var(--el-color-white);
	font-size: var(--el-font-size-medium);
	text-align: right;
	padding: 0px 10px;
	font-weight: initial;
}
.pro-left-footer-recom span {
	background-image: linear-gradient(to right, var(--bt-ltd-sub-bg-color), var(--bt-ltd-sub-color));
	-webkit-background-clip: text;
	color: transparent;
}

/* 侧边栏抵扣券 */
.sidebar-coupon {
	@apply bg-[var(--bt-pro-bg-color)];
	background-image: none;
}
.sidebar-coupon .sidebar-privilege {
	color: var(--el-color-text-secondary) !important;
}
.sidebar-coupon .sidebar-title span:last-child {
	@apply text-subtitleLarge;
	background-image: linear-gradient(to right, var(--bt-ltd-sub-bg-color), var(--bt-ltd-sub-color));
}
.sidebar-coupon .sidebar-describe,
.sidebar-coupon .sidebar-tips-item {
	@apply text-secondary;
}
.sidebar-coupon i:before {
	content: '·';
	color: var(--el-color-text-secondary);
}
.sidebar-coupon .sidebar-details {
	color: var(--el-color-primary) !important;
	border: 0.2rem solid var(--el-color-primary);
}

/* 侧边栏产品类型企业版、运维版 */
.sidebar-ltd,
.sidebar-dev {
	background-color: var(--bt-ltd-bg-color);
	background-image: url('/static/payment/lib-pay-ltd-bg-logo.png');
	background-repeat: no-repeat;
	background-position-y: bottom;
}
.sidebar-ltd .sidebar-title span:last-child,
.sidebar-dev .sidebar-title span:last-child,
.sidebar-ltd .sidebar-privilege,
.sidebar-dev .sidebar-privilege {
	background-image: linear-gradient(to bottom, var(--bt-ltd-light-color), var(--bt-ltd-sub-bg-color), var(--bt-ltd-color));
}
.sidebar-ltd .sidebar-describe,
.sidebar-dev .sidebar-describe,
.sidebar-ltd .sidebar-tips-item,
.sidebar-dev .sidebar-tips-item {
	@apply text-disabled;
}
.sidebar-ltd .sidebar-details,
.sidebar-dev .sidebar-details {
	border: 2px solid var(--el-color-warning-light-3);
	background: linear-gradient(to bottom, var(--bt-ltd-light-color), var(--bt-ltd-sub-bg-color), var(--bt-ltd-color));
}

.sidebar-info .icon-pro,
.icon-pro {
	background-image: url('/static/icons/icon-pro.svg');
}

.sidebar-info .icon-ltd,
.sidebar-info .icon-dev,
.icon-ltd,
.icon-dev {
	background-image: url('/static/icons/icon-ltd.svg');
}

.sidebar-title span:last-child,
.sidebar-privilege {
	-webkit-background-clip: text;
	color: transparent;
}

.icon-currency {
	@apply w-[2rem] h-[2rem] inline-block mr-4px bg-no-repeat bg-contain bg-center;
}
</style>

<template>
	<!-- 支付方式 -->
	<div v-bt-loading="paymentLoading.status" v-bt-loading:title="paymentLoading.title" v-bt-loading:size="'large'" class="pay-mode-view" :class="'pay-ltd'">
		<div class="flex flex-col w-[16rem]">
			<div v-for="item in payList" :key="item.type" class="pay-mode-item" :class="{ active: item.type === product?.payMode?.activePayType }" @click="changePayTypeEvent(item)">
				<span :class="'icon icon-' + item.type"></span>
				<span>{{ item.title }}</span>
			</div>
		</div>
		<div class="flex items-center pl-20px">
			<template v-if="['wechat', 'alipay'].includes(product?.payMode?.activePayType || '')">
				<div class="relative p-12px h-[14rem] border-[1px] rounded-base border-darkTertiary">
					<bt-qrcode :value="product?.payMode?.qrcode?.value" :size="product?.payMode.qrcode.size" />
					<bt-image type="icons" :src="activePayIcon" class="!absolute bg-white border-[0.2rem] border-darkTertiary rounded-small mr-4px w-2.4rem h-2.4rem top-24 left-22" />
				</div>
				<div class="pay-price-model">
					<div class="flex flex-col" :class="product?.payMode?.isLastBuyRepeat && product?.couponMode.status ? '' : 'mb-16px'">
						<div class="userinfo">
							当前账号:{{ bindUser }}
							<a class="underline cursor-pointer" @click="bindUserDialog">切换账号</a>
						</div>
						<div class="buy-price" :class="product?.payMode?.isLastBuyRepeat && product?.couponMode.status ? '' : 'mt-16px'">
							<span>支付金额:</span>
							<span>
								<span class="text-large font-bold">￥</span>
								<span>{{ product?.payMode.activeBuyInfo.price }}</span>
							</span>
							<span>{{ product?.payMode.activeBuyInfo.cycle }}/{{ product?.payMode.activeBuyInfo.name }}</span>
							<span class="line-through text-tertiaryer">
								原价:
								{{ product?.payMode.activeBuyInfo.originalPrice }}元
							</span>
							<div v-if="product?.couponMode.status" class="font-bold mt-8px coupon-discounts-titile">
								{{ product?.couponMode.discountsTitle }}
							</div>
						</div>
					</div>
				</div>
			</template>
			<!-- 余额、对公转账 -->
			<template v-else>
				<div class="box">
					<div class="userinfo">
						当前账号:{{ bindUser }}
						<a class="underline cursor-pointer" @click="bindUserDialog">切换账号</a>
					</div>
					<div class="my-16px price">
						支付金额:
						<span class="text-iconLarge font-bold"><b class="text-large">¥</b>{{ product?.payMode.activeBuyInfo.price }}</span>
						<span>{{ product?.payMode.activeBuyInfo.cycle }}/{{ product?.payMode.activeBuyInfo.name }}</span>
					</div>
					<div class="line-through text-tertiaryer">
						原价:
						{{ product?.payMode.activeBuyInfo.originalPrice }}元
					</div>
					<div v-if="product?.couponMode.status" class="font-bold mt-8px coupon-discounts-titile">
						{{ product?.couponMode.discountsTitle }}
					</div>
				</div>
				<template v-if="product?.payMode.activePayType == 'balance'">
					<div class="payment-cont h-13rem">
						可用余额
						<div class="mt-1.2rem">
							<span class="availableBalance text-subtitleLarge">{{ product?.payMode.balance }}</span
							>元
						</div>
						<el-button class="!my-1rem" type="primary" :disabled="product?.payMode.balance < product.payMode.activeBuyInfo.price" @click="changeBalanceBuyEvent()">立即购买</el-button>
						<div v-if="product?.payMode.balance < product.payMode.activeBuyInfo.price" class="flex items-center">当前余额不足，请先<bt-link target="_blank" href="https://www.bt.cn/admin/recharge">充值余额</bt-link></div>
					</div>
				</template>
				<template v-else>
					<div class="flex flex-col w-[25rem] pl-2rem accounts-box">
						<div><span>开户名称: </span>广东堡塔安全技术有限公司</div>
						<div><span>开户银行: </span>招商银行股份有限公司东莞天安数码城支行</div>
						<div>
							<span>银行账号: </span>
							<span class="cursor-pointer" @click="onlineServiceDialog">联系客服</span>
						</div>
					</div>
				</template>
			</template>
		</div>
	</div>
</template>

<script setup lang="ts">
import { bindUserDialog, onlineServiceDialog } from '@/public'
import { payList, paymentLoading, productInfo as tab, product, activePayIcon, changePayTypeEvent, changeBalanceBuyEvent } from '../useMethod'
import { useGlobalStore } from '@/store/global'

const { payment } = useGlobalStore()
const { bindUser } = toRefs(payment.value)
</script>

<style lang="css" scoped>
/* 支付区域解绑遮罩层 */
.unbind-mask {
	@apply content-[''] absolute -top-0 -left-0 -right-0 -bottom-0 bg-white z-999 rounded-small w-full;
}
/* 解绑授权 */
.unbind-author-content {
	line-height: 3rem;
}

/*  企业版 */
.pay-mode-view.pay-ltd .userinfo a {
	color: var(--bt-ltd-color);
}
.pay-mode-view.pay-ltd .userinfo a:hover {
	color: var(--bt-ltd-color);
}
.pay-mode-view.pay-ltd .price span:first-child {
	background: linear-gradient(to right, #e4a93c, #af7323);
	-webkit-background-clip: text;
	color: transparent;
}
.pay-mode-view.pay-ltd .buy-price span:nth-child(2) {
	background: linear-gradient(to right, #e4a93c, #af7323);
	-webkit-background-clip: text;
	color: transparent;
}
.pay-mode-view.pay-ltd .pay-mode-item.active {
	color: var(--bt-ltd-color);
}
.pay-mode-view.pay-ltd .pay-mode-item.active .icon-wechat {
	background-image: url('/static/icons/icon-wechatpay-ltd.svg');
}
.pay-mode-view.pay-ltd .pay-mode-item.active .icon-alipay {
	background-image: url('/static/icons/icon-alipaypay-ltd.svg');
}
.pay-mode-view.pay-ltd .pay-mode-item.active .icon-balance {
	background-image: url('/static/icons/icon-balancepay-ltd.svg');
}
.pay-mode-view.pay-ltd .pay-mode-item.active .icon-accounts {
	background-image: url('/static/icons/icon-transferpay-ltd.svg');
}

/* 专业版主题/插件主题 */
.pay-mode-view.pay-plugin .userinfo a,
.pay-mode-view.pay-pro .userinfo a {
	color: var(--bt-ltd-color);
}
.pay-mode-view.pay-plugin .userinfo a:hover,
.pay-mode-view.pay-pro .userinfo a:hover {
	color: var(--bt-ltd-color);
}
.pay-mode-view.pay-plugin .price span:first-child,
.pay-mode-view.pay-pro .price span:first-child {
	color: var(--bt-pro-color);
}
.pay-mode-view.pay-plugin .buy-price span:nth-child(2),
.pay-mode-view.pay-pro .buy-price span:nth-child(2) {
	color: var(--el-color-warning);
}
.pay-mode-view.pay-plugin .pay-mode-item.active .icon-wechat,
.pay-mode-view.pay-pro .pay-mode-item.active .icon-wechat {
	background-image: url('/static/icons/icon-wechatpay-pro.svg');
}
.pay-mode-view.pay-plugin .pay-mode-item.active .icon-alipay,
.pay-mode-view.pay-pro .pay-mode-item.active .icon-alipay {
	background-image: url('/static/icons/icon-alipaypay-pro.svg');
}
.pay-mode-view.pay-plugin .pay-mode-item.active .icon-balance,
.pay-mode-view.pay-pro .pay-mode-item.active .icon-balance {
	background-image: url('/static/icons/icon-balancepay-pro.svg');
}
.pay-mode-view.pay-plugin .pay-mode-item.active .icon-accounts,
.pay-mode-view.pay-pro .pay-mode-item.active .icon-accounts {
	background-image: url('/static/icons/icon-transferpay-pro.svg');
}

/* 运维版 */
.pay-mode-view.pay-dev .userinfo a {
	color: var(--bt-ltd-color);
}
.pay-mode-view.pay-dev .userinfo a:hover {
	color: var(--bt-ltd-color);
}
.pay-mode-view.pay-dev .price span:first-child {
	background: linear-gradient(to right, #e4a93c, #af7323);
	-webkit-background-clip: text;
	color: transparent;
}
.pay-mode-view.pay-dev .buy-price span:nth-child(2) {
	background: linear-gradient(to right, #e4a93c, #af7323);
	-webkit-background-clip: text;
	color: transparent;
}
.pay-mode-view.pay-dev .pay-mode-item.active {
	color: var(--bt-ltd-color);
}
.pay-mode-view.pay-dev .pay-mode-item.active .icon-wechat {
	background-image: url('/static/icons/icon-wechatpay-ltd.svg');
}
.pay-mode-view.pay-dev .pay-mode-item.active .icon-alipay {
	background-image: url('/static/icons/icon-alipaypay-ltd.svg');
}
.pay-mode-view.pay-dev .pay-mode-item.active .icon-balance {
	background-image: url('/static/icons/icon-balancepay-ltd.svg');
}
.pay-mode-view.pay-dev .pay-mode-item.active .icon-accounts {
	background-image: url('/static/icons/icon-transferpay-ltd.svg');
}

/* 支付展示 */
.pay-mode-view {
	@apply rounded-small border-[1px] border-solid border-light relative flex h-66;
}
.pay-mode-view .pay-mode-item {
	@apply flex flex-1 items-center pl-16px text-base text-tertiary border-b-[1px] border-r-[1px] border-solid border-light cursor-pointer;
}
.pay-mode-view .pay-mode-item:last-child {
	@apply border-b-0;
}
.pay-mode-view .pay-mode-item .icon {
	width: 1.6rem;
	height: 1.6rem;
	display: inline-block;
	margin-right: 0.4rem;
	margin-top: -0.1rem;
	vertical-align: middle;
}
.pay-mode-view .pay-mode-item.active {
	@apply border-r-[0px] text-pro;
}
.pay-mode-view .pay-mode-item .icon-wechat {
	background-image: url('/static/icons/icon-wechatpay-default.svg');
}
.pay-mode-view .pay-mode-item .icon-alipay {
	background-image: url('/static/icons/icon-alipaypay-default.svg');
}
.pay-mode-view .pay-mode-item .icon-balance {
	background-image: url('/static/icons/icon-balancepay-default.svg');
}
.pay-mode-view .pay-mode-item .icon-accounts {
	background-image: url('/static/icons/icon-transferpay-default.svg');
}
.pay-mode-view .items-center .accounts-box div {
	@apply my-8px;
}
.pay-mode-view .items-center .accounts-box div span:first-child {
	@apply font-bold;
}
.pay-mode-view .items-center .accounts-box div span:nth-child(2) {
	color: var(--el-color-primary);
}
.pay-mode-view .payment-cont {
	@apply pl-2rem ml-1rem;
	border-left-style: solid;
	border-left-width: 1px;
	border-left-color: var(--el-color-border-dark-tertiaryer);
}
.pay-mode-view .pro-author-name {
	color: var(--bt-pro-sub-color);
}
.pay-mode-view .ltd-author-name {
	color: var(--bt-ltd-color);
}
.pay-mode-view .coupon-discounts-titile {
	color: var(--bt-pro-sub-color);
}

/* 支付金额显示 */
.pay-price-model {
	@apply flex ml-16px flex-col text-small;
}
.pay-price-model span:nth-child(2) {
	@apply text-iconLarge font-bold mr-4px -mb-2px;
}
.pay-price-model .repeat-buy-tips div:first-child {
	background: rgb(245 69 0 / 9%);
	display: inline-block;
}
</style>

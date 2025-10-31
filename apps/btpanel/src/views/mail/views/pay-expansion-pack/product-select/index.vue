<template>
	<!-- 右侧产品类型 -->
	<div class="flex flex-[8] flex-col" :class="'theme-ltd'">
		<!-- 产品周期和数量、支付方式 -->
		<div v-bt-loading="tabLoading.status" v-bt-loading:title="tabLoading.title" v-bt-loading:size="'large'" class="flex-[1] pb-16px px-28px">
			<div id="lib-pay-theme-tips" class="lib-pay-line-item proS !mt-3rem">
				<img
					style="margin-right: 10px"
					src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAuMDAwMDAwIiBoZWlnaHQ9IjIyLjAwMDAwMCIgdmlld0JveD0iMCAwIDIwIDIyIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIj4KCTxkZXNjPgoJCQlDcmVhdGVkIHdpdGggUGl4c28uCgk8L2Rlc2M+Cgk8cGF0aCBpZD0icGF0aCIgZD0iTTEzLjM0MDggNS4zNDIxOUMxMy43NDk1IDYuMjkxMzUgMTMuODEwOSA3Ljg1OTg5IDEyLjk2NDkgOC42MTQwMUMxMS41OTE0												IDMuMDc5ODYgOC4xNTc3MSAyIDguMTU3NzEgMkM4LjU2NjM1IDQuODEzMzIgNi43MjI5IDcuODky												MDkgNC45MTIwNSAxMC4yMTI3QzQuODUwNjUgOS4xMDA2NSA0Ljc4NTQ2IDguMzQ4NTcgNC4xOTQ1												OCA3LjIwMjMzQzQuMDY3OTkgOS4yNjM1NSAyLjU3MTc4IDEwLjkwMDUgMi4xMzQ0IDEyLjk2MTdD												MS42MDQ5OCAxNS44MDkyIDIuNTcxNzggMTcuODA2MSA2LjI1MjkzIDIwQzUuMDk4MDggMTcuNDgy												MyA1LjcyMzQ1IDE2LjA0MDQgNi42Mjg5MSAxNC43MzMzQzcuNTk1NyAxMy4yMjkxIDcuODQ4ODgg												MTEuNzg3MyA3Ljg0ODg4IDExLjc4NzNDNy44NDg4OCAxMS43ODczIDguNjI3NjkgMTIuODAwOCA4												LjMxODg1IDE0LjQwMzVDOS42MjcxNCAxMi44MzUgOS44ODAzMSAxMC4zMTEyIDkuNjk0MjcgOS4z												OTYyN0MxMi42ODg3IDExLjU5MDIgMTQuMDI5NSAxNi40MzQ2IDEyLjI4MzkgMTkuOTM1NkMyMS41												MTg0IDE0LjQwNTUgMTQuNTU3IDYuMTkwODMgMTMuMzQwOCA1LjM0MjE5WiIgZmlsbC1ydWxlPSJu												b256ZXJvIiBmaWxsPSIjRUMwMjAyIi8+Cgk8ZGVmcy8+Cjwvc3ZnPgo=" />
				<span class="tips-span pr-[1rem] text-warning"> 超值特惠，发件扩展包为您提供充足的发件数量 </span>
			</div>
			<!-- 产品周期 -->
			<span class="pay-view-title !mb-0">产品周期</span>
			<div class="box" v-bt-loading="productPriceLoading">
				<div id="list-box" class="list-box !pt-0" style="max-width: 72rem">
					<div id="list" class="flex" style="transition: all 500ms; margin-top: 14px; left: 0; position: relative">
						<div v-for="(item, key) in product.cycleMode.list" :key="key" class="pay-product-cycle btn-box btn-box-2 relative" :class="{ active: item.id === product.cycleMode.activeCycleInfo.id }" @click="changeCycleTabEvent(item)">
							<div class="pay-product-price">
								<span>￥</span>
								<span>{{ item.dis_price }}</span>
								<span>/ {{ item.name }}</span>
							</div>
							<div class="line-through border-b pb-4px pt-4px border-dashed border-lighter text-tertiaryer">原价:{{ item.org_price }}元</div>
							<div class="text-center pt-4px">数量（封）：{{ item.num }}</div>
							<div v-if="item.recommend" class="pay-product-recommend transform scale-80">
								{{ item.recommend }}
							</div>
						</div>
					</div>
				</div>
			</div>

			<!-- 优惠券选择 -->
			<!-- <div :class="'product-coupon-box cursor-pointer !my-2rem ' + (product.couponMode.status ? 'active' : '')" @click.self="changeCouponBoxEvent()">
				<el-checkbox v-model="product.couponMode.status" :disabled="product.couponMode.disabled" @change="value => changeCouponBoxEvent(value)">优惠券({{ product.couponMode.count }})</el-checkbox>
				<el-select v-model="product.couponMode.activeCouponId" :disabled="product.couponMode.disabled" :placeholder="product.couponMode.count > 0 ? '请选择优惠券' : '无可用优惠券'" class="!w-[18rem] coupon-select" @change="changeCouponEvent">
					<el-option v-for="item in product.couponMode.list" :key="item.id" :disabled="product.numsMode.activeNumsInfo.price < parseInt(item.val1)" :label="item.newName" :value="`${item.id}`" />
				</el-select>
				<div v-if="product.couponMode.endTimeNum > 0" class="text-tertiary voucherEndtime">
					<span>{{ countDown.d }}</span
					>天<span>{{ countDown.h }}</span
					>时<span>{{ countDown.m }}</span
					>分<span>{{ countDown.s }}</span
					>秒&nbsp;&nbsp;后失效
				</div>
			</div> -->

			<!-- 支付方式 -->
			<PaymentMethod></PaymentMethod>
			<!-- 底部提示 -->
			<div class="tooTool-links absolute right-[3rem] bottom-6 cursor-pointer">
				<span @click="onlineServiceDialog"><i></i>购买未生效</span>
				<bt-divider />
				<span> <i></i><bt-link class="!text-tertiary" href="https://www.bt.cn/admin/product_orders">申请发票</bt-link> </span>
				<bt-divider />
				<span @click="onlineServiceDialog"><i></i>联系客服</span>
			</div>
		</div>
	</div>
</template>

<script lang="ts" setup>
import PaymentMethod from '../payment-method/index.vue'
import { onlineServiceDialog } from '@/public'
import { tabLoading, countDown, productPriceLoading, product, changeCouponBoxEvent, changeCouponEvent, changeCycleTabEvent } from '../useMethod'
</script>

<style lang="css" scoped>
/* tab界面样式 */
.tab-menu {
	@apply relative bg-lighter flex items-center justify-center cursor-pointer flex-col flex-[2];
}
.tab-menu:last-child::after {
	@apply hidden;
}
.tab-menu::after {
	@apply content-[''] w-[.5px] h-[60%] absolute -right-[.5px] bg-[var(--el-fill-color-darker)] z-999;
}
.tab-menu.tab-acitve {
	@apply bg-[rgba(var(--el-color-white-rgb),1)];
}
/* TAB推荐 */
.tab-menu.tab-rec {
	background-position: top left;
	background-size: 4rem;
	background-repeat: no-repeat;
	background-image: url('/static/payment/recommend.svg');
}
/* 广告界面 */
#lib-pay-theme-tips {
	font-size: var(--el-font-size-base);
	padding: 10px;
	display: flex;
	align-items: center;
	margin-top: 10px;
	background-color: var(--el-fill-color-extra-light);
	border-radius: var(--el-border-radius-large);
	box-shadow: 0 0 4px 2px rgba(var(--el-color-black-rgb), 0.1);
}
/* 专业版主题 */
.theme-pro .userinfo a,
.theme-plugin .userinfo a {
	color: var(--bt-ltd-color);
}
.theme-pro .userinfo a:hover,
.theme-plugin .userinfo a:hover {
	color: var(--bt-ltd-color);
}
.theme-pro .price span:first-child,
.theme-plugin .price span:first-child {
	color: var(--bt-pro-color);
}
.theme-pro .buy-price span:nth-child(2),
.theme-plugin .buy-price span:nth-child(2) {
	color: var(--el-color-warning);
}
.theme-pro .pay-mode-item.active .icon-wechat,
.theme-plugin .pay-mode-item.active .icon-wechat {
	background-image: url('/static/icons/icon-wechatpay-pro.svg');
}
.theme-pro .pay-mode-item.active .icon-alipay,
.theme-plugin .pay-mode-item.active .icon-alipay {
	background-image: url('/static/icons/icon-alipaypay-pro.svg');
}
.theme-pro .pay-mode-item.active .icon-balance,
.theme-plugin .pay-mode-item.active .icon-balance {
	background-image: url('/static/icons/icon-balancepay-pro.svg');
}
.theme-pro .pay-mode-item.active .icon-accounts,
.theme-plugin .pay-mode-item.active .icon-accounts {
	background-image: url('/static/icons/icon-transferpay-pro.svg');
}
.theme-pro .pay-auth-item.display,
.theme-plugin .pay-auth-item.display {
	display: none;
}
/* 企业版 */
.theme-ltd .pay-product-cycle.active {
	background: var(--bt-ltd-bg-color);
	border-color: var(--bt-ltd-border-color);
}
.theme-ltd .pay-product-cycle.active::before {
	@apply content-[''] absolute block w-[11rem] h-[9rem] -left-[3rem] -bottom-[.4rem] no-repeat rounded-br-small bg-cover;
	background-image: url('/static/payment/lib-pay-ltd-bg-logo.png');
}
.theme-ltd .pay-product-cycle.active::after {
	background-image: url('/static/payment/lower-select-ltd.svg');
}
.theme-ltd .pay-product-cycle.active .pay-product-price span:nth-child(-n + 2) {
	background: linear-gradient(to bottom, var(--bt-ltd-sub-bg-color), var(--bt-ltd-light-bg-color));
	-webkit-background-clip: text;
	color: transparent;
}
.theme-ltd .pay-product-cycle.active div:nth-child(3) {
	color: var(--bt-ltd-light-color);
}
.theme-ltd .pay-product-price span:nth-child(-n + 2) {
	color: var(--bt-ltd-sub-color);
}
.theme-ltd .pay-auth-item.active {
	background: var(--bt-ltd-bg-color);
	border-color: var(--bt-ltd-border-color);
}
.theme-ltd .pay-auth-item.active span:first-child {
	background: linear-gradient(to bottom, , var(--bt-ltd-sub-bg-color), var(--bt-ltd-light-bg-color));
	-webkit-background-clip: text;
	color: transparent;
	font-weight: bold;
}
.theme-ltd .pay-auth-item.active::before {
	@apply content-[''] absolute block w-[3.6rem] h-[3.2rem] -left-[.8rem] -bottom-[.2rem] no-repeat rounded-br-small bg-cover;
	background-image: url('/static/payment/lib-pay-ltd-bg-logo.png');
}
.theme-ltd .pay-auth-item.active::after {
	background-image: url('/static/payment/lower-select-ltd.svg');
}
.theme-ltd .userinfo a {
	color: var(--bt-ltd-sub-color);
}
.theme-ltd .userinfo a:hover {
	color: var(--bt-ltd-sub-color);
}
.theme-ltd .price span:first-child {
	background: linear-gradient(to right, var(--bt-ltd-sub-bg-color), var(--bt-ltd-color));
	-webkit-background-clip: text;
	color: transparent;
}
.theme-ltd .buy-price span:nth-child(2) {
	background: linear-gradient(to right, var(--bt-ltd-sub-bg-color), var(--bt-ltd-color));
	-webkit-background-clip: text;
	color: transparent;
}
.theme-ltd .pay-mode-view .pay-mode-item.active {
	color: var(--bt-ltd-sub-color);
}
.theme-ltd .pay-mode-view .pay-mode-item.active .icon-wechat {
	background-image: url('/static/icons/icon-wechatpay-ltd.svg');
}
.theme-ltd .pay-mode-view .pay-mode-item.active .icon-alipay {
	background-image: url('/static/icons/icon-alipaypay-ltd.svg');
}
.theme-ltd .pay-mode-view .pay-mode-item.active .icon-balance {
	background-image: url('/static/icons/icon-balancepay-ltd.svg');
}
.theme-ltd .pay-mode-view .pay-mode-item.active .icon-accounts {
	background-image: url('/static/icons/icon-transferpay-ltd.svg');
}
/* 运维版 */
.theme-dev .pay-product-cycle.active {
	background: var(--bt-ltd-bg-color);
	border-color: var(--bt-ltd-border-color);
}
.theme-dev .pay-product-cycle.active::before {
	@apply content-[''] absolute block w-[11rem] h-[9rem] -left-[3rem] -bottom-[.4rem] no-repeat rounded-br-small bg-cover;
	background-image: url('/static/payment/lib-pay-ltd-bg-logo.png');
}
.theme-dev .pay-product-cycle.active::after {
	background-image: url('/static/payment/lower-select-ltd.svg');
}
.theme-dev .pay-product-cycle.active .pay-product-price span:nth-child(-n + 2) {
	background: linear-gradient(to bottom, var(--bt-ltd-sub-bg-color), var(--bt-ltd-light-bg-color));
	-webkit-background-clip: text;
	color: transparent;
}
.theme-dev .pay-product-cycle.active div:nth-child(3) {
	color: var(--bt-ltd-light-color);
}
.theme-dev .pay-product-price span:nth-child(-n + 2) {
	color: var(--bt-ltd-sub-color);
}
.theme-dev .pay-auth-item.active {
	background: var(--bt-ltd-bg-color);
	border-color: var(--bt-ltd-border-color);
}
.theme-dev .pay-auth-item.active span:first-child {
	background: linear-gradient(to bottom, var(--bt-ltd-sub-bg-color), var(--bt-ltd-light-bg-color));
	-webkit-background-clip: text;
	color: transparent;
	font-weight: bold;
}
.theme-dev .pay-auth-item.active::before {
	@apply content-[''] absolute block w-[3.6rem] h-[3.2rem] -left-[.8rem] -bottom-[.2rem] no-repeat rounded-br-small bg-cover;
	background-image: url('/static/payment/lib-pay-ltd-bg-logo.png');
}
.theme-dev .pay-auth-item.active::after {
	background-image: url('/static/payment/lower-select-ltd.svg');
}
.theme-dev .userinfo a {
	color: var(--bt-ltd-sub-color);
}
.theme-dev .userinfo a:hover {
	color: var(--bt-ltd-sub-color);
}
.theme-dev .price span:first-child {
	background: linear-gradient(to right, var(--bt-ltd-sub-bg-color), var(--bt-ltd-color));
	-webkit-background-clip: text;
	color: transparent;
}
.theme-dev .buy-price span:nth-child(2) {
	background: linear-gradient(to right, var(--bt-ltd-sub-bg-color), var(--bt-ltd-color));
	-webkit-background-clip: text;
	color: transparent;
}
.theme-dev .pay-mode-view .pay-mode-item.active {
	color: var(--bt-ltd-sub-color);
}
.theme-dev .pay-mode-view .pay-mode-item.active .icon-wechat {
	background-image: url('/static/icons/icon-wechatpay-ltd.svg');
}
.theme-dev .pay-mode-view .pay-mode-item.active .icon-alipay {
	background-image: url('/static/icons/icon-alipaypay-ltd.svg');
}
.theme-dev .pay-mode-view .pay-mode-item.active .icon-balance {
	background-image: url('/static/icons/icon-balancepay-ltd.svg');
}
.theme-dev .pay-mode-view .pay-mode-item.active .icon-accounts {
	background-image: url('/static/icons/icon-transferpay-ltd.svg');
}
/* tab选中 */
.tab-acitve .product-pro span:last-child,
.tab-acitve .product-ltd span:last-child,
.tab-acitve .product-plugin span:last-child,
.tab-acitve .product-coupon span:last-child,
.tab-acitve .product-dev span:last-child {
	background-image: linear-gradient(to bottom, var(--bt-ltd-sub-bg-color), var(--bt-ltd-light-bg-color));
	-webkit-background-clip: text;
	color: transparent;
}
/* BTN盒子公共样式 */
.btn-box {
	@apply text-center text-tertiary rounded-base cursor-pointer border-[1px] border-solid border-light relative flex p-[1px];
}
.btn-box:last-child {
	@apply mr-0;
}
.btn-box.active {
	@apply bg-[var(--el-color-warning-light-9)] border-[var(--bt-ltd-color)];
}
.btn-box.active::after {
	@apply content-[''] absolute block w-[2.2rem] h-[2.2rem] -right-[.1rem] -bottom-[.1rem] no-repeat bg-right-bottom rounded-br-small;
	background-image: url('/static/payment/lower-select-pro.svg');
}
.btn-box.btn-box-2.active::after {
	@apply w-[3.2rem] h-[3.2rem];
}
.pay-view-title {
	@apply my-1.6rem text-default text-medium block mt-[2rem];
}
/* 产品周期 */
.pay-product-cycle {
	@apply flex-1 flex-col h-[11.2rem] mr-[2rem] p-[1.6rem] overflow-hidden;
	min-width: 152px;
	max-width: 200px;
}
.pay-product-cycle.active .pay-product-price span:nth-child(-n + 2) {
	@apply text-pro font-bold;
}
/* 产品价格 */
.pay-product-price {
	@apply h-[2.8rem] mt-[4px];
}
.pay-product-price span:nth-child(-n + 2) {
	@apply text-[var(--bt-pro-sub-color)] font-bold text-extraLarge;
}
.pay-product-price span:last-child {
	@apply text-tertiary text-base ml-[0.2rem];
}
/* 产品推荐 */
.pay-product-recommend {
	@apply absolute -top-[1.6rem] text-[var(--bt-ltd-color-linear-1)] px-[0.8rem] py-[0.6rem] -left-[1.2rem];
	border-radius: var(--el-border-radius-base);
	background-image: linear-gradient(to bottom, var(--bt-ltd-light-bg-color), var(--bt-ltd-sub-bg-color));
}
/* 产品周期左右切换 */
.switch-cycle-left,
.switch-cycle-right {
	height: 112px;
	width: 34px;
	display: flex;
	justify-content: center;
	align-items: center;
	background: var(--el-fill-color-light);
	cursor: pointer;
	color: var(--el-color-text-disabled);
	position: absolute;
	top: 104px;
	z-index: 99999;
}
.switch-cycle-right {
	right: 30px;
}
.switch-cycle-left {
	left: 26px;
}
.pay-auth-item {
	@apply text-base px-[1.6rem] py-[1.2rem] mr-[1.2rem] w-[8.4rem] justify-center text-default h-[4rem];
}
.pay-auth-item .pay-auth-discount {
	@apply absolute -top-[1rem] text-warningDark px-[0.8rem] py-[0.2rem] -right-[.4rem] text-small;
	border-radius: var(--el-border-radius-small) var(--el-border-radius-large) var(--el-border-radius-small) var(--el-border-radius-large);
	background-image: linear-gradient(to bottom, var(--bt-ltd-light-bg-color), var(--bt-ltd-sub-bg-color));
}
.pay-auth-item span {
	@apply leading-[16px];
}

/* 一年企业提示人工运维托管,优惠卷 */
.artificial,
.product-coupon-box {
	height: 3.6rem;
	display: flex;
	align-items: center;
	cursor: pointer;
	color: var(--el-color-text-secondary);
	border-radius: var(--el-border-radius-small);
	padding-left: 1rem;
	border: 0.1rem solid var(--el-fill-color-darker);
	margin-bottom: 1rem;
}
.artificial :deep(.el-checkbox),
.product-coupon-box :deep(.el-checkbox) {
	display: flex;
}
.artificial :deep(.el-checkbox) .el-checkbox__input,
.product-coupon-box :deep(.el-checkbox) .el-checkbox__input {
	margin-top: 0.3rem;
}
.artificial :deep(.el-checkbox) .el-checkbox__input .el-checkbox__inner,
.product-coupon-box :deep(.el-checkbox) .el-checkbox__input .el-checkbox__inner {
	&:hover {
		border-color: var(--el-color-border-dark-tertiary);
	}
}
.artificial :deep(.el-checkbox).is-checked .el-checkbox__inner,
.product-coupon-box :deep(.el-checkbox).is-checked .el-checkbox__inner {
	background-color: var(--bt-ltd-color);
	border-color: var(--bt-ltd-color);
}
.artificial :deep(.el-checkbox) .el-checkbox__label,
.product-coupon-box :deep(.el-checkbox) .el-checkbox__label {
	margin-top: 0.2rem;
	font-size: var(--el-font-size-small);
	display: flex;
	color: var(--el-color-text-secondary);
}
.artificial :deep(.el-checkbox) .el-checkbox__label .artificial_price,
.product-coupon-box :deep(.el-checkbox) .el-checkbox__label .artificial_price {
	color: var(--bt-ltd-color);
	padding: 0 0.5rem;
	cursor: pointer;
	margin-left: 0.8rem;
}
.artificial.active,
.product-coupon-box.active {
	background: var(--el-fill-color-extra-light);
	border: 1px solid var(--bt-ltd-light-color);
}
.artificial div,
.product-coupon-box div {
	display: flex;
	align-items: center;
	margin-left: 15px;
}
.artificial div:nth-child(1),
.product-coupon-box div:nth-child(1) {
	margin-left: 30px;
}
/* 优惠券 */
:deep(.coupon-select .el-select__selected-item) {
	color: var(--bt-ltd-color);
}
:deep(.coupon-select .el-select__wrapper) {
	border: none;
	background: none;
	color: var(--bt-ltd-color);
	width: 18rem;
	box-shadow: none;
}
:deep(.coupon-select .el-select__wrapper::placeholder) {
	color: var(--bt-ltd-color);
}
:deep(.coupon-select.is-disabled .el-input__inner) {
	background: none;
}
:deep(.voucherEndtime span) {
	@apply text-danger;
	background: rgba(var(--el-color-danger-rgb), 0.08);
	padding: 0.2rem;
	margin: 0 0.4rem;
}
.el-select-dropdown__item.selected {
	color: var(--bt-ltd-color);
}
/* 右下角样式 */
.tooTool-links {
	color: var(--el-color-text-tertiary);
}
.tooTool-links span {
	@apply inline-block;
}
.tooTool-links span i {
	background-image: url('/static/icons/lib-pay-footer-icon.png');
	width: 16px;
	height: 16px;
	display: inline-block;
	background-size: 100%;
	vertical-align: -3px;
	margin-right: 3px;
}
.tooTool-links span:nth-child(2) i {
	background-position: 0 32px;
}
.tooTool-links span:nth-child(3) i {
	background-position: 0 16px;
}
.dev-advantage {
	@apply w-[55rem] h-11rem rounded-large;
	background-image: url('/static/payment/ops_advantage.png');
	background-size: 100%;
}
</style>

<style>
.tips-span a {
	color: var(--bt-ltd-sub-color);
}
</style>

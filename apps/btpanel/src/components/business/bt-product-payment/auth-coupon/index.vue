<template>
	<section class="h-[98%]">
		<el-alert v-if="authTypeTitle !== '正式版'" class="!mt-[2.8rem]" :closable="false" type="info">
			<div class="flex justify-between items-center relative text-[1.4rem]">
				<div class="flex">当前面板已绑定【<span :class="authTypeTitle + '-author-name'">{{ authTypeTitle }}</span>】，到期时间：{{ authExpirationTime }}。</div>
				<span class="mr-[1rem] cursor-pointer hover:(text-danger) absolute right-[-355px]" @click="unBindAuthor">解绑</span>
			</div>
		</el-alert>
		<!-- 抵扣券视图 -->
		<template v-if="product?.voucherMode.isExist">
			<!-- <span class="pay-view-title !mt-16px">产品类型<span v-if="forceLtd">（当前为企业版，无法使用其他产品抵扣券）</span></span> -->
			<div v-bt-loading="product.voucherMode.loading" class="relative mb-8px" :class="authTypeTitle !== '正式版' ? '!mt-[1.4rem]' : '!mt-[2.8rem]'">
				<div v-scroll-shadow class="flex flex-wrap overflow-y-auto max-h-[12rem]">
					<!-- <template v-if="!forceLtd"> -->
						<div v-for="item in product.voucherMode.proTypeList" :key="item.pid" class="pay-voucher-type btn-box" :class="{ active: product.voucherMode.typeActive === item.pid, hidden: item.hidden }" @click="changeVoucherTypeEvent(item)">
							<span
								:class="{
									'icon-pro': item.pid === pid.pro,
									'icon-ltd': item.pid === pid.ltd,
								}"></span>
							<span>{{ item.name }}</span>
						</div>
						<div v-for="item in product.voucherMode.typeList" :key="item.pid" class="pay-voucher-type btn-box" :class="{ active: product.voucherMode.typeActive === item.pid, hidden: item.hidden }" @click="changeVoucherTypeEvent(item)">
							<span>{{ item.name }}</span>
						</div>
					<!-- </template>
					<template v-else>
						<div class="pay-voucher-type btn-box active">
							<span class="icon-ltd"></span>
							<span>企业版</span>
						</div>
					</template> -->
				</div>
			</div>
			<div class="flex">
				<span class="pay-view-title">抵扣券列表</span>
				<div class="mt-20px"></div>
			</div>
			<div class="relative">
				<div v-scroll-shadow class="flex flex-wrap overflow-y-auto max-h-[25rem]">
					<div v-for="item in product.voucherMode.list" :key="item.id" class="pay-voucher-item" :class="{ active: product.voucherMode.active === item.id }" @click="changeVoucherEvent(item)">
						<span>
							<template v-if="item.cycle === 999 && item.unit === 'month'">永久授权</template>
							<template v-else>
								{{ getVoucherCycleDescribe(item.cycle, item.unit) }}
							</template>
						</span>
						<span class="!text-extraSmall">到期时间: {{ item.timeout > 0 ? formatTime(item.endtime, 'yyyy-MM-dd') : `长期有效` }}</span>
					</div>
					<div v-if="!product.voucherMode.list.length">抵扣券列表为空</div>
				</div>
			</div>
			<div class="mt-24px flex items-center">
				<el-button type="primary" :disabled="voucherLoading || !product.voucherMode.list.length" @click="useChangeVoucher">
					{{ voucherLoading ? '正在提交中，请稍候...' : '立即使用' }}
				</el-button>
				<div class="ml-12px text-base text-tertiary">堡塔官网后台、参与活动购买的产品抵扣券，可用于开通授权或续费</div>
			</div>
			<!-- 为了将生成支付订单的loading置空 -->
			<div class="relative hidden"></div>
		</template>
		<template v-else>
			<div class="flex flex-col items-center justify-center w-full h-full mt-20rem">
				<div class="pay-voucher-empty"></div>
				<el-button plain @click="changeTypeTabEvent('ltd')">抵扣券列表为空，点击购买</el-button>
			</div>
		</template>
	</section>
</template>

<script setup lang="ts">
import { pid } from '@/utils/common'
import { formatTime } from '@/utils/date'
import { storeToRefs } from 'pinia'
import { useGlobalStore } from '@store/global'
import PRODUCT_PAYMENT_STORE from '../store'

const store = PRODUCT_PAYMENT_STORE()
const { forceLtd } = useGlobalStore()
const { product, voucherLoading, authTypeTitle, authExpirationTime } = storeToRefs(store)
const { changeTypeTabEvent, changeVoucherTypeEvent, changeVoucherEvent, getVoucherCycleDescribe, useChangeVoucher, unBindAuthor, getUnbindCount } = store

onMounted(() => {
	getUnbindCount()
})
</script>

<style lang="css" scoped>
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
.pay-voucher-type {
	@apply text-base text-tertiary px-16px py-12px mr-12px mb-8px;
}
.pay-voucher-type.active > span:nth-child(2) {
	@apply text-ltd;
}
.pay-voucher-type .icon-pro,
.pay-voucher-type .icon-ltd {
	@apply mr-[4px] w-[1.6rem] bg-no-repeat bg-center block;
}
.pay-voucher-item {
	@apply h-[7.2rem] w-[16rem] mb-12px mr-16px rounded-base cursor-pointer relative text-center flex justify-center align-middle flex-col py-8px;
	border: 2px solid var(--el-color-border-dark-tertiaryer);
}
.pay-voucher-item:nth-child(4n) {
	@apply mr-0;
}
.pay-voucher-item > span:nth-child(1) {
	@apply text-medium text-secondary font-bold pb-12px pt-2px;
}
.pay-voucher-item > span:nth-child(2) {
	@apply text-small text-tertiary;
}
.pay-voucher-item.active {
	@apply border-[var(--bt-ltd-color)];
	background: linear-gradient(to bottom, rgba(255, 249, 241, 0.2), rgba(255, 241, 224, 0.1));
}
.pay-voucher-item.active > span:nth-child(1) {
	@apply text-ltd;
}
.pay-voucher-item.active::after,
.pay-voucher-item.active::before {
	@apply border-[var(--bt-ltd-color)];
}
.pay-voucher-item::after,
.pay-voucher-item::before {
	@apply content-[''] absolute block w-[.9rem] h-[1.8rem];
	background-color: rgba(var(--el-color-white-rgb), 1);
	border: 2px solid var(--el-color-border-dark-tertiaryer);
}
.pay-voucher-item::after {
	@apply -right-[2px] top-[50%] -mt-[.9rem];
	border-radius: var(--el-border-radius-large) 0 0 var(--el-border-radius-large);
	border-right: none;
}
.pay-voucher-item::before {
	@apply -left-[2px] top-[50%] -mt-[.9rem];
	border-radius: 0 var(--el-border-radius-large) var(--el-border-radius-large) 0;
	border-left: none;
}
.pay-voucher-item:last-child {
	@apply mr-0;
}
.pay-view-title {
	@apply my-1.6rem text-default text-medium block mt-[2rem];
}
.pay-voucher-empty {
	@apply w-[20rem] h-[18rem] mb-16px bg-no-repeat;
	background-image: url('/static/payment/voucher-empty.svg');
	background-size: 100% 100%;
	margin-top: -5rem;
}
</style>

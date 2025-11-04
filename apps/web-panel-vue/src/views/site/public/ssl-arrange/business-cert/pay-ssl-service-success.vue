<template>
	<div class="flex flex-row px-[5rem] py-[5rem] justify-between">
		<div class="flex flex-col mx-[16px]">
			<div class="flex items-center mb-[32px]">
				<i class="el-icon-circle-check text-[4rem] mr-[16px] text-primary"></i>
				<span class="text-[2.4rem]">支付成功</span>
			</div>
			<div class="flex flex-col text-base leading-[3rem]">
				<div class="flex justify-between">
					<span>商品名称：</span>
					<span>证书安装服务</span>
				</div>
				<div class="flex justify-between">
					<span>商品价格：</span>
					<span>{{ orderInfo.price.toFixed(2) }} 元</span>
				</div>
				<div class="flex justify-between">
					<span>下单时间：</span>
					<span>{{ orderTime }}</span>
				</div>
			</div>
		</div>
		<div class="flex flex-col items-center content-around">
			<div class="flex">请打开微信扫一扫联系人工客服</div>
			<div class="w-[13rem] h-[13rem] mt-[16px] p-[8px] border-primary border-width-[1px]">
				<bt-image :size="110" :src="'customer/customer-qrcode.png'" />
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { formatTime } from '@/utils'
import { useSiteSSLStore } from '../useStore'

const { orderInfo } = useSiteSSLStore()

const orderTime = ref<any>(formatTime(new Date().getTime(), 'yyyy-MM-dd hh:mm:ss'))
</script>

<style scoped></style>

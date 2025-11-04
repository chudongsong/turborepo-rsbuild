<template>
	<div class="w-full p-[20px] text-small">
		<div class="flex items-center">
			<div class="message flex-1 py-[3px] leading-[24px]">
				<el-alert type="error" :show-icon="false" :closable="false">
					<template #title>
						<div class="leading-[2.5rem] flex items-center">温馨提示：第三方插件不支持更换IP,请确定使用的IP后再进行购买。</div>
					</template>
				</el-alert>
				<div>
					<div class="mt-[2rem] ml-[2rem] flex items-center flex-row">
						<div class="text-base mr-[15px]">续费时长</div>
						<el-radio-group size="large" v-model="plugin.bugTime" @change="getRenewOrder">
							<el-radio-button label="1" value="1">1个月</el-radio-button>
							<el-radio-button label="3" value="3">3个月</el-radio-button>
							<el-radio-button label="6" value="6">6个月</el-radio-button>
							<el-radio-button label="12" value="12">1年</el-radio-button>
						</el-radio-group>
					</div>
					<div class="wxCode my-[20px] flex flex-col items-center justify-center">
						<div class="text-base my-8px flex items-center">
							<span>共计：</span>
							<span class="text-warning text-extraLarge">{{ price }}元</span>
						</div>
						<bt-qrcode :value="plugin.qrcode" :size="plugin.qrcodeSize" />
					</div>
					<div class="wxTitle w-full text-medium flex justify-center items-center mt-[10px]">
						<i class="svgtofont-wechat-pay mr-[.5rem] text-success !text-large"></i>
						微信扫码支付
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import SOFT_OTHER_STORE from '../store'

const { getRenewOrder, $reset_buy } = SOFT_OTHER_STORE()
const { plugin, price } = storeToRefs(SOFT_OTHER_STORE())

onMounted(getRenewOrder)
onUnmounted($reset_buy)
</script>

<template>
	<div class="recom-view" :class="authType + '-view'">
		<div class="recom-content">
			<div class="flex items-center mr-[30px] relative" v-show="!(authExpirationTime === 0 && tabTypeActive !== 12)">
				<el-button class="payment-btn relative" @click="pluginPayEvent(isActivePay ? 30 : 29)">
					<i v-show="isShowType" class="-left-[0px] -top-[6px] absolute !text-[red] !text-titleLarge" @click.stop="pluginPayEvent(isActivePay ? 30 : 29)">
						<bt-svg-icon name="icon-recommend" size="30"></bt-svg-icon>
					</i>
					{{ isActivePay ? '立即续费' : '立即购买' }}
				</el-button>
			</div>
			<div class="flex flex-col justify-center">
				<div class="flex items-center">
					<span class="flex items-center">
						<i :class="`svgtofont-icon-${isShowType ? 'ltd' : 'pro'} relative top-[1px] mr-[4px] !text-subtitleLarge`" :style="{ color: isShowColor }"></i>
						<span class="text-base font-bold" :style="{ color: isShowColor }">
							<span class="mr-[10px]">{{ isShowType ? '企业版' : '专业版' }}{{ isActivePay ? '' : '特权' }}</span>
							<span v-if="isActivePay" class="text-warning">
								到期时间:
								<span v-if="authExpirationTime !== 0" class="cursor-pointer" @click="pluginPayEvent(33)">
									{{ isExpTime }}
									<template v-if="isDistanceDays > 7">（续费）</template>
									<template v-if="isDistanceDays <= 7"> (还有{{ isDistanceDays }}天到期，点击续费) </template>
									<template v-if="isDistanceDays <= 0">（已到期，点击续费）</template>
								</span>
								<span v-else> 永久授权 </span>
							</span>
						</span>
					</span>
					<bt-divider class="!mx-[20px]" />
					<span id="productIntroduce"></span>
					<el-link type="warning" class="!font-bold !text-base">
						<el-popover placement="bottom-start" effect="light" trigger="hover" width="180" popper-class="el-tooltip-white !p-[8px]">
							<template #reference>
								<span class="flex items-center">
									<i class="svgtofont-icon-customer-service mr-[2px] !text-large !text-warning"></i>
									<span class="!text-warning">在线客服</span>
								</span>
							</template>
							<BtOnlineService />
						</el-popover>
					</el-link>
				</div>
				<div class="product-recom-list">
					<div v-for="item in recomList" :key="item.title" class="recom-item">
						<i :class="`svgtofont-${item.icon} !text-extraLarge !text-warningDark`"></i>
						<span>{{ item.title }} </span>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'

import { useGlobalStore } from '@store/global'
import { SOFT_STORE } from '@/views/soft/store'
import SOFT_PLUGIN_STORE from '../store'

import BtOnlineService from '@components/business/bt-online-service/index.vue'
import { isBoolean } from '@/utils'

const { payment } = useGlobalStore()
const authType = shallowRef(payment.value.authType)
const authExpirationTime = shallowRef(payment.value.authExpirationTime)

const { tabTypeActive } = storeToRefs(SOFT_STORE())

const { pluginPayEvent } = SOFT_PLUGIN_STORE()
const { isActivePay, isShowType, isExpTime, isDistanceDays, isShowColor, recomList } = storeToRefs(SOFT_PLUGIN_STORE())

onMounted(() => {
	// 专版挂载方法
	nextTick(() => {
		const time = setInterval(async () => {
			if (window.$extension) {
				const plugin = await window.$extension()
				if (isBoolean(plugin.extensionElement) && !plugin.extensionElement) clearTimeout(time)
				if (plugin.extensionElement) {
					plugin.extensionElement({
						custom: {
							openPay: () => {
								pluginPayEvent(isActivePay.value ? 30 : 29)
							},
						},
					})
					clearTimeout(time)
				}
			}
		}, 1000)
	})
})
</script>

<style lang="css" scoped>
.recom-view {
	@apply h-[84px] w-full mb-12px bg-center relative rounded-extraLarge;
	background: linear-gradient(to bottom, rgba(var(--el-color-warning), 0.3), rgba(var(--el-color-warning), 0.1));
	background-color: rgba(var(--el-color-warning-rgb), 0.05);
}
.recom-view::before,
.recom-view::after {
	@apply content-[''] w-[148px] h-[84px] absolute bottom-[0] bg-no-repeat bg-bottom bg-cover rounded-base z-97;
}
.recom-view::before {
	left: 0;
	background-image: url(/static/images/advantage/free-left-img.svg);
}
.recom-view::after {
	right: 0;
	background-image: url(/static/images/advantage/free-right-img.svg);
}
.recom-content {
	@apply flex h-[84px] relative z-99 px-[8%] truncate;
}
.product-recom-list {
	@apply flex items-center mt-[8px] text-tertiary;
}
.product-recom-list .recom-item {
	@apply flex items-center mr-[20px] text-secondary;
}
.product-recom-list .recom-item i {
	@apply mr-[4px];
}

.free-view .payment-btn,
.ltd-view .payment-btn {
	@apply bg-[var(--el-color-warning-light-3)] px-[20px] h-[36px] text-white text-base border-none;
}
.free-view .payment-btn:hover,
.ltd-view .payment-btn:hover {
	@apply bg-warning;
}
.free-view i,
.ltd-view i {
	@apply text-warning;
}
.pro-view .payment-btn {
	@apply bg-[var(--el-color-warning-light-3)] px-[20px] h-[36px] text-white text-base border-none;
}
.pro-view i {
	@apply text-warning;
}
</style>

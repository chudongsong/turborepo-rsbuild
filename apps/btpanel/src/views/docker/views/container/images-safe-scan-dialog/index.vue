<template>
	<section class="p-2rem">
		<template v-if="payment.authType === 'ltd'">
			<div class="scanHead flex justify-between mb-2rem">
				<div class="scanHead__left flex">
					<div class="w-[8rem] h-[8rem]">
						<bt-image v-if="scanParam.isFirst && !scanParam.isScan" class="w-full" src="/firewall/icon-safe-detect.svg" />
						<el-progress v-else type="circle" :percentage="scanParam.score" :format="format" :color="colors" :width="80"></el-progress>
					</div>
					<div class="pt-[2rem] pl-2rem w-[40rem]">
						<div class="text-large font-bold" v-html="scanParam.title"></div>
						<div class="text-secondary mt-1rem">
							<!-- 长度大于35时取后35位 -->
							{{ scanParam.msg.length > 35 ? scanParam.msg.substring(0, 35) + '...' : scanParam.msg }}
						</div>
					</div>
				</div>

				<div class="scanHead__right pt-[2.6rem]">
					<el-button :type="scanParam.btnObj.type" :disabled="scanParam.btnObj.disabled" @click="scanDetectEvent">
						{{ scanParam.btnObj.text }}
					</el-button>
				</div>
			</div>
			<div class="scanBody h-[50rem] overflow-auto">
				<div v-for="(item, index) in scanParam.imageList" :key="index" class="bg-extraLight mb-1rem" :class="item.active ? 'active' : ''">
					<div class="scanBody__title flex justify-between cursor-pointer rounded-base px-[2rem] h-[3.5rem] leading-[3.5rem] text-base" @click="titleClick(index)">
						<el-tooltip class="item" effect="dark" :content="item.name" placement="top-start">
							<span class="text-base font-bold leading-[3.5rem]">{{ item.name.length > 50 ? item.name.substring(0, 50) + '...' : item.name }}</span>
						</el-tooltip>

						<div class="flex" v-if="scanParam.isEnd || scanParam.isScan">
							<template v-if="item.riskList && item.riskList.length > 0">
								<span class="text-danger">发现{{ item.riskList.length }}项风险</span>
							</template>
							<template v-else-if="!item.noWarring && !item.riskList">
								<span>检测中</span>
							</template>
							<template v-else>
								<span class="text-primary">无风险项</span>
							</template>
							<bt-image :src="'/firewall/arrow-down.svg'" class="w-[1.6rem] ml-2rem" />
						</div>
					</div>

					<div class="scanBody__content mb-[2rem] mx-[2rem]">
						<div v-for="(wItem, wIndex) in item.riskList" :key="wIndex" class="bg-[rgba(var(--el-color-danger),0.1)] text-secondary py-1rem px-[1.5rem] mb-[0.8rem] rounded-base">
							<div class="scanBody__content__title border-b border-light pb-[.4rem] mb-[.4rem]">
								{{ wItem.msg }}
							</div>
							<div class="scanBody__content__desc flex border-b border-light pb-[.4rem] mb-[.4rem]"><span class="w-[6rem] flex-shrink-0 inline-block">详情：</span><span v-html="wItem.detail"></span></div>
							<div class="scanBody__content__repair flex"><span class="w-[6rem] flex-shrink-0 inline-block">修复方案：</span><span v-html="wItem.repair"></span></div>
						</div>
					</div>
				</div>
			</div>
		</template>
		<template v-else>
			<bt-product-introduce :data="productData"></bt-product-introduce>
		</template>
	</section>
</template>

<script setup lang="ts">
import { useGlobalStore } from '@store/global'
import { init, unMountHandle, format, colors, titleClick, scanDetectEvent, scanParam, productData } from './useController'

const { payment } = useGlobalStore()

onMounted(() => {
	init()
})

// 退出弹窗时清除定时器
onBeforeUnmount(() => {
	unMountHandle()
})
</script>
<style lang="css" scoped>
.scanBody > div.active .scanBody__content {
	display: block;
}
.scanBody__content {
	display: none;
}
:deep(.product-introduce-hr) {
	@apply mt-[1rem] mb-[2rem];
}
</style>

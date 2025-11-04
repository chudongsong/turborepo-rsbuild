<template>
	<div class="p-[2rem] container-dialog" v-bt-loading="viewLoading">
		<div class="relative">
			<el-form ref="capsiteInfo" :model="capacityData" :rules="rules" class="" :label-width="'10rem'">
				<el-form-item label="当前已用容量：">
					<el-input v-model="useSize" readonly class="!w-[22rem]">
						<template #append v-if="typeof useSize === 'number'">
							<span class="text-gray-500">MB</span>
						</template>
					</el-input>
				</el-form-item>
				<!-- v-model -->
				<el-form-item label="当前容量配额：" prop="size">
					<el-input v-model="capacityData.size" :min="0" type="number" class="!w-[22rem]">
						<template #append>
							<span class="text-gray-500">MB</span>
						</template>
					</el-input>
				</el-form-item>
				<el-form-item label="设置告警：" prop="status">
					<el-switch v-model="capacityData.status"></el-switch>
				</el-form-item>
				<template v-if="capacityData.status">
					<el-form-item label="触发告警大小：" class="my-[1.6rem]" prop="alarmSize">
						<el-input v-model="capacityData.alarmSize" :min="0" type="number" class="!w-[22rem]">
							<template #append>
								<span class="text-gray-500">MB</span>
							</template>
						</el-input>
					</el-form-item>
					<el-form-item label="告警次数：" prop="alarmNum">
						<bt-input v-model="capacityData.alarmNum" :min="0" type="number" prependText="每日最多触发" width="26rem" text-type="次"></bt-input>
					</el-form-item>
					<el-form-item label="告警方式：" prop="module">
						<bt-alarm-old-select v-model="capacityData.module" />
					</el-form-item>
				</template>
				<el-form-item label=" ">
					<el-button @click="onConfirm" type="primary">保存</el-button>
				</el-form-item>
			</el-form>
			<bt-install-mask v-if="maskLayer" width="32rem">
				<template #content>指定xfs分区未开启目录配额功能</template>
			</bt-install-mask>
			<!-- <div v-if="maskLayer" class="absolute bg-white h-full w-full top-0 opacity-[0.6]"></div> -->
		</div>
		<div class="tip">
			<ul class="mt-[8px] leading-10 list-disc ml-[20px]">
				<template v-if="maskTips?.length">
					<li v-for="(item, index) in maskTips" :key="index" class="items-center leading-[2.4rem]">
						<span class="text-secondary">{{ item }}</span>
					</li>
				</template>
				<template v-else>
					<li class="items-center leading-[2.4rem]" v-show="authType !== 'ltd'">
						<span class="text-danger">温馨提示：此功能为企业版专享功能</span>
					</li>
					<!-- <li class="items-center leading-[2.4rem]" v-show="capacityData.status">
						点击配置后状态未更新，尝试点击【
						<bt-link @click="getPushConfigInfo">手动刷新</bt-link>
						】
					</li> -->
					<li class="items-center leading-[2.4rem]">
						<span class="text-secondary">配额容量：如需取消容量配额，请设为“0”</span>
					</li>
				</template>
			</ul>
		</div>
	</div>
</template>

<script setup lang="ts">
import { useGlobalStore } from '@/store/global'
import { capacityData, init, maskLayer, maskTips, onConfirm, rules, useSize, viewLoading, capsiteInfo } from './useOtherController'

const { payment } = useGlobalStore()
const { authType } = payment.value

// watch(
// 	() => siteInfo.value,
// 	val => {
// 		init();
// 	},
// 	{ immediate: true, deep: true }
// );

onMounted(init)

defineExpose({
	init,
	onConfirm,
})
</script>

<style lang="css" scoped>
.container-dialog :deep(.el-radio__label) {
	@apply text-small text-default;
}
.container-dialog :deep(.el-slider__runway) {
	@apply my-[1.3rem];
}
.container-dialog :deep(.el-input .el-input__inner[readonly]) {
	@apply text-default bg-light;
}
.el-message__content {
	width: 36rem;
}
.el-message__content pre {
	margin: 0 1.2rem;
	width: 92%;
	height: 100%;
	max-width: 94%;
	background-color: var(--el-color-white);
	outline: none;
	white-space: pre-wrap;
	word-wrap: break-word;
}

.site-verify-disk pre {
	@apply font-normal bg-darkPrimary text-disabled pd-[.6rem] rounded-small mt-[.6rem] whitespace-normal p-[2px] my-[2px];
}
</style>

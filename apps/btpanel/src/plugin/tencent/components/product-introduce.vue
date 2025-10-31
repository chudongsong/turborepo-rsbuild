<template>
	<div>
		<span v-if="isShow" class="free-ex-tag" @click="props.dependencies.custom.openPay"> <span class="tencent-icon"></span>腾讯云专版特权，宝塔产品享8折优惠，立即前往 </span>
	</div>
</template>

<script lang="ts" setup>
import { setInstance, checkTencentLoginAuth } from '../api'
interface Props {
	dependencies: AnyObject
}

const props: any = withDefaults(defineProps<Props>(), {
	dependencies: () => ({}),
})

const { useAxios } = unref(props.dependencies.hooks)
setInstance(useAxios)
const isShow = ref(false)

onMounted(async () => {
	const res = await checkTencentLoginAuth()
	if (res.status && res.data.login === 1) {
		isShow.value = true
	}
})
</script>

<style scoped>
.free-ex-tag {
	@apply text-small text-supplement py-[.15rem] px-[.5rem] cursor-pointer font-bold mr-[2rem] bg-light;
	border-radius: var(--el-border-radius-base);
	display: inline-flex;
	align-items: center;
	border: 1px solid var(--el-base-supplement);
}
.free-ex-tag:hover {
	@apply bg-[var(--el-base-supplement-light-8)];
}
.tencent-icon {
	width: 2rem;
	height: 2rem;
	display: inline-block;
	background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 286.65 207.43'%3E%3Cpath d='M248.41 169.83c-5.11 5-14.21 10.79-29.16 11.3-6.91.23-15 .26-18.67.26h-80.3l57.59-55.94c2.65-2.57 8.61-8.27 13.75-12.9 11.28-10.15 21.43-12.2 28.61-12.13a40.46 40.46 0 0 1 28.18 69.41m19.23-75.5a66.15 66.15 0 0 0-47.31-20c-16.07 0-29.91 5.54-42 15.38-5.27 4.29-10.79 9.42-17.74 16.17-3.45 3.36-103.53 100.46-103.53 100.46a156.54 156.54 0 0 0 18.9 1h125.82c9.69 0 16 0 22.76-.5 15.53-1.13 30.21-6.83 42.07-18.48a66.49 66.49 0 0 0 1.03-94.03' style='fill:%2300a3ff'/%3E%3Cpath d='M106.18 88.09c-11.76-8.81-24.93-13.73-39.86-13.71A66.5 66.5 0 0 0 20 188.44a64.54 64.54 0 0 0 37.05 17.94l25.76-25c-4.16 0-10.14-.07-15.45-.25-14.94-.51-24-6.25-29.15-11.3a40.46 40.46 0 0 1 28.18-69.41c7 0 16.62 2 27.43 11 5.16 4.28 16.62 14.36 21.65 18.89a.62.62 0 0 0 .87 0L134.11 113a.64.64 0 0 0 0-1c-8.53-7.71-20.62-18.5-27.91-23.92' style='fill:%2300c8dc'/%3E%3Cpath d='M227.3 59.36a89.08 89.08 0 0 0-172 16 65.32 65.32 0 0 1 11-.93 64.36 64.36 0 0 1 15 1.76 2.8 2.8 0 0 1 .28.06 63 63 0 0 1 118.98-13.47.58.58 0 0 0 .7.38 76.32 76.32 0 0 1 25.14-2.62c.85.07 1.18-.41.9-1.18' style='fill:%23006eff'/%3E%3C/svg%3E");
	background-size: 100% 100%;
	background-repeat: no-repeat;
	margin-right: 0.5rem;
}
</style>

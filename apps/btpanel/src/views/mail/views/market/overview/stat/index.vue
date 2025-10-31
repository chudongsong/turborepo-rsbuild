<template>
	<div class="rate-box">
		<div class="rate-list">
			<div class="rate-title">送达率</div>
			<div class="rate-text">{{ `${rate.delivery}%` }}</div>
		</div>
		<!-- <div class="rate-list">
			<div class="rate-title">打开率</div>
			<div class="rate-text">{{ getRate(rate.open) }}</div>
		</div>
		<div class="rate-list">
			<div class="rate-title">点击率</div>
			<div class="rate-text">{{ getRate(rate.click) }}</div>
		</div> -->
		<div class="rate-list">
			<div class="rate-title">退信率</div>
			<div class="rate-text">{{ getRate(rate.bounce) }}</div>
		</div>
	</div>
</template>

<script lang="ts" setup>
import { useOverview } from '../useMethod'

const { onResult, getRate } = useOverview()

const rate = reactive({
	delivery: 0,
	open: 0,
	click: 0,
	bounce: 0,
})

onResult(data => {
	rate.delivery = data.dashboard.delivery_rate
	rate.open = data.dashboard.open_rate
	rate.click = data.dashboard.click_rate
	rate.bounce = data.dashboard.bounce_rate
})
</script>

<style lang="scss" scoped>
.rate-box {
	@apply flex justify-between gap-16px mt-[16px];

	.rate-list {
		@apply flex-1 bg-lighter text-center p-[30px];
		border-radius: var(--el-border-radius-base);
		border: 1px solid var(--el-color-border-extra-light);
	}

	.rate-title {
		@apply text-desc text-tertiary;
	}

	.rate-text {
		@apply mt-6px text-subtitleLarge font-bold text-default text-secondary;
	}
}
</style>

<template>
	<div class="p-[1.6rem]">
		<div class="flex flex-col text-secondary text-base">
			<span class="flex items-center">
				当前状态：
				<BtTableStatus v-model="autoCompleteStatus" :data="['关闭', '开启']" @click="setAutoCompleteStatus"></BtTableStatus>
			</span>
		</div>
		<el-divider />
		<div>
			<div class="text-secondary text-base mb-[1.4rem]">操作方式</div>
			<div class="keys-up-item">
				<span class="keys-up-btn">↑</span>
				<span class="keys-up-tips">上一条</span>
			</div>
			<div class="keys-up-item">
				<span class="keys-up-btn">↓</span>
				<span class="keys-up-tips">下一条</span>
			</div>
			<div class="keys-up-item">
				<span class="keys-up-btn">ESC</span>
				<span class="keys-up-tips">隐藏/显示提示框</span>
			</div>
			<div class="keys-up-item">
				<span class="keys-up-btn">Enter/Tab</span>
				<span class="keys-up-tips">应用命令</span>
			</div>
		</div>
	</div>
</template>

<script lang="tsx" setup>
import BtTableStatus from '@/components/extension/bt-table-status'
import { useTermStore } from '@/views/term/useStore'

const { autoCompleteStatus, setAutoCompleteStatus } = useTermStore()
</script>

<style scoped>
.keys-up-item {
	@apply leading-[25px] text-default text-[0] mb-[5px];
}

.keys-up-item :deep(img) {
	@apply w-[14px];
}

.keys-up-item :deep(.keys-up-btn) {
	@apply h-[25px] px-[10px] leading-[25px] text-center inline-block rounded-small text-small font-semibold text-secondary;
	border: 1px solid var(--el-color-border-darker);
}

.keys-up-item :deep(.keys-up-btn i) {
	@apply text-base;
}

.keys-up-item :deep(.keys-up-symbol) {
	@apply px-[5px] text-base font-semibold text-secondary;
}

.keys-up-item :deep(.keys-up-symbols) {
	@apply px-[2px] text-small font-semibold text-secondary;
}

.keys-up-item :deep(.keys-up-tips) {
	@apply pl-[25px] text-small text-secondary;
}
</style>

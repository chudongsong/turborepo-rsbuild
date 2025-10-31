<template>
	<div class="tab-list">
		<div class="active tabs-item">{{ active }}</div>
		<div class="tabs-item"></div>
	</div>
</template>

<script lang="ts" setup>
defineProps({
	active: {
		type: String,
		default: '',
	},
})
</script>

<style lang="css" scoped>
.tab-list {
	@apply flex w-full h-4.5rem mb-1.5rem bg-white rounded-base;
	box-shadow: 0 3px 2px 0 rgba(var(--el-color-black-rgb), 5%);
}

.tabs-item {
	@apply relative flex justify-center items-center w-10rem h-4.5rem text-base text-default cursor-pointer;
}

.tabs-item.active {
	@apply bg-[rgba(var(--el-color-primary-rgb),0.1)] text-primary;
}

.tabs-item::after {
	content: '';
	@apply absolute bottom-0 left-[50%] ml-[-1rem] flex w-2rem h-0.2rem bg-primary;
}
</style>

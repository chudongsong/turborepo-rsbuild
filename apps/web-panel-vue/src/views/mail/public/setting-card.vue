<template>
	<div class="setting-card">
		<div class="setting-title">{{ title }}</div>
		<slot></slot>
	</div>
</template>

<script lang="ts" setup>
interface Props {
	title: string;
}

withDefaults(defineProps<Props>(), {
	title: '',
});
</script>

<style lang="css" scoped>
.setting-card {
	@apply p-12px;
}
.setting-card .setting-title {
	@apply mb-12px leading-28px font-bold text-15px text-#666;
}
</style>

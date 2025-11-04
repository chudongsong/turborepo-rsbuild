<template>
	<div class="pt-8px">
		<div class="comp-title">基础组件</div>
		<div class="comp-list">
			<menu-item v-for="item of componentsPreset" :key="item.type" :item-config="item"> </menu-item>
		</div>
		<!-- <preview-box></preview-box> 预览组件，后续优化 -->
	</div>
</template>

<script lang="ts" setup>
import { componentsPreset } from '../../store/index'

import MenuItem from './MenuItem.vue'
</script>

<style lang="scss" scoped>
.comp-title {
	display: flex;
	align-items: center;
	justify-content: center;
	height: 32px;
	margin-bottom: 8px;
	font-size: var(--el-font-size-base);
	color: var(--el-color-text-secondary);
}

.comp-list {
	display: grid;
	grid-template-columns: repeat(3, 1fr);
	padding: 0 16px;
	grid-gap: 12px;
}
</style>

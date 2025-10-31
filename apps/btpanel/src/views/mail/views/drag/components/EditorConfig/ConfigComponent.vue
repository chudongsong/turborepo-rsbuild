<template>
	<div>
		<columns-config v-if="configPanelType == 'columns'" />
		<button-config v-else-if="configPanelType == 'button'" />
		<divider-config v-else-if="configPanelType == 'divider'" />
		<header-config v-else-if="configPanelType == 'header'" />
		<text-config v-else-if="configPanelType == 'text'" />
		<image-config v-else-if="configPanelType == 'image'" />
		<menu-config v-else-if="configPanelType == 'menu'" />
	</div>
</template>

<script lang="ts" setup>
import { configPanelType } from '../../store'

import ColumnsConfig from '../ComponentPresetConfig/ColumnsConfig.vue'
import ButtonConfig from '../ComponentPresetConfig/ButtonConfig.vue'
import DividerConfig from '../ComponentPresetConfig/DividerConfig.vue'
import HeaderConfig from '../ComponentPresetConfig/HeaderConfig.vue'
import TextConfig from '../ComponentPresetConfig/TextConfig.vue'
import ImageConfig from '../ComponentPresetConfig/ImageConfig.vue'
import MenuConfig from '../ComponentPresetConfig/MenuConfig.vue'
</script>

<style lang="scss" scoped></style>

<template>
	<div>
		<PanelSettings />
		<SafeSettings />
		<UISettings />
	</div>
</template>

<script setup lang="ts">
import SafeSettings from '@config/views/safe-settings/index.vue'
import PanelSettings from '@config/views/panel-settings/index.vue'
import UISettings from '@config/views/ui-settings/index.vue'
</script>

<style scoped></style>

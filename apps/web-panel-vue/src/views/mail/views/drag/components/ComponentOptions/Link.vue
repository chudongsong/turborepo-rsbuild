<template>
	<Container label="链接">
		<template #options>
			<div>
				<el-input v-model="value" />
			</div>
			<div class="mt-3">
				<el-switch v-model="target" active-value="_blank" inactive-value="_self" />
				<span class="ml-2">在新窗口打开</span>
			</div>
		</template>
	</Container>
</template>

<script lang="ts" setup>
import Container from './BaseContainer.vue'

const value = defineModel<string>('value')

const target = defineModel<string>('target')
</script>

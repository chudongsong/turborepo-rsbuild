<template>
	<container label="图片链接">
		<template #options>
			<el-input v-model="value" />
		</template>
	</container>
</template>

<script lang="ts" setup>
import Container from './BaseContainer.vue'

const value = defineModel<string>('value')
</script>

<style lang="scss" scoped></style>

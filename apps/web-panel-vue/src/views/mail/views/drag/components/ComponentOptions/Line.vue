<template>
	<container label="线条">
		<template #value>
			<base-border v-model:value="value"></base-border>
		</template>
	</container>
</template>

<script lang="ts" setup>
import Container from './BaseContainer.vue'
import BaseBorder from './BaseBorder.vue'

const value = defineModel<string>('value', {
	default: '',
})
</script>

<template>
	<Container label="内容">
		<template #options>
			<div>
				<el-input v-model="value" />
			</div>
		</template>
	</Container>
</template>

<script lang="ts" setup>
import Container from './BaseContainer.vue'

const value = defineModel<string>('value')

</script>

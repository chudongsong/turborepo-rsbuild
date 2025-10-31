<template>
	<container :label="label">
		<template #value>
			<div class="w-32px">
				<el-color-picker v-model="color" :show-alpha="false" color-format="hex">
				</el-color-picker>
			</div>
		</template>
	</container>
</template>

<script lang="ts" setup>
import Container from './BaseContainer.vue'

interface Props {
	label?: string
}

withDefaults(defineProps<Props>(), {
	label: '',
})

const color = defineModel<string>('value', {
	default: '',
})
</script>

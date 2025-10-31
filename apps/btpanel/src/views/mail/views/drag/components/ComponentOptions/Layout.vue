<template>
	<container label="布局">
		<template #value>
			<div class="w-140px">
				<el-select v-model="value">
					<el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value" />
				</el-select>
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

const value = defineModel<string>('value', {
	default: '',
})

const options = [
	{ label: '水平', value: 'horizontal' },
	{ label: '垂直', value: 'vertical' },
]

if (!value.value) {
	value.value = options[0].value
}
</script>

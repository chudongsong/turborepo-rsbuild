<template>
	<container label="字体粗细">
		<template #value>
			<div class="w-100px">
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
	{ label: '正常', value: 'normal' },
	{ label: '粗体', value: 'bold' },
]

if (!value.value) {
	value.value = options[0].value
}
</script>

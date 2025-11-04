<template>
	<div class="el-input-group">
		<el-input-number v-model="number" :min="0" :step="step" :controls-position="'right'" style="width: 92px"
			@input="onUpdateNumber">
		</el-input-number>
		<div class="el-input-group__append">{{ unit }}</div>
	</div>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue'

const { unit } = defineProps({
	unit: {
		type: String,
		default: 'px',
	},
	step: {
		type: Number,
		default: 1,
	},
})

const value = defineModel<string>('value', {
	default: '',
})

const number = ref(0)

watch(
	() => value.value,
	val => {
		number.value = val ? Number.parseFloat(val) : 0
	},
	{
		immediate: true,
	}
)

const onUpdateNumber = (val: number | null | undefined) => {
	value.value = `${val || 0}${unit}`
}
</script>

<template>
	<container label="宽度">
		<template #value>
			<span class="mr-3">自动</span>
			<el-switch v-model="auto" @change="onUpdateAuto" />
		</template>
		<template #options>
			<div class="flex items-center" style="height: 32px;">
				<el-slider v-model="width" :step="1" :disabled="auto" @input="onUpdateWidth" />
				<span v-if="!auto" class="ml-4 whitespace-nowrap">{{ width }}%</span>
			</div>
		</template>
	</container>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue'
import Container from './BaseContainer.vue'

const value = defineModel<string>('value', {
	default: '',
})

const auto = ref(true)

const width = ref(100)

watch(
	() => value.value,
	val => {
		if (val === 'auto') {
			auto.value = true
		} else {
			auto.value = false
			width.value = Number.parseFloat(val)
		}
		if (!auto.value) {
			width.value = Number.parseFloat(val)
		}
	},
	{
		immediate: true,
	}
)

const onUpdateAuto = (val: boolean | string | number) => {
	width.value = 100
	if (val) {
		value.value = '100%'
	} else {
		value.value = `${width.value}%`
	}
}

const onUpdateWidth = (val: number | number[]) => {
	value.value = `${val}%`
}
</script>

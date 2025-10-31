<template>
	<container label="宽度">
		<template #value>
			<!-- <base-number v-model:value="value"></base-number> -->
			<div class="w-180px">
				<el-slider v-model="width" :step="1" @input="onUpdateWidth" />
			</div>
		</template>
	</container>
</template>

<script lang="ts" setup>
import { ref, watch } from "vue"
import Container from './BaseContainer.vue'

const value = defineModel<string>('value', {
	default: '',
})

const width = ref(100)

watch(
	() => value.value,
	val => {
		width.value = Number.parseFloat(val)
	},
	{
		immediate: true,
	}
)

const onUpdateWidth = (val: number | number[]) => {
	value.value = `${val}%`
}
</script>

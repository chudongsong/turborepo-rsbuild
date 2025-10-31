<!--
	@description 
		- 基础边框设置，为Border服务（可以单独设置四条边框）  
		- 要求数据格式为字符串
-->
<template>
	<div class="flex flex-col gap-8px">
		<number-base v-model:value="width" placeholder="" @update:value="onUpdateConfig"> </number-base>
		<div class="w-92px">
			<el-select v-model="style" @change="onUpdateConfig">
				<el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value" />
			</el-select>
		</div>
		<div class="w-32px">
			<el-color-picker v-model="color" :show-alpha="false" color-format="hex" @change="onUpdateConfig" />
		</div>
	</div>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue';
import NumberBase from './BaseNumber.vue'

const config = defineModel<string>('value', {
	default: '',
})

const options = [
	{ label: '实线', value: 'solid' },
	{ label: '点线', value: 'dotted' },
	{ label: '虚线', value: 'dashed' },
]

const style = ref('solid')

const width = ref('')

const color = ref('')

const onUpdateConfig = () => {
	config.value = `${width.value} ${style.value} ${color.value || 'transparent'}`
}

watch(
	() => config.value,
	val => {
		const [w, s, c] = val.split(' ')
		width.value = w || ''
		style.value = s || 'solid'
		color.value = c || ''
	},
	{
		immediate: true,
	}
)
</script>

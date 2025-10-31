<template>
	<div class="flex items-center">
		<span class="whitespace-nowrap">{{ title }}</span>
		<el-select
			@click.native="onSelectClick"
			v-model="selectVal"
			v-show="active"
			:teleported="false"
			ref="selectRef"
			style="width: 8rem"
			size="small"
			class="2xl:w-[10rem] <2xl:w-[6rem] lt-lg:w-[10rem] text-left"
			@change="changeNetworkUnit(selectVal)"
			placeholder="请选择">
			<el-option v-for="item of selectList" :key="item.value" :label="item.label" :value="item.value"> </el-option>
		</el-select>
	</div>
</template>

<script lang="ts" setup>
import { networkIoKey, changeNetworkUnit } from '../useController'

interface Props {
	type: string
	title: string
	active: boolean
	selectList?: Array<{ label: string; value: string }>
}

const props = withDefaults(defineProps<Props>(), {
	type: 'network',
	title: '网络IO',
	active: false,
})

const emits = defineEmits(['cut-day-click'])

const selectVal = ref<string>(networkIoKey.value || 'all') // 选择的值
const selectRef = ref() // 选择框

const onSelectClick = () => {
	selectRef.value?.focus()
	emits('cut-day-click')
	nextTick(() => {
		const elements = document.querySelectorAll('.custom-day-picker')
		elements.forEach(element => {
			;(element as HTMLElement).style.display = 'none'
		})
	})
}
</script>

<style lang="css" scoped>
span {
	margin-right: 5px;
}
</style>

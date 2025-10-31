<template>
	<section class="config-rows" :title="label" :style="`display: ${isSearch ? 'flex' : 'none'}`">
		<div class="label">
			<slot v-if="slotLabel" name="label"></slot>
			<span v-else v-select-lighting>{{ label }}</span>
		</div>
		<div class="value">
			<slot name="value"></slot>
		</div>
		<div ref="descRef" class="desc text-light" v-select-lighting>
			<slot name="desc"></slot>
		</div>
	</section>
</template>

<script lang="ts" setup>
import { getConfigStore } from '@config/useStore'

interface Props {
	label?: string | any
}

const props = withDefaults(defineProps<Props>(), {
	label: '',
})

const {
	refs: { settingSearch },
} = getConfigStore()

const descRef = ref()

// 判断是否显示
const isSearch = computed(() => {
	let show = true
	if (settingSearch.value === '') {
		// 搜索框为空时，显示所有
		show = true
	} else if (text.value.includes(settingSearch.value)) {
		// 搜索框不为空时，判断desc是否包含搜索值
		show = true
	} else if (props.label.includes(settingSearch.value)) {
		// 搜索框不为空时，判断label是否包含搜索值
		show = true
	} else {
		// 不显示
		show = false
	}
	return show
})

const text = ref('')

// 判断<slot name="label"/>是否有传值
const slotLabel = !!useSlots().label

onMounted(() => {
	// 通过nextTick获取desc的文本
	nextTick(() => {
		text.value = descRef.value.innerText
	})
})
</script>

<style lang="css" scoped>
.config-rows {
	display: flex;
	flex-wrap: wrap;
	align-items: center;
	padding: 0.5rem 0;
	transition: background 0.2s;
}
.config-rows:hover {
	background-color: #a5a5a514;
}
.config-rows .label {
	width: 15rem;
	padding-right: 1.5rem;
	text-align: right;
}
.config-rows .value {
	display: flex;
	align-items: center;
	min-height: 3.2rem;
	margin: 0 0.5rem;
}
.config-rows .desc {
	display: flex;
	flex-wrap: wrap;
	margin-left: 1rem;
}
</style>

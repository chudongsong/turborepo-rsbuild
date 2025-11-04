<template>
	<!-- :disabled="disabledTip" -->
	<el-tooltip
		ref="tlp"
		:content="text"
		:disabled="!tooltipFlag"
		:placement="placement"
		:popper-class="popperClass">
		<slot v-if="contentSlot" name="contentSlot" @mouseenter="visibilityChange($event)"></slot>
		<span v-else v-bind="$attrs" @mouseenter="visibilityChange($event)">
			{{ text }}</span
		>
	</el-tooltip>
</template>

<script lang="ts" setup>
interface Props {
	text: string
	placement?: 'top' | 'top-start' | 'top-end' | 'bottom' | 'bottom-start' | 'bottom-end' | 'left' | 'left-start' | 'left-end' | 'right' | 'right-start' | 'right-end'
	popperClass?: string
}

// 默认数据
const props = withDefaults(defineProps<Props>(), {
	text: '', // 文本内容,父元素加上truncate w-full类
	placement: 'top', // Tooltip位置
	popperClass: '', // Tooltip类名
})

const { proxy: vm }: any = getCurrentInstance()

const tooltipFlag = ref(false) // Tooltip是否显示

/**
 * @description tooltip的可控
 */
const visibilityChange = (event: MouseEvent) => {
	const ev = event.target
	const ev_width = ev.offsetWidth // 文本的实际高度
	const content_width = vm.$refs.tlp.$el.parentNode.clientWidth // 文本容器高度
	if (content_width < ev_width) {
		// 实际内容高度 > 文本高度 =》内容溢出
		tooltipFlag.value = true // NameIsIncludeWord ? true : !!false
	} else {
		// 否则为不溢出
		tooltipFlag.value = false
	}
}
// 判断<slot name="suffix"/>是否有传值
const contentSlot = !!useSlots().content
</script>

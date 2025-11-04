<template>
	<div class="w-full h-full relative" @mouseover="setBtnShow(true)" @mouseleave="setBtnShow(false)">
		<pre ref="preRef" style="height: 100%" class="w-full flex items-start py-[1rem] px-4 overflow-y-auto bg-[#111] log-box leading-[20px] !rounded-large text-small">
			<code v-if="isHtml" class="flex-1 w-full p-0 bg-none whitespace-pre-line text-i text-disabled dark:text-[#ccc]" v-html="content || '暂无日志'"></code>
    	<code v-if="!isHtml" class="flex-1  w-full p-0 bg-none whitespace-pre-line text-i text-disabled dark:text-[#ccc]">{{ content || '暂无日志' }}</code>
		</pre>
		<el-button v-show="isBtnShow" type="primary" class="absolute" style="top: 1rem; right: 1.5rem" @click="fullScreen"> 全屏展示 </el-button>
	</div>
</template>

<script lang="ts" setup>
import { useDialog } from '@/hooks/tools'
import type { FullScreenProps } from './index'

interface Props {
	content: string // 内容
	isHtml?: boolean // 是否是html
	autoScroll?: boolean // 是否自动滚动到底部
	fullScreen?: FullScreenProps | false // 全屏配置
}

const props = withDefaults(defineProps<Props>(), {
	content: '',
	isHtml: false,
	autoScroll: true, // 是否自动滚动到底部
	fullScreen: false,
})

const preRef = ref<Element | null>(null)

// 是否显示全屏按钮
const isBtnShow = ref(false)

/**
 * @description 滚动到底部
 */
const setScrollBottom = () => {
	nextTick(() => {
		const el = preRef.value as Element
		const { scrollHeight } = el
		el.scrollTop = scrollHeight
	})
}

watch(
	() => props.content,
	() => {
		console.log(21343)
		if (props.autoScroll) setScrollBottom()
	},
	{ immediate: true }
)

// 设置全屏按钮
const setBtnShow = (val: boolean) => {
	if (!props.fullScreen) return
	isBtnShow.value = val
}

// 获取内容
const getContent = () => {
	return props.content
}

// 全屏
const fullScreen = () => {
	useDialog({
		title: (props.fullScreen as FullScreenProps).title,
		area: '100%',
		showFooter: false,
		closeBtn: 2,
		customClass: 'full-screen-dialog',
		component: () => import('./full-screen.vue'),
		compData: {
			isHtml: props.isHtml,
			autoScroll: props.autoScroll,
			onRefresh: (props.fullScreen as FullScreenProps).onRefresh,
			getContent,
		},
	})
}

onMounted(() => {
	if (props.autoScroll) setScrollBottom()
})

defineExpose({
	setScrollBottom,
})
</script>

<style lang="css" scoped>
/* 调整滚动条样式 */
.log-box::-webkit-scrollbar-thumb {
	background: var(--el-base-tertiary);
}
</style>

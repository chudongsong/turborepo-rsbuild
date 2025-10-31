<template>
	<transition name="dialog-fade">
		<div ref="dialog" :class="`bt-dialog-v2 ${customClass}`" :style="{ zIndex: zIndex, width: dialogArea[0], height: dialogArea[1], left: dialogOffset.x, top: dialogOffset.y }">
			<header v-if="title" class="bt-dialog-header" @mousedown="startDrag">
				<span>{{ title }}</span>
				<div class="dialog-btn-group">
					<!-- 缩小 -->
					<template v-if="!clientMinimize && !clientFullscreen">
						<span class="icon" title="最小化" @click.stop.prevent="onShrink">
							<i class="svgtofont-el-semi-select" />
						</span>
					</template>

					<!-- 全屏 -->
					<template v-if="!clientFullscreen && !clientMinimize">
						<span class="icon" title="全屏" @click.stop.prevent="onFullscreen">
							<i class="svgtofont-icon-max-black" />
						</span>
					</template>

					<!-- 恢复 -->
					<template v-if="clientFullscreen || clientMinimize">
						<span class="icon" :title="clientFullscreen ? '退出全屏' : '恢复视图大小'" :data-state="clientFullscreen ? 'fullscreen' : 'minimize'" @click.stop.prevent="onRecovery">
							<i class="svgtofont-icon-minmax-black" />
						</span>
					</template>

					<template v-if="closeBtnComp === 'one'">
						<span class="ico-close-one" title="关闭视图" @click.stop.prevent="onClose">
							<i class="absolute w-3rem h-3rem top-0 left-0 origin-center close-popup-btn"></i>
						</span>
					</template>

					<template v-if="closeBtnComp === 'two'">
						<span class="icon" title="关闭视图" @click.stop.prevent="onClose">
							<i class="!text-subtitleLarge svgtofont-el-close icon-group" />
						</span>
					</template>
				</div>
			</header>

			<article v-show="!clientMinimize" class="bt-dialog-content">
				<component :is="props.component" />
			</article>
			<footer v-show="!clientMinimize" v-if="footer" class="bt-dialog-footer">
				<bt-button @click="onCancel">{{ cancelText }}</bt-button>
				<bt-button type="primary" @click="onConfirm">{{ confirmText }}</bt-button>
			</footer>
		</div>
	</transition>
</template>

<script lang="ts" setup>
import { useResizeObserver } from '@vueuse/core'

export interface DialogProps<T> {
	title?: string | boolean // 弹窗标题
	area: [string, string] // 弹窗大小，如果为数字类型的时候，默认单位为rem
	modal?: boolean // 是否显示遮罩层
	modelValue: boolean // 是否显示弹窗
	component: string | Component | JSX.Element // 弹窗组件
	compData?: T // 组件数据
	fullscreen?: boolean // 是否全屏5t5
	draggable?: boolean // 是否可拖拽
	footer?: boolean // 是否显示底部按钮，和confirm配合使用
	zIndex?: number // 弹窗层级
	customClass?: string // 自定义类名
	closeBtn: 'one' | 'two' // 关闭按钮类型
	onClose?: () => void // 关闭回调，close不验证返回值
	onCancel?: () => boolean | void // 取消回调，关闭的回调
	onConfirm?: () => boolean | void // 确认回调，如果设置，确认按钮和取消按钮都会显示
	cancelText?: string // 取消按钮文本
	confirmText?: string // 确认按钮文本
}

const props = withDefaults(defineProps<DialogProps<AnyObject>>(), {
	title: false, // 标题
	modal: false, // 是否遮罩层
	modelValue: false, // 是否显示弹窗
	component: '', // 弹窗内容
	area: () => ['40%', '40%'], // 弹窗大小
	compData: () => ({}), // 			弹窗内容数据
	fullscreen: false, // 是否全屏
	draggable: false, // 是否可拖拽
	zIndex: 999, // 层叠顺序
	customClass: '', // 自定义类名
	closeBtn: 'one', // 关闭按钮类型
	footer: false, // 是否显示底部
	cancelText: '取消', // 取消按钮文本
	confirmText: '确定', // 确认按钮文本
	onClose: () => {}, // 关闭回调
	onCancel: () => {}, // 取消回调
	onConfirm: () => {}, // 确认回调
})

const dialog = ref() // 弹窗实例
const draggable = ref(false) // 是否拖拽
const heightLimits = ref(false) // 高度限制，用于解决视图高度问题
const fullscreen = ref(props.fullscreen) // 是否全屏
const offset = ref({ x: 0, y: 0 }) // 鼠标偏移量，用于解决拖拽按钮位置问题
const position = ref<{ x: string | boolean; y: string | boolean }>({ x: false, y: false }) // 弹窗位置
const clientArea = ref([0, 0]) // 弹窗大小-记录
const clientPosition = ref({ x: 0, y: 0 }) // 弹窗位置-记录
const clientFullscreen = ref(false) // 全屏大小-记录
const clientMinimize = ref(false) // 最小化大小-记录
const tempArea = ref([0, 0]) // 临时大小=记录，用于解决全屏问题

// 弹窗实例-大小
const dialogArea = computed(() => {
	const [width, height] = props.area
	if (clientFullscreen.value) return ['100%', '100%']
	if (clientMinimize.value) return ['300px', '44px']
	return [width, height].map(item => (typeof item === 'number' ? `${item}rem` : item))
})

// 弹窗实例-位置
const dialogOffset = computed(() => {
	if (clientFullscreen.value) return { x: 0, y: 0 }
	if (clientMinimize.value) {
		if (!draggable.value) {
			return { x: '190px', y: '90%' }
		}
		return position.value
	}
	return position.value
})

// // 弹窗实例-变形
// const transform = computed(() => {
// 	console.log(clientFullscreen.value || draggable.value)
// 	if (clientFullscreen.value || draggable.value) {
// 		return ''
// 	}
// 	return 'translate(-50%, -50%)'
// })

// 弹窗实例-位置
const closeBtnComp = computed(() => {
	if (fullscreen.value) return 'two'
	if (heightLimits.value) return 'two'
	return props.closeBtn
})

// 设置弹窗大小
const setArea = (init: boolean = false) => {
	const { clientWidth, clientHeight } = dialog.value
	const left = (window.innerWidth - clientWidth) / 2
	const top = (window.innerHeight - clientHeight) / 2
	position.value = { x: `${left}px`, y: `${top}px` }
	if (init) {
		clientArea.value = [clientWidth, clientHeight]
		tempArea.value = [clientArea.value[0], clientArea.value[1]]
	}
}

// 开始拖拽
const startDrag = (event: MouseEvent) => {
	if (clientFullscreen.value) return
	const startX = event.clientX
	const startY = event.clientY
	const rect = dialog.value.getBoundingClientRect()

	// 如果是首次拖拽且处于最小化状态，保持当前位置作为起始位置
	if (!draggable.value && clientMinimize.value) {
		const currentLeft = rect.left
		const currentTop = rect.top
		clientPosition.value = { x: currentLeft, y: currentTop }
		position.value = { x: `${currentLeft}px`, y: `${currentTop}px` }
	}

	if (!draggable.value) draggable.value = true

	const offsetX = startX - rect.left
	const offsetY = startY - rect.top

	// 鼠标移动
	const onMouseMove = (e: MouseEvent) => {
		let left = e.clientX - offsetX
		let top = e.clientY - offsetY

		// 设置边界
		const minLeft = 0
		const minTop = 0
		const maxLeft = window.innerWidth - rect.width
		const maxTop = window.innerHeight - rect.height
		if (left < minLeft) left = minLeft
		if (top < minTop) top = minTop
		if (left > maxLeft) left = maxLeft
		if (top > maxTop) top = maxTop
		const x = left - offset.value.x
		const y = top - offset.value.y
		clientPosition.value = { x, y }
		position.value = { x: `${x}px`, y: `${y}px` }
	}

	// 鼠标抬起
	const onMouseUp = () => {
		document.removeEventListener('mousemove', onMouseMove)
		document.removeEventListener('mouseup', onMouseUp)
	}

	// 监听鼠标移动
	document.addEventListener('mousemove', onMouseMove)
	document.addEventListener('mouseup', onMouseUp)
}

/**
 * @description  缩小视图
 * @param {MouseEvent} event
 */
const onShrink = (event: MouseEvent) => {
	clientMinimize.value = true
	draggable.value = false
}

// 全屏视图
const onFullscreen = (event: MouseEvent) => {
	clientFullscreen.value = true
}

// 恢复视图
const onRecovery = (event: MouseEvent) => {
	clientFullscreen.value = false
	clientMinimize.value = false
	nextTick(() => {
		// 重新计算并设置弹窗位置
		setArea()
	})
}

/**
 * @description: 监听视图大小变化
 */
const onResize = () => {
	const debouncedFn = useDebounceFn(entries => {
		if (clientFullscreen.value) return
		const { height, width } = entries[0].contentRect
		heightLimits.value = height <= clientArea.value[1]
		// 仅拖拽后视图的校对
		if (draggable.value) {
			// 超出视图宽度
			const beyondWidth = width - (clientPosition.value.x + clientArea.value[0] / 2)
			// 超出视图高度
			const beyondHeight = height - (clientPosition.value.y + clientArea.value[1] / 2)
			// 判断视图变化是否导致弹窗位置超出视图
			if (beyondWidth < 0) {
				clientPosition.value.x += Number(beyondWidth.toFixed(0))
				position.value.x = `${clientPosition.value.x}px`
			}
			if (beyondHeight < 0) {
				clientPosition.value.y += Number(beyondHeight.toFixed(0))
				position.value.y = `${clientPosition.value.y}px`
			}
		} else {
			setArea()
		}
	}, 100)
	useResizeObserver(document.body, debouncedFn)
}

provide('fullData', toRef(clientFullscreen)) // 提供给子组件 fullData

onMounted(() => {
	setArea(true) // 设置弹窗大小
	onResize() // 监听视图大小变化
})
</script>

<style lang="css" scoped>
.bt-dialog-v2 {
	@apply fixed left-[50%] top-[50%] flex flex-col;
	/* transform: translate(-50%, -50%); */
	--el-dialog-box-shadow: var(--el-box-shadow);
	--el-dialog-bg-color: var(--el-bg-color);
	box-shadow: var(--el-dialog-box-shadow);
	background: var(--el-dialog-bg-color);
	box-sizing: border-box;
	border-radius: var(--el-border-radius-base);
}

.bt-dialog-v2 header {
	cursor: move;
	user-select: none;
	font-size: var(--el-font-size-base);
	line-height: 1.4rem;
	display: flex;
	justify-content: space-between;
	align-items: center;
	height: 4.4rem;
	padding-left: 2rem;
	border-bottom: 1px solid var(--el-color-border-dark-tertiary);
	background-color: var(--el-fill-color-light);
	border-top-left-radius: var(--el-border-radius-base);
	border-top-right-radius: var(--el-border-radius-base);
	flex-shrink: 0;
}

.bt-dialog-header {
	border-radius: var(--el-border-radius-base);
}

.dialog-btn-group .icon {
	width: 44px;
	height: 100%;
	display: flex;
	align-items: center;
	justify-content: center;
	cursor: pointer;
	padding: 0 4px;
}

.dialog-btn-group .icon:hover {
	background-color: var(--el-fill-color-light);
}

.dialog-btn-group .icon i {
	font-size: var(--el-font-size-extra-large);
}

/* 按钮组 */
.bt-dialog-v2 .dialog-btn-group {
	height: 100%;
	display: flex;
	align-items: center;
	justify-content: flex-start;
}

/* 关闭按钮-初始化 */
.bt-dialog-v2 .dialog-btn-group .ico-close-one {
	@apply absolute -top-1.5rem -right-1.5rem z-99 w-3rem h-3rem rounded-1/2 cursor-pointer hover:bg-base;
}

/* 关闭按钮- */
.bt-dialog-v2 .dialog-btn-group .ico-close-two {
}

/** 关闭按钮-two */
.bt-dialog-v2 .bt-dialog-content {
	height: 100%;
	box-sizing: border-box;
	display: flex;

	flex: 1;
}

.bt-dialog-v2 .bt-dialog-footer {
	background-color: var(--el-fill-color-light);
	border-top: 1px solid var(--el-color-border-dark-tertiaryer);
	padding: 8px 18px 10px;
	text-align: right;
	border-bottom-left-radius: var(--el-border-radius-base);
	border-bottom-right-radius: var(--el-border-radius-base);
}

.dialog-fade-enter-active,
.dialog-fade-leave-active {
	transition: opacity 0.5s;
}

.dialog-fade-enter,
.dialog-fade-leave-to {
	opacity: 0;
}
</style>

<template>
	<div id="dialogBox" ref="dialogRef" class="relative">
		<div v-show="miniViewShow">
			<el-dialog
				v-model="modelValue"
				destroy-on-close
				align-center
				center
				draggable
				:modal-class="!props.modal ? `el-custom-class m-auto w-max h-max ` + (fullData ? 'full-screen' : '') : ''"
				:class="'bt-dialog rounded-base ' + props.customClass + (isTitle ? 'is-title' : '')"
				:width="actualArea.width"
				:show-close="false"
				:close-on-click-modal="false"
				:close-on-press-escape="disabledEsc"
				:modal="props.modal"
				:fullscreen="fullData"
				:append-to-body="props.appendToBody"
				@closed="closed">
				<!-- 标题 -->
				<template v-if="isTitle" #header>
					<template v-if="slotTitle">
						<slot name="header"></slot>
					</template>
					<template v-else>
						<span class="text-base leading-[1.8rem] text-grey-333 truncate" v-html="titleContent"></span>
					</template>
				</template>

				<!-- 放大缩小按钮组 -->
				<div v-if="isFullScreen" class="absolute top-0 z-999 flex items-center" style="gap: 8px" :class="fullData || closeBtn == 2 ? 'right-[4.6rem]' : 'right-[2rem]'">
					<i class="svgtofont-el-semi-select icon-group" @click="miniViewShow = false"></i>
					<i v-if="!fullData" class="svgtofont-el-fullscreen-expand icon-group" @click="handleChangeFull(true)"></i>
					<i v-if="fullData" class="svgtofont-el-fullscreen-shrink icon-group" @click="handleChangeFull(false)"></i>
				</div>
				<!-- 关闭按钮 -->
				<div v-if="showClose && closeBtn == 1" class="absolute z-999 right-[1.4rem] top-[1rem] h-[2.4rem] w-[2.4rem] cursor-pointer p-[3px] rounded-base hover:bg-darker" @click="onCancel">
					<svg viewBox="0 0 12 12" version="1.1" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
						<g stroke="none" stroke-width="2" fill="none" fill-rule="evenodd">
							<g fill="currentColor" fill-rule="nonzero">
								<path
									d="M2.08859116,2.2156945 L2.14644661,2.14644661 C2.32001296,1.97288026 2.58943736,1.95359511 2.7843055,2.08859116 L2.85355339,2.14644661 L6,5.293 L9.14644661,2.14644661 C9.34170876,1.95118446 9.65829124,1.95118446 9.85355339,2.14644661 C10.0488155,2.34170876 10.0488155,2.65829124 9.85355339,2.85355339 L6.707,6 L9.85355339,9.14644661 C10.0271197,9.32001296 10.0464049,9.58943736 9.91140884,9.7843055 L9.85355339,9.85355339 C9.67998704,10.0271197 9.41056264,10.0464049 9.2156945,9.91140884 L9.14644661,9.85355339 L6,6.707 L2.85355339,9.85355339 C2.65829124,10.0488155 2.34170876,10.0488155 2.14644661,9.85355339 C1.95118446,9.65829124 1.95118446,9.34170876 2.14644661,9.14644661 L5.293,6 L2.14644661,2.85355339 C1.97288026,2.67998704 1.95359511,2.41056264 2.08859116,2.2156945 L2.14644661,2.14644661 L2.08859116,2.2156945 Z"></path>
							</g>
						</g>
					</svg>
				</div>

				<div v-if="showClose && closeBtn == 2" class="absolute top-0 right-0.4rem z-999 w-4rem h-4rem rounded-1/2 cursor-pointer" @click="onCancel">
					<i class="!text-subtitleLarge svgtofont-el-close icon-group"></i>
				</div>

				<!-- 动态组件 -->
				<div class="h-[inherit]">
					<template v-if="component">
						<el-config-provider :locale="locale">
							<component :is="asyncLoad(component)" ref="compRef" :comp-data="compData" class="!h-[inherit]" @resize="resize" @open="onOpen" @close="close" @confirm="onConfirm" @set-confirm-btn="setConfirmBtn" />
						</el-config-provider>
					</template>
					<template v-else>
						<slot>
							<div v-if="contentText" class="p-8 flex justify-center items-center">
								<i class="svgtofont-el-warning-filled ml-[0.4rem] mr-[1.2rem] text-titleLarge text-warning"></i>
								<span class="text-subtitleLarge flex !flex-wrap">
									{{ props.contentText }}
								</span>
							</div>
						</slot>
					</template>
				</div>

				<!-- 底部 -->
				<template v-if="showFooter" #footer>
					<div class="flex items-center justify-between flex-row-reverse">
						<div>
							<el-button v-if="cancelText.trim()" type="info" :disabled="popupSubmit.loading" @click="onCancel">
								{{ cancelText }}
							</el-button>
							<el-button v-if="!confirmBtnType" type="primary" :disabled="confirmBtn.disabled || popupSubmit.loading" :loading="popupSubmit.loading" @click="onConfirm">
								{{ buttonText }}
							</el-button>
							<el-button v-if="confirmBtnType" :type="confirmBtnType === 'danger' ? 'danger' : confirmBtnType" :class="confirmBtnType === 'danger' ? 'danger-button' : ''" @click="onConfirm">
								{{ confirmText || '下一步' }}
							</el-button>
						</div>
					</div>
				</template>
			</el-dialog>
		</div>
		<template v-if="!miniViewShow">
			<div id="dialogMinimize" ref="dialogMinimize" class="dialog-minimize fixed bg-white flex items-center p-[1rem] justify-between z-9999 w-[19.4rem]" :style="`bottom:0px;left:${200}px`">
				<div class="lefts">
					<span class="w-[10rem] truncate inline-block">
						{{ titleContent }}
					</span>
				</div>
				<div class="centers flex items-center">
					<i class="svgtofont-el-fullscreen-expand cursor-pointer text-subtitleLarge mr-[5px]" @click="miniViewShow = true"></i>
					<div class="rights" @click="recoverCancel">
						<i class="svgtofont-el-close cursor-pointer text-subtitleLarge"></i>
					</div>
				</div>
			</div>
		</template>
	</div>
</template>

<script lang="ts" setup>
import { useGlobalStore } from '@/store/global'
import { isBoolean, isFunction, isObject, isPromise, isString, isUndefined } from '@/utils'
import locale from 'element-plus/es/locale/lang/zh-cn'
import { has } from 'ramda'
import { type Ref, useSlots, defineModel } from 'vue'

interface Props {
	title?: string | boolean // 标题
	customClass?: string // 自定义类名
	area: Array<number | string> | number | string // 视图
	confirmText?: string // 确认按钮文本
	cancelText?: string // 取消按钮文本
	component?: boolean | Element | Component | JSX.Element // 组件
	compData?: AnyObject // 组件数据
	showFooter?: boolean // 是否显示底部
	contentText?: string // 文本内容
	confirmBtnType?: '' | 'default' | 'success' | 'warning' | 'info' | 'text' | 'primary' | 'danger' // 确认按钮类型
	showClose?: boolean // 是否显示关闭按钮
	modal?: boolean // 是否显示遮罩层
	isFullScreen?: boolean // 是否全屏
	closeBtn?: number // 关闭按钮显示方式 1:内部右上角 2:外部右上角
	disabledEsc?: boolean // 是否禁用ESC关闭
	appendToBody?: boolean // 是否将遮罩层挂载到 body 上
	onCancel?: AnyFunction // 取消事件
	onConfirm?: AnyFunction // 确认事件
}

const props = withDefaults(defineProps<Props>(), {
	title: '', // 该参数不要设置默认值，会导致title无法隐藏
	customClass: '', // 自定义类名
	component: false, // 组件
	area: () => ['auto', 'auto'], // 视图
	confirmText: '确定',
	cancelText: '取消',
	contentText: '',
	compData: () => ({}),
	showFooter: false,
	showClose: true,
	modal: true, // 是否显示遮罩层
	isFullScreen: false, // 是否全屏
	closeBtn: 1, // 关闭按钮显示方式 1:内部右上角 2:外部右上角
	disabledEsc: false, // 是否禁用ESC关闭
	appendToBody: true, // 是否将遮罩层挂载到 body 上
})
// 事件处理
const emits = defineEmits<{
	(e: 'open'): void // 打开
	(e: 'close'): void // 关闭
	(e: 'cancel', close: () => void): void // 取消
	(e: 'confirm', close: () => void): void // 确认
	(e: 'resize'): void // 窗口大小改变
	(e: 'refresh'): void // 刷新
}>()

const { mainHeight } = useGlobalStore()

// 双向绑定
const modelValue = defineModel({ default: false, type: Boolean })
// 获取全局高度
// const { mainHeight } = useGlobalStore();
// 判断<slot name="title"/>是否有传值
const slotTitle = !!useSlots().header

const initView = ref(false)
// 弹框实例
const dialogRef = ref()
// 动态组件实例
const compRef = ref()
// 宽高
const area = ref(props.area)
// 按钮类型
const closeBtn = ref(props.closeBtn)
// 全屏
const fullData = ref(false)
// 是否显示最小化视图
const miniViewShow = ref(true)
// 是否显示底部
const showFooter = ref(props.showFooter)

const confirmText = ref(props.confirmText)

watch(
	() => modelValue.value,
	(val: boolean) => {
		if (val && !initView.value) {
			initView.value = true
			nextTick(() => {
				setBodyHeight(actualArea.value.height, 'rem')
			})
			setClose()
		} else {
			initView.value = false
		}
	}
)

// 确认按钮类型
const popupSubmit = reactive({
	loading: false,
	loadingText: '提交中...',
})
// 确认按钮属性
const confirmBtn = reactive({
	disabled: false,
})

// title内容
// biome-ignore lint/correctness/noUnusedVariables: <explanation>
const titleContent = computed(() => props.title || '')

// 实际宽高
const actualArea = computed(() => {
	const result = { width: 'auto', height: 'auto' }
	if (Array.isArray(area.value)) {
		const [width, height] = area.value
		result.width = getStyleUnit(width, 'rem')
		if (height) result.height = getStyleUnit(height, 'rem')
	} else {
		result.width = getStyleUnit(area.value, 'rem')
	}
	return result
})

// 判断是否显示标题
const isTitle = computed(() => {
	if (isString(props.title) && props.title !== '') {
		return true
	}
	return false
})

// 按钮文本
const buttonText = computed(() => {
	return popupSubmit.loading ? popupSubmit.loadingText : confirmText.value
})

/**
 * @description 获取样式单位
 * @param {string | number} val 值
 * @param {string} unit 单位
 * @returns {string} 值
 */
const getStyleUnit = (val: string | number, unit = 'rem'): string => {
	const valNum: number = Number(val)
	if (Number.isNaN(valNum)) return `${val}`
	return val + unit
}

/**
 * @description 获取Dom元素
 * @param {Element} el 元素
 * @returns {Element} 元素
 */
const getDom = (el: string): HTMLElement => {
	const dialogContentRef = dialogRef.value
	if (!dialogContentRef) return document.createElement('div')
	return dialogContentRef.querySelectorAll(el)[0]
}

/**
 * @description 关闭
 */
const close = () => {
	modelValue.value = false
	emits('cancel', close)
}

/**
 * @description 关闭动画结束，触发事件
 */
// biome-ignore lint/correctness/noUnusedVariables: <explanation>
const closed = () => {
	emits('close')
}

/**
 * @description 设置过度状态
 * @param {boolean} status 状态
 * @param {string} text 文本
 */
const loading = (status: Ref<boolean>, text = '加载中...') => {
	status.value = true
	popupSubmit.loading = status.value
	popupSubmit.loadingText = text
	return {
		close: () => {
			popupSubmit.loading = false
		},
	}
}

/**
 * @description 关闭弹框事件
 */
const onCancel = async () => {
	const callback = compRef.value?.onCancel
	if (callback) {
		const result = await callback(close)
		if (isBoolean(result) && !result) return
	}
	const isCancel = emits('cancel', close)
	if (isBoolean(isCancel) && !isCancel) return
	close()
}

/**
 * @description 确认弹出框事件
 */
const onConfirm = async (): Promise<boolean | void> => {
	const callback = compRef.value?.onConfirm
	const optionsCallback = props.onConfirm
	if (callback || optionsCallback) {
		if (callback) {
			// 组件内部的onConfirm方法，优先级高于配置外部传入的onConfirm方法
			const status = !!(await callback(close))
			if (!status) return status
		}
		if (optionsCallback) {
			// 判断是否有传入onConfirm方法，且返回值为false时，不关闭弹框
			const isClose = await optionsCallback(close)
			if (!isUndefined(isClose) && !isClose) return isClose
		}
	} else {
		emits('confirm', close)
	}
	close()
}

/**
 * @description 隐藏头部
 */
const hideHeader = (): void => {
	if (!slotTitle && !props.title) {
		nextTick(() => {
			const dom: HTMLElement = getDom('.el-dialog__header')
			if (dom) dom.style.display = 'none'
		})
	}
}

/**
 * @description 全屏
 * @param {boolean} status 状态
 */

// biome-ignore lint/correctness/noUnusedVariables: <explanation>
const handleChangeFull = (status: boolean) => {
	fullData.value = status
	closeBtn.value = status ? 2 : props.closeBtn
}

/**
 * @description 恢复弹框
 */

// biome-ignore lint/correctness/noUnusedVariables: <explanation>
const recoverCancel = () => {
	modelValue.value = false
	miniViewShow.value = true
	// 剔除id为dialogMinimize和dialogBox的元素
	const dom = document.querySelectorAll('#dialogMinimize,#dialogBox')
	dom.forEach(item => item.remove()) // 移除元素
	onCancel()
}

/**
 * @description 设置body高度
 * @param {number | string} height 高度
 * @param {string} areaUnit 单位
 * @returns {void}
 */
const setBodyHeight = (height: number | string, areaUnit?: string): void => {
	const elBodyEl = getDom('.el-dialog__body') // 获取弹框body元素
	if (elBodyEl) elBodyEl.style.height = getStyleUnit(height, areaUnit)
}

/**
 * @description 设置确认按钮方法
 * @param {data} data 需要设置的属性
 */
const setConfirmBtn = (data: AnyObject) => {
	Object.keys(data).forEach((key: string) => {
		confirmBtn[key] = data[key]
	})
}

/**
 * @description 动态挂载
 */
// biome-ignore lint/correctness/noUnusedVariables: <explanation>
const asyncLoad = (component: boolean | Element | Component | JSX.Element) => {
	// 判断是否为组件
	if (isBoolean(component)) return false
	// 判断是否为直接引用的组件,
	if (isObject(component) && has('__name', component)) return component
	// 判断是否为函数并且返回值为Promise, 则使用异步组件
	if (isFunction(component)) {
		const comp = (component as () => Promise<Component>)()
		if (isPromise(comp)) {
			return defineAsyncComponent(() => comp as Promise<Component>)
		}
		return comp
	}
	// tsx直接返回
	return component
}

/**
 * @description 窗口大小改变事件
 */

// biome-ignore lint/correctness/noUnusedVariables: <explanation>
const resize = () => {
	if (!modelValue.value) return
	emits('resize')
}

const setClose = async () => {
	nextTick(() => {
		const elDialog = dialogRef.value
		const elDialogHeader = getDom('.el-dialog__header')
		const elDialogFooter = getDom('.el-dialog__footer')
		const elDialogBody = getDom('.el-dialog__body')
		if (!elDialog) return

		// 想要保留的上下边距总
		const margin = 0
		// 计算头部和底部的高度，如果不存在则为0
		const headerHeight = elDialogHeader ? elDialogHeader.offsetHeight : 0
		const footerHeight = elDialogFooter ? elDialogFooter.offsetHeight : 0
		if (!elDialogBody || !elDialogHeader) return
		// 设置最大高度
		const maxHeight = window.innerHeight - headerHeight - footerHeight - margin
		elDialogBody.style.maxHeight = `${maxHeight}px`
		elDialogBody.style.overflowX = 'hidden'
		// 获取元素相对于视窗的位置信息
		const rect = elDialogHeader.getBoundingClientRect()
		if ((rect.top < 15 || window.innerHeight < rect.bottom) && rect.width > 0 && rect.height > 0) {
			// 按钮类型
			closeBtn.value = 2
			elDialogBody.style.overflowY = 'auto' // 内容过多时显示滚动条
			// if (!isNotificationShown.value) {
			// 	// 通知组件`
			// 	Notification({
			// 		title: '提示',
			// 		type: 'warning',
			// 		message: '当前视图过小，页面显示不全，可以使用鼠标滚动和滚动查看',
			// 		position: 'bottom-right',
			// 		duration: 10000,
			// 	})
			// 	// 标记通知已显示
			// 	isNotificationShown.value = true
			// }
		} else {
			closeBtn.value = props.closeBtn
			elDialogBody.style.overflowY = 'visible'
		}
	})
}

/**
 * @description 打开弹框的事件
 */
const onOpen = async () => {
	emits('open')
	hideHeader() // 隐藏头部，
	nextTick(() => {
		const callback = compRef.value?.onOpen
		if (callback) callback()
		if (!initView.value) setBodyHeight(actualArea.value.height, 'rem')
		const el = dialogRef.value
		useResizeObserver(el, () => {
			setClose()
		})
	})
}

/**
 * @description 设置弹框高度
 */
const setHeightThrottle = useThrottleFn(() => {
	setClose()
}, 100)

// mainHeight
watch(
	() => mainHeight.value,
	(val: number) => {
		if (props.modal) {
			const { height } = actualArea.value
			setHeightThrottle()
			if (Number(height) * 10 > mainHeight.value) {
				setBodyHeight(val / 10, 'rem')
			} else {
				setBodyHeight(actualArea.value.height, 'rem')
			}
		}
	}
)

/**
 * @description 显示底部
 * @param {boolean} value 是否显示
 */
const showFooterFun = (value: boolean) => {
	showFooter.value = value
}

// 注入
provide('popupLoading', loading) // 提供给子组件 loading
provide('popupClose', close) // 提供给子组件 close
provide('fullData', fullData) // 提供给子组件 fullData
provide('popupSetFooter', showFooterFun) // 提供给子组件 showFooterFun
provide('buttonText', confirmText) // 提供给子组件 buttonText
provide('confirmBtn', confirmBtn) // 提供给子组件 buttonText

onMounted(() => {
	nextTick(() => onOpen())
})

defineExpose({
	close,
	onCancel,
	onConfirm,
	loading,
	setConfirmBtn,
	showFooterFun,
})
</script>

<style lang="css" scoped>
.dialog-minimize {
	box-shadow: 4px -4px 20px rgba(var(--el-color-black-rgb), 0.25);
}
:deep(.el-dialog__header code.tag) {
	@apply text-extraSmall py-[2px] px-[4px] border border-solid border-warning rounded-small text-warningDark leading-[2]
	vertical-align: text-bottom;
}
:deep(.el-dialog .icon-group) {
	@apply text-extraLarge cursor-pointer h-[4rem] w-[4rem] flex items-center justify-center;
}

:deep(.el-dialog.hide-header .el-dialog__header) {
	display: none;
}
</style>

<style>
.el-custom-class .el-overlay-dialog {
	width: fit-content;
	height: max-content;
	margin: auto;
	overflow: visible;
}
.el-custom-class.full-screen .el-overlay-dialog {
	width: 100vw;
	position: relative;
}
</style>

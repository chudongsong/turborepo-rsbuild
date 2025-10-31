<template>
	<div :class="`confirm-${compData.type}`" class="text-de relative p-2rem">
		<!-- 默认确认框 -->
		<div class="content flex items-center">
			<i v-show="compData.icon" :class="`svgtofont-el-${icon === 'warning' ? icon + '-filled' : icon} !text-titleLarge text-${compData.iconColor}`" :style="compData.iconColor !== 'warning' ? `color:${compData.iconColor}` : ``"></i>
			<slot>
				<div class="message flex-1 ml-4 py-[.3rem] leading-[2.4rem] text-base">
					<div v-if="compData.isHtml" class="text" v-html="compData.content"></div>
					<div v-else class="text text-medium leading-[2.5rem] flex !flex-wrap break-all">
						<template v-if="isString(compData.content)">
							{{ compData.content }}
						</template>
						<component :is="compData.content" v-else />
					</div>
				</div>
			</slot>
		</div>

		<!-- 数学计算 -->
		<div v-if="isCalc" class="vcode flex items-center h-[4.8rem] mt-4 pl-[1.2rem] text-base">
			<span>计算结果：</span>
			<span class="mx-[1rem]"> {{ countGroup.num1 }} + {{ countGroup.num2 }} </span>
			<span class="mr-[1rem]">=</span>
			<el-input-number v-model="countGroup.gentle" v-focus autofocus="true" controls-position="right" size="small" @keydown.native.enter="nextTickComfirm" />
		</div>

		<!-- 文字验证 -->
		<div v-if="isInput" class="bg-darker flex flex-col p-[12px] mt-[12px]">
			<p class="mb-[8px]">
				请手动输入
				<span class="text-danger">"{{ compData.input?.content }}"</span>
				,完成验证
			</p>
			<el-input v-model="inputValue" v-focus size="small" @keydown.native.enter="nextTickComfirm" @paste.native.capture.prevent />
		</div>

		<!-- 协议确认 -->
		<div v-if="isCheck" class="flex p-[12px] mt-[8px] ml-[24px]">
			<el-checkbox v-model="checkValue">
				<span v-html="compData.check?.content"></span>
			</el-checkbox>
		</div>
	</div>
</template>

<script lang="ts" setup>
import type { ConfirmBaseProps } from '@/components/extension/bt-confirm/types'
import { useMessage } from '@message/index'
import { isBoolean, isString } from '@/utils'

interface Props {
	compData: ConfirmBaseProps
}

const Message = useMessage() // 消息提示
const props = withDefaults(defineProps<Props>(), {
	compData: () => ({
		content: '', // 提示内容
		type: 'default', // 弹窗类型
		isHtml: false, // 是否是html
		icon: true, // 是否显示图标
		iconColor: 'warning', // 图标颜色
		input: { content: '' }, // 输入框验证
		// 协议确认
		check: {
			content: '',
			value: false,
			onConfirm: () => {},
		},
	}),
})

// 事件声明
const emits = defineEmits<{
	(e: 'cancel'): void
	(e: 'confirm'): void
	(e: 'close'): void
}>()

// 协议确认
const checkValue = ref(props.compData.check?.value || false)
// 用于计算验证
const countGroup = reactive({
	num1: 0,
	num2: 0,
	gentle: undefined as undefined | number,
})

const inputValue = ref('') // 输入框值
// 图标
const icon = computed(() => {
	return isBoolean(props.compData.icon) && props.compData.icon ? 'warning' : props.compData.icon
})
// 计算验证
const isCalc = computed(() => {
	return props.compData.type === 'calc'
})
// 文字验证
const isInput = computed(() => {
	return props.compData.type === 'input'
})
// 协议确认
const isCheck = computed(() => {
	return props.compData.type === 'check'
})

/**
 * @description 初始化计算验证
 * @returns {void}
 */
const initCalcVerify = () => {
	countGroup.num1 = Math.round(Math.random() * 9 + 1)
	countGroup.num2 = Math.round(Math.random() * 9 + 1)
	countGroup.gentle = undefined
}

/**
 * @description 计算验证
 * @param {boolean} isClose 是否关闭弹窗
 * @returns {boolean} 是否验证通过
 */
const onCalc = (isClose = true) => {
	if (countGroup.gentle === countGroup.num1 + countGroup.num2) {
		if (isClose) emits('cancel')
		return false
	}
	Message.error('计算错误，请重新计算！')
	return true
}

/**
 * @description 文字验证
 * @param {boolean} isClose 是否关闭弹窗
 * @returns {boolean} 是否验证通过
 */
const onInput = (isClose = true): boolean => {
	if (inputValue.value === props.compData?.input?.content) {
		if (isClose) emits('cancel')
		console.log('验证通过', isClose)
		return false
	}
	Message.error('输入错误，请重新输入！')
	return true
}

/**
 * @description 异步提交（解决第一次回车获取不到输入的值问题）
 */
const nextTickComfirm = () => {
	const timer = setTimeout(() => {
		onConfirm()
		clearTimeout(timer)
	}, 0)
}

/**
 * @description 确认提交
 */
const onConfirm = () => {
	try {
		if (isCalc.value && onCalc(false)) return
		if (isInput.value && onInput(false)) return
		if (isCheck.value) {
			props.compData.check?.onConfirm?.(checkValue.value)
		}
		// eslint-disable-next-line consistent-return
		return true // 验证通过
	} catch (error) {
		console.log(error)
	}
}

onMounted(() => {
	inputValue.value = ''
	if (isCalc.value) initCalcVerify()
})

defineExpose({
	onConfirm,
})
</script>

<style lang="css" scoped>
.svgtofont-el-warning {
	color: var(--el-color-warning);
}

.confirm {
	color: var(--el-color-text-primary);
}

/* 文本 */
.confirm-calc .text {
	color: var(--el-color-danger-dark-2);
}
/* 文字验证 */
.confirm-calc .vcode {
	background-color: var(--el-fill-color);
	color: var(--el-color-text-primary);
}
.confirm-calc .el-input-number--small {
	width: 10rem;
}
/*  */
.confirm :deep(.el-input__inner) {
	padding-left: 1rem;
	padding-right: 4rem;
}
</style>

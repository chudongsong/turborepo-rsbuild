<template>
	<div class="p-[20px]">
		<el-button type="primary" @click="getLog(true)">刷新日志</el-button>
		<el-button @click="logEvent" type="default">清空日志</el-button>
		<div class="pre-box bg-darkPrimary mt-[12px] text-white h-[48rem] overflow-auto p-[20px]">
			<pre v-html="logMsg"></pre>
		</div>
	</div>
</template>

<script lang="ts" setup>
import { useConfirm, useDataHandle, useHandleError, useMessage } from '@/hooks/tools'
import { clearCrontabLog, getCrontabLog } from '@api/site'

interface Props {
	compData?: any
}
const Message = useMessage() // 消息提示
const props = withDefaults(defineProps<Props>(), {
	compData: {},
})

const { id } = props.compData
const logMsg = ref('正在获取中....') // 日志信息
const setTimer = ref<any>(null) // 定时器

/**
 * @description 日志事件-清空
 */
const logEvent = async () => {
	await useConfirm({
		title: '提示',
		content: '确定清空日志吗？',
		icon: 'warning-filled',
	})
	useDataHandle({
		loading: '正在清空日志，请稍后...',
		request: clearCrontabLog({ id }),
		message: true,
		success: getLog,
	})
}

/**
 * @description 获取日志
 */
const getLog = async (isClick?: boolean) => {
	try {
		const res = await getCrontabLog({ id })
		logMsg.value = res.msg
		scrollToBottom()
		if (isClick) Message.request({ status: res.status, msg: res.status ? '刷新成功' : '刷新失败' })
	} catch (error) {
		useHandleError(error)
	}
}

const scrollToBottom = () => {
	nextTick(() => {
		const el: any = document.querySelector('.pre-box')
		el.scrollTop = el.scrollHeight
	})
}

watch(
	() => props.compData,
	() => {
		getLog()
	},
	{ immediate: true }
)

onMounted(() => {
	setTimer.value = setInterval(async () => {
		await getLog()
	}, 2000)
})

onUnmounted(() => {
	clearInterval(setTimer.value)
})
</script>

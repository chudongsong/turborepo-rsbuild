<template>
	<div class="flex-wrap">
		<bt-log class="h-[40rem] !rounded-none" :content="logContent" />
	</div>
</template>

<script lang="tsx" setup>
import { getLines } from '@/api/global';
import { useMessage } from '@/hooks/tools';
import { clearCache } from '@/utils';

interface Props {
	compData: CompDataProps
}

interface CompDataProps {
	type: 'scan' | 'repair' // 类型 scan 扫描 | repair 修复
	endMsg: string // 成功结束标识
	logPath: string // 日志路径
	successMsg: string // 成功提示
	isClear: boolean // 是否清空定时器
}

const props = withDefaults(defineProps<Props>(), {
	compData: () => ({
		type: 'scan', // 类型 scan 扫描 | repair 修复
		endMsg: '扫描结束', // 成功结束标识
		logPath: '', // 日志路径
		successMsg: '修复成功', // 成功提示
		isClear: false, // 是否清空定时器
		completeEvent: null, // 完成事件  (status:boolean,close:fn) => {}  status:是否成功  close:关闭弹窗方法
		failMsg: '', // 失败结束标识
	}),
})

const Message = useMessage()

watch(
	() => props.compData,
	() => {
		isScan.value = true
		getLog()
	}
)

const emit = defineEmits(['close', 'onCancel'])

const logContent = ref<string>('获取中...')
const isScan = ref<boolean>(true)
const timer = ref<any>(null) // 定时

/**
 * @description 获取日志
 */
const getLog = async () => {
	try {
		const rdata = await getLines({ num: 20, filename: props.compData.logPath })
		if (logContent.value !== rdata.msg) logContent.value = rdata.msg
		// 判断扫描失败
		if (props.compData.failMsg !== '' && rdata.msg.indexOf(props.compData.failMsg) !== -1) {
			isScan.value = false
			if (props.compData.completeEvent) {
				clearTimer()
				props.compData.completeEvent(false, () => {
					emit('close')
				})
				return
			}
			Message.error('失败')
			clearTimer()
			return
		}
		// 扫描已结束
		if (rdata.msg.indexOf(props.compData.endMsg) !== -1) {
			isScan.value = false
			if (props.compData.completeEvent) {
				props.compData.completeEvent(true, () => {
					emit('close')
				})
				clearTimer()
				return
			}
			if (props.compData.type === 'repair') {
				// 修复完成后关闭弹窗
				emit('close')
				Message.msg({
					dangerouslyUseHTMLString: true,
					message: '修复完成，请按 Ctrl+F5 刷新缓存，或等待2s自动刷新！',
					type: 'success',
					duration: 2000,
				}) // 提示错误信息
				// 修复完成后刷新页面
				setTimeout(() => {
					clearCache()
					window.location.reload()
				}, 2000)
			} else if (props.compData.type === 'scan') {
				Message.success('扫描已结束')
			} else {
				// 其他情况调用关闭
				Message.success(props.compData.successMsg)
				emit('close')
			}
			clearTimer()
			return
		}
		// 扫描未结束
		if (rdata.msg.indexOf(props.compData.endMsg) === -1 && isScan.value) {
			timer.value = setTimeout(function () {
				getLog()
			}, 1500)
		}
		if (!rdata.status) {
			Message.request(rdata)
			isScan.value = false
		}
	} catch (err) {
		// 扫描发生错误
		console.log(err)
		// 扫描未结束
		if (isScan.value) {
			getLog()
		}
		// if (props.compData.type === 'repair') {
		// 	setTimeout(() => {
		// 		window.location.reload()
		// 		localStorage.clear()
		// 		sessionStorage.clear()
		// 	}, 2000)
		// }
	}
}

const clearTimer = () => {
	if (timer.value) clearTimeout(timer.value)
}

const onCancel = () => {
	if (props.compData.isClear) {
		clearTimeout(timer.value)
	}
}

emit('onCancel', onCancel)

// 页面加载完成
onMounted(() => {
	getLog()
})

// 页面卸载时
onBeforeUnmount(() => {
	clearTimer()
})

defineExpose({
	onCancel,
})
</script>

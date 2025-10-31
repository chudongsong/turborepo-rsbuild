<template>
	<div class="p-2rem flex-wrap">
		<div class="relative w-full text-medium flex items-center leading-4rem mb-1rem justify-between">
			<div>
				<i class="svgtofont-el-loading text-iconLarge"></i>
				<span class="ml-1rem">{{ title || '正在备份，请稍后...' }}</span>
			</div>
			<el-button type="warning" plain @click="cancelBackup">取消备份</el-button>
		</div>
		<hr class="!border-dark" />
		<div class="grid grid-cols-3 leading-3rem py-1rem text-base">
			<div class="flex items-center mr-1rem">
				<span>备份网站：</span>
				<div class="truncate flex-1">{{ siteName || '--' }}</div>
			</div>
			<div class="flex items-center mr-1rem">
				<div>已备份：</div>
				<div class="truncate flex-1">{{ total || '--' }}</div>
			</div>
			<div class="flex items-center">
				<div>备份速度：</div>
				<div class="truncate flex-1">{{ speed || '--' }}</div>
			</div>
		</div>
		<bt-log class="h-[30rem]" :content="logContent" />
	</div>
</template>
<script lang="tsx" setup>
import { useConfirm, useDataHandle, useMessage } from '@/hooks/tools'
import { getBackupLogs, stopBackup } from '@api/site'

interface Props {
	compData: any
}

const props = withDefaults(defineProps<Props>(), {
	compData: () => ({
		type: 'scan', // 类型 scan 扫描 | repair 修复
		endMsg: '扫描结束', // 结束标识
		logPath: '', // 日志路径
		successMsg: '修复成功', // 成功提示
		isClear: false, // 是否清空定时器
		completeEvent: null, // 完成事件
		id: '', // 备份id
	}),
})
const emits = defineEmits(['close', 'onCancel'])

const total = ref<string>('') // 数据库总大小
const speed = ref<string>('') // 导入速度
const siteName = ref<string>('') // 网站名称
const title = ref<string>('') // 标题

watch(
	() => props.compData,
	val => {
		isScan.value = true
		getLog()
	}
)

const Message = useMessage() // 消息提示

const logContent = ref<string>('获取中...	')
const isScan = ref<boolean>(true)
const timer = ref<any>(null) //定时
let unDestory = false

/**
 * @description 获取日志
 */
const getLog = async () => {
	if (unDestory) return
	try {
		const { data } = await getBackupLogs({ id: props.compData.id })
		if (logContent.value !== data.msg) logContent.value = data.msg
		if (data?.total) {
			total.value = data.total
			speed.value = data.speed
			siteName.value = data.site_name
			title.value = data.title
		}
		// 扫描已结束
		if (data.stop) {
			isScan.value = false
			// 其他情况调用关闭
			if (data.status) {
				Message.success(data.title)
				emits('close')
				clearTimer()
			} else {
				Message.error(data.title)
				isScan.value = false
			}
			return
		}
		// 扫描未结束
		if (!data.stop && isScan.value) {
			timer.value = setTimeout(function () {
				getLog()
			}, 1000)
		}
	} catch (err) {
		// 扫描发生错误
		console.log(err)
		// 扫描未结束
		if (isScan.value) {
			getLog()
		}
	}
}

/**
 * @description 取消备份
 */
const cancelBackup = async () => {
	await useConfirm({
		width: '40rem',
		title: '取消备份',
		content: '<p>取消选中站点备份文件后，<span class="text-danger">该站点备份文件将永久消失</span>，是否继续？</p>',
		icon: 'warning-filled',
		isHtml: true,
	})
	const res = await useDataHandle({
		loading: '正在取消备份，请稍后...',
		request: stopBackup({ id: props.compData.id }),
		message: true,
	})
	emits('close')
}

const clearTimer = () => {
	if (timer.value) clearTimeout(timer.value)
}

const onCancel = () => {
	if (props.compData.isClear) {
		clearTimeout(timer.value)
	}
}

emits('onCancel', onCancel)

// 页面加载完成
onMounted(() => {
	getLog()
})

// 页面卸载时
onBeforeUnmount(() => {
	clearTimer()
	unDestory = true
})

defineExpose({
	onCancel,
})
</script>

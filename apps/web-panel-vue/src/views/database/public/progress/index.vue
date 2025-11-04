<template>
	<div class="p-2rem flex-wrap" ref="progressDialog">
		<div class="relative w-full text-medium flex items-center mb-2rem">
			<!-- 标题 -->
			<i class="svgtofont-el-loading text-3rem animate-spin"></i>
			<div class="flex flex-col ml-1rem leading-2rem">
				<span>正在{{ typeTitle }}数据库文件，请稍后...</span>
				<span class="text-small mt-[8px]">当前{{ typeTitle }}任务为后台{{ typeTitle }}，可关闭此页面进行其他操作</span>
			</div>
		</div>

		<hr class="!border-[#dedede]" />

		<!-- 描述 -->
		<div class="grid grid-cols-3 leading-3rem py-1rem text-base">
			<div class="flex items-center mr-1rem">
				<span>{{ typeTitle }}数据库：</span>
				<div class="truncate flex-1">{{ compData.config.name }}</div>
			</div>
			<div class="flex items-center mr-1rem">
				<div>{{ typeTitle }}大小：</div>
				<div class="truncate flex-1">{{ total || '--' }}</div>
			</div>
			<div class="flex items-center">
				<div>{{ typeTitle }}速度：</div>
				<div class="truncate flex-1">{{ speed || '--' }}</div>
			</div>
		</div>

		<!-- 操作进度日志 -->
		<bt-log class="h-[30rem]" :content="logContent" />

		<!-- 帮助 -->
		<ul class="pl-2rem mt-2re leading-8 text-small list-disc" v-if="compData.type === 'import'">
			<li>导入完成后，可到导入->导入日志查看导入结果</li>
		</ul>
	</div>
</template>
<script lang="tsx" setup>
import { clearCache } from '@/utils'
import { getImportSize, getBackupSize } from '@api/database'
import { Message } from '@hooks/tools'

interface Props {
	compData: {
		type: string // 类型 scan 扫描 | repair 修复
		refreshFn: AnyFunction // 刷新函数
		successFlag: boolean // 成功标识
		config: {
			id?: string // 数据库id
			name: string // 数据库名称
			path?: string // 日志路径
		}
	}
}

const props = withDefaults(defineProps<Props>(), {
	compData: () => ({
		type: '',
		refreshFn: () => {},
		successFlag: false,
		config: {
			id: '',
			name: '',
			path: '',
		},
	}),
})

const emit = defineEmits(['close', 'onCancel'])

const { id, name, path } = props.compData.config

const total = ref('') // 数据库总大小
const speed = ref('') // 导入速度
const logContent = ref('获取中...	')
const isScan = ref(true) // 是否扫描中
const timer = ref<any>(null) //定时
const typeTitle = ref(props.compData.type === 'import' ? '导入' : props.compData.type === 'recover' ? '恢复' : '压缩') // 类型标题
const progressDialog = ref<HTMLElement | null>() // 进度弹窗

/**
 * @description 获取日志
 */
const getLog = async () => {
	try {
		const { data } = props.compData.type === 'backup' ? await getBackupSize({ id: Number(id) }) : await getImportSize({ name })
		if (progressDialog.value) isScan.value = true
		if (!data.status) {
			onCancel() // 清除定时器
			isScan.value = false // 扫描结束
			logContent.value = data.msg // 赋值日志框内容
			// Message.error(data.msg); // 提示错误信息
			return
		} else {
			// 赋值日志框内容
			if (logContent.value !== data.msg) logContent.value = data.msg
			if (data?.total) {
				total.value = data.total
				speed.value = data.speed
			}
		}
		// 扫描结束时
		let successful = (data.msg.indexOf('成功!') !== -1 || data.msg.indexOf('successful') !== -1) && data.status
		if (successful) {
			completeEvent()
			return
		}
		// 扫描未结束时
		if (data?.speed && isScan.value && !successful) {
			timer.value = setTimeout(function () {
				getLog()
			}, 1000)
		}
	} catch (err) {
		onCancel()
		console.log(err)
	}
}

/**
 * @description 完成事件
 */
const completeEvent = () => {
	isScan.value = false
	if (props.compData.type === 'repair') {
		Message.success('修复完成，请按 Ctrl+F5 刷新缓存，或等待2s自动刷新！')
		setTimeout(() => {
			clearCache()
			window.location.reload()
		}, 2000)
	}
	emit('close')
	onCancel()
	props.compData.refreshFn && props.compData.refreshFn()
	return
}

/**
 * @description 清除定时器
 */
const onCancel = () => {
	timer.value = null
	clearTimeout(timer.value)
	isScan.value = false
}

// 页面加载完成
onMounted(getLog)
// 页面卸载时
onBeforeUnmount(onCancel)
// 暴露方法
defineExpose({ onCancel })
</script>

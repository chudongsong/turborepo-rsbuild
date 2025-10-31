<template>
	<section class="max-h-[52rem] p-4 overflow-auto">
		<div v-for="item of task.list" :key="item.id">
			<!-- 正在执行的任务 -->
			<template v-if="item.status == -1">
				<!-- 下载 -->
				<template v-if="item.type == 1">
					<div class="p-4">
						<div class="flex items-center">
							<div class="flex-1 w-0 truncate" :title="`${item.name}：${item.shell}`">
								{{ `${item.name}：${item.shell}` }}
							</div>
							<span class="mx-8 text-tertiary">{{ item.log.pre }}%</span>
							<bt-link @click="onCancelTask(item)">取消</bt-link>
						</div>
						<el-progress class="my-2" :percentage="Number(item.log.pre)" :show-text="false"></el-progress>
						<div class="flex items-center text-tertiary">
							<div class="flex-1 flex items-center">
								<div>{{ item.log.used }} / {{ getTotal(item.log.total) }}</div>
								<div class="ml-8">预计还要: {{ item.log.time }}</div>
							</div>
							<div>{{ item.log.speed }}/s</div>
						</div>
					</div>
				</template>
				<!-- 解压或者压缩 -->
				<template v-else>
					<div class="title">
						<span class="text" :title="`${item.name}: ${item.shell}`">{{ item.name }}: {{ item.shell }}</span>
						<bt-link @click="onCancelTask(item)">取消</bt-link>
					</div>
					<bt-log class="max-h-[27rem]" is-html :content="item.log" />
				</template>
				<div v-if="task.list.length > 1" class="title">等待执行任务</div>
			</template>
			<!-- 等待执行任务 -->
			<template v-else>
				<div class="title wait">
					<span class="text" :title="`${item.name}: ${item.shell}`">{{ item.name }}: {{ item.shell }}</span>
					<i class="svgtofont-el-close cursor-pointer font-bold" @click="onCancelTask(item)"></i>
				</div>
			</template>
		</div>
	</section>
</template>

<script lang="ts" setup>
import { removeTask } from '@api/global'
import { getByteUnit } from '@utils/index'
import { useMessage, useConfirm } from '@hooks/tools'
import { useGlobalStore } from '@store/global' // 获取首页数据

const { getRealTimeTaskList, task } = useGlobalStore()

let timer: any = null
const Message = useMessage()
const emits = defineEmits(['resize', 'close'])

/**
 * @description 清空时间函数
 */
const clearTimer = () => {
	if (timer != null) clearInterval(timer)
}

/**
 * @description 初始化时间函数
 */
const initTimer = () => {
	timer = setInterval(async () => {
		await getRealTimeTaskList()
		const list = task.value.list
		if (list.length === 0) {
			clearTimer()
			emits('close') // 关闭弹框
		}
	}, 1000)
}

/**
 * @description 获取下载文件大小
 * @param total
 */
const getTotal = (total: number) => {
	return getByteUnit(total)
}

/**
 * @description 取消任务
 */
const onCancelTask = async (item: any) => {
	let load = null
	try {
		await useConfirm({
			icon: 'warning-filled',
			title: '取消上传文件',
			content: `是否取消上传当前列表的文件，若取消上传，已上传的文件，需用户手动删除，是否继续？`,
		})
		load = Message.load('正在取消任务，请稍候...')
		const res = await removeTask(item.id)
		load.close()
		Message.request(res)
	} catch (err) {
		load?.close()
	}
}

/**
 * @description 打开弹框
 */
const onOpen = () => {
	initTimer()
}

/**
 * @description 关闭弹框
 */
const onCancel = () => {
	clearTimer()
}

nextTick(() => {
	emits('resize') // 重新计算弹框大小
})

defineExpose({ onOpen, onCancel })
</script>

<style lang="css" scoped>
.title {
	@apply flex items-center justify-between min-h-[36px] px-[10px] bg-light;
}

.title.wait {
	@apply bg-none text-secondary;
}

.title.wait i {
	@apply text-dangerDark text-medium;
}

.title .text {
	@apply whitespace-nowrap text-ellipsis overflow-hidden mr-[20px];
}
</style>

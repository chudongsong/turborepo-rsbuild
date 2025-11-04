<template>
	<div>
		<div class="mw-con relative p-2rem">
			<!-- <div class=""> -->
			<!-- <span class="btlink" @click="bt_file.remove_present_task(item)" style="position: absolute; top: 25px; right: 20px"></span> -->
			<!-- </div> -->
			<span class="fname" :style="{ width: '80%' }" :title="'正在下载: ' + items.shell"> 正在迁移数据至目录: {{ items.project }} </span>

			<el-progress :percentage="items.percentage" />

			<div class="flex w-full justify-between mt-4px items-center text-#999">
				<span>{{ items.total }}/{{ items.data_size }}</span>
				<span>{{ items.speed == 0 ? '正在连接..' : items.speed }}</span>
			</div>

			<p style="padding-top: 10px; color: #888">注：迁移即将完成时mysql将会重启，进度会在100%前后波动，属于正常现象，等待迁移成功即可。</p>
		</div>
	</div>
</template>

<script lang="tsx" setup>
import { getMysqMvSpeed } from '@/api/soft'

const items = ref({
	id: 1,
	shell: 'shell',
	project: 'project',
	percentage: 0,
	total: 0,
	data_size: 0,
	speed: 0,
})

const emits = defineEmits(['close'])

/**
 * @description 获取迁移进度
 */
const getSpeedMsg = async () => {
	try {
		const { data: res } = await getMysqMvSpeed()
		if (res.status && res.speed) {
			items.value = res
			if (res.copy_status === 1) {
				// 关闭
				emits('close')
				return
			}
		} else {
			emits('close')
			return
		}
		setTimeout(() => {
			getSpeedMsg()
		}, 1500)
	} catch (error) {
		console.log(error)
	}
}

onMounted(getSpeedMsg)
</script>

<style lang="css" scoped>
.waiting-down-list li {
	margin: 10px 0;
}

.waiting-down-list li .down-filse-name .fname {
	color: #333;
	display: inline-block;
	width: 220px;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.waiting-down-list li .down-progress {
	background: #eee;
	width: 100%;
	height: 3px;
	margin: 3px 0;
}

.waiting-down-list .done-progress {
	background-color: #20a53a;
	height: 3px;
}

.waiting-down-list .down-info {
	color: #999;
	font-size: var(--el-font-size-small);
}

.waiting-down-list .down-info .speed-size {
	float: right;
}
</style>

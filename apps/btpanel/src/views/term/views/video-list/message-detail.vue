<template>
	<div class="flex flex-col p-[16px] lib-box">
		<table class="border-dark border-1">
			<tbody>
				<tr>
					<th>登录用户</th>
					<td>{{ compData?.rowsData?.ssh_user }}</td>
				</tr>
				<tr>
					<th>主机IP</th>
					<td>{{ compData?.rowsData?.server_ip }}</td>
					<th>客户端IP</th>
					<td>{{ compData?.rowsData?.addr }}</td>
				</tr>
				<tr>
					<th>连接时间</th>
					<td>{{ formatTime(compData?.rowsData?.login_time) }}</td>
					<th>关闭时间</th>
					<td>{{ formatTime(compData?.rowsData?.close_time) }}</td>
				</tr>
			</tbody>
		</table>
		<div class="mt-[20px]">
			<div class="font-bold">User-Agent</div>
			<div class="lib-con">{{ compData?.rowsData?.user_agent }}</div>
		</div>
		<div class="mt-[20px] flex justify-end">
			<el-button type="danger" class="mr-[10px]" @click="handleDeleteVideo">删除录像</el-button>
			<el-button type="primary" @click="handlePlayVideo">播放录像</el-button>
		</div>
	</div>
</template>
<script setup lang="ts">
import { formatTime } from '@utils/index'
import { playVideo, deleteVideo } from './useController'

interface Props {
	compData?: any
}

const props = withDefaults(defineProps<Props>(), {
	compData: () => ({}),
})

const popupClose = inject<() => void>('popupClose', () => {})

const handlePlayVideo = () => {
	playVideo(props.compData.rowsData)
}

const handleDeleteVideo = () => {
	deleteVideo(props.compData.rowsData, () => {
		popupClose()
		props.compData.refresh()
	})
}
</script>

<style lang="css" scoped>
.lib-box table tr td,
.lib-box table tr th {
	@apply border-t-1 border-dark leading-34px text-left px-[8px];
}
.lib-box .lib-con {
	@apply border border-dark p-[1rem] my-[1rem] rounded-base bg-light leading-20px;
}
</style>

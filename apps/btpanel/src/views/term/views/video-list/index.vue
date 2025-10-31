<template>
	<div class="flex flex-col h-full">
		<div class="flex items-center">
			<div class="mr-[8px]">录像开关</div>
			<btSwitch v-model="isVideo" :width="36" @change="onChangeVideo" />
		</div>
		<bt-table-group>
			<template #content>
				<BtTable :max-height="mainHeight - 220" />
			</template>
			<template #footer-right>
				<BtPage type="unknown" />
			</template>
		</bt-table-group>
	</div>
</template>
<script lang="tsx" setup>
import type { TermVideoInfoProps } from '@term/types'

import { useDynamicTable } from '@/hooks/tools'
import { useOperate } from '@/hooks/tools/table/column'
import { formatTime } from '@/utils'
import { useGlobalStore } from '@store/global'
import { onChangeVideo, playVideo, videoDetailDialog, deleteVideo } from './useController'
import { useTermVideoStore } from './useStore'
import 'asciinema-player/dist/bundle/asciinema-player.css'

import btSwitch from '@/components/form/bt-switch'

const { mainHeight } = useGlobalStore()
const { getVideo, getVideoStatus, isVideo, $reset } = useTermVideoStore()

// 表格实例
const { BtTable, BtPage, refresh } = useDynamicTable({
	request: ({ p, limit }: AnyObject) => getVideo({ p, limit }),
	columns: [
		{ label: '主机IP', prop: 'server_ip' },
		{
			label: '登录时间',
			width: 100,
			render: (row: TermVideoInfoProps, index: number) => {
				return (
					<span class="inline-block whitespace-pre-wrap" title={formatTime(row.login_time)}>
						{formatTime(row.login_time)}
					</span>
				)
			},
		},
		useOperate([
			// { title: '播放', onClick: playVideo },
			{ title: '详情', onClick: (row: TermVideoInfoProps) => videoDetailDialog(row, refresh) },
			{ title: '删除', onClick: (row: TermVideoInfoProps) => deleteVideo(row, refresh) },
		]),
	],
})
onMounted(getVideoStatus)

defineExpose({
	init: getVideoStatus,
})

// 页面消耗时重置数据
// onUnmounted($reset)
</script>

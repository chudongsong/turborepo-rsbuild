<template>
	<div class="w-full h-full p-[2px]">
		<BtTabs />
	</div>
</template>

<script setup lang="tsx">
import { useTabs } from '@/hooks/tools'
import HostList from './host-list/index.vue'
import VideoList from './video-list/index.vue'
import CommandList from './command-list/index.vue'

const { BtTabs } = useTabs({
	options: [
		{
			label: '服务器列表',
			name: 'serverList',
			render: HostList,
			lazy: true,
		},
		{
			label: '录像审计',
			name: 'videoList',
			render: VideoList,
			lazy: true,
		},
		{
			label: '常用命令',
			name: 'commonList',
			render: CommandList,
			lazy: true,
		},
	],
})
</script>

<style lang="css" scoped>
.list-content {
	@apply flex flex-col overflow-y-auto border-lighter h-full flex-1 border-[1px];
}

.list-item {
	@apply h-[3.6rem] leading-[3.6rem] flex justify-between cursor-pointer border-b border-lighter;
}

.list-item:hover {
	@apply bg-lighter;
}

.list-item:hover .list-tools {
	@apply flex;
}

.list-head,
.list-tools {
	@apply flex items-center;
}

.list-head i,
.list-tools i {
	@apply text-base px-[8px] h-full leading-[3.6rem] mr-[4px];
}

.list-tools {
	@apply hidden;
}

.list-tools i.svgtofont-el-delete:hover {
	@apply bg-danger text-white;
}

.list-tools i.svgtofont-el-edit:hover {
	@apply bg-primary text-white;
}
</style>

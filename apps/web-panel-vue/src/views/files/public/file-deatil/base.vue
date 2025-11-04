<template>
	<div class="flex flex-col h-[40rem]">
		<div class="item-card">
			<div class="item">
				<div class="title">
					<img class="w-[5rem] h-[5rem]" :src="`/static/images/file_icon/${fileItem.is_dir ? 'folder_win10' : 'file'}.png`" alt="" />
				</div>
				<div class="con">
					<bt-input width="38rem" v-model="fileItem.name" disabled />
				</div>
			</div>
		</div>
		<div class="item-card">
			<div class="item">
				<div class="title">类型：</div>
				<div class="con">{{ fileItem.st_type || '未知文件' }}</div>
			</div>
			<div class="item">
				<div class="title">文件路径:</div>
				<div class="con overflow-ellipsis flex-1 break-all">
					{{ path }}
					<i class="svgtofont-icon-copy cursor-pointer hover:text-primary text-base ml-[4px] align-middle" @click="copyText({ value: `${fileItem.path}/${fileItem.name}` })" />
				</div>
			</div>
			<div class="item">
				<div class="title">大小:</div>
				<div class="con">{{ fileItem.st_size }}</div>
			</div>
		</div>
		<div class="item-card">
			<div class="item">
				<div class="title">权限:</div>
				<div class="con">{{ fileItem.mode }}</div>
			</div>
			<div class="item">
				<div class="title">所属组:</div>
				<div class="con">{{ fileItem.group }}</div>
			</div>
			<div class="item">
				<div class="title">所属用户:</div>
				<div class="con">{{ fileItem.user }}</div>
			</div>
		</div>
		<div class="item-card !border-b-0">
			<div class="item">
				<div class="title">访问时间:</div>
				<div class="con">{{ formatTime(fileItem.st_atime) }}</div>
			</div>
			<div class="item">
				<div class="title">修改时间:</div>
				<div class="con">{{ formatTime(fileItem.st_mtime) }}</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { copyText, formatTime } from '@/utils/index'
import { storeToRefs } from 'pinia'
import FILES_DETAIL_STORE from './store'

const store = FILES_DETAIL_STORE()
const { fileItem } = storeToRefs(store)

const path = computed(() => {
	const str = `${fileItem.value.path}/${fileItem.value.name}`.replace(/\/\//g, '/')
	return str
})
</script>

<style lang="css" scoped>
.item-card {
	@apply w-full px-[1rem] py-[1rem] border-darker border-b;
}

.item {
	@apply flex items-center;
}

.title {
	@apply w-[9rem] text-small text-secondary leading-[2.5rem];
}

.con {
	@apply flex-1 leading-[2.5rem];
}

.copy {
	@apply w-[1.2rem] h-[1.4rem] inline-block ml-[1rem] cursor-pointer text-default;
	background: url(/static/icons/icon-copy.svg) no-repeat;
	vertical-align: -2px;
}
</style>

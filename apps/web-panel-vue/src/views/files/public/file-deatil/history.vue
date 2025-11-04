<template>
	<div class="h-[40rem] pt-[.5rem] overflow-hidden">
		<div class="item th">
			<div class="w-[14rem]">修改时间</div>
			<div class="w-[8.5rem]">文件大小</div>
			<div class="con">MD5</div>
			<div class="w-[9rem] text-right">操作</div>
		</div>
		<div class="h-[36.5rem] overflow-y-auto">
			<div v-for="history in fileItem.history" :key="history.md5" class="item">
				<div class="w-[14rem]">{{ formatTime(history.st_mtime) }}</div>
				<div class="w-[8.5rem]">{{ `${getByteUnit(history.st_size)}` }}</div>
				<div class="con">{{ history.md5 }}</div>
				<div class="w-[9rem] text-right">
					<!-- <bt-link @click="showHistory(history)">查看</bt-link>
					<bt-divider /> -->
					<bt-link @click="recoverHistory(history)">恢复</bt-link>
				</div>
			</div>
			<el-empty description="暂无历史版本" v-show="fileItem.history.length === 0"></el-empty>
		</div>
	</div>
</template>

<script setup lang="ts">
import { getByteUnit, formatTime } from '@/utils/index'
import { storeToRefs } from 'pinia'
import FILES_DETAIL_STORE from './store'

const store = FILES_DETAIL_STORE()
const { fileItem } = storeToRefs(store)
const { showHistory, recoverHistory } = store
</script>

<style lang="css" scoped>
.item {
	@apply flex items-center h-[3rem] p-[.5rem] hover:(bg-base cursor-pointer);
}

.item.th {
	@apply font-bold bg-light hover:(bg-lighter cursor-default);
}

.item .con {
	@apply flex-1;
}
</style>

<template>
	<div class="p-20px">
		<div class="flex items-center mb-8px">
			<i class="svgtofont-el-warning-filled !text-warning !text-[4rem]"></i>
			<span class="text-base ml-12px text-danger">{{ popupData.resultTitle || '操作' }}</span>
		</div>
		<bt-table :column="popupData.resultColumn" :data="popupData.resultData || []" max-height="360"></bt-table>
	</div>
</template>

<script setup lang="tsx">
import { storeToRefs } from 'pinia'
import FILES_RECYCLE_BIN_STORE from '../store'

const store = FILES_RECYCLE_BIN_STORE()
const { popupData } = storeToRefs(store)
</script>

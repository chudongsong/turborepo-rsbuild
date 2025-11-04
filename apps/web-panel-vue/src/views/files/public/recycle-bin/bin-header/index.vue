<template>
	<div class="pb-[2rem] flex items-center justify-between text-small">
		<div class="flex items-center">
			<el-switch v-model="statusSwitch" @change="setStatus(tabValue === 'db' ? 1 : 0)" :inactive-text="`${tabValue === 'db' ? '数据库' : '文件'}回收站`"> </el-switch>
			<el-alert class="!ml-2rem" :closable="false" type="warning" show-icon>
				<template #title>
					<span class="text-[#F0AD4E] text-small"> 注意：关闭回收站后，文件删除时将永久删除 </span>
				</template>
			</el-alert>
		</div>
		<div class="flex items-center relative">
			<el-button type="default" @click="cleanBin">清空回收站</el-button>
			<bt-divider />
			<el-date-picker align="right" type="daterange" v-model="time" range-separator="-" start-placeholder="开始日期" end-placeholder="结束日期" value-format="x" @change="watchTime" @clear="watchTime" :disabled-date="pickerOptions.disabledDate" class="!w-[20rem]" />
			<bt-divider />
			<bt-input-icon v-model="searchName" icon="el-search" clearable class="!w-[22rem]" @keydown.enter="goSearch" placeholder="请输入文件名" @icon-click="goSearch" @clear="goSearch" />
		</div>
	</div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import FILES_RECYCLE_BIN_STORE from '../store'

const store = FILES_RECYCLE_BIN_STORE()
const { activeName: tabValue, statusSwitch, time, showPopup, searchName, pickerOptions, formatDate } = storeToRefs(store)
const { onCancel, showPlayer, cleanBin, clearTime, setStatus, goSearch, changeClearCheck, watchTime } = store
</script>

<style lang="css" scoped>
:deep(.el-switch__label span) {
	@apply text-[#555] text-small whitespace-nowrap;
}

:deep(.el-input__inner) {
	@apply hover:cursor-pointer;
}
</style>

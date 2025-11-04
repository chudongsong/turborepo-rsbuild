<template>
	<div class="w-full p-[20px]">
		<div class="flex items-center">
			<i class="svgtofont-el-warning-filled text-[#E6A23C] !text-[4rem]"></i>
			<div class="message flex-1 ml-4 py-[4px] leading-[24px] text-[13px]">
				<div class="text-base leading-[24px]">
					{{ `卸载【${pluginData.title}】插件，是否继续操作？` }}
				</div>
				<div v-if="pluginData.name === 'redis' || pluginData.name === 'mongodb'" class="text-danger">卸载后{{ pluginData.title }}数据将会丢失，如有重要数据请进行备份</div>
			</div>
		</div>
		<el-checkbox v-if="isSpecial" class="mt-[16px] ml-[10px] text-small" v-model="checked"> 保存配置文件 </el-checkbox>
	</div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { SOFT_STORE } from '../../store'

const { checked, pluginData, isSpecial } = storeToRefs(SOFT_STORE())
const { onUnInstall } = SOFT_STORE()

defineExpose({ onConfirm: onUnInstall })
</script>

<style lang="css" scoped>
.boxCon {
	@apply flex items-center text-small;
}
.title {
	@apply ml-[.6rem] mr-[2rem];
	white-space: nowrap;
}
.con {
	@apply flex items-center;
}
.search {
	@apply w-[57rem] relative;
}
</style>

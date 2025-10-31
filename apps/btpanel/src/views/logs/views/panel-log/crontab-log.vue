<template>
	<div class="flex items-start" :style="{ height: mainHeight - 195 + 'px', minHeight: '400px' }">
		<LogList logsType="crontab" :menu-options="menuOptions" :logContent="logsMsg" @tab-click="getCrontabLogs" @search="getMenuData">
			<!-- 木马查杀日志特有 左侧按钮 -->
			<template #LogLeft>
				<!-- <el-button type="primary" @click="getCrontabLogs(currentItem)"> 刷新日志 </el-button> -->
				<el-button class="!mr-[12px]" @click="openClearShellView(currentItem)"> 清理日志 </el-button>
				<el-button v-if="isShellLog" @click="openOutShellView"> 导出日志 </el-button>
			</template>
			<!-- 木马查杀日志特有 - 右侧操作 -->
			<template #LogRight>
				<div class="flex items-center">
					<div class="flex items-center inline-block" v-if="isShellLog">
						<bt-radio class="mr-[12px]" type="button" @change="getCrontabLogs(currentItem)" v-model="crontabForm.type" :options="typeCrontabOptions"></bt-radio>

						<el-date-picker
							v-model="crontabForm.time_search"
							format="YYYY/MM/DD"
							value-format="x"
							@change="getCrontabLogs(currentItem)"
							@clear="getCrontabLogs(currentItem)"
							type="daterange"
							placement="bottom-end"
							range-separator="至"
							start-placeholder="开始日期"
							end-placeholder="结束日期"></el-date-picker>
					</div>
					<bt-table-refresh class="ml-8px" @refresh="getCrontabLogs(currentItem)"></bt-table-refresh>
				</div>
			</template>
		</LogList>
	</div>
</template>
<script setup lang="ts">
import LogList from '@logs/public/log-list/index.vue'
import { useGlobalStore } from '@store/global'

import { storeToRefs } from 'pinia'
import { getCrontabLogs, getMenuData, isShellLog, menuOptions, openClearShellView, openOutShellView, typeCrontabOptions } from './useController'
import { LOG_PANEL_STORE } from './useStore'

const { mainHeight } = useGlobalStore() // 获取全局高度
const store = LOG_PANEL_STORE()
const { logsMsg, currentItem, crontabForm } = storeToRefs(store)

onMounted(async () => {
	await getMenuData()
	await getCrontabLogs(menuOptions.value[0])
})
</script>

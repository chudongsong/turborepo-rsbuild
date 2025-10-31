<template>
	<div class="items-start flex">
		<LogList logsType="soft" @tab-click="handleTabClick" :menu-options="menuOptions" :logContent="logsMsg">
			<!-- 组件插槽	 -->
			<template #LogView>
				<div v-if="isSpecialData" :style="`width:${mainWidth - 290}px`">
					<!-- mysql -->
					<MysqlLogs v-if="currentName === 'Mysql'"></MysqlLogs>
					<!-- ftp -->
					<FtpLog v-if="currentName === 'FTP'"></FtpLog>
					<!-- plugin -->
					<PluginLog v-if="plugin.includes(currentName)" :path="logPath"></PluginLog>
				</div>
			</template>
			<!-- 使用默认类型 -->
			<template #LogLeft>
				<!-- 公共 -->
				<el-button class="!m-0" type="default" @click="outSoftSite" v-if="currentName != 'Mysql' && logPath"> 导出日志 </el-button>
				<el-button class="!m-0 !mx-[8px]" type="default" @click="delAllLogData" v-if="currentName != 'Mysql'"> 清空日志 </el-button>
				<!-- php -->
				<div v-if="currentName === 'Php'" class="flex items-center mr-8px">
					php版本：
					<el-select @change="changePhpVersion" v-model="phpChecked" class="!w-[8rem] mr-[4px]">
						<el-option v-for="(item, index) in phpData" :key="index" :label="item.version" :value="item.version"></el-option>
					</el-select>
				</div>
			</template>

			<template #LogRight>
				<div class="flex items-center">
					<!-- 搜索框 -->
					<bt-input-search class="!w-[26rem] mr-1rem" v-model="search" @search="renderSoftLog({ name: currentName }, search)" placeholder="请输入日志内容名称" />
					<BtTableRefresh @refresh="renderSoftLog({ name: currentName }, search)"></BtTableRefresh>
				</div>
			</template>
		</LogList>
	</div>
</template>

<script lang="ts" setup>
import BtTableRefresh from '@components/extension/bt-table-refresh'
import LogList from '@logs/public/log-list/index.vue'
import FtpLog from '@logs/views/soft-log/ftp-log/index.vue'
import MysqlLogs from '@logs/views/soft-log/mysql-log/index.vue'
import PluginLog from '@logs/views/soft-log/plugin-log/index.vue'

import { storeToRefs } from 'pinia'
import { changePhpVersion, delAllLogData, handleTabClick, isSpecialData, outSoftSite, plugin, renderSoftLog, search } from './useController'
import { LOG_SOFT_STORE } from './useStore'
import { useGlobalStore } from '@/store/global'

const { mainWidth } = useGlobalStore()
const { getMenuList } = LOG_SOFT_STORE()

const { menuOptions, currentName, phpData, phpChecked, logsMsg, logPath } = storeToRefs(LOG_SOFT_STORE())

onMounted(async () => {
	await getMenuList()
	if (menuOptions.value.length) {
		renderSoftLog(menuOptions.value[0])
	}
})
</script>

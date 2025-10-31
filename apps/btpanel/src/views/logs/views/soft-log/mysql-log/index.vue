<template>
	<bt-tabs type="bg-card" v-model="mysqlActive" @tabClick="handleClickMysqlTab">
		<el-tab-pane v-for="(item, index) in tabsData" :label="item.label" :name="item.value" :key="index">
			<div class="flex items-center mb-[12px] justify-between flex-1 flex-wrap">
				<div class="flex items-center">
					<el-button class="!mr-[8px]" @click="deleteMysqlLog"> 清空日志 </el-button>
					<!-- 左侧错误日志分类 -->
					<div class="flex items-center flex-nowrap" v-if="mysqlActive === 'mysqlError'">
						级别：
						<bt-checkbox v-model="checkList" @change="getMysqlLogs(search)" class="mr-[12px] flex !flex-nowrap" :options="rankOptions"></bt-checkbox>
					</div>
				</div>
				<!-- 右侧慢日志日志搜索 -->
				<!-- v-if="mysqlActive === 'mysqlSlow'" -->
				<div class="flex items-center">
					<bt-input-search class="mr-1rem w-[26rem]" v-model="search" @search="getMysqlLogs(search)" @clear="() => (search = '')" placeholder="请输入搜索关键字" />
					<bt-table-refresh @refresh="getMysqlLogs(search)"></bt-table-refresh>
				</div>
			</div>
			<bt-log
				:content="mysqlLogMsg"
				:isHtml="true"
				:autoScroll="true"
				:fullScreen="{
					title: '全屏查看-Mysql日志',
					onRefresh: () => getMysqlLogs(search),
				}"
				:style="`height:${mainHeight - 246}px`" />
		</el-tab-pane>
	</bt-tabs>
</template>

<script lang="ts" setup>
import BtLog from '@/components/extension/bt-log/index.vue'
import { useGlobalStore } from '@store/global'
import { storeToRefs } from 'pinia'
import { deleteMysqlLog, getMysqlLogs, handleClickMysqlTab, mysqlLogMsg, rankOptions, search, tabsData } from '../useController'
import { LOG_SOFT_STORE } from '../useStore'

const { mainHeight } = useGlobalStore() // 获取全局高度
const store = LOG_SOFT_STORE()
const { mysqlActive, checkList } = storeToRefs(store)

onMounted(getMysqlLogs)
</script>

<style lang="css" scoped>
:deep(.el-tabs__item) {
	height: 3.6rem !important;
	line-height: 3.6rem !important;
	font-size: var(--el-font-size-small) !important;
	padding: 0 1.2rem !important;
	@apply some-tailwind-class;
}

:deep(.el-tabs__content) {
	margin-top: 0 !important;
	@apply some-tailwind-class;
}

:deep(.el-tab-pane) {
	padding: 0 !important;
	@apply some-tailwind-class;
}
</style>

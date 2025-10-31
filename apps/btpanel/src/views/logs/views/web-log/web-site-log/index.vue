<template>
	<div class="flex flex-col">
		<div class="flex items-center justify-end mb-[12px]">
			<div class="flex justify-between w-full flex-wrap">
				<!-- 左侧按钮 -->
				<div class="flex items-center text-small">
					<el-button type="default" @click="openClearLogView"> 清理日志 </el-button>
					<el-button type="default" class="!mr-[8px]" @click="openOutLogView"> 导出日志 </el-button>

					<el-switch v-model="logParams.keywordSwitch" :width="36" @change="changeKeywordStatus"></el-switch>
					<span class="pl-[1rem] mr-[8px]">
						<el-tooltip content="点击开启日志关键词告警" placement="top">
							<span> <span class="lt-xl:hidden">关键词</span>告警 </span>
						</el-tooltip>
						<span class="cursor-pointer text-primary" @click="setKeywordConfig"> [配置] </span>
					</span>
					<el-checkbox v-if="logParams.typeValue === 'access'" v-model="logParams.ipArea" class="pr-[2rem]" @change="changeIpArea">
						<div class="flex items-center">
							<span class="text-small">显示IP归属地</span>
							<i class="svgtofont-icon-ltd text-ltd !text-extraLarge"></i>
						</div>
					</el-checkbox>
				</div>

				<!-- 右侧日期选择+类别+搜索 -->
				<div class="flex items-center mt-4px">
					<!-- 类别 -->
					<bt-radio type="button" size="default" class="mr-1rem" v-model="logParams.typeValue" @change="renderWebLog" :options="typeOptions"></bt-radio>
					<!-- 日期 -->
					<el-date-picker
						v-model="logParams.timeValue"
						format="YYYY/MM/DD"
						value-format="x"
						@change="renderWebLog"
						type="daterange"
						range-separator="-"
						:disabled-date="disabledDate"
						start-placeholder="开始"
						class="lt-xl:(!w-[12rem]) at-lg:(!w-[12rem]) at-xl:(!w-[12rem]) !w-[20rem]"
						end-placeholder="结束"></el-date-picker>
					<!-- 搜索 -->
					<div class="ml-1rem">
						<bt-input-search class="lt-xl:(!w-[16rem]) !w-[24rem]" v-model="logParams.searchValue" placeholder="请输入搜索关键字" @search="renderWebLog" />
					</div>
					<bt-table-refresh class="ml-1rem" @refresh="renderWebLog"></bt-table-refresh>
				</div>
			</div>
		</div>
		<!-- 日志主体 -->
		<bt-log
			v-bt-loading="preLoading"
			:content="logMsg"
			:isHtml="true"
			:autoScroll="true"
			:fullScreen="{
				title: '全屏查看-日志',
				onRefresh: () => judgeLogType('WebLogs'),
			}"
			:style="'height:' + (mainHeight - 292) + 'px;min-height:400px;'" />
	</div>
</template>
<script setup lang="ts">
import { useGlobalStore } from '@store/global'
import BtLog from '@components/extension/bt-log/index.vue'
import { storeToRefs } from 'pinia'
import { disabledDate, changeIpArea, changeKeywordStatus, judgeLogType, openClearLogView, openOutLogView, renderWebLog, setKeywordConfig } from '../useController'
import { LOG_SITE_STORE } from '../useStore'
const { mainHeight } = useGlobalStore()

const store = LOG_SITE_STORE()
const { logParams, logMsg, preLoading } = storeToRefs(store)

const typeOptions = [
	{ label: '运行日志', value: 'access' },
	{ label: '异常日志', value: 'error' },
]

defineExpose({ init: () => judgeLogType('WebLogs') })
</script>

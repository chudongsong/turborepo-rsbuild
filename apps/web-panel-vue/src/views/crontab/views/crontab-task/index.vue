<template>
	<div>
		<el-alert v-if="!serviceStatus" :closable="false" type="error" class="!mb-[1.6rem]">
			<template #title>
				<div class="flex items-center">
					<i class="svgtofont-el-warning-filled text-[var(--el-color-error-light-8)] !text-base mr-[4px]"></i>
					检测到当前计划任务服务异常，请及时修复，温馨提示：修复前请先临时关闭系统加固，否则可能导致修复失败。
					<span class="bt-link" @click="repairCrontabService">[ 一键修复 ]</span>
				</div>
			</template>
		</el-alert>
		<bt-table-group>
			<template #header-left>
				<!-- 按钮组 -->
				<el-button type="primary" @click="addTaskEvent()">添加任务</el-button>
				<el-button @click="openLocalFile">导入</el-button>
				<el-button @click="exportData">导出</el-button>
				<el-button @click="logSplitDialog()">日志切割设置</el-button>
				<!-- 选取本地文件 -->
				<CrontabUpload ref="fileRef" @upload-success="getCrontabList" />
				<!-- 需求反馈 -->
				<div class="flex items-center ml-4px" @click="openNps()">
					<i class="svgtofont-desired text-medium"></i>
					<span class="bt-link">需求反馈</span>
				</div>
			</template>
			<template #header-right>
				<div class="flex items-center">
					<bt-table-class name="CrontabTask" class="mr-[10px] !w-[16rem]" v-model="tableParam.type_id" :options="classOption" field="name" :config="getClassOption" @change="getCrontabList" :ignore="['-1', '0', '-2', '-3']" />
					<div>
						<bt-input-search class="!w-[26rem]" v-model="tableParam.search" @search="getCrontabList" placeholder="支持任务名称模糊搜索" />
					</div>
					<bt-table-refresh @refresh="getCrontabList" class="!mx-[10px]"></bt-table-refresh>
					<!-- @change="cutColumn" -->
					<bt-table-column name="Crontab" :column="tableColumns" />
				</div>
			</template>
			<template #content>
				<!-- 排序  -->
				<bt-table ref="crontabRef" v-bt-loading="tableLoading" v-bt-loading:title="'正在加载中，请稍候...'" :column="tableColumns" :data="tableData" @sort-change="sortChange" />
			</template>
			<template #footer-left>
				<bt-table-batch :table-ref="crontabRef" :options="TableBatchOptions" />
			</template>
			<template #footer-right>
				<bt-table-page v-model:page="tableParam.p" v-model:row="tableParam.count" :total="tableTotal" @change="getCrontabList" />
			</template>
		</bt-table-group>

		<bt-dialog title="正在修复服务，请耐心等候" v-model="repairDialog" :area="[60]">
			<div class="flex-wrap">
				<bt-log class="h-[40rem] !rounded-none" :content="repairContent" />
			</div>
		</bt-dialog>
	</div>
</template>

<script setup lang="tsx">
import CrontabUpload from './upload/index.vue'
import { useGlobalStore } from '@/store/global'
import {
	fileRef,
	openLocalFile,
	crontabRef,
	TableBatchOptions,
	tableTotal,
	repairDialog,
	repairContent,
	tableLoading,
	tableData,
	tableParam,
	serviceStatus,
	classOption,
	init,
	sortChange,
	getClassOption,
	getCrontabList,
	repairCrontabService,
	addTaskEvent,
	exportData,
	logSplitDialog,
	tableColumns,
} from './useController'

import { openNps } from '../../useController'

const { mainHeight } = useGlobalStore()

onMounted(() => init())
</script>

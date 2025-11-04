<!--  -->
<template>
	<bt-tabs v-model="activeName" type="left-bg-card" @tab-click="handleTabClick">
		<el-tab-pane label="服务" name="service">
			<Status></Status>
			<!-- 状态停止告警 -->
			<Alert></Alert>
			<bt-divider direction="horizontal" />
			<div>
				<div>
					<span>守护进程：</span>
					<bt-switch class="mr-[2rem]" v-model="processStatus" @change="setProcessStatus"></bt-switch>
				</div>
				<bt-help class="mt-1rem" :options="[{ content: '守护进程可以在Apache服务停止后自动启动，保证Apache服务一直运行。' }]"></bt-help>
			</div>
		</el-tab-pane>

		<el-tab-pane label="配置文件" name="config">
			<span class="my-[4px] text-secondary">提示：Ctrl+F 搜索关键字，Ctrl+S 保存，Ctrl+H 查找替换</span>
			<div class="my-[12px]">
				<bt-editor v-bt-loading="textLoading" class="!h-[40rem] !w-[54rem] my-[12px]" v-model="staticContent" id="configContent" :filePath="`/www/server/apache/conf/httpd.conf`" />
			</div>
			<el-button type="primary" @click="saveFileEvent">保存</el-button>
			<bt-help :options="helpList" class="ml-[20px] mt-[20px]"></bt-help>
		</el-tab-pane>

		<el-tab-pane label="版本切换" name="version">
			<div class="flex text-secondary items-center">
				<span>选择版本</span>
				<el-select class="mx-[12px] !w-[18rem]" v-model="version">
					<el-option v-for="(item, index) in versionList" :key="index" :label="'apache ' + item.m_version" :value="item.m_version"></el-option>
				</el-select>
				<el-button type="primary" @click="switchVersion(compData)">切换</el-button>
			</div>
		</el-tab-pane>

		<el-tab-pane label="负载状态" name="load">
			<el-table maxHeight="500" :data="tableData" border style="width: 100%" v-bt-loading="textLoading">
				<el-table-column prop="ps" label="字段"> </el-table-column>
				<el-table-column prop="value" label="当前值"> </el-table-column>
			</el-table>
		</el-tab-pane>

		<el-tab-pane label="性能调整" name="performance" v-bt-loading="viewLoading">
			<div class="flex flex-col text-secondary performance">
				<el-form label-position="right" label-width="186px">
					<el-form-item :label="item.name" v-for="(item, index) in performanceData" :key="index">
						<div class="flex items-center" v-if="item.name != 'KeepAlive'">
							<el-input v-model="item.value" :type="item.name !== 'worker_processes' ? 'number' : ''"></el-input>
							<span>{{ item.ps }}</span>
						</div>
						<div class="flex items-center" v-if="item.name == 'KeepAlive'">
							<el-select v-model="item.value" class="!w-[8rem] mr-8px">
								<el-option label="开启" value="On"></el-option>
								<el-option label="关闭" value="Off"></el-option>
							</el-select>
							<span>{{ item.ps }}</span>
						</div>
					</el-form-item>
					<el-form-item label=" ">
						<el-button @click="saveNginxData" type="primary">保存</el-button>
					</el-form-item>
				</el-form>
			</div>
		</el-tab-pane>

		<el-tab-pane label="运行日志" name="logs">
			<bt-log
				:content="logMsg"
				:autoScroll="true"
				v-bt-loading="textLoading"
				:isHtml="true"
				:full-screen="{
					title: '全屏查看日志',
					onRefresh: getErrLogsEvent,
				}"
				:style="'height:540px'"></bt-log>
		</el-tab-pane>
	</bt-tabs>
</template>

<script setup lang="ts">
import Status from '@soft/public/environment-plugin/public/service-status/index.vue'
import Alert from '@soft/public/environment-plugin/public/status-stop-alert/index.vue'
import { processStatus, setProcessStatus, performanceData, activeName, staticContent, textLoading, viewLoading, tableData, logMsg, version, versionList, helpList, saveNginxData, handleTabClick, getErrLogsEvent, switchVersion, saveFileEvent, init } from './useController'

interface Props {
	compData: any
}
const props = withDefaults(defineProps<Props>(), {
	compData: {},
})

const emits = defineEmits(['close'])

onMounted(() => {
	init(props.compData)
})
</script>

<style lang="css" scoped>
.performance :deep(.el-input) {
	width: 8rem !important;
	margin: 0 0.8rem;
}
.performance span {
	font-size: 1.2rem;
}
.el-table.el-table--border .el-table__cell {
	border-right: 1px solid var(--el-fill-color-dark) !important;
}
.el-divider {
	margin: 1rem 0 2rem 0;
}
</style>

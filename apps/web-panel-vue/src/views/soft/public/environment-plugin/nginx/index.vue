<!--  -->
<template>
	<div>
		<bt-tabs v-model="activeName" type="left-bg-card" class="h-full" @tab-click="handleTabClick">
			<el-tab-pane label="服务" name="service">
				<Status></Status>
				<!-- 状态停止告警 -->
				<Alert></Alert>
			</el-tab-pane>

			<el-tab-pane label="配置文件" name="config">
				<span class="my-[4px] text-secondary">提示：Ctrl+F 搜索关键字，Ctrl+S 保存，Ctrl+H 查找替换</span>
				<div class="my-[12px]">
					<bt-editor v-bt-loading="textLoading" class="!h-[38rem] !w-[52rem]" v-model="staticContent" id="configContent" :filePath="`/www/server/nginx/conf/nginx.conf`" />
				</div>
				<el-button type="primary" @click="saveFileEvent">保存</el-button>
				<ul class="leading-8 mt-20px text-small list-disc ml-[20px]">
					<li>此处为nginx主配置文件,若您不了解配置规则,请勿随意修改</li>
				</ul>
			</el-tab-pane>

			<el-tab-pane label="版本切换" name="version">
				<div class="flex text-secondary items-center">
					<span>选择版本</span>
					<el-select class="mx-[12px] !w-[18rem]" v-model="version">
						<el-option v-for="(item, index) in versionList" :key="index" :label="'nginx ' + item.m_version" :value="item.m_version"></el-option>
					</el-select>
					<el-button type="primary" @click="switchVersion">切换</el-button>
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
							<div class="flex items-center" v-if="item.name != 'gzip'">
								<bt-input v-model="item.value" :type="item.name !== 'worker_processes' ? 'number' : ''"></bt-input>
								<span>{{ item.ps }}</span>
							</div>
							<div class="flex items-center" v-if="item.name == 'gzip'">
								<el-select v-model="item.value" class="!w-[8rem] mx-8px">
									<el-option label="开启" value="on"></el-option>
									<el-option label="关闭" value="off"></el-option>
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

			<el-tab-pane label="错误日志" name="logs">
				<bt-log
					:content="logMsg"
					:autoScroll="true"
					:isHtml="true"
					:full-screen="{
						title: '全屏查看日志',
						onRefresh: getErrLogsEvent,
					}"
					:style="'height:540px'"></bt-log>
			</el-tab-pane>
		</bt-tabs>
	</div>
</template>

<script setup lang="ts">
import Status from '@soft/public/environment-plugin/public/service-status/index.vue'
import Alert from '@soft/public/environment-plugin/public/status-stop-alert/index.vue'
import { performanceData, activeName, staticContent, textLoading, viewLoading, tableData, logMsg, version, versionList, saveNginxData, handleTabClick, getErrLogsEvent, switchVersion, saveFileEvent, init } from './useController'
import SOFT_SERVICE_STATUS_STORE from '../public/service-status/store'
import { getSoftStatus } from '@/api/global'

interface Props {
	compData: any
}
const props = withDefaults(defineProps<Props>(), {
	compData: {},
})

const { compData } = storeToRefs(SOFT_SERVICE_STATUS_STORE())

onMounted(() => {
	init(props.compData)
	compData.value.refreshEvent = async () => {
		const { data: res } = await getSoftStatus({ name: 'web' })
		compData.value.status = res.s_status
	}
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
:deep(.el-table.el-table--border .el-table__cell) {
	border-right: 1px solid var(--el-fill-color-dark) !important;
}
.el-divider {
	margin: 1rem 0 2rem 0;
}
</style>

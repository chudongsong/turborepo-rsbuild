<!--  -->
<template>
	<div>
		<bt-tabs v-model="tabActive" type="left-bg-card" position="left" class="h-full" @change="handleTabClick">
			<el-tab-pane label="服务" name="service">
				<div>
					<ServiceStatus></ServiceStatus>

					<!-- 状态停止告警 -->
					<StopAlert></StopAlert>

					<el-button v-if="!status" class="mt-4rem" @click="repairStartEvent">修复启动</el-button>

					<bt-help :options="[{ content: '如需更换mysql版本，请备份好数据后，卸载mysql重新安装' }]" class="pl-1rem">
						<li v-if="!status">如无法正常启动，请尝试使用修复启动按钮进行修复启动</li>
					</bt-help>

					<bt-dialog v-model="isRecoverPopup" :area="50" title="修复启动-恢复模式-innodb_force_recovery" show-footer @confirm="onConfirm">
						<div class="p-2rem">
							<div class="content flex items-center">
								<i class="svgtofont-el-warning-filled !text-[4rem] text-warning"></i>
								<div class="message flex-1 ml-4 py-[.3rem] leading-[2.4rem] text-base">
									<div class="text text-[15px] leading-[2.5rem] flex !flex-wrap break-all">
										{{ form.tips }}
									</div>
								</div>
							</div>
							<el-form :model="form" label-width="80px">
								<el-form-item label="恢复级别">
									<bt-select v-model="form.re_level" :options="levelOptions" class="!w-20rem"></bt-select>
								</el-form-item>
							</el-form>
							<bt-help :options="helpList.recover" class="pl-3rem"></bt-help>
						</div>
					</bt-dialog>
				</div>
			</el-tab-pane>
			<el-tab-pane label="配置文件" name="config" :lazy="true">
				<div v-bt-loading="isLoading">
					<span class="my-[4px] text-secondary"> 提示：Ctrl+F 搜索关键字，Ctrl+S 保存，Ctrl+H 查找替换 </span>
					<div class="my-[12px]">
						<bt-editor class="!h-[48rem] !w-full" v-model="staticContent" id="configContent" @save="saveFileEvent" />
					</div>
					<el-button type="primary" @click="saveFileEvent">保存</el-button>
					<bt-help :options="helpList.config" class="pl-2rem"></bt-help>
				</div>
			</el-tab-pane>
			<el-tab-pane label="存储位置" name="storage" :lazy="true">
				<div v-bt-loading="isLoading">
					<div class="flex text-secondary items-center">
						<bt-input-icon icon="icon-file_mode" @icon-click="onPathChange" width="32rem" v-model="mysqlData.path" class="!w-32rem"></bt-input-icon>
						<el-button class="ml-[12px]" @click="setMysqlConfig" type="primary">迁移</el-button>
					</div>
					<bt-help :options="helpList.storage" class="pl-2rem"></bt-help>
				</div>
			</el-tab-pane>
			<el-tab-pane label="端口配置" name="port" :lazy="true">
				<div v-bt-loading="isLoading" class="flex text-secondary items-center">
					<bt-input v-model="mysqlData.port" type="number" width="10rem" class="!w-10rem"></bt-input>
					<el-button type="primary" class="ml-[12px]" @click="setMysqlConfig">修改</el-button>
				</div>
			</el-tab-pane>
			<el-tab-pane label="当前状态" name="state" :lazy="true">
				<div v-bt-loading="isLoading">
					<el-descriptions class="margin-top table-descriptions" :column="2" border>
						<el-descriptions-item v-for="(item, index) in noPsTitle" :key="index">
							<template #label> {{ item.name }} </template>
							{{ item.value }}
						</el-descriptions-item>
					</el-descriptions>
					<el-table :data="psTitle" class="mt-[20px]" max-height="400">
						<el-table-column prop="name" label="字段" width="180"> </el-table-column>
						<el-table-column prop="value" label="当前值" width="100"> </el-table-column>
						<el-table-column prop="ps" label="注意"> </el-table-column>
					</el-table>
				</div>
			</el-tab-pane>
			<el-tab-pane label="性能调整" name="performance" :lazy="true">
				<div class="text-secondary performance" v-bt-loading="isLoading">
					<div class="flex items-center justify-center">
						优化方案
						<el-select class="!w-[12rem] mr-[20px] ml-8px" v-model="mysqlSelectData" @change="changeDbScheme" placeholder="自定义">
							<el-option v-for="(item, index) in mysqlSelect" :key="index" :value="index" :label="item.title"></el-option>
						</el-select>
						最大使用内存
						<bt-input text-type="MB" width="16rem" class="!w-16rem ml-8px" readonly v-model="mysqlUseMem"></bt-input>
					</div>
					<el-divider></el-divider>

					<el-form class="performance-form" label-position="right" label-width="146px">
						<el-form-item :label="item.name" v-for="(item, index) in performanceData" :key="index" v-show="item.ps">
							<div class="flex items-center">
								<bt-input v-model="item.value" width="16rem" class="!w-16rem" type="number" @change="changeMysqlInput"></bt-input>
								<span class="ml-2rem">{{ item.ps }}</span>
							</div>
						</el-form-item>
						<el-form-item label=" " class="mt-1rem">
							<el-button type="primary" @click="saveDbData">保存</el-button>
							<el-button @click="serviceManageEvent('restart')">重启数据库</el-button>
							<span class="ml-3rem">* 修改配置后，需重启数据库生效</span>
						</el-form-item>
					</el-form>
				</div>
			</el-tab-pane>
			<el-tab-pane label="错误日志" name="errorLogs" :lazy="true">
				<div v-bt-loading="isLoading">
					<el-button type="default" @click="clearLogsEvent">清空日志</el-button>
					<div class="my-[12px]">
						<bt-log
							class="!h-[56rem] !w-full"
							:content="content"
							id="errorLogs"
							:isHtml="true"
							:fullScreen="{
								title: `全屏查看【错误日志】`,
								onRefresh: getErrorLogs,
							}" />
					</div>
				</div>
			</el-tab-pane>
			<el-tab-pane label="慢日志" name="slowLogs" :lazy="true">
				<div v-bt-loading="isLoading" class="my-[12px]">
					<bt-log
						:content="content"
						:isHtml="true"
						class="!h-[60rem] !w-full"
						id="slowLogs"
						:fullScreen="{
							title: `全屏查看【慢日志】`,
							onRefresh: getSlowLogs,
						}" />
				</div>
			</el-tab-pane>
			<el-tab-pane label="二进制日志" name="binaryLogs" :lazy="true">
				<div>
					<div class="flex items-center">
						<div>
							二进制日志
							<el-switch v-model="binlogData.status" @change="changeBinlogStastus"></el-switch>
						</div>
						<span class="ml-[16rem]">{{ binlogData.size }}</span>
						<!-- <el-button @click="clearPopup = true" type="default">清理日志</el-button> -->
					</div>
					<el-divider></el-divider>
					<span> · 温馨提示：Mysql二进制日志是记录当前的操作日志，可用于数据恢复，数据备份。 </span>
					<el-table class="mt-[20px]" :data="binData" v-bt-loading="isLoading" max-height="500">
						<el-table-column prop="name" label="文件名"> </el-table-column>
						<el-table-column prop="size" label="大小">
							<template #default="scope">
								{{ getByteUnit(scope.row.size) }}
							</template>
						</el-table-column>
						<el-table-column prop="last_modified" label="最后修改时间">
							<template #default="scope">
								{{ formatTime(scope.row.last_modified) }}
							</template>
						</el-table-column>
						<el-table-column align="right" label="操作">
							<template #default="scope">
								<span class="bt-link" @click="delLogs(scope)">删除</span>
							</template>
						</el-table-column>
					</el-table>

					<bt-dialog title="清理日志" v-model="clearPopup" :area="42" showFooter @cancel="cancelButtonEvent" @confirm="clearBinlog">
						<div class="p-[20px]">
							<el-form :disabled="formDisabled" class="flex justify-center" label-position="right" :model="clearForm" ref="binlogFormRef" :rules="rules">
								<el-form-item label="清理周期" prop="days">
									<bt-input v-model="clearForm.days" type="number" :min="7" width="24" text-type="天"></bt-input>
								</el-form-item>
							</el-form>
							<ul class="leading-8 text-small list-disc ml-[48px]">
								<li>只能清理7天前的日志,请输入大于7的天数</li>
							</ul>
						</div>
					</bt-dialog>
				</div>
			</el-tab-pane>
			<el-tab-pane label="内存保护" name="memoryProtection" :lazy="true">
				<div>
					<div>
						内存保护
						<el-switch v-model="protectionMemory" @change="changeProtectionStatus"></el-switch>
					</div>
					<bt-help :options="helpList.memoryProtection" class="pl-2rem"></bt-help>
				</div>
			</el-tab-pane>
		</bt-tabs>
	</div>
</template>

<script setup lang="ts">
import StopAlert from '@soft/public/environment-plugin/public/status-stop-alert/index.vue'
import ServiceStatus from '@soft/public/environment-plugin/public/service-status/index.vue'
import { getByteUnit, formatTime } from '@utils/index'
import {
	tabActive,
	isRecoverPopup,
	form,
	isLoading,
	staticContent,
	mysqlData,
	noPsTitle,
	psTitle,
	mysqlSelectData,
	mysqlSelect,
	mysqlUseMem,
	performanceData,
	content,
	binlogFormRef,
	binlogData,
	clearPopup,
	binData,
	clearForm,
	protectionMemory,
	formDisabled,
	rules,
	levelOptions,
	helpList,
	repairStartEvent,
	onConfirm,
	saveFileEvent,
	onPathChange,
	setMysqlConfig,
	changeMysqlInput,
	changeDbScheme,
	saveDbData,
	serviceManageEvent,
	clearLogsEvent,
	delLogs,
	cancelButtonEvent,
	changeBinlogStastus,
	clearBinlog,
	changeProtectionStatus,
	handleTabClick,
	getSlowLogs,
	init,
	getErrorLogs,
} from './useController'
import { useCheckSoftStatus } from '@/views/database/useMethod'
import SOFT_SERVICE_STATUS_STORE from '../public/service-status/store'

const { compData } = storeToRefs(SOFT_SERVICE_STATUS_STORE())

interface Props {
	compData: any
}
const props = withDefaults(defineProps<Props>(), {
	compData: {},
})

const status = computed(() => compData.value.status)

onMounted(() => {
	init(props.compData)
	compData.value.refreshEvent = async () => {
		const res = await useCheckSoftStatus('mysql')
		compData.value.status = res.s_status
	}
})
</script>

<style lang="css" scoped>
.performance :deep(.el-input) {
	margin: 0 0.8rem;
}
.performance span {
	font-size: 1.2rem;
}
:deep(.performance-form .el-form-item) {
	margin-bottom: 0.4rem;
}
.el-divider {
	margin: 1rem 0 2rem 0;
}
</style>

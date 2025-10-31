<template>
	<div class="px-[2rem] py-[2.4rem]">
		<el-form v-bt-loading="isLoading" ref="addFtpInfo" :model="ruleForm" class="btCustomForm p-0" label-width="4rem" :rules="timedScanRules" @submit.native.prevent>
			<template v-if="isAutoScan">
				<el-form-item label="告警状态">
					<el-switch v-model="ruleForm.status" active-color="var(--el-color-primary)" inactive-color="#cdcdcd"></el-switch>
				</el-form-item>
			</template>
			<el-form-item label="安全风险项" prop="risk">
				<div class="condition-risk">
					<el-checkbox v-model="ruleForm.login_error">
						<span>多次登录失败</span>
						<el-tag type="info" class="risk-tag" :title="ruleForm.config.login_error_des">
							{{ ruleForm.config.login_error_des }}
						</el-tag>
					</el-checkbox>
					<el-checkbox v-model="ruleForm.time">
						<span>登录时间异常</span>
						<el-tag type="info" class="risk-tag" :title="ruleForm.config?.time_des">
							{{ ruleForm.config?.time_des }}
						</el-tag>
					</el-checkbox>
					<el-checkbox v-model="ruleForm.area">
						<span>登录地区异常</span>
						<el-tag type="info" class="risk-tag" :title="ruleForm.config?.area_des">
							{{ ruleForm.config?.area?.country.length ? ruleForm.config?.area_des : '未配置' }}
						</el-tag>
					</el-checkbox>
					<el-checkbox v-model="ruleForm.anonymous" :disabled="ruleForm.user === 'other' && !isAutoScan ? true : false">
						<span>匿名用户登录</span>
					</el-checkbox>
					<el-checkbox v-model="ruleForm.upload_shell">
						<span>上传脚本文件</span>
						<el-tag type="info" class="risk-tag" :title="ruleForm.config?.upload_shell_des">
							{{ ruleForm.config?.upload_shell?.length ? ruleForm.config?.upload_shell_des : '未配置' }}
						</el-tag>
					</el-checkbox>
					<span class="bt-link" @click="openLogsSetScanConditionEvent"> 【设置扫描触发条件】 </span>
				</div>
			</el-form-item>
			<template v-if="!isAutoScan">
				<el-form-item label="扫描日志天数" prop="otherDay">
					<bt-radio type="button" size="small" v-model="ruleForm.day" :options="scanWeekOption" />
					<bt-input type="number" v-model.number="ruleForm.otherDay" v-if="ruleForm.day === 'other'" class="!inline-block ml-[1rem]"></bt-input>
				</el-form-item>
				<el-form-item label="FTP用户" prop="userList">
					<div class="flex items-center">
						<bt-select class="!w-[16rem]" v-model="ruleForm.user" :options="userOption" @change="userChange" />
						<bt-select class="ml-[1rem]" v-if="ruleForm.user === 'other'" multiple collapse-tags filterable v-model="ruleForm.userList" :options="userOptions" />
					</div>
				</el-form-item>
			</template>
			<template v-else>
				<el-form-item v-show="false" label="周期" prop="cycle">
					<el-input class="max-w-[16rem]" v-model="ruleForm.cycle" :min="1" type="number">
						<template #append>
							<el-row type="flex">
								<el-col>
									<span>天</span>
								</el-col>
							</el-row>
						</template>
					</el-input>
				</el-form-item>
				<el-form-item label="告警方式" prop="channel">
					<BtAlarmSelect v-model="ruleForm.channel" :multiple="true" class="!w-30rem" :limit="['wx_account', 'sms']"></BtAlarmSelect>
				</el-form-item>
			</template>
		</el-form>
		<div class="tip">
			<ul>
				<template v-if="isAutoScan">
					<li>默认扫描全部用户30天的日志</li>
				</template>
				<li>【多次登录失败】检测时间为：5分钟</li>
			</ul>
		</div>
	</div>
</template>

<script lang="tsx" setup>
import { ElCheckbox, ElTag } from 'element-plus'
import { initTimeScan, onTimedScanConfirm, openLogsSetScanConditionEvent, scanWeekOption, timedScanRules, userChange, userOption } from './useMethod'
import { useFtpAnalysisStore } from './useStore'

const { isAutoScan, ruleForm, userOptions, isLoading, addFtpInfo } = useFtpAnalysisStore()

onMounted(initTimeScan)

defineExpose({ onConfirm: onTimedScanConfirm })
</script>

<style lang="css" scoped>
:deep(.risk-tag) {
	@apply ml-[1rem] max-w-[12rem] truncate;
}
:deep(.el-tag__content) {
	@apply truncate leading-[2.4rem];
}

:deep(.condition-risk) {
	@apply grid grid-cols-2 gap-x-[2rem];
}

.tip {
	@apply mt-[3rem] ml-[2.6rem];
}

.tip ul {
	@apply list-disc;
}

.tip li {
	@apply list-inside leading-[2.4rem] text-secondary;
}
</style>

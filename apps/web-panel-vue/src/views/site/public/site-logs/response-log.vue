<template>
	<div class="h-full">
		<template v-if="isBindExtranet">
			<div v-if="siteType !== 'proxy'" class="flex items-center justify-between pb-1.6rem">
				<div class="flex items-center" v-bt-loading="logLoading">
					<template v-if="siteType !== 'python'">
						<el-switch @change="changeSwitch" v-model="responseLogData.alert"></el-switch>
						<span class="ml-[8px]">
							关键字告警
							<span class="!inline-block bt-link" @click="openKeywordsView"> [配置] </span>
						</span>
						<el-divider direction="vertical" class="!h-2rem !mx-1.6rem"></el-divider>
					</template>
					<template v-if="enterpriseRec">
						<el-checkbox @change="changeIpShow" v-model="responseLogData.showIp">
							<div class="flex items-center">
								显示IP归属地信息
								<bt-icon icon="icon-ltd" :size="16" color="#9B7E48" class="ml-[4px]"></bt-icon>
							</div>
						</el-checkbox>
					</template>
					<template v-if="siteType === 'php'">
						<el-divider direction="vertical" class="!h-2rem !mx-1.6rem"></el-divider>
						<el-popover trigger="click" placement="bottom" popper-class="white-tips-popover" width="400" v-model:visible="pathPopover">
							<div class="flex items-center p-[12px]">
								<bt-input-icon placeholder="请输入日志路径" v-model="logsPathValue" @icon-click="onPathChange" icon="el-folder-opened"></bt-input-icon>
								<el-button type="primary" class="!ml-[8px]" @click="saveResLogPath()"> 保存 </el-button>
							</div>
							<template #reference>
								<el-button type="default">更改日志路径</el-button>
							</template>
						</el-popover>
					</template>
				</div>

				<!-- 刷新按钮 -->
				<el-button type="primary" @click="() => getResLogs()">刷新日志</el-button>
			</div>

			<div v-if="siteType === 'proxy'" class="mb-[16px]">日志大小：{{ responseLogData.size }}</div>

			<bt-log
				v-bt-loading="logLoading"
				:content="responseLogData.logs"
				:isHtml="true"
				:fullScreen="{
					title: `全屏查看[响应]日志`,
					onRefresh: getResLogs,
				}"
				:style="{ height: siteType === 'php' ? '52rem' : '56rem', width: '99.5%' }" />
			<div v-if="webServerType === 'nginx' && siteType === 'php'" class="mt-1rem">
				* 若网站开启cdn导致日志<span class="text-danger">来源IP</span>解析错误，可前往[
				<span class="cursor-pointer bt-link" @click="phpAdvancedSettingsDialog('globalSetting')">全局设置</span>
				]打开cdn来源IP解析
			</div>
		</template>
		<div class="bg-light flex items-center justify-center h-full" style="min-height: 500px" v-else>
			<div class="bg-lighter px-[48px] py-[16px] text-default flex items-center">
				请开启
				<bt-link class="mx-[.4rem]" @click="jumpTabEvent('mapping')"> 外网映射 </bt-link>
				后查看
			</div>
		</div>
		<bt-dialog title="关键字告警配置" @confirm="setPushTask(alertSetForm, 'confirm')" @cancel="cancelPopup" v-model="alertPopup" :area="46" showFooter>
			<div class="p-[20px]">
				<el-form label-position="right" :model="alertSetForm" :rules="rules" ref="alertSetFormRef">
					<el-form-item label="周期" prop="cycle">
						<bt-input v-model="alertSetForm.cycle" type="number" :min="1" width="24rem" text-type="分钟"></bt-input>
					</el-form-item>
					<el-form-item label="关键字" prop="keys">
						<bt-input v-model="alertSetForm.keys" type="textarea" resize="none" :row="6" width="24rem"></bt-input>
					</el-form-item>
					<el-form-item label="告警方式" prop="channel">
						<bt-alarm-select v-model="alertSetForm.channel" :multiple="true" :limit="['sms']" class="!w-[24rem]"></bt-alarm-select>
					</el-form-item>
				</el-form>
				<ul class="mt-[8px] leading-8 text-small list-disc ml-[20px]">
					<li>检查时只检查间隔时间内的日志内容</li>
					<li>周期时间请勿设置太小，建议10分钟以上以免导致服务器资源异常</li>
				</ul>
			</div>
		</bt-dialog>
	</div>
</template>

<script setup lang="tsx">
import BtAlarmSelect from '@/components/business/bt-alarm-select/index.vue'
import BtLog from '@/components/extension/bt-log/index.vue'
import { useSiteStore, SITE_STORE } from '@site/useStore'
import { alertPopup, changeIpShow, getResLogs, initResLog, logLoading, logsPathValue, onPathChange, pathPopover, responseLogData, saveResLogPath, setPushTask, changeSwitch, alertSetForm, alertSetFormRef, openKeywordsView, rules, cancelPopup } from './useController'
import { useGlobalStore } from '@/store/global'
import { phpAdvancedSettingsDialog } from '@site/views/php-model/useController'

const { plugin, enterpriseRec } = useGlobalStore()
const { webserver: webServerType } = toRefs(plugin.value)
const { isBindExtranet, siteType } = useSiteStore()
const { jumpTabEvent } = SITE_STORE()
onMounted(initResLog)

defineExpose({
	init: initResLog,
})
</script>

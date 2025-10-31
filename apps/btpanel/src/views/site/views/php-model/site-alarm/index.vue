<!-- 拨测告警 -->
<template>
	<bt-table-group>
		<template #header-left>
			<el-button type="primary" @click="addAlertEvent"> 添加拨测告警 </el-button>
		</template>
		<template #header-right>
			<bt-table-refresh @refresh="getAlarmListEvent"></bt-table-refresh>
		</template>
		<template #content>
			<bt-table :column="tableColumns" :data="tableData" v-bt-loading="tableLoading" />
		</template>
		<template #footer-left>
			<!-- 批量操作 -->
		</template>
		<template #footer-right>
			<bt-table-page v-model:page="tableParams.p" v-model:row="tableParams.limit" :total="tableParams.total" @change="getAlarmListEvent()"></bt-table-page>
		</template>
		<template #popup>
			<bt-dialog title="拨测告警" v-model="dialingTestPopup" :area="54" showFooter @cancel="cancelForm" @confirm="onConfirm">
				<div class="p-[20px]">
					<el-alert type="success" :closable="false">
						<template #title>
							<div class="text-secondary text-small py-[8px]">
								<div>
									<b>本地测试</b>
									：本机发送请求，可能导致测试结果不准确等结果
								</div>
								<div>
									<b>多节点测试</b>
									（推荐）：通过宝塔部署在全国的多个节点上来实现更全面的覆盖和测试
								</div>
							</div>
						</template>
					</el-alert>
					<el-form label-position="right" ref="boceFormRef" :model="dialingTestForm" class="mt-[16px]" :rules="rules">
						<el-form-item label="监控网站URL" prop="url">
							<el-select class="!w-[32rem]" v-model="dialingTestForm.url" @change="handleChangeName">
								<el-option v-for="(item, index) in domainOptions" :key="index" :label="item.name" :value="item.name"></el-option>
							</el-select>
						</el-form-item>
						<el-form-item label="任务名称" prop="name">
							<bt-input v-model="dialingTestForm.name" width="32rem"></bt-input>
						</el-form-item>
						<el-form-item label="检测节点" prop="address">
							<el-radio-group class="node-custom-radio" v-model="dialingTestForm.address" @change="handleChangeMethod">
								<el-radio-button value="localhost" :disabled="dialingTestForm.id ? true : false"> 本地测试 </el-radio-button>
								<el-radio-button value="node" :disabled="dialingTestForm.id ? true : false">
									<div class="flex items-center justify-center">
										<bt-icon icon="icon-ltd" color="#A88E5F" class="mr-[4px]"></bt-icon>
										多节点测试
									</div>
								</el-radio-button>
							</el-radio-group>
						</el-form-item>
						<el-form-item label="监控频率" prop="cycle">
							<bt-input text-type="分钟" v-model="dialingTestForm.cycle" type="number" :min="10"></bt-input>
						</el-form-item>
						<el-form-item label="告警类型" prop="method">
							<el-select :disabled="dialingTestForm.id ? true : false" class="!w-[32rem]" v-model="dialingTestForm.method" @change="handleChangeType">
								<el-option v-for="(item, index) in typeOptions" :key="index" :label="item.name" :value="item.id"></el-option>
							</el-select>
						</el-form-item>
						<el-form-item label=" " v-if="['delay', 'keyword'].includes(dialingTestForm.method)" prop="methodData">
							<div class="flex items-center">
								<span class="inline-block text-secondary text-small mr-[4px]">
									{{ dialingTestForm.method === 'delay' ? '平均响应延迟大于' : '当响应内容不包含' }}
								</span>
								<bt-input :disabled="dialingTestForm.id ? true : false" v-model="dialingTestForm.methodData" width="18rem" class="w-18rem" placeholder="请输入关键词,分割"></bt-input>
								<span class="ml-4px">
									{{ dialingTestForm.method === 'delay' ? 'ms' : '内容，触发告警' }}
								</span>
							</div>
						</el-form-item>
						<el-form-item label=" " v-if="['size', 'status_code'].includes(dialingTestForm.method)">
							<span class="inline-block text-secondary text-small mr-[4px]" v-if="dialingTestForm.method === 'size'"> 网站大小变化告警 当网站响应内容大小发生变化达到20%时，将触发告警 </span>
							<span class="inline-block text-secondary text-small mr-[4px]" v-else> 当网站响应状态不为正常状态(200、300、302)，将触发告警 </span>
						</el-form-item>
						<el-form-item label="告警次数" prop="alarm_count">
							<div class="flex items-center">
								<span class="inline-block text-secondary text-small mr-[4px]"> 每日最多触发 </span>
								<bt-input text-type="次" width="12rem" class="w-12rem" type="number" :min="1" v-model="dialingTestForm.alarm_count"></bt-input>
								<span class="ml-4px">告警</span>
							</div>
						</el-form-item>
						<el-form-item label="告警方式" prop="channel">
							<bt-alarm-old-select v-model="dialingTestForm.channel" :limit="['sms']" :needAll="false" name="channel" class="!w-32rem" @change="onGiveSelect" />
						</el-form-item>
					</el-form>
				</div>
			</bt-dialog>

			<bt-dialog :title="'查看扫描拨测结果-' + siteInfo.name" v-model="resultPopup" :area="120">
				<div class="p-[20px]">
					<bt-table :column="resultColumn" :data="resultData" :max-height="500"></bt-table>
				</div>
			</bt-dialog>
			<bt-dialog :title="`查看任务记录【${logParams.url}】`" v-model="logPopup" :area="82">
				<div class="p-[20px]">
					<bt-table-group>
						<template #content>
							<bt-table :column="logColumns" :data="logData"></bt-table>
						</template>
						<template #footer-right>
							<bt-table-page v-model:page="logParams.p" v-model:row="tableParams.limit" :total="logParams.total" layout="prev, pager, next, total" @change="getBoceLogEvent()"></bt-table-page>
						</template>
					</bt-table-group>
				</div>
			</bt-dialog>
		</template>
	</bt-table-group>
</template>

<script setup lang="tsx">
import { useSiteStore } from '@/views/site/useStore'
import {
	addAlertEvent,
	boceFormRef,
	cancelForm,
	dialingTestForm,
	dialingTestPopup,
	domainOptions,
	getAlarmListEvent,
	getAlarmOption,
	getBoceLogEvent,
	handleChangeMethod,
	handleChangeName,
	handleChangeType,
	logColumns,
	logData,
	logParams,
	logPopup,
	onConfirm,
	onGiveSelect,
	resultColumn,
	resultData,
	resultPopup,
	rules,
	tableColumns,
	tableData,
	tableLoading,
	tableParams,
	typeOptions,
} from './useController'

const { siteInfo } = useSiteStore() // 全局数据

const init = () => {
	getAlarmListEvent()
	getAlarmOption()
}
onMounted(init)
defineExpose({ init })
</script>

<style lang="css" scoped>
:deep(.node-custom-radio .el-radio-button__inner) {
	@apply h-[3.2rem] px-[1.6rem]  flex items-center;
}
</style>

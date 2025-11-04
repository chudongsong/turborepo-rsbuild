<template>
	<section>
		<div class="text-large mb-6">安全总览</div>
		<el-row>
			<el-col :span="13">
				<!-- 概览分数 -->
				<TotalScore />
			</el-col>
			<el-col :span="11">
				<!-- 防御信息 -->
				<DefenseInfo />
			</el-col>
		</el-row>
		<el-row>
			<el-col :span="13">
				<!-- 待处理告警 -->
				<PendingAlarm ref="pendingAlarm" />
			</el-col>
			<el-col :span="11">
				<!-- 待处理风险 -->
				<PendingRisk />
			</el-col>
		</el-row>
		<el-divider direction="horizontal" class="!my-0"></el-divider>
		<el-row>
			<el-col :span="14">
				<!-- 安全趋势 -->
				<SecurityTrend ref="securityTrend" />
			</el-col>
			<el-col :span="10">
				<!-- 安全动态 -->
				<SecurityDynamic ref="securityDynamic" />
			</el-col>
		</el-row>
	</section>
</template>
<script lang="ts" setup>
import TotalScore from './totalScore.vue'
import DefenseInfo from './defenseInfo.vue'
import PendingAlarm from './pendingAlarm.vue'
import PendingRisk from './pendingRisk.vue'
import SecurityTrend from './securityTrend.vue'
import SecurityDynamic from './securityDynamic.vue'

import HOME_SECURITY_OVERVIEW_STORE from './store'
import HOME_SECURITY_RISKS_STORE from '../store'

const store = HOME_SECURITY_RISKS_STORE()
const overviewStore = HOME_SECURITY_OVERVIEW_STORE()
const { repairTypeActive } = storeToRefs(store)
const pendingAlarm = ref()
const securityTrend = ref()
const securityDynamic = ref()

watch(
	repairTypeActive,
	val => {
		if (val === 'overview') {
			nextTick(() => {
				overviewStore.getSafeOverviewData()
				pendingAlarm.value.setData()
				securityTrend.value.setData()
				securityDynamic.value.getListData()
			})
		}
	},
	{
		immediate: true,
	}
)
</script>

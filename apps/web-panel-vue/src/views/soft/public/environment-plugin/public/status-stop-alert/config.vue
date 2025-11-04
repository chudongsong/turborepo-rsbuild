<template>
	<div class="p-2rem">
		<el-form ref="alertFormRef" :model="alertForm" label-width="80px" :rules="rules">
			<el-form-item label="停止告警">
				<el-switch v-model="alertForm.status"></el-switch>
			</el-form-item>
			<el-form-item label="自动重启">
				<bt-radio type="radio" v-model="alertForm.count" :options="countOptions"></bt-radio>
			</el-form-item>
			<el-form-item label="间隔时间" prop="interval">
				<div class="flex items-center">
					<bt-input type="number" v-model="alertForm.interval" min="60" text-type="秒" width="14rem" class="w-14rem mr-8px"></bt-input>
					后再次监控检测条件
				</div>
			</el-form-item>
			<el-form-item label="发送次数" prop="day_num">
				<div class="flex items-center">
					<bt-input type="number" v-model="alertForm.day_num" min="0" text-type="次" width="14rem" class="w-14rem mr-8px"></bt-input>
					后，当日不再发送，次日恢复
				</div>
			</el-form-item>
			<el-form-item label="告警方式" prop="sender">
				<bt-alarm-select ref="alarmRef" v-model="alertForm.sender" :limit="['sms']" class="!w-[33rem]"></bt-alarm-select>
			</el-form-item>
		</el-form>
		<bt-help class="pl-3rem leading-2rem">
			<li>开启该告警后，若该插件状态停止，将会使用您选中的告警方式发送告警信息</li>
			<li>
				<div class="flex items-center">点击安装后状态未更新，尝试点击【<bt-link @click="alarmRefreshEvent">手动刷新</bt-link>】</div>
			</li>
		</bt-help>
	</div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import SOFT_STATUS_STOP_ALERT from './store'

const store = SOFT_STATUS_STOP_ALERT()
const { alertFormRef, alarmRef, alertForm, rules } = storeToRefs(store)
const { countOptions, alarmRefreshEvent } = store
</script>

<style scoped></style>

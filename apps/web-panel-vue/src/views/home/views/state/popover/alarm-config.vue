<template>
	<div class="px-[2rem] py-[4rem] give-dialog">
		<el-form :model="msgForm" :rules="rules" ref="giveFormRef" :disabled="giveFormDisabled">
			<el-form-item label="任务类型">
				<el-input class="!w-[30rem]" v-model="inputContent" :readonly="true" disabled></el-input>
			</el-form-item>
			<el-form-item v-if="type.indexOf('disk') !== -1" label="检测类型">
				<el-radio-group v-model="msgForm.typeDetection" @change="store.switchTypeDetection">
					<el-radio label="2">占用百分比</el-radio>
					<el-radio label="1">剩余容量</el-radio>
				</el-radio-group>
			</el-form-item>
			<el-form-item :label="typeName" prop="usageRate">
				<div class="flex items-center">
					<bt-input class="!w-[12rem]" v-model="msgForm.usageRate" :min="0" :max="maxCapacityAndUsageRate" type="number">
						<template #append>
							<span v-if="type.indexOf('disk') !== -1" class="text-tertiary">{{ unitComputed }}</span>
							<span v-else class="text-tertiary">%</span>
						</template>
					</bt-input>
					<span v-if="type.indexOf('cpu') > -1" class="text-[#999] ml-1.6rem text-[1.2rem]"> 每5分钟平均CPU超过该数值就告警 </span>
					<span v-else-if="type.indexOf('disk') === -1" class="text-[#999] ml-1.6rem text-[1.2rem]"> 每5分钟平均负载超过该数值就告警 </span>
					<span v-else class="text-[#999] ml-1.6rem text-[1.2rem]"> 每隔10分钟磁盘占用超过该数值就告警 </span>
				</div>
			</el-form-item>
			<el-form-item label="发送次数" prop="num">
				<div class="flex items-center">
					<bt-input class="!w-[12rem]" v-model="msgForm.num" :min="0" type="number">
						<template #append>
							<span class="text-tertiary">次</span>
						</template>
					</bt-input>
					<span class="text-tertiary ml-1.6rem text-small"> 后将不再发送告警信息，如需发送多次请填写2次以上 </span>
				</div>
			</el-form-item>
			<el-form-item label="告警后执行" prop="next_data" v-if="type.indexOf('disk') === -1">
				<bt-select v-model="msgForm.next_data" :options="nextOptions" class="!w-[30rem]" multiple></bt-select>
			</el-form-item>
			<el-form-item label="告警方式" prop="give">
				<bt-alarm-select class="!w-[30rem]" v-model="msgForm.give" />
			</el-form-item>
		</el-form>
		<div class="tip">
			<ul>
				<li>【发送次数】设置0时，每天触发告警次数没有上限</li>
			</ul>
		</div>
	</div>
</template>
<script setup lang="ts">
import HOME_STATE_POPOVER_STORE from './store'
import { storeToRefs } from 'pinia'

const store = HOME_STATE_POPOVER_STORE()
const { giveFormDisabled, giveFormRef, msgForm, maxCapacityAndUsageRate, options, nextOptions, rowData } = storeToRefs(store)
const { type, data, id } = rowData.value

const rules = {
	num: [
		{ required: true, message: '请输入发送次数', trigger: 'blur' },
		{ pattern: /^[0-9]\d*$/, message: '请输入正整数', trigger: 'blur' },
	],
	usageRate: [
		{ required: true, message: '请输入告警阈值', trigger: 'blur' },
		{ pattern: /^[0-9]\d*$/, message: '请输入正整数', trigger: 'blur' },
	],
	give: [{ required: true, message: '请至少选择一个告警方式', trigger: 'change' }],
}

// 任务类型名称
const inputContent = computed(() => {
	switch (type) {
		case 'load':
			return '【负载状态】告警'
		case 'cpu':
			return '【CPU使用率】告警'
		case 'mem':
			return '【内存使用率】告警'
	}
	if (type.indexOf('disk') !== -1) {
		return `磁盘【${type.split('-')[1]}】告警`
	}
})

// 任务类型参数名称
const typeName = computed(() => {
	switch (type) {
		case 'load':
			return '负载状态'
		case 'cpu':
			return '使用率'
		case 'mem':
			return '使用率'
	}
	if (type.indexOf('disk') !== -1) {
		if (data.cycle === 2 || msgForm.value.typeDetection === '2') {
			return '占用率'
		} else {
			return '剩余容量'
		}
	}
})

// 任务类型参数单位
const unitComputed = computed(() => {
	return msgForm.value.typeDetection === '2' ? '%' : 'GB'
})

watch(
	() => rowData.value,
	() => {
		store.alarmInfo()
	}
)

onMounted(async () => {
	store.alarmInfo()
})
</script>

<style lang="css" scoped>
.tip {
	@apply mt-[15px] ml-[26px];
}
.tip ul {
	list-style: disc;
}
.tip li {
	list-style: inside disc;
	line-height: 24px;
	color: var(--el-color-text-secondary);
}
</style>

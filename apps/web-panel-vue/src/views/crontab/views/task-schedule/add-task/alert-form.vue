<template>
	<el-form ref="formDataRef" :rules="timeRule" :inline="true" :model="timeForm" label-width="100px" class="demo-form-inline">
		<el-form-item label="执行周期">
			<div class="flex items-center">
				<el-select @change="handleTypeChange" class="!w-[8rem] mr-1rem" v-model="timeForm.type">
					<el-option v-for="(item, index) in timeType" :key="index" :label="item.text" :value="item.type"> </el-option>
				</el-select>

				<el-form-item v-if="timeForm.type == 'week'" class="el-form-item-item !mr-1rem">
					<el-select class="!w-[8rem]" v-model="timeForm.week">
						<el-option label="周一" :value="1"></el-option>
						<el-option label="周二" :value="2"></el-option>
						<el-option label="周三" :value="3"></el-option>
						<el-option label="周四" :value="4"></el-option>
						<el-option label="周五" :value="5"></el-option>
						<el-option label="周六" :value="6"></el-option>
						<el-option label="周日" :value="7"></el-option>
					</el-select>
				</el-form-item>

				<el-form-item v-if="timeType[cycleTime]?.showDay" class="el-form-item-item !mr-1rem" prop="where1">
					<bt-input v-model="timeForm.where1" :min="1" width="10rem" type="number">
						<template #append> 天 </template>
					</bt-input>
				</el-form-item>
				<el-form-item v-if="timeType[cycleTime]?.showHour" class="el-form-item-item !mr-1rem" prop="hour">
					<bt-input v-model="timeForm.hour" width="10rem" max="23" min="0" type="number">
						<template #append> 小时 </template>
					</bt-input>
				</el-form-item>
				<el-form-item v-if="timeType[cycleTime]?.showMinute" class="el-form-item-item" prop="minute">
					<bt-input v-model="timeForm.minute" width="10rem" max="59" min="0" type="number">
						<template #append> 分钟 </template>
					</bt-input>
				</el-form-item>
			</div>
		</el-form-item>
	</el-form>
</template>

<script lang="ts" setup>
import { handleTypeChange, timeType, timeForm, formDataRef, cycleTime, timeRule } from './useController'

onMounted(() => handleTypeChange(timeForm.type, true))
defineExpose({ timeForm, formDataRef })
</script>

<style lang="css" scoped>
:deep(.el-input-group__append) {
	padding: 0 10px !important;
}
:deep(.week-css .el-input__inner) {
	height: 32px !important;
}
</style>

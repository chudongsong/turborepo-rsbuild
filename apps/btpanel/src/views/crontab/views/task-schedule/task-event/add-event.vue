<template>
	<div class="p-20px">
		<el-form ref="taskEventRef" label-width="80px" :model="taskEventForm" :rules="rules">
			<el-form-item label="当执行结果">
				<div class="flex items-center">
					<el-select v-model="taskEventForm.operator" class="!w-[16rem]">
						<el-option label="包含" value="in"></el-option>
						<el-option label="不包含" value="not in"></el-option>
						<el-option label="等于" value="="></el-option>
						<el-option label="不等于" value="!="></el-option>
						<el-option label="大于" value=">"></el-option>
						<el-option label="大于等于" value=">="></el-option>
						<el-option label="小于" value="<"></el-option>
						<el-option label="小于等于" value="<="></el-option>
					</el-select>
					<el-form-item label="" prop="op_value"><bt-input v-model="taskEventForm.op_value" class="ml-[6px]" placeholder="请输入比较值"></bt-input></el-form-item>
				</div>
			</el-form-item>
			<el-form-item label="运行" prop="run_script_id">
				<div class="flex items-center">
					<el-select class="mr-12px !w-[16rem]" v-model="taskEventForm.on">
						<el-option label="脚本库" value="script"></el-option>
						<!-- <el-option label="自定义脚本" value="0"></el-option> -->
					</el-select>

					<el-cascader
						:show-all-levels="false"
						@change="changeScript"
						@expand-change="expandChange"
						@visible-change="setLabelClick"
						class="!w-[24rem]"
						popper-class="task-cascader"
						v-model="taskEventForm.run_script_id"
						ref="scriptSectionRef"
						:props="{
							label: 'name',
							value: 'script_id',
							children: 'script_list',
							multiple: true,
							checkStrictly: true,
						}"
						:options="scriptLibraryData"
						placeholder="请选择脚本,支持搜索"
						collapse-tags
						collapse-tags-tooltip
						filterable>
					</el-cascader>
				</div>
			</el-form-item>
			<el-form-item :label="argsForm.args_title" v-if="argsForm.is_args" prop="args">
				<bt-input :placeholder="argsForm.args_holder" v-model="taskEventForm.args" width="32.2rem"></bt-input>
			</el-form-item>
		</el-form>
	</div>
</template>

<script setup lang="ts">
import { rules, argsForm, scriptLibraryData, scriptSectionRef, expandChange, setLabelClick, initAddEvent, $reset_event_form, taskEventRef, onConfirm, changeScript, taskEventForm } from './useController'
onMounted(initAddEvent)
onUnmounted($reset_event_form)
defineExpose({ onConfirm })
</script>

<style lang="css">
.task-cascader li[aria-haspopup='true'] .el-checkbox {
	display: none;
}
.el-cascader__tags {
	@apply flex-nowrap items-center;
}
</style>

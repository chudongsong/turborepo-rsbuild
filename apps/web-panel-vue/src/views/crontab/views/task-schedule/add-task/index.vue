<template>
	<div class="p-20px">
		<el-form ref="taskArrangementRef" label-position="right" :rules="rules" label-width="100px" :model="taskForm">
			<el-form-item label="名称" prop="name">
				<bt-input v-model="taskForm.name" width="32.2rem" placeholder="请输入任务名称"></bt-input>
			</el-form-item>
			<AlertForm ref="alertFormRef"></AlertForm>
			<el-form-item v-if="timeForm.type === 'custom'" label="crontab表达式" prop="crontab_expression">
				<bt-input v-model="taskForm.crontab_expression" width="30rem" placeholder="请输入crontab表达式"></bt-input>
			</el-form-item>

			<el-form-item>
				<div class="flex definePicker">
					<el-form-item label="开始时间">
						<el-date-picker class="picker" v-model="taskForm.start_time" value-format="YYYY-MM-DD HH:mm:ss" :disabled-date="disabledDate" type="datetime" width="12rem" placeholder="请选择开始时间"> </el-date-picker>
					</el-form-item>
					<el-form-item prop="exec_count" label="执行次数" label-width="0" class="!mt-0 anotherClass">
						<div class="text-small flex items-center number">
							<bt-input v-model="taskForm.exec_count" width="13.4rem" :min="0" type="number">
								<template #append> 次 </template>
							</bt-input>
						</div>
					</el-form-item>
				</div>
			</el-form-item>
			<el-form-item label="运行">
				<div>
					<div>
						<el-select class="mr-12px !w-[12rem]" v-model="taskForm.on" @change="changeScriptType">
							<el-option label="脚本库" value="script"></el-option>
							<el-option label="自定义脚本" value="0"></el-option>
						</el-select>
						<el-form-item v-if="taskForm.on === 'script'" prop="script_id" class="!inline-block">
							<el-cascader
								class="w-[19rem]"
								@change="changeScript"
								:show-all-levels="false"
								ref="scriptCascaderRef"
								v-model="taskForm.script_id"
								:props="{
									label: 'name',
									value: 'script_id',
									children: 'script_list',
								}"
								placeholder="请选择脚本,支持搜索"
								:options="scriptData"
								filterable></el-cascader>
						</el-form-item>
					</div>
					<bt-editor class="mt-12px !h-[12rem] !w-[32.2rem]" v-if="taskForm.on === '0'" v-model="taskForm.script_body" :is-zoom="true" />
				</div>
			</el-form-item>
			<el-form-item label="备注">
				<bt-input placeholder="请输入备注" v-model="taskForm.ps" width="32.2rem"></bt-input>
			</el-form-item>
			<el-form-item :label="argsForm.args_title" v-if="argsForm.is_args" prop="args">
				<bt-input :placeholder="argsForm.args_holder" v-model="taskForm.args" width="32.2rem"></bt-input>
			</el-form-item>

			<!-- 提示数据组 -->
			<el-form-item label="温馨提示">
				<div class="min-h-[3.2rem] flex items-center">
					<bt-help :options="helpList" list-style="disc" class="ml-12px text-small mt-0"> </bt-help>
				</div>
			</el-form-item>
		</el-form>
	</div>
</template>

<script setup lang="ts">
import AlertForm from './alert-form.vue'
import { alertFormRef, scriptCascaderRef, taskArrangementRef, argsForm, rules, helpList, initAddTask, scriptData, disabledDate, changeScript, changeScriptType, $reset_add_task, onConfirm, timeForm, taskForm } from './useController'
defineExpose({ onConfirm })
onMounted(initAddTask)
onUnmounted($reset_add_task)
</script>

<style lang="css" scoped>
:deep(.el-cascader-panel) {
	@apply text-small !important;
}

:deep(.definePicker .el-input--small input.el-input__inner) {
	@apply pl-[3rem] !important;
}

:deep(.definePicker .number .el-input--small input.el-input__inner) {
	@apply pl-[1rem] !important;
}

:deep(.el-form .el-form-item--small .el-form-item__label) {
	@apply min-w-[6rem] !important;
}
</style>

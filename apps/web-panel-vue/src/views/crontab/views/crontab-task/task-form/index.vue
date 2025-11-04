<!--  -->
<template>
	<div class="p-2rem">
		<BtForm>
			<!-- 此插槽为特殊情况下的表单项，非必要请不要在这个位置添加代码 -->
			<!-- 此插槽为特殊情况下的表单项，非必要请不要在这个位置添加代码 -->
			<!-- 此插槽为特殊情况下的表单项，非必要请不要在这个位置添加代码 -->
			<template #custom>
				<!-- 发送post请求,动态表格行 -->
				<el-form-item label="参数配置" v-if="formValue.sType === 'to_post'">
					<div class="w-[60rem]">
						<el-table ref="paramTableRef" class="param-table" :data="postParam" :row-class-name="rowClassName" max-height="200" @selection-change="handleDetailSelectionChange">
							<el-table-column label="参数名" prop="paramName" width="240">
								<template #default="{ row }">
									<bt-input v-model="row.paramName" type="text" size="small"></bt-input>
								</template>
							</el-table-column>

							<el-table-column label="参数值" prop="paramValue">
								<template #default="{ row }">
									<bt-input v-model="row.paramValue" type="text" size="small"></bt-input>
								</template>
							</el-table-column>
							<el-table-column label="操作" align="right" width="70">
								<template #default="{ row, index }">
									<span class="bt-link" @click="deleteParam(row, index)">删除</span>
								</template>
							</el-table-column>
						</el-table>
						<el-button type="primary" size="small" class="!mt-[1rem]" @click="addParam"> <i class="svgtofont-el-plus text-white font-bold mr-[0.4rem]"></i>添加参数 </el-button>
					</div>
				</el-form-item>
			</template>
		</BtForm>
	</div>
</template>

<script setup lang="tsx">
import { useForm } from '@/hooks/tools'
import { FormCustom, FormGroup, FormInput, FormSelect } from '@/hooks/tools/form/form-item'
import { alarmFormItem, taskTypeOptions, switchTaskType, submitForm, setTimeForm, alertForm, clearTimeForm, timeForm } from './useController'
import { ElPopover } from 'element-plus'
import { postParam, rowClassName, paramTableRef, handleDetailSelectionChange, addParam, deleteParam } from './form-type/to-post'
import CRONTAB_TASK_STORE from '../useStore'

const { rowData, typeInit } = storeToRefs(CRONTAB_TASK_STORE())

// 是否禁用任务名称
const disableName = computed(() => {
	const arr = ['logs', 'webshell', 'site_restart', 'path', 'site', 'database', 'enterpriseBackup']
	return arr.includes(formValue.value.sType)
})

// 是否显示执行周期
const showCycle = computed(() => {
	const arr = ['site_restart']
	return !arr.includes(formValue.value.sType)
})

// 是否为编辑状态
const isEdit = computed(() => rowData.value && rowData.value.id)

// 是否为复制状态
const isCopy = computed(() => rowData.value && !rowData.value.id)

const {
	// 表单实体
	BtForm,
	// 表单数据
	param: formValue,
	// 提交表单
	submit,
	// 清除表单验证
	clearValidate,
} = useForm({
	data: () => {
		// 编辑
		if (rowData.value) {
			// 赋值时间表单
			setTimeForm()
			// topost 表格特殊情况
			if (rowData.value.sType === 'to_post') {
				postParam.value = JSON.parse(rowData.value.post_param)
			}
			console.log(rowData.value.rname || rowData.value.name, 'name')
			let sType = rowData.value.sType
			switch (sType) {
				case 'mysql_increment_backup':
					sType = 'enterpriseBackup'
					break
				default:
					break
			}
			return {
				...rowData.value,
				sType,
				name: rowData.value.rname || rowData.value.name,
				...(rowData.value.sType === 'toPython' ? { python_env: rowData.value.params.python_env } : {}),
			}
		}
		// 添加
		return { sType: 'toShell', name: '' }
	},
	options: (formData: any) => {
		return computed(() => [
			// 常规表单项
			FormGroup([
				FormSelect('任务类型', 'sType', taskTypeOptions, {
					attrs: {
						clearable: false,
						class: '!w-[30rem]',
						disabled: isEdit.value || isCopy.value, // 编辑,复制状态下禁用
						onChange: () => {
							// 清除表单验证
							clearValidate()
							// 任务类型改变时，初始化表单，勿删
							typeInit.value = true
							// 初始化名称，防止出现空名称类型出现上一次类型名称遗留
							formData.value.name = ''
						},
					},
				}),
				// 提示图标
				FormCustom(() => (
					<ElPopover placement="top-start" width="260" popper-class="green-tips-popover" trigger="hover">
						{{
							default: () => (
								<div>
									<span class="text-white">任务类型包含以下部分：Shell脚本、备份网站、备份数据库、数据库增量备份、网站日志切割、自定义日志切割、释放内存、访问URL-GET、访问URL-POST、备份目录、木马查杀、同步时间</span>
								</div>
							),
							reference: () => <i class="inline-block svgtofont-el-question-filled text-warning ml-[12px] mt-8px"></i>,
						}}
					</ElPopover>
				)),
			]),
			// 任务名称需要动态赋值，动态禁用
			FormInput('任务名称', 'name', {
				attrs: {
					placeholder: '请输入计划任务名称',
					// 编辑情况下不禁用，复制也不禁用
					disabled: disableName.value && !isEdit.value && !isCopy.value,
					class: 'w-[30rem]',
				},
				rules: [{ required: true, message: '请输入计划任务名称', trigger: 'blur' }],
			}),
			// 动态告警表单项
			showCycle.value ? alarmFormItem(formData.value.sType) : null,
			// 动态表单项
			...switchTaskType(formData),
			// 特殊表单项 to-post
			{ type: 'slots', key: 'custom' },
		])
	},
	submit: async (param: Ref<any>, validate: any, ref: Ref<any>) => {
		console.log(param.value, 'param')

		await validate()

		// 验证告警表单
		await alertForm.value?.validate()
		return await submitForm(param.value)
	},
})

defineExpose({ onConfirm: submit })

onUnmounted(() => {
	// 重置store
	CRONTAB_TASK_STORE().$resetForm()
	clearTimeForm()
})
</script>

<style lang="css" scoped>
:deep(.el-form .el-small-label .el-form-item__label) {
	min-width: 2rem;
}
</style>

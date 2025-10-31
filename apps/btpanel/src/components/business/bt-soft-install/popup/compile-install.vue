<template>
	<div class="p-[20px]">
		<bt-table-group>
			<template #header-left>
				<el-button type="primary" @click="handleAddCustomModule">添加自定义模块</el-button>
			</template>
			<template #content>
				<bt-table ref="customTableRef" :column="tableColumn" max-height="30rem" :data="customData" @select-all="setCustomModuleData" @select="setCustomModuleData">
					<template #empty>
						<div class="flex items-center justify-center">列表为空</div>
					</template>
				</bt-table>
			</template>
		</bt-table-group>
		<bt-dialog v-model="customVisible" title="添加自定义选装模块" area="56" show-footer @confirm="submitCustomModule" @cancel="clearAddForm">
			<div class="p-[20px]">
				<el-form ref="customFormRef" :model="customForm" :rules="rules">
					<el-form-item prop="args_name" label="模块名称">
						<bt-input v-model="customForm.args_name" placeholder="请输入模块名称，只能输入字母、数字、下划线" width="30rem" clearable> </bt-input>
					</el-form-item>
					<el-form-item prop="ps" label="模块描述"><bt-input v-model="customForm.ps" maxlength="30" placeholder="请输入模块描述，30字以内" width="30rem" show-word-limit clearable> </bt-input> </el-form-item>
					<el-form-item prop="args" label="模块参数">
						<bt-input v-model="customForm.args" placeholder="如：--add-module=/tmp/echo/echo-nginx-module-master" width="30rem" clearable> </bt-input>
					</el-form-item>
					<el-form-item prop="init" label="前置脚本">
						<!-- :is-zoom="true" -->
						<bt-editor ref="AceEditor" v-model="customForm.init" class="!h-[32rem] !w-[36rem]" :editor-option="config" />
					</el-form-item>
				</el-form>
			</div>
		</bt-dialog>
	</div>
</template>

<script setup lang="tsx">
import { storeToRefs } from 'pinia'
import { INSTALL_STORE } from '../store'

const { config, getCustomModuleData, setCustomModuleData, handleAddCustomModule, clearAddForm, submitCustomModule } = INSTALL_STORE()
const { rules, tableColumn, customData, customForm, customVisible, customFormRef } = storeToRefs(INSTALL_STORE())

onMounted(getCustomModuleData)
</script>

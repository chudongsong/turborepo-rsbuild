<template>
	<div class="p-20px">
		<el-form ref="addScriptFormRef" :model="addScriptForm" label-width="80px" :rules="addScriptRules">
			<el-form-item label="名称" prop="name">
				<bt-input v-model="addScriptForm.name" placeholder="请输入脚本名称" width="36rem"></bt-input>
			</el-form-item>
			<el-form-item label="返回类型">
				<el-select v-model="addScriptForm.return_type" class="!w-[16rem]">
					<el-option label="字符串" value="string"></el-option>
					<el-option label="整数" value="int"></el-option>
					<el-option label="浮点数" value="float"></el-option>
				</el-select>
			</el-form-item>
			<el-form-item label="脚本参数">
				<div class="flex items-center">
					<el-select v-model="addScriptForm.is_args" class="!w-[8.2rem]">
						<el-option label="需要" value="1"></el-option>
						<el-option label="不需要" value="0"></el-option>
					</el-select>
					<div class="flex items-center" v-if="addScriptForm.is_args == '1'">
						<bt-input class="mx-4px" width="10rem" placeholder="参数标题" v-model="addArgsForm.args_title"></bt-input>
						<bt-input v-model="addArgsForm.args_ps" width="16rem" placeholder="参数说明"></bt-input>
					</div>
				</div>
			</el-form-item>
			<el-form-item label="内容" prop="script">
				<div class="h-[16rem]">
					<bt-editor class="!h-[16rem] !w-[36rem]" v-model="addScriptForm.script" />
				</div>
			</el-form-item>
			<el-form-item label="备注">
				<bt-input v-model="addScriptForm.ps" placeholder="备注" width="36rem"></bt-input>
			</el-form-item>
		</el-form>
		<bt-help :options="helpList" class="list-disc pl-24px"> </bt-help>
	</div>
</template>

<script setup lang="ts">
import { helpList, addScriptFormRef, addArgsForm, addScriptForm, addScriptRules } from '../useController'
</script>

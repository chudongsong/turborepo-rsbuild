<template>
	<div class="p-20px">
		<el-form ref="addScriptFormRef" :model="addScriptForm" label-width="80px" :rules="addScriptRules">
			<el-form-item label="名称" prop="name">
				<bt-input v-model="addScriptForm.name" placeholder="请输入脚本名称" width="36rem"></bt-input>
			</el-form-item>
			<el-form-item label="脚本类型" prop="script_type">
					<el-radio-group v-model="addScriptForm.script_type">
						<el-radio label="shell" value="shell">Shell</el-radio>
						<el-radio label="python" value="python">Python</el-radio>
					</el-radio-group>
			</el-form-item>
			<el-form-item label="内容" prop="content">
				<div class="h-[16rem]">
					<bt-editor class="!h-[16rem] !w-[36rem]" v-model="addScriptForm.content" />
				</div>
			</el-form-item>
			<el-form-item label="备注">
				<bt-input v-model="addScriptForm.description" placeholder="备注" width="36rem"></bt-input>
			</el-form-item>
		</el-form>
		<bt-help :options="helpList" class="list-disc pl-24px"> </bt-help>
	</div>
</template>

<script setup lang="ts">
import { helpList, addScriptFormRef, addArgsForm, addScriptForm, addScriptRules } from './useController'
</script>

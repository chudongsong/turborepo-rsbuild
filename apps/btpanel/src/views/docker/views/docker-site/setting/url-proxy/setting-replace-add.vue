<template>
	<!-- 添加内容替换 -->
	<el-form ref="replaceFormRef" :disabled="formDisabled" :model="addReplaceData" class="p-[2rem] addfrom" :rules="replaceRules" label-width="5rem">
		<el-form-item label="原关键词" prop="oldstr">
			<bt-input v-model="addReplaceData.oldstr" width="40rem" placeholder="请输入要被替换的内容，如：http://www.bt.cn" @input="setInputResult"></bt-input>
		</el-form-item>
		<el-form-item label="替换词" prop="newstr">
			<bt-input v-model="addReplaceData.newstr" width="40rem" placeholder="新的内容，如：https://www.bt.cn" @input="setInputResult" />
			<div v-if="proxyData.subs_filter">
				<el-checkbox-group class="mt-[1.6rem]" v-model="replaceMode" @change="setResultEvent">
					<el-checkbox value="i">不区分大小写(<span class="font-bold">i</span>)</el-checkbox>
					<el-checkbox value="o">只替换第一个(<span class="font-bold">o</span>)</el-checkbox>
					<el-checkbox value="r">正则表达式(<span class="font-bold">r</span>)</el-checkbox>
				</el-checkbox-group>
				<div class="mt-[1.6rem]">{{ resultText }}</div>
			</div>
		</el-form-item>
	</el-form>
</template>
<script lang="ts" setup>
import { proxyData, replaceFormRef, replaceRules, addReplaceData, resultText, formDisabled, setInputResult, setResultEvent, replaceMode, onConfirmReplace as onConfirm } from './useController';

defineExpose({ onConfirm });
</script>

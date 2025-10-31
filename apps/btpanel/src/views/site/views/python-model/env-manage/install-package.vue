<!-- 防盗链 批量+设置中使用 -->
<template>
	<div class="p-[20px]">
		<el-form ref="installFormRef" :model="installForm" :rules="rules">
			<el-form-item label="安装方式">
				<el-radio-group v-model="installForm.type">
					<el-radio-button value="common">普通安装</el-radio-button>
					<el-radio-button value="file">从文件批量安装</el-radio-button>
				</el-radio-group>
			</el-form-item>
			<el-form-item v-show="installForm.type == 'common'" label="名称" prop="name">
				<div class="flex">
					<bt-input v-model="installForm.name" placeholder="请输入名称" width="22rem"></bt-input>
					<el-form-item label="版本" prop="version">
						<bt-input v-model="installForm.version" placeholder="默认最新版本" width="22rem"></bt-input>
					</el-form-item>
				</div>
			</el-form-item>
			<el-form-item v-show="installForm.type == 'file'" label="版本记录文件" prop="file">
				<bt-input-icon v-model="installForm.file" placeholder="版本记录文件" icon="el-folder-opened" @icon-click="onPathChangeInstall" width="40rem" />
			</el-form-item>
			<el-form-item label="pip镜像源" prop="pip">
				<bt-select v-model="installForm.pip" :options="pipSource" class="!w-[54rem]"></bt-select>
				<!-- <el-select v-model="installForm.pip" class="w-[54rem]">
					<el-option
						v-for="image in pipOptions"
						:key="image.key"
						:label="image.label"
						:value="image.label"></el-option>
				</el-select> -->
			</el-form-item>
		</el-form>
	</div>
</template>

<script setup lang="ts">
import { pipSource, installFormRef, installForm, rules, onPathChangeInstall, getData, onConfirmInstall as onConfirm } from './useController';

interface Props {
	compData?: any;
	isConfig?: boolean;
	formData?: any;
}
const emit = defineEmits(['']);
const props = withDefaults(defineProps<Props>(), {
	compData: () => {},
});

onMounted(() => {
	getData();
});

defineExpose({ onConfirm });
</script>

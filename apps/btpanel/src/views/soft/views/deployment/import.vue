<template>
	<div class="flex flex-col p-[2rem]">
		<el-form ref="cmdFormRef" size="small" :model="cmdForm" :rules="cmdRules" class="relative w-full" :label-position="`right`" @submit.native.prevent>
			<el-form-item label="项目类型" prop="project_type">
				<bt-radio type="button" v-model="cmdForm.project_type" @change="changeProjectType" :options="projectTypeRadio"></bt-radio>
			</el-form-item>
			<el-form-item prop="name" label="英文名">
				<el-input class="!w-[19rem]" v-model="cmdForm.name" placeholder="项目英文名" />
				<span class="helpTip">格式: [0-9A-Za-z_-]+，不要带有空格和特殊字符</span>
			</el-form-item>
			<el-form-item prop="title" label="中文名">
				<el-input class="!w-[19rem]" v-model="cmdForm.title" placeholder="项目中文名" />
				<span class="helpTip">用于显示到列表的名称</span>
			</el-form-item>
			<template v-if="cmdForm.project_type !== 'java'">
				<el-form-item prop="php" label="PHP版本">
					<el-input class="!w-[19rem]" v-model="cmdForm.php" placeholder="如：53,54,55,56,70,71,72" />
					<span class="helpTip">多个请使用","(逗号)隔开，不要使用PHP5.2</span>
				</el-form-item>
				<el-form-item prop="enable_functions" label="解禁的函数">
					<el-input class="!w-[19rem]" v-model="cmdForm.enable_functions" placeholder="如：system,exec" />
					<span class="helpTip">多个请使用","(逗号)隔开，只解禁必要函数</span>
				</el-form-item>
			</template>
			<template v-else>
				<el-form-item prop="java_version" label="JDK版本">
					<el-input class="!w-[19rem]" v-model="cmdForm.java_version" placeholder="如：jdk1.8.0_371, jdk1.7.0_80" />
					<span class="helpTip">多个请使用","(逗号)隔开</span>
				</el-form-item>
				<el-form-item prop="mysql_version" label="Mysql版本">
					<el-input class="!w-[19rem]" v-model="cmdForm.mysql_version" placeholder="如：5.5,5.6,5.7,8.0" />
					<span class="helpTip">多个请使用","(逗号)隔开</span>
				</el-form-item>
			</template>
			<el-form-item prop="version" label="项目版本">
				<el-input class="!w-[19rem]" v-model="cmdForm.version" placeholder="如：5.2.1" />
				<span class="helpTip">当前导入的项目版本</span>
			</el-form-item>
			<el-form-item prop="ps" label="简介">
				<el-input class="!w-[29rem]" v-model="cmdForm.ps" />
			</el-form-item>
			<el-form-item prop="dep_zip" label="上传项目包">
				<div class="flex items-center mt-4px">
					<el-button title="导入项目" size="small" class="!mr-[.5rem]" @click="importPlugin">选择文件</el-button>
					<span>{{ fileName }}</span>
				</div>
			</el-form-item>
			<bt-help class="mt-[2rem] ml-[2rem]" :options="helpList" list-style="disc" />
		</el-form>
	</div>
</template>
<script setup lang="ts">
import { storeToRefs } from 'pinia'
import SOFT_DEPLOY_STORE from './store'

const { fileName, cmdForm, cmdFormRef } = storeToRefs(SOFT_DEPLOY_STORE())
const { cmdRules, helpList, projectTypeRadio, onConfirm, importPlugin, changeProjectType, initImportForm, $reset_import_form } = SOFT_DEPLOY_STORE()

onMounted(initImportForm)
onUnmounted($reset_import_form)

defineExpose({ onConfirm })
</script>
<style lang="css" scoped>
:deep(.el-form-item__label) {
	@apply w-[7rem] text-default;
}

.helpTip {
	@apply text-tertiary text-small ml-[.5rem];
}
.el-form-item {
	@apply mb-[1.5rem];
}
</style>

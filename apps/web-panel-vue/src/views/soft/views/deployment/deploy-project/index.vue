<template>
	<div class="flex flex-col p-[16px] lib-box" v-bt-loading="loading">
		<el-form ref="quickFormRef" size="small" :model="quickForm" :rules="quickRules" class="relative w-full p-[1.5rem]" label-position="right" @submit.native.prevent>
			<el-form-item prop="webname" label="域名">
				<bt-input width="32rem" :rows="3" type="textarea" v-model="quickForm.webname" :placeholder="`每行填写一个域名，默认为80端口\n泛解析添加方法 *.domain.com\n如另加端口格式为 www.domain.com:88`" @input="changeName" />
			</el-form-item>
			<el-form-item v-if="projectType !== 'java'" prop="path" label="根目录">
				<!-- <bt-input width="32rem"	v-model="quickForm.dir" /> -->
				<bt-input-icon v-model="quickForm.path" name="path" icon="el-folder-opened" @icon-click="onPathChange()" @change.passive="clearSpace('path')" width="32rem" />
			</el-form-item>
			<el-form-item label="数据库">
				<div class="flex items-center">
					<el-form-item prop="datauser" class="!mb-0">
						<bt-input width="15rem" v-model="quickForm.datauser" placeholder="数据库用户名" />
					</el-form-item>
					<el-form-item prop="datapassword" class="datapassword !mb-0">
						<bt-input width="15rem" class="ml-[1rem]" v-model="quickForm.datapassword" placeholder="数据库密码" />
					</el-form-item>
					<div v-if="!checkInfo?.mysql" class="text-small mt-1rem text-danger">未安装数据库 <span class="bt-link" @click="installPlugin('mysql')">立即安装</span></div>
				</div>
			</el-form-item>
			<el-form-item prop="port" label="源码">
				<el-input class="!w-[15rem]" v-model="quickForm.code" disabled />
				<span class="helpTip">准备为你部署的源码程序</span>
			</el-form-item>
			<el-form-item v-if="projectType !== 'java'" prop="port" label="PHP版本">
				<bt-select v-model="quickForm.version" :options="options" class="!w-[10rem]" @change="selectVersion"></bt-select>
				<span class="helpTip">请选择源码程序支持的php版本</span>
			</el-form-item>
			<el-form-item v-else label="JDK版本" prop="project_jdk">
				<div class="flex items-center custom-refresh-select">
					<el-select size="small" v-model="quickForm.project_jdk" @change="selectVersion" class="!w-[32rem]" placeholder="请选择JDK版本">
						<el-option v-for="item in javaOptions" :key="item.key" :label="item.title" :value="item.key" :disabled="item.disabled">
							<span>{{ item.title }}</span>
							<template v-if="item.disabled"> [<span class="my-4px bt-link" @click="openJdkView('jdkSettings')">未安装</span>] </template>
						</el-option>
					</el-select>
					<div class="el-input-group__append !h-3rem !flex items-center">
						<bt-button title="刷新JDK版本" class="!flex" @click="getForm(true)">
							<bt-icon icon="el-refresh" class="!text-base"></bt-icon>
						</bt-button>
					</div>
				</div>
				<span class="helpTip block mt-1rem leading-[16px]">
					请选择源码程序支持的JDK版本
					<bt-link @click="openJdkView('jdkSettings')">安装其他版本</bt-link>
				</span>
			</el-form-item>
		</el-form>
		<bt-dialog title="部署日志" v-model="logPopup" :area="53">
			<bt-log class="h-[40rem] !rounded-none" :content="logContent" />
		</bt-dialog>
	</div>
</template>
<script setup lang="ts">
import { storeToRefs } from 'pinia'
import SOFT_DEPLOY_PROJECT_STORE from './store'
import { openJdkView } from '@site/views/java-model/useController'

const store = SOFT_DEPLOY_PROJECT_STORE()

const { quickRules, init, installPlugin, onConfirm, getForm, onPathChange, changeName, clearSpace, selectVersion, $reset } = store

const { projectType, options, loading, logPopup, logContent, quickFormRef, quickForm, checkInfo, javaOptions } = storeToRefs(store)

onMounted(init)
onUnmounted($reset)
defineExpose({ onConfirm })
</script>
<style lang="css" scoped>
:deep(.el-form-item__label) {
	@apply w-[9rem] text-default;
}

.el-form-item {
	@apply mb-[1.4rem];
}

.check :deep(.el-form-item__content) {
	@apply leading-[1.4];
}
:deep(.el-form .el-form-item--mini.el-form-item + .el-form-item) {
	margin-top: 1.5rem !important;
}

:deep(.el-form .el-form-item.datapassword) {
	margin-top: 0 !important;
}

.helpTip {
	@apply text-tertiary text-small ml-[.5rem];
}
</style>

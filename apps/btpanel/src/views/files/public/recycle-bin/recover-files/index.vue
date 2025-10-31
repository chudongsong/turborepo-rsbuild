<template>
	<el-form ref="cmdFormRef" :model="cmdForm" :rules="cmdRules" class="p-2rem" :disabled="isCmdLoading" :label-position="`right`" @submit.native.prevent>
		<el-form-item style="margin-bottom: 1.5rem" label="恢复方法">
			<el-radio-group v-model="cmdForm.type">
				<el-radio-button label="before">原文件地址</el-radio-button>
				<el-radio-button label="path">其他目录</el-radio-button>
			</el-radio-group>
		</el-form-item>
		<el-form-item prop="path" v-show="cmdForm.type === 'path'" label="恢复到">
			<bt-input-icon v-model="cmdForm.path" v-show="cmdForm.type == 'path'" class="w-[24rem]" icon="el-folder-opened" @icon-click="openFile" @change.passive="clearSpace('path')" :placeholder="`被保护的文件或目录完整路径`" />
		</el-form-item>
	</el-form>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import FILES_RECYCLE_BIN_STORE from '../store'

const store = FILES_RECYCLE_BIN_STORE()
const { rowData, isCmdLoading, cmdForm, cmdFormRef, cmdRules } = storeToRefs(store)
const { openFile, clearSpace, $resetCmdForm } = store

onUnmounted(() => {
	$resetCmdForm()
})
</script>

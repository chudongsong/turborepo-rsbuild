<template>
	<div class="overflow-hidden p-[16px]">
		<div class="flex justify-around ml-[-1rem]">
			<fieldset class="p-4px">
				<legend>所有者</legend>
				<el-checkbox-group class="flex flex-col" style="gap: 4px" v-model="checkList.owner" @change="reversePermission">
					<el-checkbox class="ml-[1rem]" label="r">读取</el-checkbox>
					<el-checkbox class="ml-[1rem]" label="w">写入</el-checkbox>
					<el-checkbox class="ml-[1rem]" label="x">执行</el-checkbox>
				</el-checkbox-group>
			</fieldset>
			<fieldset class="p-4px">
				<legend>用户组</legend>
				<el-checkbox-group class="flex flex-col" style="gap: 4px" v-model="checkList.group" @change="reversePermission">
					<el-checkbox class="ml-[1rem]" label="r">读取</el-checkbox>
					<el-checkbox class="ml-[1rem]" label="w">写入</el-checkbox>
					<el-checkbox class="ml-[1rem]" label="x">执行</el-checkbox>
				</el-checkbox-group>
			</fieldset>
			<fieldset class="p-4px">
				<legend>公共</legend>
				<el-checkbox-group class="flex flex-col" v-model="checkList.public" style="gap: 4px" @change="reversePermission">
					<el-checkbox class="ml-[1rem]" label="r">读取</el-checkbox>
					<el-checkbox class="ml-[1rem]" label="w">写入</el-checkbox>
					<el-checkbox class="ml-[1rem]" label="x">执行</el-checkbox>
				</el-checkbox-group>
			</fieldset>
		</div>
		<div class="flex items-center ml-[1.5rem]">
			<bt-input width="6rem" v-model="checkList.auth" @input="checkNumber" type="number" min="0" max="777" oninput="if(value){value=value.replace(/[^\d]/g,'')} if(value<=0){value=0} if(value>777){value=777}" />
			<div class="mx-[1rem]">权限，所有者</div>
			<bt-select v-model="checkList.user" :options="ownerOptions" class="!w-[10rem]" @change="changeUser"></bt-select>
			<el-checkbox class="ml-[1rem]" v-model="checkList.isDir">应用到子目录</el-checkbox>
		</div>
	</div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import FILES_BATCH_SET_AUTH_STORE from './store'

const store = FILES_BATCH_SET_AUTH_STORE()
const { checkList } = storeToRefs(store)
const { ownerOptions, reversePermission, checkNumber, changeUser, getFileAuths, $reset } = store

onMounted(() => {
	getFileAuths()
})

onUnmounted(() => {
	$reset()
})
</script>

<style lang="css" scoped>
fieldset {
	@apply ml-[1.5rem] mb-[1.5rem] border border-darker float-left pb-[1rem] rounded-base w-[25%];
}
fieldset legend {
	@apply p-[.3rem] mx-[.6rem] text-base;
}
</style>

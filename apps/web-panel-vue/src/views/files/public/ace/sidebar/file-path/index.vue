<template>
	<div class="title">
		<span>目录：</span>
		<span class="w-[100%] cursor-text truncate" :title="currentPath" v-if="!isShow" @click="inputFocus">{{ currentPath }}</span>
		<el-input v-else ref="inputRef" size="mini" v-model="currentPath" @blur="changeCurrentPath" @keyup.enter.native="changeCurrentPath"></el-input>
	</div>
</template>

<script setup lang="ts">
import { currentPath } from '@files/public/ace/sidebar/useMethods'
import { storeToRefs } from 'pinia'
import FILES_ACE_STORE from '../../store'

const store = FILES_ACE_STORE()
const { isShow, inputRef } = storeToRefs(store)
const { changeCurrentPath, inputFocus } = store
</script>

<style lang="css" scoped>
.title {
	@apply h-[4rem] flex items-center bg-[#383838] px-[1.5rem] relative left-0 right-0 truncate text-base text-[#fff] border-r border-[#2e2e2e] leading-normal w-full;
}
</style>

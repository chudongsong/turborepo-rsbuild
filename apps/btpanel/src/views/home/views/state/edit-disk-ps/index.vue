<template>
	<el-form ref="setPsFormRef" :model="setPsForm" class="p-[2rem]">
		<el-form-item :label="'磁盘备注'">
			<bt-input v-model="setPsForm.name" class="!w-[28rem]"></bt-input>
		</el-form-item>
	</el-form>
</template>
<script lang="ts" setup>
import HOME_STATE_STORE from '@/views/home/views/state/store'
import { storeToRefs } from 'pinia'

const store = HOME_STATE_STORE()
const { setPsFormRef, setPsForm } = storeToRefs(store)
</script>

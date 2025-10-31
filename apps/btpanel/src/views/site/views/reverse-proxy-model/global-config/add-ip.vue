<template>
	<!-- 添加ip黑白表单 -->
	<el-form ref="ipFormRef" :rules="ipRules" :disabled="formDisabled" :model="ipData" class="p-[2rem] addfrom" label-width="5rem">
		<el-form-item label="IP" prop="address">
			<bt-input type="textarea" v-model="ipData.address" width="20rem" resize="none" :rows="4" placeholder="请输入IP地址" clearable />
		</el-form-item>
		<!-- <el-form-item label="类型">
			<el-select v-model="ipData.types" class="w-[20rem]">
				<el-option
					v-for="item in typesOptions"
					:key="item.key"
					:label="item.title"
					:value="item.key"></el-option>
			</el-select>
		</el-form-item> -->
		<bt-help :options="ipHelpList" class="pl-[5.6rem] pt-[2.4rem]"></bt-help>
	</el-form>
</template>
<script lang="ts" setup>
import { formDisabled, ipData, ipHelpList, ipFormRef, ipRules, onConfrimIp as onConfirm } from './useController';

defineExpose({ onConfirm });
</script>

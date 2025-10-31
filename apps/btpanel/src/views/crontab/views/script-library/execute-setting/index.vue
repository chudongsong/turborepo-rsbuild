<template>
	<div class="p-20px">
		<el-form ref="argsFormRef" label-position="right" :rules="rules" :model="argsForm.form">
			<el-form-item :label="argsForm.title" prop="args">
				<bt-input v-model="argsForm.form.args" :placeholder="argsForm.form.placeholder" width="24rem"> </bt-input>
			</el-form-item>
		</el-form>
	</div>
</template>

<script setup lang="ts">
import { argsFormRef, argsForm, rules } from '../useController'
</script>

<style scoped></style>

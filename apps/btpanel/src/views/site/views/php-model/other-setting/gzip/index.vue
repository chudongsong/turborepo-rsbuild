<template>
	<div class="p-[20px]">
		<el-form ref="compressFormRef" class="h-[38rem]" :model="compressData" :rules="compressFormRules" label-width="100px" v-bt-loading="viewLoading" :disabled="formDisabled">
			<el-form-item label="内容压缩" prop="status">
				<el-switch v-model="compressData.status" @change="changeCompressStatus"> </el-switch>
			</el-form-item>
			<div v-show="compressData.status" class="mt-[1.6rem]">
				<el-form-item label="压缩类型" prop="gzip_types">
					<bt-input v-model="compressData.gzip_types" type="textarea" width="42rem" :rows="6" resize="none" />
				</el-form-item>
				<el-form-item label="压缩级别" prop="comp_level">
					<el-select class="!w-[42rem]" v-model="compressData.comp_level">
						<el-option v-for="level in 9" :key="level" :label="level" :value="String(level)"> </el-option>
					</el-select>
				</el-form-item>
				<el-form-item label="压缩最小长度" prop="min_length">
					<div class="flex items-center">
						<bt-input v-model="compressData.min_length"></bt-input>
						<el-form-item prop="unit">
							<el-select class="ml-[1rem] !w-[8rem]" v-model="compressData.unit" placeholder="请选择">
								<el-option v-for="item in lengthUnit" :key="item.value" :label="item.label" :value="item.value"> </el-option>
							</el-select>
						</el-form-item>
					</div>
				</el-form-item>
			</div>
			<el-form-item v-show="compressData.status" label=" " class="mt-[1.6rem]">
				<el-button type="primary" @click="onConfirm">保存</el-button>
			</el-form-item>
		</el-form>
		<div class="ml-[20px]">
			<bt-help :options="compressHelpList"></bt-help>
		</div>
	</div>
</template>

<script setup lang="ts">
import { viewLoading, formDisabled, compressFormRef, compressData, lengthUnit, compressHelpList, compressFormRules, onConfirmCompress as onConfirm, getNginxGzip, changeCompressStatus, initStatus } from './useController'

onMounted(() => {
	getNginxGzip()
})
onUnmounted(() => {
	initStatus.value = true
})
</script>
